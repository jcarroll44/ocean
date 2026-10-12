// Bounded volumetric adaptation of Takram three-clouds (MIT), pinned source:
// takram-design-engineering/three-geospatial b012ad06d858fc035d88aacfd73f092f93c994e4.
// Perlin-Worley shape/erosion assets and accompanying notices: takram-LICENSE.txt.
// Only this amortized bake raymarches. Sky, reflections and shadows sample one atlas.
import {GPU} from '../vendor/tidewater/src/engine/gpu/GPU.js';
import {Texture} from '../vendor/tidewater/src/engine/gpu/Texture.js';
import {ComputeKernel} from '../vendor/tidewater/src/engine/gpu/Compute.js';
import {UniformBlock,ShaderModule} from '../vendor/tidewater/src/engine/gpu/Shader.js';
export const CLOUD_BUDGET=Object.freeze({width:512,height:128,rows:1,layers:3,primarySteps:18,shadowSteps:3,refreshMs:6000,fadeMs:400});
export const SCRUB_CLOUD_BUDGET=Object.freeze({width:128,height:32,rows:4}); // same 512 pixels/frame
const clone=v=>Array.isArray(v)?v.map(clone):v?.clone?v.clone():v;
export class CloudSchedule {
 constructor(){this.current=0;this.previous=0;this.staging=1;this.row=0;this.valid=false;this.active=false;this.completedKey=null;this.bakedAt=-Infinity;this.changedAt=-Infinity;this.generations=0;}
 begin(key,now){this.active=true;this.key=key;this.row=0;this.startedAt=now;}
 complete(now){this.previous=this.current;this.current=this.staging;this.staging=[0,1,2].find(i=>i!==this.current&&i!==this.previous)??2;this.active=false;this.valid=true;this.changedAt=now;this.bakedAt=this.startedAt;this.completedKey=this.key;this.generations++;}
 mix(now){return Math.max(0,Math.min(1,(now-this.changedAt)/CLOUD_BUDGET.fadeMs));}
}
export function createCloudCache(weather,prepareSnapshot=()=>{}){
 const b=CLOUD_BUDGET,schedule=new CloudSchedule();
 const atlas=new Texture({label:'Weather cloud cache',width:b.width,height:b.height,depth:3,dimension:'2d-array',format:'rgba16float',usage:['sample','storage']});
 const display=new UniformBlock('CloudDisplay',{current:['i32',0],previous:['i32',0],blend:['f32',1],valid:['f32',0],currentSmall:['f32',0],previousSmall:['f32',0]});
 const module=new ShaderModule({name:'cachedVolumeClouds',uniforms:display,uniformName:'cloudDisplay',bindings:{cloudAtlas:{texture:atlas}},code:`
fn cachedCloud(dir:vec3f)->vec4f {
 if(cloudDisplay.valid<0.5){return vec4f(0.0);}
 let uv=vec2f(atan2(dir.x,dir.z)/6.2831853+0.5,clamp(sqrt(max(0.0,(asin(clamp(dir.y,-1.0,1.0))+.07)/1.6407963)),.00390625,.99609375));
 let bScale=mix(vec2f(1.0),vec2f(.25,.25),cloudDisplay.currentSmall);
 let bUV=clamp(uv*bScale,vec2f(.0009765625,.00390625),bScale-vec2f(.0009765625,.00390625));
 let b=textureSampleLevel(cloudAtlas,smpLinearRepeat,bUV,cloudDisplay.current,0.0);
 if(cloudDisplay.blend>=.999){return b;}
 let aScale=mix(vec2f(1.0),vec2f(.25,.25),cloudDisplay.previousSmall);
 let aUV=clamp(uv*aScale,vec2f(.0009765625,.00390625),aScale-vec2f(.0009765625,.00390625));
 let a=textureSampleLevel(cloudAtlas,smpLinearRepeat,aUV,cloudDisplay.previous,0.0);
 return mix(a,b,cloudDisplay.blend);
}`});
 const snapshot=new UniformBlock('CloudSnapshot',Object.fromEntries(weather.order.map(k=>[k,[weather.layout[k].typeStr,clone(weather.fields[k].value)]])));
 const bake=new UniformBlock('CloudBake',{row:['u32',0],layer:['i32',1],width:['u32',512],height:['u32',128]});
 let kernel,targetKey='initial',scrubbing=false,work=b;const small=[0,0,0];
 const api={module,schedule,setKey(key,dragging=false){scrubbing=!!dragging;targetKey=String(key??'live')+(scrubbing?':scrub':'');},state(now=performance.now()){return{...b,ready:schedule.valid&&schedule.completedKey===targetKey&&schedule.mix(now)===1,active:schedule.active,row:schedule.row,generations:schedule.generations,targetKey,completedKey:schedule.completedKey,scrubbing,activeResolution:[work.width,work.height],snapshotLayers:snapshot.fields.covers.value.toArray()};},async initialize(){
  const [shape,detail]=await Promise.all(['takram-shape.bin','takram-detail.bin'].map(async name=>{const r=await fetch(new URL('./'+name,import.meta.url));if(!r.ok)throw Error('Cloud noise asset unavailable: '+name);return new Uint8Array(await r.arrayBuffer());}));
  if(shape.length!==128**3||detail.length!==32**3)throw Error('Cloud noise asset length mismatch');
  const noise=(label,size,data)=>new Texture({label,width:size,height:size,depth:size,dimension:'3d',format:'r8unorm',data});
  kernel=new ComputeKernel({label:'Amortized 3D cloud bake · 512 pixels',workgroupSize:[8,1,1],modules:[new ShaderModule({uniforms:snapshot,uniformName:'weather'}),new ShaderModule({uniforms:bake,uniformName:'bake'})],bindings:{cloudShape:{texture:noise('Takram shape',128,shape)},cloudErosion:{texture:noise('Takram erosion',32,detail)},cloudOutput:{storageTexture:atlas,viewDimension:'2d-array'}},code:CLOUD_BAKE_WGSL});
  await GPU.pipelinesReady();
 },step(now=performance.now()){
  if(!kernel)return;
  // Drop only an unpublished full-resolution generation when a drag begins.
  // Subsequent changing keys never restart work, so continuous drags cannot
  // starve publication. Current/previous complete textures remain untouched.
  if(schedule.active&&scrubbing&&work===b)schedule.active=false;
  if(!schedule.active&&schedule.mix(now)===1&&(!schedule.valid||schedule.completedKey!==targetKey||now-schedule.bakedAt>=b.refreshMs)){
   schedule.begin(targetKey,now);work=scrubbing?SCRUB_CLOUD_BUDGET:b;small[schedule.staging]=scrubbing?1:0;
   bake.fields.width.value=work.width;bake.fields.height.value=work.height;
   for(const k of weather.order)snapshot.fields[k].value=clone(weather.fields[k].value);
   // Bake the requested hour, not the first eased frame on the way to it.
   // Presentation transitions happen only between completed coherent atlases.
   prepareSnapshot(snapshot);
  }
  if(schedule.active){
   bake.fields.row.value=schedule.row;bake.fields.layer.value=schedule.staging;kernel.dispatch([work.width/8,work.rows]);schedule.row+=work.rows;
   if(schedule.row>=work.height)schedule.complete(now);
  }
  display.fields.current.value=schedule.current;display.fields.previous.value=schedule.previous;display.fields.blend.value=schedule.mix(now);display.fields.valid.value=schedule.valid?1:0;
  display.fields.currentSmall.value=small[schedule.current];display.fields.previousSmall.value=small[schedule.previous];
 },async warm(){
  // Loading only: each stripe has its own submission, so snapshot/row writes
  // cannot alias a later stripe in the same command buffer. Never used in gate.
  if(!kernel||schedule.valid)return;
  for(let i=0;i<b.height/b.rows;i++){api.step();GPU.submit();if(i%8===7)await GPU.queue.onSubmittedWorkDone();}
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
 let r=EARTH+3.0;return -r*rd.y+sqrt(max(0.0,r*r*rd.y*rd.y+(EARTH+h)*(EARTH+h)-r*r));
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
 // lookup to the approved density/shadow loop. Rest refresh retains its duty.
 let erosion=textureSampleLevel(cloudErosion,smpLinearRepeat,q*9.3,0.0).r;
 let body=smoothstep(threshold-.04,threshold+.10,shape-(1.0-profile)*.19-(1.0-erosion)*.055);
 return mix(body,max(body,.68),smoothstep(.94,1.0,w.x))*profile*mix(.55,1.0,smoothstep(.55,.95,shape))*mix(.55,1.35,clamp(w.y*.5+w.z*.5,0.0,1.0));
}
fn phaseHG(mu:f32,g:f32)->f32{return (1.0-g*g)/pow(max(.05,1.0+g*g-2.0*g*mu),1.5);}
fn approachingShelf(rd:vec3f)->vec4f {
 // A bounded volume at the observed offshore sample's bearing and range.
 // It is baked with the cloud atlas, never marched per display pixel.
 let s=weather.squall;
 if(s.z<.001||rd.y<-.005||rd.y>.20){return vec4f(0.0);}
 let heading=vec2f(-sin(s.x),cos(s.x));let tangent=vec2f(heading.y,-heading.x);
 let forward=dot(rd.xz,heading);if(forward<.1){return vec4f(0.0);}
 let side=dot(rd.xz,tangent)/forward;
 let width=s.y*tan(min(s.w,1.04));let depth=max(2000.0,s.y*.18);
 if(abs(side*s.y)>width){return vec4f(0.0);}
 let start=max(0.0,(s.y-depth)/forward);let end=(s.y+depth)/forward;
 let step=(end-start)/8.0;var trans=1.0;var colour=vec3f(0.0);
 for(var i=0;i<8;i++){
  let p=rd*(start+(f32(i)+.5)*step);
  let cross=dot(p.xz,tangent);let along=dot(p.xz,heading)-s.y;
  let q=vec3f(cross/4800.0,p.y/2200.0,along/3600.0);
  let shape=textureSampleLevel(cloudShape,smpLinearRepeat,q,0.0).r;
  let detail=textureSampleLevel(cloudErosion,smpLinearRepeat,q*6.0,0.0).r;
  let base=480.0+(1.0-shape)*720.0;
  let top=1250.0+shape*1050.0+along*.025;
  let h=altitude(p);
  let profile=smoothstep(base,base+150.0,h)*(1.0-smoothstep(top-450.0,top,h));
  let edges=(1.0-smoothstep(.72,1.0,abs(cross)/width))*(1.0-smoothstep(.60,1.0,abs(along)/depth));
  let density=profile*edges*s.z*max(.15,shape-(1.0-detail)*.24);
  let alpha=1.0-exp(-density*step*.0022);
  let relief=.52+.48*smoothstep(base,top,h);
  let radiance=mix(vec3f(.022,.029,.042),vec3f(.15,.16,.17),weather.daylight)*relief*(.78+.22*detail);
  colour+=trans*alpha*radiance;trans*=1.0-alpha;
 }
 // Rain extinction beneath that same volume: irregular fall streaks, no
 // moving billboard, duplicate local rainfall or arbitrary camera bearing.
 let p=rd*(s.y/forward);let h=altitude(p);let cross=dot(p.xz,tangent);
 let edge=1.0-smoothstep(.70,1.0,abs(cross)/width);
 let curtainHeight=(1.0-smoothstep(430.0,850.0,h))*smoothstep(-120.0,60.0,h);
 let streak=textureSampleLevel(cloudErosion,smpLinearRepeat,vec3f(cross/2100.0,h/13000.0,weather.weatherTime*.002),0.0).r;
 let rainAlpha=curtainHeight*edge*s.z*(.30+.32*streak);
 let rainColour=mix(vec3f(.022,.030,.045),vec3f(.25,.27,.28),weather.daylight);
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
 let lightColour=mix(vec3f(.55,.68,1.0),mix(vec3f(1.0,.94,.84),vec3f(1.0,.53,.28),warm),weather.daylight);
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
 let pixel=vec2u(gid.x,bake.row+gid.y);if(pixel.x>=bake.width||pixel.y>=bake.height){return;}
 let uv=(vec2f(pixel)+.5)/vec2f(f32(bake.width),f32(bake.height));let angle=(uv.x-.5)*6.2831853;let elevation=uv.y*uv.y*1.6407963-.07;
 let rd=vec3f(sin(angle)*cos(elevation),sin(elevation),cos(angle)*cos(elevation));
 var result=vec4f(0.0);
 // Front to back: opaque low overcast does not spend time baking hidden
 // mid/high layers. Density edges remain volumetric and feathered.
 for(var layer=0;layer<3;layer++){let c=marchLayer(rd,layer);result+=c*(1.0-result.a);if(result.a>.995){break;}}
 let shelf=approachingShelf(rd);result=shelf+result*(1.0-shelf.a);
 textureStore(cloudOutput,vec2i(pixel),bake.layer,result);
}`;
