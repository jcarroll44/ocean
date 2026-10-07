import assert from 'node:assert/strict';
import {create,globals} from 'webgpu';
import {FramePipeline} from '../proof/pipeline.js';
Object.assign(globalThis,globals);
const gpu=create(['backend=null']),adapter=await gpu.requestAdapter(),device=await adapter.requestDevice();
device.pushErrorScope('validation');
const buffer=device.createBuffer({size:4,usage:GPUBufferUsage.COPY_DST});
let observed=0,resolve,reject;
const done=new Promise((a,b)=>{resolve=a;reject=b;}),total=64;
const pipeline=new FramePipeline({queue:device.queue,onError:reject,onComplete:e=>{
 observed+=e.count;
 if(observed===total)resolve();else queueMicrotask(pump);
}});
function pump(){
 while(pipeline.submitted<total&&!pipeline.busy){
  const encoder=device.createCommandEncoder();encoder.clearBuffer(buffer);device.queue.submit([encoder.finish()]);pipeline.submittedFrame();
 }
}
const timeout=setTimeout(()=>reject(Error('GPU completion observer stalled')),10000);
try{pump();await done;await pipeline.drain();assert.equal(observed,total);assert.equal(pipeline.completed,total);assert.equal(pipeline.maxInFlight,2);assert.equal(pipeline.inFlight,0);assert.equal(await device.popErrorScope(),null);}
finally{clearTimeout(timeout);buffer.destroy();device.destroy();}
console.log('PASS: 64 real WebGPU queue submissions, exact asynchronous completions and two-frame bound on Dawn null. No pixels or device FPS measurement.');
process.exit(0);
