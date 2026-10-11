// Dawn null validates WGSL and pipelines, not pixels, throughput or iPhone support.
import assert from 'node:assert/strict';
import {create,globals} from 'webgpu';
Object.assign(globalThis,globals);
Object.defineProperty(globalThis,'navigator',{value:{gpu:create(['backend=null'])},configurable:true});
const root='../ocean-proof/vendor/tidewater/src/';
const {GPU}=await import(root+'engine/gpu/GPU.js');await GPU.init({headless:true});
await import(root+'engine/render/Frame.js');
const {Scene}=await import(root+'engine/index.js');
const {Atmosphere}=await import(root+'sky/Atmosphere.js');
const {Sky}=await import(root+'sky/Sky.js');
const {ShaderModule,composeShader}=await import(root+'engine/gpu/Shader.js');
const {ShoreWaves}=await import(root+'ocean/ShoreWaves.js');
const {installNativeWeather}=await import('../ocean-proof/proof/native-weather.js');
const {installNativeBeach}=await import('../ocean-proof/proof/NativeBeachScene.js');
const {installSmallSurf}=await import('../ocean-proof/proof/scene-polish.js');
GPU.device.pushErrorScope('validation');
const atmosphere=new Atmosphere(),app={atmosphere,sky:new Sky(atmosphere),settings:{exposure:.55},sceneRenderer:{},scene:new Scene(),terrainData:{heightAt:()=>0}};
app.nativeWeather=installNativeWeather(app);
const beach=installNativeBeach(app),reflections=app.sky.background.pass;
for(const pass of [beach.pass,reflections]){
 const info=await GPU.device.createShaderModule({code:pass.source}).getCompilationInfo();
 assert.equal(info.messages.filter(m=>m.type==='error').length,0,info.messages.map(m=>m.message).join('\n'));
}
// Exercise all three patched evaluation variants with terrain function stubs;
// terrain source itself remains frozen and is not under test here.
const terrain={module:new ShaderModule({name:'polishTestTerrain',code:'fn terrainHeightAt(p:vec2f)->f32{return -1.0;} fn terrainShoreSample(p:vec2f)->vec4f{return vec4f(0.0,0.0,1.0,1.0);}'})};
const shore=new ShoreWaves(terrain);installSmallSurf(shore);
const source=composeShader({modules:[shore.module],stage:'compute',code:'@compute @workgroup_size(1) fn main() { let sample=shoreEvaluate(vec2f(0.0),1.0,-1.0); }'}).code;
const info=await GPU.device.createShaderModule({code:source}).getCompilationInfo();
assert.equal(info.messages.filter(m=>m.type==='error').length,0,info.messages.map(m=>m.message).join('\n'));
await Promise.all([...GPU._pending]);
assert(beach.pass.handle.pipeline&&!beach.pass.handle.failed);assert(reflections.handle.pipeline&&!reflections.handle.failed);
const error=await GPU.device.popErrorScope();assert.equal(error,null,error?.message);
console.log('PASS: actual native sky/moon/cloud and reflected sky WGSL plus render pipelines; three modified shore evaluation functions compile on Dawn null. No rendered or phone-speed claim.');
process.exit(0);
