import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
import {Color} from '../ocean-proof/vendor/tidewater/src/engine/math/index.js';
import {transitionLight} from '../ocean-proof/proof/transition-light.js';
const G=Object.fromEntries(['sunColor','skyIrradiance','horizonColor'].map(k=>[k,{value:new Color(1,.5,.1)}])),smooth=transitionLight();
smooth(G,false,0);const initial=G.sunColor.value.clone();smooth(G,false,20);assert(G.sunColor.value.equals(initial),'Resting approved light must be exact');
for(const f of Object.values(G))f.value.setRGB(.1,.2,.5);smooth(G,true,40);assert(G.sunColor.value.r>.1&&G.sunColor.value.r<1,'Smooth a discontinuous async lighting update');
for(let i=3;i<100;i++){for(const f of Object.values(G))f.value.setRGB(.1,.2,.5);smooth(G,i<5,i*20);}assert.equal(G.sunColor.value.r,.1,'Return to exact resting light after settling');
let now=0,maps=0,published=0,resolveMap;const submitted=[],copies=[];
class Texture{getGPU(){return{};}}
class FullscreenPass{constructor(o){this.source=o.code;}render(){copies.push('render');}}
const buffer={mapAsync(){maps++;return new Promise(r=>resolveMap=r);},getMappedRange:()=>new ArrayBuffer(64*64*4),unmap(){}};
const GPU={device:{createBuffer:()=>buffer},getEncoder:()=>({copyTextureToBuffer(){copies.push('copy');}}),onSubmit:(a,b)=>submitted.push(b)};
const context={GPU,Texture,FullscreenPass,GPUBufferUsage:{COPY_DST:1,MAP_READ:2},GPUMapMode:{READ:1},performance:{now:()=>now},document:{hidden:false},Uint8ClampedArray};vm.createContext(context);
vm.runInContext(fs.readFileSync('ocean-proof/proof/sky-orb.js','utf8').replace(/^import .*;\n/gm,'').replaceAll('export ',''),context);
const fields={transition:{value:0}},app={post:{_finalPass:{source:'fn RRTAndODTFit(x:f32)->f32{return x;} fn acesFilmicToneMapping(x:f32)->f32{return x;}'},render(){},exposure:{}},atmosphere:{module:{}},sky:{module:{}},nativeWeather:{module:{},uniforms:{fields}}};
context.app=app;context.beach={pass:{source:'fn beachHash(a:vec2f)->f32{return 1.;}\nfn beachSkyColour(a:vec3f)->vec3f{return a;}\nstruct BeachSkyOut'},params:{}};context.publish=()=>published++;
const orb=vm.runInContext('installSkyOrb(app,beach,{publish})',context);
app.post.render();assert.equal(copies.length,2);submitted.shift()();assert.equal(maps,1);
for(let i=0;i<60;i++){now+=16;app.post.render();}assert.equal(maps,1);assert.equal(copies.length,2,'Pending readback never allocates another');
resolveMap();await new Promise(r=>setImmediate(r));assert.equal(published,1);app.post.render();assert.equal(copies.length,4);
submitted.shift()();resolveMap();await new Promise(r=>setImmediate(r));now+=100;app.post.render();assert.equal(copies.length,4,'Rest is capped below 6 Hz');
fields.transition.value=1;app.post.render();assert.equal(copies.length,6,'Drag updates at at most 12 Hz');submitted.shift()();resolveMap();await new Promise(r=>setImmediate(r));context.document.hidden=true;now+=1000;app.post.render();assert.equal(copies.length,6,'Hidden orb does no work');assert.equal(orb.state().size,64);
console.log('PASS: unchanged resting light, smoothed async lighting, shared 64px sky shader, one pending readback, bounded idle/drag cadence and hidden pause. Mock GPU timing; real WGSL separately validated.');
