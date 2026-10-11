import {BeachApp} from '../ocean-proof/proof/BeachApp.js';
import {installNativeBeach} from '../ocean-proof/proof/NativeBeachScene.js';
import {NativeOverlays} from '../ocean-proof/proof/NativeOverlays.js';
import {GPU} from '../ocean-proof/vendor/tidewater/src/engine/gpu/GPU.js';
import {G} from '../ocean-proof/vendor/tidewater/src/core/Globals.js';
import {WaveClock,renderAt} from '../ocean-proof/proof/timing.js';
import {FramePipeline,throttleReadbacks} from '../ocean-proof/proof/pipeline.js';
import {AdaptiveResolution,PRODUCTION_SETTINGS} from '../ocean-proof/proof/adaptive-resolution.js';
import {installNativeWeather,guardNativeBreakerLip} from '../ocean-proof/proof/native-weather.js';
import {installSmallSurf,smallSurfSpan} from '../ocean-proof/proof/scene-polish.js';
import {ShoreUpload} from '../ocean-proof/proof/shore-upload.js';
import {installWeatherSurfaces} from '../ocean-proof/proof/weather-surfaces.js';
const send=data=>parent.postMessage({type:'daybuoy-ocean',...data},location.origin);
let app,beach,overlays,packet,failed=false,forecastKey='',shoreKey='',shoreBusy=false,pendingShore,shoreUpload;
function fail(error){if(failed)return;failed=true;send({status:'failed',reason:String(error?.message||error)});}
addEventListener('error',e=>fail(e.error||e.message));addEventListener('unhandledrejection',e=>fail(e.reason));
try{
 if(!navigator.gpu)throw Error('WebGPU unavailable');
 app=new BeachApp();const settings=PRODUCTION_SETTINGS,adaptive=new AdaptiveResolution();
 app.configureNativeWeather=()=>{app.nativeWeather=installNativeWeather(app);};
 app.configureNativeShore=()=>installSmallSurf(app.shore);
 const initial=parent.__daybuoy;if(initial)packet={sun:initial.uniforms.uSun.value.toArray(),moon:initial.uniforms.uMoon.value.toArray()};
 const prepare=app.precompile.bind(app);
 app.precompile=async()=>{
  guardNativeBreakerLip(app.breakers);beach=installNativeBeach(app);overlays=new NativeOverlays(app.scene);app.weatherSurfaces=installWeatherSurfaces(app,beach);
  app.engine.setRenderScale(settings.dpr);app.activeQuality={...app.activeQuality,dpr:settings.dpr};app.post.aaMode='fxaa';app.post.flare=null;
  if(initial?.state?.data?.source==='live'){
   const forecast=initial.conditions();if(app.setForecast(forecast)){packet={...packet,forecast};app.shore.breakSpan.value=smallSurfSpan(app.marine.amplitude,app.marine.period);app.shore.updateNativeSurf();app.nativeWeather.update(packet);beach.update(packet);}
  }
  await prepare();await GPU.pipelinesReady();app.frame(1/60);await GPU.pipelinesReady();await GPU.queue.onSubmittedWorkDone();
 };
 const originalReadback=app.applyAtmosphereReadback.bind(app);
 app.applyAtmosphereReadback=()=>{
  originalReadback();if(!packet)return;
  const cover=Math.max(0,Math.min(1,(packet.forecast?.cloud||0)/100)),moon=packet.moon,moonStrength=packet.moonlight||0;
  if(packet.sun[1]<-.07)G.sunColor.value.setRGB(.6,.7,1).multiplyScalar(moon?.[1]>0?.12*moonStrength*(1-cover*.9):0);
  else G.sunColor.value.multiplyScalar(1-cover*.88);
  G.skyIrradiance.value.multiplyScalar(1-cover*.40);
  const flash=packet.lightning||0;G.skyIrradiance.value.r+=flash*.14;G.skyIrradiance.value.g+=flash*.18;G.skyIrradiance.value.b+=flash*.23;
  app.nativeWeather.light(G);
 };
 app.updateSun=()=>{
  if(!packet)return;const s=packet.sun,m=packet.moon;app.atmosphere.sunDir.value.set(-s[0],s[1],-s[2]);
  const light=s[1]<-.07&&m?.[1]>0?m:s;G.sunDir.value.set(-light[0],light[1],-light[2]);G.night.value=Math.max(0,Math.min(1,-s[1]/.18));app.sky.starIntensity.value=0;
  if(m)app.sky.moonDir.value.set(-m[0],m[1],-m[2]);
 };
 await app.init((fraction,label)=>send({status:'loading',fraction,label}));
 const gate=new FramePipeline({queue:GPU.queue,onComplete:e=>adaptive.observe(e.now,e.count),onError:fail});throttleReadbacks(app,GPU);
 document.addEventListener('visibilitychange',()=>adaptive.resetWindow());
 GPU.device.addEventListener('uncapturederror',e=>fail(e.error));GPU.device.lost.then(info=>fail(info.message));
 const clock=new WaveClock(performance.now(),30),worker=new Worker('/assets/shore.js',{type:'module'});let first=true;
 function rebuildShore(){
  if(shoreBusy||!pendingShore)return;shoreBusy=true;const p=pendingShore;pendingShore=null;
  const data=first?{size:app.terrainData.size,res:app.terrainData.res,texel:app.terrainData.texel,origin:app.terrainData.origin,heights:app.terrainData.heights}:null;first=false;
  worker.postMessage({data,propagation:p.propagation,tide:p.tide,retainSurf:true});
 }
 worker.onmessage=e=>{try{if(!e.data.field)throw Error(e.data.error);shoreUpload=new ShoreUpload(e.data.field,e.data.direction);}catch(e){fail(e);}};
 worker.onerror=e=>fail(e.message);
 function applyPacket(p){
  packet=p;const c=p.camera,a=app.camera;
  a.position.set(-c.position[0],c.position[1],-c.position[2]);a.up.set(0,1,0);a.lookAt(-c.position[0]-c.direction[0],c.position[1]+c.direction[1],-c.position[2]-c.direction[2]);
  a.fov=c.fov;a.aspect=c.aspect;a.near=c.near;a.far=c.far;a.updateProjectionMatrix();a.projectionMatrix.elements[8]=c.shearX;a.projectionMatrix.elements[9]=c.shearY;a.projectionMatrixInverse.copy(a.projectionMatrix).invert();
  app.nativeWeather.update(p);app.weatherSurfaces.update();beach.update(p);overlays.update(p.overlays);
  const f=p.forecast,seaLevel=Number.isFinite(f?.tide)?f.tide:(app.marine?.tide??0),key=f?JSON.stringify([f.swell.toFixed(2),f.period.toFixed(2),Math.round(f.direction),f.wind.toFixed(1),Math.round(f.windDirection),seaLevel.toFixed(2)]):'';
  if(f&&key!==forecastKey&&app.setForecast({...f,tide:seaLevel})){
   app.shore.breakSpan.value=smallSurfSpan(app.marine.amplitude,app.marine.period);app.shore.updateNativeSurf();forecastKey=key;
   const next=[Math.round(f.direction/5),Math.round(app.marine.tide*10)].join(':');
   if(next!==shoreKey){shoreKey=next;pendingShore=app.marine;rebuildShore();}
  }
 }
 window.__daybuoyOcean={
  get ready(){if(failed)return false;try{
   if(!adaptive.prepare(performance.now(),gate.inFlight,dpr=>{app.engine.setRenderScale(dpr);app.activeQuality={...app.activeQuality,dpr};app.post.taau._needsRestart=true;return[app.engine.width,app.engine.height,app.engine.canvas.width,app.engine.canvas.height];}))return false;
  }catch(e){fail(e);return false;}return !gate.busy;},
  get canvas(){return app.engine.canvas;},
  draw(p){
   if(failed||gate.busy||adaptive.pending)return false;
   try{applyPacket(p);adaptive.verifyFrame(innerWidth,innerHeight,[app.engine.width,app.engine.height,app.engine.canvas.width,app.engine.canvas.height]);
    if(shoreUpload?.step()){shoreUpload.commit(app,GPU);shoreUpload=null;shoreBusy=false;rebuildShore();}
    renderAt(app,G,clock.sample(performance.now()));gate.submittedFrame();return true;
   }catch(e){fail(e);return false;}
  }
 };
 send({status:'ready',backend:'WebGPU'});
}catch(e){fail(e);}
