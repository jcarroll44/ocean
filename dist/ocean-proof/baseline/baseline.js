import {CAMERA,TEST} from '../proof/inputs.js';
import {WaveClock} from '../proof/timing.js';
import {SUN} from '../proof/sun.js';
const M=window.__baselineModules,T=M['three.module.js'],canvas=document.querySelector('canvas');
const send=data=>parent.postMessage({type:'proof',engine:'baseline',...data},location.origin),start=performance.now();
const uniforms={uResolution:{value:new T.Vector2(1,1)},uTime:{value:30},uPhase:{value:30/TEST.period},uHour:{value:12},uSwell:{value:TEST.feet*.3048},uWind:{value:TEST.windKnots},uCloud:{value:TEST.cloudCover},uPeriod:{value:TEST.period},uRain:{value:0},uVisibility:{value:28000},uCloudLayers:{value:new T.Vector3(.15,.05,.1)},uCloudQuality:{value:1},uTide:{value:TEST.tide},uDirection:{value:0},uWindDirection:{value:0},uSun:{value:new T.Vector3(...SUN)},uLightning:{value:0},uAfternoon:{value:0},uHazeStrength:{value:0}};
// The retained lighting installer consumes the app-level uniforms binding.
window.uniforms=uniforms;
const listeners=new Set(),clock=new WaveClock(performance.now());
let failed=false,paused=false,prev=0,started=0,frames=0,lastMetrics=0,engine;
const fail=e=>{failed=true;document.querySelector('#error').textContent=String(e?.message||e);send({status:'failed',error:String(e?.message||e),fps:null});};
try{
 engine=M['ocean-engine.js'].createOcean(canvas,uniforms,fail);engine.scene=engine.buoy.group.parent;engine.buoy.group.visible=false;
 window.installDayLighting(engine.scene);
 const resize=()=>{engine.resize(innerWidth,innerHeight,devicePixelRatio||1);engine.setPose(CAMERA.x,CAMERA.y,CAMERA.z,0,CAMERA.pitch,1,CAMERA.shear);};resize();addEventListener('resize',resize);
 const reset=()=>{started=performance.now();frames=0;prev=0;};reset();
 window.addEventListener('message',e=>{if(e.origin!==location.origin||e.source!==parent)return;if(e.data.type==='pause'){paused=e.data.value;reset();}if(e.data.type==='reset-metrics')reset();});
 const backend=typeof WebGL2RenderingContext!=='undefined'&&engine.renderer.getContext() instanceof WebGL2RenderingContext?'WebGL2':'WebGL';
 send({status:'ready',backend,loadMs:performance.now()-start,viewport:[innerWidth,innerHeight],output:[canvas.width,canvas.height],dpr:devicePixelRatio,camera:CAMERA,test:TEST});
 function tick(now){if(failed)return;if(!paused&&!document.hidden){const time=clock.sample(now),dt=Math.min(.05,time.dt);uniforms.uTime.value=time.seconds;uniforms.uPhase.value=time.seconds/TEST.period;try{engine.render(dt);frames++;for(const fn of listeners)fn();}catch(e){fail(e);return;}if(now-lastMetrics>1000){send({status:'running',backend,fps:frames/((now-started)/1000),seconds:(now-started)/1000,output:[canvas.width,canvas.height],metric:'Animation-frame submission cadence; not a GPU timer'});lastMetrics=now;}}else prev=0;requestAnimationFrame(tick);}
 const snapshot=document.createElement('canvas');let snapshotContext;
 window.__proof={engine,get canvas(){return canvas;},reset,copyFrame(ctx,...box){ctx.drawImage(snapshot,...box);},enableSnapshots(){snapshot.width=390;snapshot.height=844;snapshotContext=snapshot.getContext('2d');const fn=()=>snapshotContext.drawImage(canvas,0,0,390,844);listeners.add(fn);return()=>listeners.delete(fn);}};requestAnimationFrame(tick);
}catch(e){fail(e);}
