import {BeachApp} from './BeachApp.js';
import {OceanComposite} from './OceanComposite.js';
import {GPU} from '../vendor/tidewater/src/engine/gpu/GPU.js';
import {G} from '../vendor/tidewater/src/core/Globals.js';
import {Vector2} from '../vendor/tidewater/src/engine/index.js';
import {WaveClock,renderAt,AutoQuality} from './timing.js';
import {applyQuality} from './quality.js';
import {PIN} from './inputs.js';
import {ProfileRun,installRuntimeAblation,installHostRuntime,hostCuts,profileMetadata} from './profile.js';
import {installPostBypass} from './profile-present.js';
const send=data=>parent.postMessage({type:'daybuoy-ocean',...data},location.origin);
let app,composite,packet,inFlight=false,failed=false,tuner,clock,completed=[],lastReport=0,lastQuality=0,forecastKey='',shoreKey='',shoreBusy=false,pendingShore,profileRun,profileDimensions;
const started=performance.now();
function fail(error){if(failed)return;failed=true;send({status:'failed',reason:String(error?.message||error)});console.error('Tidewater ocean:',error);}
window.addEventListener('error',e=>fail(e.error||e.message));window.addEventListener('unhandledrejection',e=>fail(e.reason));
try{
 if(!navigator.gpu)throw Error('WebGPU unavailable');
 app=new BeachApp();
 const prepare=app.precompile.bind(app);
 app.precompile=async()=>{composite=new OceanComposite(app);composite.resize();await prepare();};
 // No native sky/clouds/land scene is presented. Atmospheric irradiance is
 // used only by the water material, with the app's real solar/lunar direction.
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
 installRuntimeAblation(app,app.profileConfig,composite);
 installHostRuntime(app,app.profileConfig);
 if(hostCuts(app.profileConfig).post)installPostBypass(app,composite);
 if(app.profileConfig){
  profileRun=new ProfileRun(app.profileConfig);
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&!profileRun.done)fail('Profiling interrupted: page hidden. Rerun this case.');});
 }
 GPU.device.addEventListener('uncapturederror',e=>fail(e.error));GPU.device.lost.then(info=>fail(info.message));
 clock=new WaveClock(performance.now(),30);tuner=new AutoQuality(app.qualityLevel);lastQuality=performance.now();
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
  const f=p.forecast,key=f?JSON.stringify([f.swell.toFixed(2),f.period.toFixed(2),Math.round(f.direction),f.wind.toFixed(1),Math.round(f.windDirection),(f.tide||0).toFixed(2),Math.round(f.cloud||0)]):'';
  if(f&&key!==forecastKey&&app.setForecast(f)){
   forecastKey=key;const next=[Math.round(f.direction/5),Math.round(app.marine.tide*10)].join(':');
   // Fixed 201-degree / zero-tide diagnostics already match the initial field.
   if(!profileRun&&next!==shoreKey){shoreKey=next;pendingShore=app.marine;rebuildShore();}
  }
 }
 const api=window.__daybuoyOcean={
  get ready(){return !failed&&!inFlight&&!profileRun?.done;},get canvas(){return composite.canvas||app.engine.canvas;},pin:PIN,
  begin(p,base){
   if(failed||inFlight)return false;
   applyPacket(p);composite.resize();composite.copyBase(base);
   if(profileRun){
    const d=app.profileConfig.dpr,w=Math.floor(innerWidth*d),h=Math.floor(innerHeight*d);
    const actual=[app.engine.width,app.engine.height,composite.canvas?.width,composite.canvas?.height];
    const valid=actual.every((v,i)=>v===(i%2?h:w));
    if(!valid||profileDimensions&&actual.some((v,i)=>v!==profileDimensions[i])){fail('Profiling resolution changed or did not retain requested DPR '+d+'. Rerun this case.');return false;}
    profileDimensions=actual;
   }
   return true;
  },
  finish(overlay){
   if(failed||inFlight)return false;
   try{composite.copyOverlay(overlay);renderAt(app,G,clock.sample(performance.now()));inFlight=true;
    GPU.queue.onSubmittedWorkDone().then(()=>{
     inFlight=false;const now=performance.now();completed.push(now);while(completed.length&&completed[0]<now-3000)completed.shift();
     if(profileRun){
      const result=profileRun.observe(now);
      if(result)send({status:'profile-result',result:{...result,...profileMetadata(app,app.profileConfig,G,GPU,
       [composite.canvas?.width,composite.canvas?.height],composite.atlas?'one atlas copy':composite.singleLayer?'one base copy; foreground omitted':'two layer copies')}});
     }
     if(now-lastReport>1000){const fps=completed.length/Math.min(3,Math.max(.001,(now-started)/1000));lastReport=now;send({status:'running',backend:'WebGPU',pin:PIN,fps,resolution:[app.engine.width,app.engine.height],quality:app.activeQuality,waveSeconds:G.time.value,period:app.shore.period.value});
      if(!profileRun&&now-lastQuality>5000){lastQuality=now;if(tuner.observe(fps)){applyQuality(app,tuner.level);composite.resize();completed=[];}}
     }
    }).catch(fail);return true;
   }catch(e){fail(e);return false;}
  }
 };
 send({status:'ready',backend:'WebGPU',pin:PIN,loadMs:performance.now()-started});
}catch(e){fail(e);}
