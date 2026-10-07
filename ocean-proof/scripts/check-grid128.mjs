// Real derived compute pipelines on Dawn null: validation, NOT pixels/timings.
import assert from 'node:assert/strict';
import {create,globals} from 'webgpu';Object.assign(globalThis,globals);
Object.defineProperty(globalThis,'navigator',{value:{gpu:create(['backend=null'])},configurable:true});
const {GPU}=await import('../vendor/tidewater/src/engine/gpu/GPU.js');
const {OceanFFT,FFT_SIZE}=await import('../proof/grid128/OceanFFT.js');
await GPU.init({headless:true});GPU.device.pushErrorScope('validation');
const fft=new OceanFFT({}, {cascades:3});
assert.equal(FFT_SIZE,128);assert.equal(fft.cascades,3);
for(const t of [fft.displacementTexture,fft.derivativeTexture]){assert.equal(t.width,128);assert.equal(t.height,128);assert.equal(t.depth,3);assert.equal(t.mipLevelCount,8);}
await GPU.pipelinesReady();
const initializationError=await GPU.device.popErrorScope();
const kernels=[fft.initSpectrumKernel,fft.conjugateKernel,fft.copyH0Kernel,fft.rowKernel,fft.columnKernel,...fft.mipKernelsA,...fft.mipKernelsB];
for(const k of kernels){const info=await GPU.device.createShaderModule({code:k.source}).getCompilationInfo();assert.deepEqual(info.messages.filter(m=>m.type==='error'),[],k.label);}
if(initializationError){
 assert(GPU.limits.maxStorageTexturesPerShaderStage<5&&initializationError.message.includes('number of storage textures (5)'),'Unexpected grid128 failure: '+initializationError.message);
 console.log('PARTIAL: derived 128-grid WGSL compiles. Full compute dispatch BLOCKED: adapter permits '+GPU.limits.maxStorageTexturesPerShaderStage+' storage textures per shader; unchanged mip-A design requires 5. '+initializationError.message);
 process.exit(0);
}
GPU.device.pushErrorScope('validation');
GPU.beginFrame();fft.update(1/30);GPU.submit();await GPU.queue.onSubmittedWorkDone();
const calls=[];
for(const k of [fft.rowKernel,fft.columnKernel,...fft.mipKernelsA,...fft.mipKernelsB])k.dispatch=counts=>calls.push([k.label,counts]);
GPU.beginFrame();fft.update(1/30);GPU.submit();await GPU.queue.onSubmittedWorkDone();
assert(calls.some(([label,n])=>label==='Ocean FFT Rows'&&n[0]===128&&n[1]===3));
assert(calls.filter(([label,n])=>label==='Ocean Mips A'&&n[0]===4&&n[1]===4&&n[2]===3).length===2);
const error=await GPU.device.popErrorScope();assert.equal(error,null,error?.message);
console.log('PASS: real 3 × 128 FFT compute pipelines, 7-stage IFFT, 8-level mip chain, 3-layer dispatches on Dawn null. No pixels or iPhone FPS.');process.exit(0);
