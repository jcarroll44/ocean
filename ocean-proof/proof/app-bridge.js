import {Vector2} from '../vendor/tidewater/src/engine/index.js';
import {G} from '../vendor/tidewater/src/core/Globals.js';
export function connectApp(app){
 if(!new URLSearchParams(location.search).has('embedded'))return null;
 document.querySelector('#hud').hidden=true;
 let remote=null,lastForecast=-Infinity,sequence=0,workerBusy=false,pending=null,fieldKey='';
 const worker=new Worker(new URL('./shore-worker.js',import.meta.url),{type:'module'});
 let first=true;
 const rebuild=()=>{
  if(workerBusy||!pending)return;workerBusy=true;const p=pending;pending=null;
  const data=first?{size:app.terrainData.size,res:app.terrainData.res,texel:app.terrainData.texel,origin:app.terrainData.origin,heights:app.terrainData.heights}:null;first=false;
  worker.postMessage({id:++sequence,data,propagation:p.propagation,tide:p.tide});
 };
 worker.onmessage=async e=>{
  workerBusy=false;if(e.data.field){await app.gpu.queue.onSubmittedWorkDone();
   app.shoreField=e.data.field;app.terrainGPU.shoreField=e.data.field;app.terrainGPU.setShoreField(e.data.field);
   const old=app.shore.dirTexture;app.shore.buildDirTexture({min:new Vector2(-190,-170),size:380});old?.destroy();
  }else parent.postMessage({type:'proof',engine:'tidewater',integrationWarning:'Shore direction field: '+e.data.error},location.origin);rebuild();
 };
 worker.onerror=e=>{workerBusy=false;parent.postMessage({type:'proof',engine:'tidewater',integrationWarning:'Shore direction worker failed: '+e.message},location.origin);};
 const projection=Object.getPrototypeOf(app.camera).updateProjectionMatrix;
 app.camera.updateProjectionMatrix=function(){projection.call(this);if(remote?.camera){this.projectionMatrix.elements[8]=remote.camera.shearX;this.projectionMatrix.elements[9]=remote.camera.shearY;this.projectionMatrixInverse.copy(this.projectionMatrix).invert();}};
 const initialSun=app.updateSun;
 app.updateSun=()=>{
  if(!remote)return initialSun();const s=remote.sun;
  app.atmosphere.sunDir.value.set(-s[0],s[1],-s[2]);G.sunDir.value.copy(app.atmosphere.sunDir.value);
  // Stage 1 keeps the approved WebGL night renderer. Never invent a full moon.
  G.night.value=0;app.sky.starIntensity.value=0;
 };
 window.addEventListener('message',e=>{
  if(e.origin!==location.origin||e.source!==parent||e.data?.type!=='daybuoy-frame')return;
  remote=e.data;const c=remote.camera;
  app.camera.position.set(-c.position[0],c.position[1],-c.position[2]);app.camera.up.set(0,1,0);
  app.camera.lookAt(-c.position[0]-c.direction[0],c.position[1]+c.direction[1],-c.position[2]-c.direction[2]);
  app.camera.fov=c.fov;app.camera.aspect=c.aspect;app.camera.near=c.near;app.camera.far=c.far;app.camera.updateProjectionMatrix();
  if(remote.forecast&&performance.now()-lastForecast>=1000){
   lastForecast=performance.now();const source=remote.forecast;
   const steps={swell:.01,period:.05,direction:1,wind:.1,windDirection:1,tide:.01,cloud:1};
   const signature=JSON.stringify(Object.fromEntries(Object.entries(steps).map(([key,step])=>[key,Math.round(source[key]/step)*step])));
   if(signature!==app.forecastSignature&&app.setForecast(remote.forecast)){
    app.forecastSignature=signature;
    const key=[Math.round(remote.forecast.direction/5),Math.round(app.marine.tide*10)].join(':');
    if(key!==fieldKey){fieldKey=key;pending=app.marine;rebuild();}
   }
  }
 });
 return {get remote(){return remote;}};
}
