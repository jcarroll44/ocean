import assert from 'node:assert/strict';
import {FrameGate,LoopProbe,loopMode,clearFrame,LOOP_PASSES} from '../ocean-proof/proof/loop-profile.js';
import {ProfileRun,profileConfig} from '../ocean-proof/proof/profile.js';
// Delayed completion must gate only the original path. rAF cases must submit
// without registering a per-frame fence, even if all prior GPU work is pending.
let resolve,waits=0,ticks=[];
const queue={onSubmittedWorkDone(){waits++;return new Promise(r=>{resolve=r;});}};
const gate=new FrameGate(true,()=>50);
gate.submitted(queue,0,t=>ticks.push(t),e=>{throw e;});assert(gate.busy);assert.equal(waits,1);assert.equal(ticks.length,0);
resolve();await Promise.resolve();assert(!gate.busy);assert.deepEqual(ticks,[50]);
for(const pass of ['native-empty-raf','native-readback','native-raf']){
 const free=new FrameGate(loopMode(pass).wait);ticks=[];
 for(let t=0;t<100;t+=1000/60){assert(!free.busy);free.submitted(queue,t,x=>ticks.push(x),e=>{throw e;});}
 assert.equal(waits,1);assert(ticks.length>=6);
}
for(const pass of ['native',...LOOP_PASSES])assert.equal(profileConfig('?ocean-profile=1&profile-pass='+pass).dpr,2);
// CPU readback suppression must preserve the producer methods and prime first.
let now=0,copies=0;const run={origin:0,start:15000,last:35000};
const queryUpdate=()=>{},atmoUpdate=()=>{};
const app={query:{update:queryUpdate,readback:{request:()=>{copies++;return true;}}},atmosphere:{update:atmoUpdate,readback:{request:()=>{copies++;return true;}}}};
const p=new LoopProbe(run,loopMode('native-readback'));p.readbacks(app,()=>now);
assert(app.query.readback.request());now=2999;assert(app.atmosphere.readback.request());assert.equal(copies,2);
now=3000;assert.equal(app.query.readback.request(),false);now=16000;assert.equal(app.atmosphere.readback.request(),false);assert.equal(copies,2);
assert.equal(app.query.update,queryUpdate);assert.equal(app.atmosphere.update,atmoUpdate);
// Exclude warm-up, keep skipped-frame CPU cost, and report native draw subset.
for(const [t,cpu,draw,busy] of [[1000,99,88,false],[16000,2,1,false],[16016,3,null,true],[16032,4,2,false]]){p.begin(t,busy);if(draw!==null)p.draw(draw);p.end(cpu);}
const r=p.result();assert.equal(r.cpuFrame.samples,3);assert.equal(r.cpuFrame.meanMs,3);assert.equal(r.cpuRender.meanMs,1.5);assert.equal(r.skippedWhileGPUInFlight,1);assert.equal(r.rafFPS,62.5);assert.equal(r.readbackRequests.atmosphere.suppressed,1);
// A clear-only frame encodes just one color attachment and no scene draws.
const calls=[];let descriptor;
clearFrame({beginFrame:()=>calls.push('begin'),context:{getCurrentTexture:()=>({createView:()=>42})},encoder:{beginRenderPass:d=>{descriptor=d;calls.push('pass');return {end:()=>calls.push('end')};}},submit:()=>calls.push('submit')});
assert.deepEqual(calls,['begin','pass','end','submit']);assert.equal(descriptor.colorAttachments[0].view,42);assert.equal(descriptor.colorAttachments[0].loadOp,'clear');
// Even a simulated 60-Hz 2-minute rAF run cannot pass GPU/display acceptance.
const raf=new ProfileRun({pass:'native-raf',seconds:120,warmup:0});let result;
for(let t=0;t<=120017;t+=1000/60)result=raf.observe(t)||result;
assert(result.fps>59);assert.equal(result.metric,'raf-submitted');assert.equal(result.meetsCadenceTarget,false);
console.log('PASS: delayed-fence vs ungated submissions, no per-frame waits in rAF cases, warm-up/readback suppression, CPU/rAF accounting, clear-only encoding and metric acceptance separation. Synthetic timing; no device FPS claim.');
