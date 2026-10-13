// Bounded volumetric adaptation of Takram three-clouds (MIT), pinned source:
// takram-design-engineering/three-geospatial b012ad06d858fc035d88aacfd73f092f93c994e4.
// Perlin-Worley shape/erosion assets and accompanying notices: takram-LICENSE.txt.
// Only this amortized bake raymarches. Sky, reflections and shadows sample one atlas.
import {GPU} from '../vendor/tidewater/src/engine/gpu/GPU.js';
import {Texture} from '../vendor/tidewater/src/engine/gpu/Texture.js';
import {ComputeKernel} from '../vendor/tidewater/src/engine/gpu/Compute.js';
import {UniformBlock,ShaderModule} from '../vendor/tidewater/src/engine/gpu/Shader.js';
export const CLOUD_BUDGET=Object.freeze({width:512,height:128,columns:256,rows:1,layers:3,primarySteps:18,shadowSteps:3,refreshMs:20000,fadeMs:400,refreshFadeMs:1600});
export const SCRUB_CLOUD_BUDGET=Object.freeze({width:512,height:128,columns:512,rows:4}); // full detail; only while changing forecast
const clone=v=>Array.isArray(v)?v.map(clone):v?.clone?v.clone():v;
export class CloudSchedule {
 constructor(){this.current=0;this.previous=0;this.staging=1;this.row=0;this.column=0;this.fadeMs=CLOUD_BUDGET.fadeMs;this.valid=false;this.active=false;this.completedKey=null;this.bakedAt=-Infinity;this.changedAt=-Infinity;this.generations=0;}
 begin(key,now){this.active=true;this.key=key;this.row=0;this.column=0;this.startedAt=now;}
 complete(now){this.fadeMs=this.valid&&this.completedKey===this.key?CLOUD_BUDGET.refreshFadeMs:CLOUD_BUDGET.fadeMs;this.previous=this.current;this.current=this.staging;this.staging=[0,1,2].find(i=>i!==this.current&&i!==this.previous)??2;this.active=false;this.valid=true;this.changedAt=now;this.bakedAt=this.startedAt;this.completedKey=this.key;this.generations++;}
 mix(now){return Math.max(0,Math.min(1,(now-this.changedAt)/this.fadeMs));}
}
export function createCloudCache(weather,prepareSnapshot=()=>{}){
 const b=CLOUD_BUDGET,schedule=new CloudSchedule();
 const atlas=new Texture({label:'Weather cloud cache',width:b.width,height:b.height,depth:3,dimension:'2d-array',format:'rgba16float',usage:['sample','storage']});
 const display=new UniformBlock('CloudDisplay',{current:['i32',0],previous:['i32',0],blend:['f32',1],valid:['f32',0],currentEmpty:['f32',0],previousEmpty:['f32',0]});
 const module=new ShaderModule({name:'cachedVolumeClouds',uniforms:display,uniformName:'cloudDisplay',bindings:{cloudAtlas:{texture:atlas}},code:`
fn cloudReconstruct(uv:vec2f,layer:i32)->vec4f {
 // Four bilinear taps reconstruct a smooth cubic footprint from a COMPLETE
 // atlas. No nearest-neighbour cells and no extra raymarch at display time.
 let size=vec2f(512.0,128.0);let p=uv*size-.5;let cell=floor(p);let f=fract(p);
 let w0=pow(1.0-f,vec2f(3.0))/6.0;
 let w1=(3.0*f*f*f-6.0*f*f+4.0)/6.0;
 let w2=(-3.0*f*f*f+3.0*f*f+3.0*f+1.0)/6.0;
 let w3=f*f*f/6.0;let g0=w0+w1;let g1=w2+w3;
 let a=(cell-1.0+w1/g0+.5)/size;let b=(cell+1.0+w3/g1+.5)/size;
 let ay=clamp(a.y,.00390625,.99609375);let by=clamp(b.y,.00390625,.99609375);
 return textureSampleLevel(cloudAtlas,smpLinearRepeat,vec2f(a.x,ay),layer,0.0)*g0.x*g0.y
  +textureSampleLevel(cloudAtlas,smpLinearRepeat,vec2f(b.x,ay),layer,0.0)*g1.x*g0.y
  +textureSampleLevel(cloudAtlas,smpLinearRepeat,vec2f(a.x,by),layer,0.0)*g0.x*g1.y
  +textureSampleLevel(cloudAtlas,smpLinearRepeat,vec2f(b.x,by),layer,0.0)*g1.x*g1.y;
}
fn cachedCloud(dir:vec3f)->vec4f {
 if(cloudDisplay.valid<0.5||(cloudDisplay.currentEmpty>.5&&cloudDisplay.blend>=.999)){return vec4f(0.0);}
 let uv=vec2f(atan2(dir.x,dir.z)/6.2831853+0.5,clamp(sqrt(max(0.0,(asin(clamp(dir.y,-1.0,1.0))+.07)/1.6407963)),.00390625,.99609375));
 let bUV=clamp(uv,vec2f(.0009765625,.00390625),vec2f(.9990234375,.99609375));
 var b=vec4f(0.0);if(cloudDisplay.currentEmpty<.5){b=cloudReconstruct(bUV,cloudDisplay.current);}
 if(cloudDisplay.blend>=.999){return b;}
 let aUV=bUV;
 var a=vec4f(0.0);if(cloudDisplay.previousEmpty<.5){a=cloudReconstruct(aUV,cloudDisplay.previous);}
 return mix(a,b,cloudDisplay.blend);
}`});
 const snapshot=new UniformBlock('CloudSnapshot',Object.fromEntries(weather.order.map(k=>[k,[weather.layout[k].typeStr,clone(weather.fields[k].value)]])));
 const bake=new UniformBlock('CloudBake',{row:['u32',0],column:['u32',0],layer:['i32',1],width:['u32',512],height:['u32',128]});
 let kernel,targetKey='initial',scrubbing=false,work=b;const empty=[1,1,1];
 const api={module,schedule,setKey(key,dragging=false){scrubbing=!!dragging;targetKey=String(key??'live')+(scrubbing?':scrub':'');},state(now=performance.now()){return{...b,ready:schedule.valid&&schedule.completedKey===targetKey&&schedule.mix(now)===1,active:schedule.active,row:schedule.row,column:schedule.column,empty:!!empty[schedule.current],generations:schedule.generations,targetKey,completedKey:schedule.completedKey,scrubbing,activeResolution:[work.width,work.height],snapshotLayers:snapshot.fields.covers.value.toArray()};},async initialize(){
  const bundled=globalThis.__DAYBUOY_BUNDLED_CLOUDS__;
   const load=async name=>{
    const base64=bundled?.[name];
    if(typeof base64==='string'){
     window.__daybuoyStartupMark?.('cloud-asset-bundled',{name,bytes:Math.floor(base64.length*3/4)});
     const bytes=atob(base64),data=new Uint8Array(bytes.length);
     for(let i=0;i<bytes.length;i++)data[i]=bytes.charCodeAt(i);
     return data;
    }
    window.__daybuoyStartupMark?.('cloud-asset-fetch-start',{name});
    const r=await fetch(new URL('./'+name,import.meta.url));
    if(!r.ok)throw Error('Cloud noise asset unavailable: '+name+' (HTTP '+r.status+')');
    const data=new Uint8Array(await r.arrayBuffer());
    window.__daybuoyStartupMark?.('cloud-asset-fetch-complete',{name,bytes:data.byteLength});return data;
   };
   const [shape,detail]=await Promise.all(['takram-shape.bin','takram-detail.bin'].map(load));
  if(shape.length!==128**3||detail.length!==32**3)throw Error('Cloud noise asset length mismatch');
  const noise=(label,size,data)=>new Texture({label,width:size,height:size,depth:size,dimension:'3d',format:'r8unorm',data});
  kernel=new ComputeKernel({label:'Amortized 3D cloud bake · 256 pixels',workgroupSize:[8,1,1],modules:[new ShaderModule({uniforms:snapshot,uniformName:'weather'}),new ShaderModule({uniforms:bake,uniformName:'bake'})],bindings:{cloudShape:{texture:noise('Takram shape',128,shape)},cloudErosion:{texture:noise('Takram erosion',32,detail)},cloudOutput:{storageTexture:atlas,viewDimension:'2d-array'}},code:CLOUD_BAKE_WGSL});
  await GPU.pipelinesReady();
 },step(now=performance.now()){
  if(!kernel)return;
  // Drop only an unpublished full-resolution generation when its target changes.
  // Subsequent changing keys never restart work, so continuous drags cannot
  // starve publication. Current/previous complete textures remain untouched.
  if(schedule.active&&work===b&&(scrubbing||schedule.key!==targetKey))schedule.active=false;
  if(!schedule.active&&schedule.mix(now)===1&&(!schedule.valid||schedule.completedKey!==targetKey||(!empty[schedule.current]&&now-schedule.bakedAt>=b.refreshMs))){
   schedule.begin(targetKey,now);work=scrubbing||(schedule.valid&&schedule.completedKey!==targetKey)?SCRUB_CLOUD_BUDGET:b;
   bake.fields.width.value=work.width;bake.fields.height.value=work.height;
   for(const k of weather.order)snapshot.fields[k].value=clone(weather.fields[k].value);
   // Bake the requested hour, not the first eased frame on the way to it.
   // Presentation transitions happen only between completed coherent atlases.
   prepareSnapshot(snapshot);
   // An exactly empty density field has exactly zero radiance/opacity.
   // Publish that result without marching or sampling an uninitialized atlas.
   empty[schedule.staging]=snapshot.fields.covers.value.toArray().every(v=>v===0)&&snapshot.fields.offshoreLayers.value.every(v=>v.w===0||v.toArray().slice(0,3).every(n=>n===0))&&snapshot.fields.squall.value.z===0?1:0;
   if(empty[schedule.staging])schedule.complete(now);
  }
  if(schedule.active){
   bake.fields.row.value=schedule.row;bake.fields.column.value=schedule.column;bake.fields.layer.value=schedule.staging;kernel.dispatch([work.columns/8,work.rows]);
   schedule.column+=work.columns;if(schedule.column>=work.width){schedule.column=0;schedule.row+=work.rows;}
   if(schedule.row>=work.height)schedule.complete(now);
  }
  display.fields.current.value=schedule.current;display.fields.previous.value=schedule.previous;display.fields.blend.value=schedule.mix(now);display.fields.valid.value=schedule.valid?1:0;
  display.fields.currentEmpty.value=empty[schedule.current];display.fields.previousEmpty.value=empty[schedule.previous];
 },async warm(){
  // Loading only: each stripe has its own submission, so snapshot/row writes
  // cannot alias a later stripe in the same command buffer. Never used in gate.
  if(!kernel||schedule.valid)return;
  for(let i=0;i<b.height/b.rows*b.width/b.columns&&!schedule.valid;i++){api.step();GPU.submit();if(i%8===7)await GPU.queue.onSubmittedWorkDone();}
  schedule.changedAt=-Infinity;display.fields.blend.value=1;
 },get source(){return kernel?.source;}};
 return api;
}
export const CLOUD_BAKE_WGSL=`
// Cloud density remapping, detail erosion, Beer-Lambert integration and
// secondary light optical depth follow Takram's MIT clouds implementation.
const EARTH:f32=6371000.0;
fn altitude(p:vec3f)->f32{return p.y+dot(p.xz,p.xz)/(2.0*EARTH);}
fn shellDistance(rd:vec3f,h:f32)->f32 {
 // Rationalized quadratic avoids float32 cancellation near the horizon.
 let r=EARTH+3.0;let delta=(h-3.0)*(2.0*EARTH+h+3.0);
 let root=sqrt(max(0.0,r*r*rd.y*rd.y+delta));
 return select(root-r*rd.y,delta/max(1.0,root+r*rd.y),rd.y>=0.0);
}
fn sector(r:i32,s:f32)->vec4f {
 let i=i32(floor(s));let t=fract(s);return mix(weather.offshore[r*7+i],weather.offshore[r*7+i+1],t);
}
fn layerSector(r:i32,s:f32,layer:i32)->f32 {
 let i=i32(floor(s));return mix(weather.offshoreLayers[r*7+i][layer],weather.offshoreLayers[r*7+i+1][layer],fract(s));
}
fn localWeather(p:vec3f,layer:i32)->vec3f {
 let a=atan2(-p.x,p.z);let km=length(p.xz)*.001;
 if(abs(a)>1.5707963){return vec3f(weather.covers[layer],weather.rain/8.0,weather.thunder);}
 let s=clamp((a+1.5707963)/.5235988,0.0,5.9999);
 var r0=0;var r1=0;var t=smoothstep(0.0,8.047,km);
 var left=vec3f(weather.covers[layer],weather.rain/8.0,weather.thunder);
 if(km>8.047){r0=0;r1=1;t=smoothstep(8.047,32.187,km);}
 if(km>32.187){r0=1;r1=2;t=smoothstep(32.187,64.374,km);}
 if(km>8.047){let w=sector(r0,s);let valid=mix(weather.offshoreLayers[r0*7+i32(floor(s))].w,weather.offshoreLayers[r0*7+i32(floor(s))+1].w,fract(s));left=mix(left,vec3f(layerSector(r0,s,layer),w.y,w.z),valid);}
 let w=sector(r1,s);let valid=mix(weather.offshoreLayers[r1*7+i32(floor(s))].w,weather.offshoreLayers[r1*7+i32(floor(s))+1].w,fract(s));
 return mix(left,vec3f(layerSector(r1,s,layer),w.y,w.z),t*valid);
}
fn density(p:vec3f,layer:i32,w:vec3f)->f32 {
 if(w.x<.001){return 0.0;}
 let base=array<f32,3>(850.0,4100.0,8500.0)[layer];
 let thick=array<f32,3>(1700.0,1900.0,950.0)[layer]+select(0.0,w.z*4300.0,layer==0);
 let h=(altitude(p)-base)/thick;if(h<=0.0||h>=1.0){return 0.0;}
 let drift=weather.drift[layer];let scale=array<f32,3>(7800.0,12000.0,21000.0)[layer];
 var q=(p+vec3f((drift.x+drift.z*weather.weatherTime)*array<f32,3>(1600.0,4500.0,9000.0)[layer],0.0,(drift.y+drift.w*weather.weatherTime)*array<f32,3>(1600.0,4500.0,9000.0)[layer]))/scale;
 q+=vec3f(f32(layer)*.273,.137*f32(layer),.419*f32(layer));
 if(layer==2){q*=vec3f(.5,1.0,3.5);}
 let shape=textureSampleLevel(cloudShape,smpLinearRepeat,q,0.0).r;
 // Quantiles measured from the pinned 128^3 asset; cover remains percentage.
 let quantiles=array<f32,17>(.60,.670588,.705882,.729412,.749020,.764706,.776471,.792157,.803922,.815686,.827451,.843137,.854902,.866667,.886275,.905882,.992157);
 let quant=clamp((1.0-w.x)*16.0,0.0,15.999);let idx=i32(floor(quant));let threshold=mix(quantiles[idx],quantiles[idx+1],fract(quant));
 // A varying, feathered condensation base avoids a flat opaque slab even at
 // 100% cover. The volume still closes across multiple cells along the ray.
 let baseRelief=(1.0-shape)*.38;
 let profile=smoothstep(baseRelief,baseRelief+.16,h)*(1.0-smoothstep(.55,1.0,h));
 // Finer erosion reuses the existing sample; sharper display adds no noise
 // lookup to the approved density/shadow loop. The slower cache cadence retains detail.
 let erosion=textureSampleLevel(cloudErosion,smpLinearRepeat,q*9.3,0.0).r;
 let body=smoothstep(threshold-.04,threshold+.10,shape-(1.0-profile)*.19-(1.0-erosion)*.055);
 return mix(body,max(body,.68),smoothstep(.94,1.0,w.x))*profile*mix(.55,1.0,smoothstep(.55,.95,shape))*mix(.55,1.35,clamp(w.y*.5+w.z*.5,0.0,1.0));
}
fn phaseHG(mu:f32,g:f32)->f32{return (1.0-g*g)/pow(max(.05,1.0+g*g-2.0*g*mu),1.5);}
fn approachingShelf(rd:vec3f)->vec4f {
 // A bounded volume at the observed offshore sample's bearing and range.
 // It is baked with the cloud atlas, never marched per display pixel.
 let s=weather.squall;
 if(s.z<.001||rd.y<-.025||rd.y>.55){return vec4f(0.0);}
 let heading=vec2f(-sin(s.x),cos(s.x));let tangent=vec2f(heading.y,-heading.x);
 let forward=dot(rd.xz,heading);if(forward<.1){return vec4f(0.0);}
 let side=dot(rd.xz,tangent)/forward;
 let drift0=weather.drift[0];
 let displacement=vec2f(drift0.z,drift0.w)*1600.0*weather.weatherTime;
 let range=max(6000.0,s.y-dot(displacement,heading));
 let width=s.y*tan(min(s.w,1.04));let depth=max(2400.0,s.y*.18);
 if(abs(side*s.y)>width*1.15){return vec4f(0.0);}
 let start=max(0.0,(range-depth)/forward);let end=(range+depth)/forward;
 let step=(end-start)/8.0;var trans=1.0;var colour=vec3f(0.0);
 for(var i=0;i<8;i++){
  let p=rd*(start+(f32(i)+.5)*step);
  let cross=dot(p.xz,tangent);let along=dot(p.xz,heading)-range;
  let drift=weather.drift[0];let advection=vec2f(drift.x+drift.z*weather.weatherTime,drift.y+drift.w*weather.weatherTime)*1600.0;
  let travel=vec2f(dot(advection,tangent),dot(advection,heading));
  let q=vec3f((cross+travel.x)/4800.0,p.y/2200.0,(along+travel.y)/3600.0);
  let shape=textureSampleLevel(cloudShape,smpLinearRepeat,q,0.0).r;
  let detail=textureSampleLevel(cloudErosion,smpLinearRepeat,q*6.0,0.0).r;
  // Overlapping rounded rolls, with wind-advected crowns and a hanging lower
  // shelf. Density feathers all three axes; there is no rectangular slab.
  let rollX=(cross+travel.x)/2100.0;
  let billow=.5+.28*sin(rollX+.8*sin(rollX*.43))+.22*cos(rollX*1.73+1.4);
  let crown=.5+.5*sin(rollX*.61+2.1);
  let h=altitude(p);let center=1600.0+billow*1300.0;
  let lower=length(vec2f((along+depth*.32)/(depth*.82),(h-center)/(650.0+billow*1050.0)));
  let upper=length(vec2f((along-depth*.15)/depth,(h-3000.0-crown*1700.0)/(1150.0+crown*1000.0)));
  let erosion=(1.0-detail)*.20+(1.0-shape)*.22;
  let hanging=length(vec2f((along+depth*.52)/(depth*.6),(h-950.0-billow*550.0)/(330.0+billow*220.0)));
  let profile=max(max(1.0-smoothstep(.66,1.14,lower+erosion),.7*(1.0-smoothstep(.65,1.15,hanging+erosion))),(.65+.35*shape)*(1.0-smoothstep(.72,1.10,upper+erosion)));
  let edges=1.0-smoothstep(.55,1.0,abs(cross)/width);
  let density=profile*edges*s.z*(.65+.35*detail);
  let alpha=1.0-exp(-density*step*.0018);
  let relief=.16+.84*smoothstep(850.0,5400.0,h);
  let radiance=mix(vec3f(.022,.029,.042),vec3f(.32,.34,.35),weather.daylight)*relief*(.62+.38*detail);
  colour+=trans*alpha*radiance;trans*=1.0-alpha;
 }
 // Rain extinction beneath that same volume: irregular fall streaks, no
 // moving billboard, duplicate local rainfall or arbitrary camera bearing.
 let p=rd*(range/forward);let h=altitude(p);let cross=dot(p.xz,tangent);
 let edge=1.0-smoothstep(.70,1.0,abs(cross)/width);
 let curtainHeight=(1.0-smoothstep(700.0,1500.0,h))*smoothstep(-260.0,-30.0,h);
 let drift=weather.drift[0];let wind=vec2f(drift.z,drift.w)*1600.0;
 let advect=vec2f(drift.x,drift.y)*1600.0+wind*weather.weatherTime;
 let shaftCross=cross+dot(advect,tangent)+dot(wind,tangent)*h/8.0;
 let streak=textureSampleLevel(cloudErosion,smpLinearRepeat,vec3f(shaftCross/3800.0,h/18000.0,weather.weatherTime*.025),0.0).r;
 let broad=textureSampleLevel(cloudShape,smpLinearRepeat,vec3f(shaftCross/6200.0,.38,h/14000.0),0.0).r;
 let shafts=smoothstep(.28,.70,streak)*smoothstep(.48,.76,broad);
 let rainAlpha=curtainHeight*edge*s.z*shafts*.84;
 let rainColour=mix(vec3f(.022,.030,.045),vec3f(.16,.17,.18),weather.daylight);
 return vec4f(colour+trans*rainAlpha*rainColour,1.0-trans*(1.0-rainAlpha));
}
fn marchLayer(rd:vec3f,layer:i32)->vec4f {
 let base=array<f32,3>(850.0,4100.0,8500.0)[layer];
 let top=array<f32,3>(6850.0,6000.0,9450.0)[layer];
 let start=max(0.0,shellDistance(rd,base));let end=min(160000.0,shellDistance(rd,top));
 if(start>=end){return vec4f(0.0);}
 let stepSize=(end-start)/18.0;
 let light=normalize(select(weather.moon,weather.sun,weather.daylight>.2)+vec3f(.00001));
 let moonPower=weather.moonlight*smoothstep(-.02,.18,weather.moon.y);
 let direct=mix(.045*moonPower,weather.direct*weather.energy,weather.daylight);
 let warm=1.0-smoothstep(.0,.4,weather.sun.y);
 let nearSun=smoothstep(.55,.95,dot(normalize(rd.xz+vec2f(.00001)),normalize(light.xz+vec2f(.00001))));
 let lightColour=mix(vec3f(.55,.68,1.0),mix(vec3f(1.0,.94,.84),vec3f(1.0,.64,.38),warm*nearSun*(1.0-weather.closed)),weather.daylight);
 let phase=.75*phaseHG(dot(rd,light),.55)+.25*phaseHG(dot(rd,light),-.2);
 var colour=vec3f(0.0);var trans=1.0;
 for(var i=0;i<18;i++){
  let p=rd*(start+(f32(i)+.5)*stepSize)+vec3f(0.0,3.0,0.0);let w=localWeather(p,layer);let d=density(p,layer,w);
  if(d<.001){continue;}
  let extinction=select(.0013,.00055,layer==2);let alpha=1.0-exp(-d*stepSize*extinction);
  var optical=0.0;
  for(var j=0;j<3;j++){let distance=160.0*pow(2.8,f32(j));optical+=density(p+light*distance,layer,w)*distance*extinction;}
  let shadow=exp(-optical);let multiple=.16*exp(-optical*.22);
  let heightLight=.60+.40*smoothstep(base,top,altitude(p));
  // Broad skylight is occluded by the same 3D optical depth as the key light;
  // retain underside folds in overcast instead of a constant ambient fill.
  let occlusion=.34+.66*exp(-optical*.50);
  let city=vec3f(.012,.008,.006)*(1.0-weather.daylight)*(1.0-smoothstep(base,top,altitude(p)));
  let ambient=(mix(vec3f(.060,.078,.108)*(1.0+moonPower*.35),vec3f(.46,.49,.52)*mix(.62,1.0,weather.energy),weather.daylight)*heightLight+city)*occlusion*(.64+.36*exp(-d*2.2));
  let radiance=ambient+lightColour*direct*(shadow*phase*.50+multiple);
  colour+=trans*alpha*radiance;trans*=1.0-alpha;if(trans<.008){break;}
 }
 return vec4f(colour,1.0-trans);
}
@compute @workgroup_size(WG_X,WG_Y,WG_Z)
fn main(@builtin(global_invocation_id) gid:vec3u){
 let pixel=vec2u(bake.column+gid.x,bake.row+gid.y);if(pixel.x>=bake.width||pixel.y>=bake.height){return;}
 let uv=(vec2f(pixel)+.5)/vec2f(f32(bake.width),f32(bake.height));let angle=(uv.x-.5)*6.2831853;let elevation=uv.y*uv.y*1.6407963-.07;
 let rd=vec3f(sin(angle)*cos(elevation),sin(elevation),cos(angle)*cos(elevation));
 var result=vec4f(0.0);
 // Front to back: opaque low overcast does not spend time baking hidden
 // mid/high layers. Density edges remain volumetric and feathered.
 for(var layer=0;layer<3;layer++){let c=marchLayer(rd,layer);result+=c*(1.0-result.a);if(result.a>.995){break;}}
 let shelf=approachingShelf(rd);result=shelf+result*(1.0-shelf.a);
 textureStore(cloudOutput,vec2i(pixel),bake.layer,result);
}`;
