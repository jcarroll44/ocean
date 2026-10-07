// Validates only the added spray budget shader hook. Null backend renders no pixels.
import assert from 'node:assert/strict';
const {create,globals}=await import('/workspace/sites/daybuoy-app-v2-preview/node_modules/webgpu/index.js');Object.assign(globalThis,globals);
Object.defineProperty(globalThis,'navigator',{value:{gpu:create(['backend=null'])},configurable:true});
const {GPU}=await import('../vendor/tidewater/src/engine/gpu/GPU.js');await GPU.init({headless:true});
GPU.device.pushErrorScope('validation');
const {ShaderModule}=await import('../vendor/tidewater/src/engine/gpu/Shader.js');
const {Texture}=await import('../vendor/tidewater/src/engine/gpu/Texture.js');
const {TunedSpray}=await import('../proof/TunedSpray.js');
const query={module:new ShaderModule({name:'testWater',code:'fn waterQueryHeightAtXZ(p:vec2f)->f32{return 0.0;}'})};
const terrain={module:new ShaderModule({name:'testGround',code:'fn terrainHeightAt(p:vec2f)->f32{return -5.0;}'})};
const sceneCopy={texture:new Texture({width:1,height:1,format:'rgba16float'})};
const spray=new TunedSpray({}, {query,terrain,sceneCopy});
spray.setBudget(8192);spray._buildUpdate();await GPU.pipelinesReady();
assert(spray.updateKernel.pipeline);assert(spray.updateKernel.source.includes('sprayQuality.activeGPU'));
const counts=[];spray.updateKernel.dispatch=n=>counts.push(n);
for(const n of [32768,8192,4096,512,8192]){spray.setBudget(n);spray.update();assert.equal(spray.NG,n);assert.equal(spray.mesh.count,n);assert.equal(spray.mesh.geometry.instanceCount,n);assert.equal(spray.quality.fields.activeGPU.value,n);assert.equal(counts.at(-1),n/64);}
const error=await GPU.device.popErrorScope();assert.equal(error,null,error?.message);
console.log('PASS: spray-budget WGSL compiles on Dawn null; ring budget, draw instances and dispatch counts match each setting. Not a rendered/iPhone test.');process.exit(0);
