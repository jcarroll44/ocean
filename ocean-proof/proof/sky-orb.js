// Tiny view of the actual scene sky. Same shader, cloud atlas, astronomy and
// tone map; no second renderer or procedural weather-icon approximation.
import {GPU} from '../vendor/tidewater/src/engine/gpu/GPU.js';
import {Texture} from '../vendor/tidewater/src/engine/gpu/Texture.js';
import {FullscreenPass} from '../vendor/tidewater/src/engine/render/FullscreenPass.js';
export const SKY_ORB=Object.freeze({size:64,idleMs:180,dragMs:90,readbacks:1});
function functionSource(source,name){const a=source.indexOf('fn '+name+'(');if(a<0)throw Error('Sky orb shader hook missing: '+name);let i=source.indexOf('{',a),depth=1;for(i++;depth&&i<source.length;i++){if(source[i]==='{')depth++;if(source[i]==='}')depth--;}return source.slice(a,i);}
export function installSkyOrb(app,beach,{publish}={}){
 const size=SKY_ORB.size,texture=new Texture({label:'Sky orb · actual scene sky',width:size,height:size,format:'rgba8unorm',usage:['render','copySrc']});
 if(!app.post._finalPass)throw Error('Sky orb requires the prepared scene tone map');
 const start=beach.pass.source.indexOf('fn beachHash('),end=beach.pass.source.indexOf('struct BeachSkyOut');
 if(start<0||end<start)throw Error('Sky orb must reuse the scene sky');
 const source=beach.pass.source.slice(start,end),tone=['RRTAndODTFit','acesFilmicToneMapping'].map(name=>functionSource(app.post._finalPass.source,name)).join('\n');
 const pass=new FullscreenPass({label:'Sky orb · 64 × 64',modules:[app.atmosphere.module,app.sky.module,...(app.nativeWeather?[app.nativeWeather.module]:[])],bindings:{beachSky:{uniform:beach.params},orbExposure:{storage:app.post.exposure,access:'read'}},colorFormats:['rgba8unorm'],code:source+tone+`
fn fragment(in:FSIn)->vec4f {
 let night=1.0-smoothstep(-.16,.13,beachSky.sun.y);
 var center=normalize(vec3f(beachSky.sun.x,max(.13,beachSky.sun.y*.65),beachSky.sun.z));
 if(night>.5){center=normalize(vec3f(0.0,.25,1.0));if(beachSky.moon.y>.0){center=normalize(beachSky.moon);}}
 let right=normalize(cross(center,vec3f(0.0,1.0,0.0)));let up=normalize(cross(right,center));
 let p=(in.uv-vec2f(.5))*2.0;let lens=mix(.38,.11,night);
 let rd=normalize(center+(right*p.x-up*p.y)*lens);
 var colour=beachSkyColour(rd);
 // The same forecast rain and real storm flash, confined to this tiny lens.
 let rain=min(nativeWeather.rain*.06,.35);let cell=floor((p.x+p.y*.12)*18.0);let seed=beachHash(vec2f(cell,19.0));
 let streak=(1.0-smoothstep(.0,.12,abs(fract((p.x+p.y*.12)*18.0)-.5)))*(1.0-smoothstep(.08,.55,fract(p.y*1.4+(frame.time*nativeWeather.flashes)*(1.8+seed)+seed)));
 colour+=vec3f(.20,.24,.27)*rain*streak;
 return vec4f(linearToSrgb(acesFilmicToneMapping(colour*orbExposure[0],frame.exposure)),1.0);
}`});
 const buffer=GPU.device.createBuffer({label:'Sky orb asynchronous pixels',size:size*size*4,usage:GPUBufferUsage.COPY_DST|GPUBufferUsage.MAP_READ});
 let busy=false,last=-Infinity,published=0,requested=0,lastError=null;const original=app.post.render;
 app.post.render=function(...args){const result=original.apply(this,args),now=performance.now(),drag=app.nativeWeather?.uniforms.fields.transition.value>.01;
  if(busy||document.hidden||now-last<(drag?SKY_ORB.dragMs:SKY_ORB.idleMs))return result;
  last=now;busy=true;requested++;pass.render({colorViews:[texture],clear:[0,0,0,1]});
  GPU.getEncoder().copyTextureToBuffer({texture:texture.getGPU()},{buffer,bytesPerRow:size*4},{width:size,height:size,depthOrArrayLayers:1});
  GPU.onSubmit(null,()=>{void buffer.mapAsync(GPUMapMode.READ).then(()=>{const bytes=new Uint8ClampedArray(buffer.getMappedRange().slice(0));buffer.unmap();published++;publish?.({bytes,width:size,height:size,sequence:published});}).catch(e=>{lastError=String(e.message||e);}).finally(()=>busy=false);});
  return result;
 };
 return {pass,state:()=>({...SKY_ORB,requested,published,busy,lastError,source:'shared beachSkyColour + completed cloud atlas'})};
}
