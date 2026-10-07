import {BeachApp} from './BeachApp.js';
import {GPU} from '../vendor/tidewater/src/engine/gpu/GPU.js';
import {G} from '../vendor/tidewater/src/core/Globals.js';
import {TEST,CAMERA,PIN} from './inputs.js';
import {SUN} from './sun.js';
import {applyQuality} from './quality.js';
import {WaveClock,renderAt,AutoQuality} from './timing.js';
import {captureStill} from './still.js';
import {captureQualityPair} from './quality-capture.js';
import {connectApp} from './app-bridge.js';
import {recordTimingClip} from './timing-clip.js';
import {profileConfig,ProfileRun,profileMetadata} from './profile.js';
const diagnostic=profileConfig(location.search);
const started=performance.now(),send=data=>parent.postMessage({type:diagnostic?'daybuoy-profile':'proof',engine:'tidewater',...data},location.origin),listeners=new Set();
let profileRun,profileDimensions;
let app,paused=false,failed=false,inFlight=0,measureStart=0,completed=0,samples=[],lastMetrics=0,recent=[],clock,tuner,mode,adjusting=false,adjustAt=0,currentFPS=0;
const hud=document.querySelector('#hud');
function fail(error){failed=true;if(app?.engine)app.engine.stop();document.querySelector('#status').style.display='grid';document.querySelector('#error').textContent='Tidewater could not run on this device.\n'+(error?.message||error);send({status:'failed',backend:GPU.context?'WebGPU':'unavailable',error:String(error?.message||error),reason:String(error?.message||error),fps:null});}
window.addEventListener('error',e=>fail(e.error||e.message));window.addEventListener('unhandledrejection',e=>fail(e.reason));
const reset=()=>{measureStart=performance.now();completed=0;samples=[];recent=[];};
function qualityInfo(){return {...app.activeQuality,mode,state:mode==='auto'?tuner.state:'Manual quality'};}
async function changeQuality(level){
 if(adjusting)return;adjusting=true;
 try{await GPU.queue.onSubmittedWorkDone();applyQuality(app,level);tuner.level=level;recent=[];adjustAt=performance.now()+4000;send({quality:qualityInfo(),output:[app.engine.width,app.engine.height]});}catch(e){fail(e);}finally{adjusting=false;}
}
try{
 if(diagnostic&&diagnostic.pass!=='proof-alone')throw Error('Only proof-alone may use the direct proof profiler');
 if(!navigator.gpu)throw Error('WebGPU is unavailable. This proof never substitutes WebGL.');
 const adapter=await navigator.gpu.requestAdapter({powerPreference:'high-performance'});
 if(!adapter)throw Error('This browser exposes WebGPU but no usable adapter. No fallback is used.');
 if(adapter.limits.maxComputeWorkgroupStorageSize<18432)throw Error('This Tidewater revision needs at least 18,432 bytes of compute workgroup memory; this device exposes '+adapter.limits.maxComputeWorkgroupStorageSize+'.');
 app=new BeachApp();
 app.updateSun=()=>{app.atmosphere.sunDir.value.set(-SUN[0],SUN[1],-SUN[2]);G.sunDir.value.copy(app.atmosphere.sunDir.value);G.night.value=0;app.sky.starIntensity.value=0;};
 await app.init((fraction,label)=>{document.querySelector('#error').textContent=label+' · '+Math.round(fraction*100)+'%';send({status:'loading',stage:label,label});});
 if(diagnostic)profileRun=new ProfileRun(diagnostic);
 if(app.clouds)app.clouds.coverage.value=TEST.cloudCover;connectApp(app);
 clock=new WaveClock(performance.now(),30);mode=app.initialQuality.mode;tuner=new AutoQuality(app.qualityLevel);adjustAt=performance.now()+5000;
 GPU.device.addEventListener('uncapturederror',e=>fail(e.error));GPU.device.lost.then(info=>fail('Device lost: '+info.message));
 document.querySelector('#status').style.display='none';
 const adapterInfo=GPU.adapter.info||{};
 send({status:'ready',backend:'WebGPU',fallback:false,pin:PIN,loadMs:performance.now()-started,viewport:[innerWidth,innerHeight],output:[app.engine.width,app.engine.height],deviceDpr:devicePixelRatio,internalScale:app.settings.renderScale,camera:CAMERA,quality:qualityInfo(),adapter:{vendor:adapterInfo.vendor||null,architecture:adapterInfo.architecture||null,device:adapterInfo.device||null},test:TEST});
 reset();
 function frame(now){
  if(failed)return;
  if(!paused&&!document.hidden&&!adjusting&&inFlight<1){
   try{
    if(profileRun){
     const dims=[app.engine.width,app.engine.height],wanted=[Math.floor(innerWidth*diagnostic.dpr),Math.floor(innerHeight*diagnostic.dpr)];
     if(dims.some((v,i)=>v!==wanted[i]||profileDimensions&&v!==profileDimensions[i])||app.engine.canvas.width!==dims[0]||app.engine.canvas.height!==dims[1])throw Error('Proof viewport/DPR changed; rerun this case');
     profileDimensions=dims;
    }
    const time=renderAt(app,G,clock.sample(now));
    inFlight++;
    GPU.queue.onSubmittedWorkDone().then(()=>{inFlight--;completed++;const t=performance.now();samples.push(t);recent.push(t);while(recent.length&&recent[0]<t-3000)recent.shift();
     if(profileRun){const result=profileRun.observe(t);if(result){paused=true;send({status:'profile-result',result:{...result,...profileMetadata(app,diagnostic,G,GPU,[app.engine.canvas.width,app.engine.canvas.height],'direct native proof; no DayBuoy host or copies')}});}}
    }).catch(fail);
    const info={now,...time,quality:qualityInfo(),output:[app.engine.width,app.engine.height],fps:currentFPS};
    for(const listener of listeners)listener(info);
    const p=app.activeQuality;
    hud.textContent=`${info.output.join('×')} · DPR ${p.dpr} · ${currentFPS.toFixed(1)} fps\n${mode==='auto'?'Auto · ':''}${p.name} · waves ${p.lod}× LOD · spray ${p.spray.toLocaleString()}\nRefraction ${Math.round(p.reflection*100)}% · reflections ${p.reflectionCube}² / ${p.reflectionSeconds}s\nClock ${(time.waveSeconds-30).toFixed(2)}s · swell ${app.shore.period.value.toFixed(1)}s · ${tuner.state}`;
   }catch(e){fail(e);return;}
  }
  if(now-lastMetrics>1000&&!paused&&!document.hidden){
   const elapsed=(now-measureStart)/1000;while(recent.length&&recent[0]<now-3000)recent.shift();
   currentFPS=recent.length/Math.min(3,Math.max(.001,elapsed));
   const intervals=samples.slice(1).map((t,i)=>t-samples[i]).sort((a,b)=>a-b);
   send({status:'running',backend:'WebGPU',fps:elapsed>0?completed/elapsed:null,recentFps:currentFPS,completedFrames:completed,seconds:elapsed,p95ms:intervals.length?intervals[Math.floor(intervals.length*.95)]:null,resolution:[app.engine.width,app.engine.height],output:[app.engine.width,app.engine.height],internalScale:app.settings.renderScale,quality:qualityInfo(),waveSeconds:G.time.value,fftSeconds:app.fft.time.value,metric:'Completed GPU submissions per second; not GPU timestamp duration'});lastMetrics=now;
   if(mode==='auto'&&!adjusting&&now>=adjustAt){adjustAt=now+3000;if(tuner.observe(currentFPS))void changeQuality(tuner.level);}
  }
  requestAnimationFrame(frame);
 }
 window.addEventListener('message',e=>{if(e.origin!==location.origin||e.source!==parent)return;const d=e.data;if(d.type==='pause'){paused=d.value;reset();}if(d.type==='reset-metrics')reset();if(d.type==='quality'){mode=d.value==='auto'?'auto':'manual';tuner.slow=0;tuner.state=mode==='auto'?'Measuring':'Manual quality';if(mode==='manual')void changeQuality(Math.max(0,Math.min(5,Number(d.value)||0)));else adjustAt=performance.now()+3000;}});
 document.addEventListener('visibilitychange',()=>{if(profileRun&&!profileRun.done&&document.hidden)fail('Proof profiling interrupted: page hidden');recent=[];adjustAt=performance.now()+5000;reset();});
 const snapshot=document.createElement('canvas');let snapshotContext;
 const proof=window.__proof={app,GPU,get canvas(){return app.engine.canvas;},reset,subscribeFrames(fn){listeners.add(fn);return()=>listeners.delete(fn);},copyFrame(ctx,...box){if(snapshot.width)ctx.drawImage(snapshot,...box);},enableSnapshots(){snapshot.width=390;snapshot.height=844;snapshotContext=snapshot.getContext('2d');return proof.subscribeFrames(()=>snapshotContext.drawImage(app.engine.canvas,0,0,390,844));},recordTimingClip:()=>recordTimingClip(proof),captureStill:()=>captureStill(proof),setView(name){const angle=({left:90,right:-90,back:180,front:0})[name]*Math.PI/180;if(Number.isFinite(angle)){const c=app.camera;c.lookAt(c.position.x+Math.sin(angle)*10,c.position.y-2,c.position.z+Math.cos(angle)*10);}},captureQualityPair:()=>captureQualityPair({app,G,GPU,changeQuality,getQuality:qualityInfo,setPaused:value=>{paused=value;}})};
 requestAnimationFrame(frame);
}catch(error){fail(error);}
