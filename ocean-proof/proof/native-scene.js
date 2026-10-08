import {BeachApp} from './BeachApp.js';
import {installNativeBeach} from './NativeBeachScene.js';
import {NativeOverlays} from './NativeOverlays.js';
import {captureNativePair} from './native-capture.js';
import {GPU} from '../vendor/tidewater/src/engine/gpu/GPU.js';
import {G} from '../vendor/tidewater/src/core/Globals.js';
import {Vector2} from '../vendor/tidewater/src/engine/index.js';
import {WaveClock,renderAt} from './timing.js';
import {PIN} from './inputs.js';
import {ProfileRun,profileMetadata} from './profile.js';
import {loopMode,FrameGate,LoopProbe,clearFrame} from './loop-profile.js';
import {FramePipeline,throttleReadbacks} from './pipeline.js';
import {PIPE_PASSES,CompletedProfileRun} from './pipeline-profile.js';
import {AdaptiveResolution,PRODUCTION_SETTINGS} from './adaptive-resolution.js';

const send=data=>parent.postMessage({type:'daybuoy-ocean',...data},location.origin);
let app,beach,overlays,packet,capturing=false,failed=false,clock,completed=[],lastReport=0,forecastKey='',shoreKey='',shoreBusy=false,pendingShore,profileRun,profileDimensions,probe,rafTime;
const started=performance.now();
const completionListeners=new Set();
function fail(error){if(failed)return;failed=true;send({status:'failed',reason:String(error?.message||error)});console.error('Tidewater ocean:',error);}
window.addEventListener('error',e=>fail(e.error||e.message));window.addEventListener('unhandledrejection',e=>fail(e.reason));
try{
 if(!navigator.gpu)throw Error('WebGPU unavailable');
 app=new BeachApp();
 const pipelined=!app.profileConfig||PIPE_PASSES.includes(app.profileConfig.pass);
 const settings=app.profileConfig??PRODUCTION_SETTINGS;
 const adaptive=(!app.profileConfig||app.profileConfig.adaptive)&&!app.qs.has('native-capture')?new AdaptiveResolution():null;
 const prepare=app.precompile.bind(app);
 app.precompile=async()=>{
  beach=installNativeBeach(app);overlays=new NativeOverlays(app.scene);
  app.engine.setRenderScale(settings.dpr);app.activeQuality={...app.activeQuality,dpr:settings.dpr};
  app.proofFlare=app.post.flare;
  if(app.profileConfig?.pass==='native-fxaa'||settings.aa==='fxaa')app.post.aaMode='fxaa';
  if(app.profileConfig?.pass==='native-flare'||app.profileConfig?.flare===false)app.post.flare=null;
  await prepare();
 };
 // Native terrain, sky and objects share Tidewater's one scene renderer.
 const originalReadback=app.applyAtmosphereReadback.bind(app);
 app.applyAtmosphereReadback=()=>{
  originalReadback();if(!packet)return;
  const cover=Math.max(0,Math.min(1,(packet.forecast?.cloud||0)/100));
  const moon=packet.moon,moonStrength=packet.moonlight||0;
  if(packet.sun[1]<-.07){
   G.sunColor.value.setRGB(.6,.7,1).multiplyScalar(moon?.[1]>0?.12*moonStrength*(1-cover*.9):0);
  }else G.sunColor.value.multiplyScalar(1-cover*.88);
  G.skyIrradiance.value.multiplyScalar(1-cover*.40);
  const flash=packet.lightning||0;G.skyIrradiance.value.r+=flash*.14;G.skyIrradiance.value.g+=flash*.18;G.skyIrradiance.value.b+=flash*.23;
 };
 app.updateSun=()=>{
  if(!packet)return;
  const s=packet.sun,m=packet.moon;app.atmosphere.sunDir.value.set(-s[0],s[1],-s[2]);
  const light=s[1]<-.07&&m?.[1]>0?m:s;
  G.sunDir.value.set(-light[0],light[1],-light[2]);G.night.value=Math.max(0,Math.min(1,-s[1]/.18));
  app.sky.starIntensity.value=0;
  if(m)app.sky.moonDir.value.set(-m[0],m[1],-m[2]);
 };
 // Do not initialize the proof's fabricated fixed-time sun for app startup.
 const initial=parent.__daybuoy; if(initial)packet={sun:initial.uniforms.uSun.value.toArray(),moon:initial.uniforms.uMoon.value.toArray()};
 await app.init((fraction,label)=>send({status:'loading',fraction,label}));

 if(app.profileConfig&&!app.qs.has('native-capture')){
  profileRun=pipelined?new CompletedProfileRun(app.profileConfig):new ProfileRun(app.profileConfig);
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&!profileRun.done)fail('Profiling interrupted: page hidden. Rerun this case.');});
 }
 const mode={...loopMode(app.profileConfig?.pass),...(pipelined?{wait:false}:{}),pipelined};
 const gate=pipelined?new FramePipeline({queue:GPU.queue,onComplete:e=>tick(e.now,e.count),onError:fail}):new FrameGate(mode.wait);
 const readbackThrottle=pipelined?throttleReadbacks(app,GPU):null;
 if(adaptive&&!profileRun)document.addEventListener('visibilitychange',()=>adaptive.resetWindow());
 if(profileRun){probe=new LoopProbe(profileRun,mode);probe.readbacks(app);}
 GPU.device.addEventListener('uncapturederror',e=>fail(e.error));GPU.device.lost.then(info=>fail(info.message));
 clock=new WaveClock(performance.now(),30);
 const worker=new Worker(new URL('./shore-worker.js',import.meta.url),{type:'module'});let first=true;
 function rebuildShore(){
  if(shoreBusy||!pendingShore)return;shoreBusy=true;const p=pendingShore;pendingShore=null;
  const data=first?{size:app.terrainData.size,res:app.terrainData.res,texel:app.terrainData.texel,origin:app.terrainData.origin,heights:app.terrainData.heights}:null;first=false;
  worker.postMessage({data,propagation:p.propagation,tide:p.tide});
 }
 worker.onmessage=async e=>{try{await GPU.queue.onSubmittedWorkDone();if(!e.data.field)throw Error(e.data.error);app.shoreField=e.data.field;app.terrainGPU.shoreField=e.data.field;app.terrainGPU.setShoreField(e.data.field);const old=app.shore.dirTexture;app.shore.buildDirTexture({min:new Vector2(-190,-170),size:380});old?.destroy();shoreBusy=false;rebuildShore();}catch(e){fail(e);}};
 worker.onerror=e=>fail(e.message);
 function applyPacket(p){
  packet=p;const c=p.camera,a=app.camera;
  a.position.set(-c.position[0],c.position[1],-c.position[2]);a.up.set(0,1,0);a.lookAt(-c.position[0]-c.direction[0],c.position[1]+c.direction[1],-c.position[2]-c.direction[2]);
  a.fov=c.fov;a.aspect=c.aspect;a.near=c.near;a.far=c.far;a.updateProjectionMatrix();a.projectionMatrix.elements[8]=c.shearX;a.projectionMatrix.elements[9]=c.shearY;a.projectionMatrixInverse.copy(a.projectionMatrix).invert();
  beach.update(p);overlays.update(p.overlays);
  const f=p.forecast,key=f?JSON.stringify([f.swell.toFixed(2),f.period.toFixed(2),Math.round(f.direction),f.wind.toFixed(1),Math.round(f.windDirection),(f.tide||0).toFixed(2),Math.round(f.cloud||0)]):'';
  if(f&&key!==forecastKey&&app.setForecast(f)){
   forecastKey=key;const next=[Math.round(f.direction/5),Math.round(app.marine.tide*10)].join(':');
   // Fixed 201-degree / zero-tide diagnostics already match the initial field.
   if(!app.profileConfig&&next!==shoreKey){shoreKey=next;pendingShore=app.marine;rebuildShore();}
  }
 }
 async function finish(result){
  try{
   // One terminal drain exposes queued work without serializing rAF cases.
   // Never use submission cadence to pass the 30-fps GPU/display gate.
   let queueDrainMs=0;
   if(!mode.wait){send({status:'loading',label:'Measurement finished · draining queued GPU work'});const start=performance.now();if(pipelined)await gate.drain();else await GPU.queue.onSubmittedWorkDone();queueDrainMs=performance.now()-start;}
   send({status:'profile-result',result:{...result,...profileMetadata(app,app.profileConfig,G,GPU,
    [app.engine.canvas.width,app.engine.canvas.height],'one native WebGPU renderer; zero external image/layer copies'),
    ...probe.result(),queueDrainMs,...(pipelined?{pipeline:gate.stats(),readbackThrottle}:{}),...(adaptive?{adaptiveResolution:adaptive.result()}:{}),...(mode.empty?{oceanVisible:false,sprayVisible:false,breakerVisible:false}:{}),
    drainNote:pipelined?'Final drain is outside the measured window and does not increase measured completed-frame counts.':'One final queue drain for rAF cases; its duration exposes backlog. Submission/rAF FPS is not GPU-completed or displayed FPS.'}});
  }catch(e){fail(e);}
 }
 function tick(now,count=1){
  if(!capturing&&!profileRun?.done)adaptive?.observe(now,count);
  completed.push({now,count});while(completed.length&&completed[0].now<now-3000)completed.shift();
  const result=profileRun?.observe(now,count);if(result)void finish(result);
  for(const listener of completionListeners){try{listener({now,count});}catch(e){completionListeners.delete(listener);console.warn('Completion subscriber stopped:',e);}}
  if(now-lastReport>1000){const fps=completed.reduce((n,e)=>n+e.count,0)/Math.min(3,Math.max(.001,(now-started)/1000));lastReport=now;send({status:'running',backend:'WebGPU',pin:PIN,fps,metric:pipelined?'gpu-completed-pipelined':mode.wait?'gpu-completed':'raf-submitted',resolution:[app.engine.width,app.engine.height],quality:app.activeQuality,waveSeconds:G.time.value,period:app.shore.period.value,...(pipelined?{pipeline:gate.stats(),readbackThrottle}:{})});}
 }
 const api=window.__daybuoyOcean={
  subscribeCompleted(listener){completionListeners.add(listener);return()=>completionListeners.delete(listener);},
  evidence(){return {waveSeconds:G.time.value,marine:app.marine,quality:{...app.activeQuality},post:{aa:app.post.aaMode,flare:!!app.post.flare},pipeline:pipelined?gate.stats():null};},
  get ready(){
   if(failed||capturing||profileRun?.done)return false;
   try{
    if(adaptive&&!adaptive.prepare(performance.now(),gate.inFlight,dpr=>{
     app.engine.setRenderScale(dpr);app.activeQuality={...app.activeQuality,dpr};app.post.taau._needsRestart=true;
     return [app.engine.width,app.engine.height,app.engine.canvas.width,app.engine.canvas.height];
    }))return false;
   }catch(e){fail(e);return false;}
   return !gate.busy;
  },get canvas(){return app.engine.canvas;},pin:PIN,
  profileFrameStart(timestamp,origin){if(probe&&!profileRun.done){rafTime=timestamp+origin-performance.timeOrigin;probe.begin(rafTime,gate.busy);}},
  profileFrameEnd(cpuMs){probe?.end(cpuMs);},
  async capturePair(){
   if(profileRun)throw Error('Use the separate capture page; never record during an FPS test');
   capturing=true;try{if(pipelined)await gate.drain();return await captureNativePair({app,beach,overlays,G,GPU});}finally{capturing=false;adaptive?.resetWindow();}
  },
  draw(p){
   if(failed||gate.busy||capturing||profileRun?.done||adaptive?.pending)return false;
   const cpuStart=performance.now();
   applyPacket(p);
   if(adaptive){
    try{adaptive.verifyFrame(innerWidth,innerHeight,[app.engine.width,app.engine.height,app.engine.canvas.width,app.engine.canvas.height]);}catch(e){fail(e);return false;}
   }else if(profileRun){
    const d=app.profileConfig.dpr,w=Math.floor(innerWidth*d),h=Math.floor(innerHeight*d);
    const actual=[app.engine.width,app.engine.height,app.engine.canvas.width,app.engine.canvas.height];
    const valid=actual.every((v,i)=>v===(i%2?h:w));
    if(!valid||profileDimensions&&actual.some((v,i)=>v!==profileDimensions[i])){fail('Profiling resolution changed or did not retain requested DPR '+d+'. Rerun this case.');return false;}
    profileDimensions=actual;
   }
   try{
    if(!mode.readbacks&&profileRun.start!==null&&(app.query._pending||app.atmosphere._irrPending))throw Error('CPU readback still pending after warm-up; result rejected.');
    if(mode.empty){const sample=clock.sample(performance.now());G.time.value=sample.seconds;clearFrame(GPU);}
    else renderAt(app,G,clock.sample(performance.now()));
    probe?.draw(performance.now()-cpuStart);
    if(pipelined)gate.submittedFrame();else gate.submitted(GPU.queue,rafTime??performance.now(),tick,fail);return true;
   }catch(e){fail(e);return false;}
  }
 };
 send({status:'ready',backend:'WebGPU',pin:PIN,loadMs:performance.now()-started});
}catch(e){fail(e);}
