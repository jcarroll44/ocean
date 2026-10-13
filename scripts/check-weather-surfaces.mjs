// Compile actual production material WGSL. Compute dispatch is deliberately
// omitted: Dawn null has 16 KB workgroup storage, below upstream SH's 18 KB.
// No pixels, iPhone throughput or full simulation validation is implied.
import assert from 'node:assert/strict';import fs from 'node:fs';
import {create,globals} from 'webgpu';Object.assign(globalThis,globals);
Object.defineProperty(globalThis,'navigator',{value:{gpu:create(['backend=null']),userAgent:'validation'},configurable:true});
globalThis.location={search:'?noClouds=1&quality=0'};globalThis.window=globalThis;globalThis.innerWidth=390;globalThis.innerHeight=844;globalThis.devicePixelRatio=1;
globalThis.document={getElementById:()=>null};globalThis.fetch=async url=>new Response(fs.readFileSync(url instanceof URL?url:'ocean-proof/public/'+String(url).replace(/^\//,'')));
const {GPU}=await import('../ocean-proof/vendor/tidewater/src/engine/gpu/GPU.js');
const {Engine}=await import('../ocean-proof/vendor/tidewater/src/engine/Engine.js');
const {MeshRenderer}=await import('../ocean-proof/vendor/tidewater/src/engine/render/MeshRenderer.js');
const {PerspectiveCamera,Scene}=await import('../ocean-proof/vendor/tidewater/src/engine/index.js');
const {FrameUniforms}=await import('../ocean-proof/vendor/tidewater/src/engine/render/Frame.js');
const {composeShader}=await import('../ocean-proof/vendor/tidewater/src/engine/gpu/Shader.js');
const {buildMeshShader}=await import('../ocean-proof/vendor/tidewater/src/engine/render/MeshShader.js');
const {installNativeWeather}=await import('../ocean-proof/proof/native-weather.js');const {installNativeBeach}=await import('../ocean-proof/proof/NativeBeachScene.js');
const {installSkyOrb}=await import('../ocean-proof/proof/sky-orb.js');
const {installForecastSurf}=await import('../ocean-proof/proof/forecast-waves.js');
const {installSmallSurf}=await import('../ocean-proof/proof/scene-polish.js');
const {installWeatherSurfaces}=await import('../ocean-proof/proof/weather-surfaces.js');
const {BeachApp}=await import('../ocean-proof/proof/BeachApp.js');
const {ComputeKernel}=await import('../ocean-proof/vendor/tidewater/src/engine/gpu/Compute.js');
ComputeKernel.prototype.dispatch=()=>{}; // no compute execution in this material-only test
Engine.prototype.init=async function(){await GPU.init({headless:true});this.canvas=this.domElement={width:390,height:844,style:{}};this.meshRenderer=new MeshRenderer();this.camera=new PerspectiveCamera(62,390/844,.3,60000);this.scene=new Scene();FrameUniforms.fields.outputResolution.value.set(390,844);GPU.computePipeline=()=>({pipeline:null,validationOnly:true});};
const app=new BeachApp();app.configureNativeWeather=()=>{app.nativeWeather=installNativeWeather(app);};app.frame=()=>{};
app.configureNativeShore=()=>{installSmallSurf(app.shore);app.forecastSurf=installForecastSurf(app.shore);};
const validated=[],bindingLimits=[];
app.precompile=async()=>{
 GPU.device.pushErrorScope('validation');
 assert.equal(app.fft.params.fields.sysA.value.length,4);
 for(const key of ['initSpectrumKernel','conjugateKernel','copyH0Kernel','rowKernel','columnKernel']){const info=await GPU.device.createShaderModule({code:app.fft[key].source}).getCompilationInfo();assert.equal(info.messages.filter(m=>m.type==='error').length,0,key+': '+info.messages.map(m=>m.message).join('\n'));}
 assert.equal(app.breakers.crest.count,app.breakers.NS*9);
 const beach=installNativeBeach(app),surfaces=installWeatherSurfaces(app,beach);
 assert(!app.spray.material.modules.includes(app.nativeWeather.module),'Spray material must not bind entire weather/cloud shader in vertex stage');
 assert(app.spray.material.vertex.includes('let sun = frame.sunColor * sunVis;'),'Spray vertex shader must match the last passing v8.2');
 assert.equal(app.spray.material.vertex.includes('nativeFoamIncident('),false,'No indirect weather function in Spray vertex');

 app.post._finalPass={source:fs.readFileSync('ocean-proof/vendor/tidewater/src/post/PostFX.js','utf8')};const orb=installSkyOrb(app,beach);const orbInfo=await GPU.device.createShaderModule({code:orb.pass.source}).getCompilationInfo();assert.equal(orbInfo.messages.filter(m=>m.type==='error').length,0,orbInfo.messages.map(m=>m.message).join('\n'));assert(orb.pass.source.includes('fn beachSkyColour('));assert.equal(orb.state().size,64);
 assert.equal(surfaces.rain.geometry.instanceCount,384);assert(app.spray.module.code.includes('nativeWeather.gustExtra'));
 assert(app.breakers.kernel.source.includes('nativeWeather.gustExtra'),'Gust must reach the compiled emitter, not just its module');
 const computeInfo=await GPU.device.createShaderModule({code:app.breakers.kernel.source}).getCompilationInfo();
 assert.equal(computeInfo.messages.filter(m=>m.type==='error').length,0,computeInfo.messages.map(m=>m.message).join('\n'));
 const materials=[app.waterMaterial,app.terrain.material,beach.stand.material,surfaces.rain.material,app.breakers.mesh.material,app.spray.material];
 for(const material of materials){
  const layout=[{name:'position',wgsl:'vec3f',location:0},{name:'normal',wgsl:'vec3f',location:1},{name:'uv',wgsl:'vec2f',location:2},...(material.attributes.nodeData?[{name:'nodeData',wgsl:'vec4f',location:3,instanced:true}]:[])];
  const src=buildMeshShader(material,layout,{kind:'main'}),composed=composeShader({...src,stage:'render'}),info=await GPU.device.createShaderModule({code:composed.code}).getCompilationInfo();
  assert.equal(info.messages.filter(m=>m.type==='error').length,0,material.name+' '+info.messages.map(m=>m.message).join('\n'));validated.push(material.name);
 }
 const error=await GPU.device.popErrorScope();
 if(error){assert(error.message.includes('sampled textures (23)')&&error.message.includes('limit (16)'),error.message);bindingLimits.push('Water material needs 23 sampled textures including the single cloud atlas; Dawn null supports 16. Binding/pipeline execution is not verified.');}
 assert.equal(Object.keys(app.nativeWeather.cache.module.bindings).filter(k=>k==='cloudAtlas').length,1);
 assert(!app.nativeWeather.module.code.includes('marchLayer'),'No per-frame volumetric march');
};
let environmentLimit=null;
try{await app.init();}catch(e){if(!e.message.includes('storage textures (5)')||!e.message.includes('envSource mips'))throw e;environmentLimit='Full environment construction exceeds Dawn null compute storage-texture limit (5 required, 4 available).';}
 assert.equal(validated.length,6);
const result={backend:'Dawn null: shader semantics, no pixels',validated,bindingLimits,computeDispatch:'Not tested',environmentLimit,physicalDevice:false};fs.writeFileSync('night-report/weather-material-checks.json',JSON.stringify(result,null,2));console.log('PASS: '+validated.join(', ')+' production WGSL semantics. Resource-limited pipeline execution is unverified; no pixels or performance claim.');process.exit(0);
