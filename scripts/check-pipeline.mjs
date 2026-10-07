import assert from 'node:assert/strict';
import {FramePipeline,throttleReadbacks} from '../ocean-proof/proof/pipeline.js';
import {CompletedProfileRun,pipelineSettings,chooseCombo,chooseSustained} from '../ocean-proof/proof/pipeline-profile.js';
import {captureNativePair} from '../ocean-proof/proof/native-capture.js';
const flush=async()=>{await Promise.resolve();await Promise.resolve();};
const fences=[],events=[];let now=0,error;
const queue={onSubmittedWorkDone:()=>new Promise((resolve,reject)=>fences.push({resolve,reject}))};
const p=new FramePipeline({queue,onComplete:e=>events.push(e),onError:e=>error=e,now:()=>now});
p.submittedFrame();p.submittedFrame();assert(p.busy);assert.equal(fences.length,1);assert.equal(p.completed,0);assert.throws(()=>p.submittedFrame(),/window/);
now=50;fences[0].resolve();await flush();assert.equal(p.completed,1);assert(!p.busy);assert.equal(events[0].through,1);
p.submittedFrame();assert.equal(p.inFlight,2);assert.equal(fences.length,2);
let drained=false;const done=p.drain().then(()=>drained=true);
now=65;fences[1].resolve();await flush();assert.equal(p.completed,2);assert.equal(drained,false);assert.equal(fences.length,3);
now=80;fences[2].resolve();await done;assert.equal(p.completed,3);assert.equal(p.inFlight,0);assert.equal(events.reduce((n,e)=>n+e.count,0),3);assert.equal(p.maxInFlight,2);
// Long GPU stalls cannot grow the queue; a rejected observer releases drain
// waiters by rejection and disables future submissions.
p.submittedFrame();const rejected=p.drain();fences[3].reject(Error('device lost'));await assert.rejects(rejected,/device lost/);await flush();assert(error);assert(p.busy);
const GPU={frame:0},waterFrames=[],atmoTimes=[];let t=0;
const waterUpdate=()=>{},atmoUpdate=()=>{};
const app={query:{update:waterUpdate,readback:{request:()=>{waterFrames.push(GPU.frame);return true;}}},atmosphere:{update:atmoUpdate,readback:{request:()=>{atmoTimes.push(t);return true;}}}};
throttleReadbacks(app,GPU,()=>t);
for(let i=0;i<60;i++){GPU.frame=i;t=i*16;app.query.readback.request();app.atmosphere.readback.request();}
assert.deepEqual(waterFrames,[0,4,8,12,16,20,24,28,32,36,40,44,48,52,56]);assert(atmoTimes.every((v,i)=>!i||v-atmoTimes[i-1]>=250));assert.equal(app.query.update,waterUpdate);assert.equal(app.atmosphere.update,atmoUpdate);
// Batched confirmations count frames, not callbacks. Warm-up and final drain
// are excluded; a single slow whole second fails sustained acceptance.
function run(slow=false){const r=new CompletedProfileRun({pass:'native-pipe',warmup:1,seconds:120});let out;
 for(let i=0;i<=2440;i++){const ms=i*50;out=r.observe(ms,slow&&ms>=60000&&ms<61000?1:2)||out;}
 return out;
}
const good=run();assert.equal(good.frames,4800);assert.equal(good.fps,40);assert.equal(good.completionNotifications,2400);assert.equal(good.p95CompletionGapMs,50);assert.equal(good.meetsCadenceTarget,true);assert.equal(good.maxCompletionBatch,2);
assert.equal(run(true).meetsCadenceTarget,false);assert.throws(()=>pipelineSettings('native-pipe-combo',new URLSearchParams('profile-dpr=1')),/Invalid/);
const row=(pass,fps,min=fps)=>({pass,fps,minOneSecondFPS:min,metric:'gpu-completed-pipelined',config:{pass,...pipelineSettings(pass)}});
const rows=[row('native-pipe',27),row('native-pipe175',29),row('native-pipe15',32),row('native-pipe-fxaa',31),row('native-pipe-flare',27)];
assert.deepEqual(chooseCombo(rows),{pass:'native-pipe-combo',dpr:1.5,aa:'fxaa',flare:true});assert.equal(chooseSustained(rows).pass,'native-pipe-fxaa');
// Run capture orchestration with mocked pixels: same clock/state, full reference
// settings, candidate settings, and exact restoration even when export fails.
globalThis.innerWidth=390;globalThis.innerHeight=689;
const samples=[],projection={elements:Array(16).fill(0)};projection.elements[9]=.13;
const inverse={copy(){return this;},invert(){return this;}};
const color={getContext:()=>new Proxy({drawImage(){samples.push({time:G.time.value,dpr:scene.engine.renderScale,aa:scene.post.aaMode,flare:!!scene.post.flare});}},{get:(o,k)=>o[k]??(()=>{})}),toBlob:cb=>cb(new Blob(['mock pixels']))};
globalThis.document={createElement:()=>color};
const G={time:{value:65}},update=()=>{},meter=()=>{},final={},flare={};
const scene={camera:{projectionMatrix:projection,projectionMatrixInverse:inverse},engine:{renderScale:1.5,width:585,height:1033,canvas:{},setRenderScale(d){this.renderScale=d;this.width=Math.floor(390*d);this.height=Math.floor(689*d);projection.elements[9]=0;}},post:{aaMode:'fxaa',flare:null,_finalPass:final,_buildFinal(){this._finalPass={};},meterKernel:{dispatch:meter},taau:{}},proofFlare:flare,activeQuality:{dpr:1.5},fft:{time:{value:65}},shoreSim:{update},spray:{update},breakers:{update},sceneRenderer:{background:{}},sky:{background:{}},frame(dt){assert.equal(dt,0);assert.equal(G.time.value,65);assert.equal(projection.elements[9],.13);assert.notEqual(this.shoreSim.update,update);}};
const beach={stand:{visible:true}},overlays={root:{visible:true}},gpu={queue:{onSubmittedWorkDone:()=>Promise.resolve()},pipelinesReady:()=>Promise.resolve()};
const pair=await captureNativePair({app:scene,beach,overlays,G,GPU:gpu});
assert.equal(samples.length,8);assert(samples.slice(0,4).every(x=>x.dpr===2&&x.aa==='taa'&&x.flare));assert(samples.slice(4).every(x=>x.dpr===1.5&&x.aa==='fxaa'&&!x.flare));assert.deepEqual(pair.metadata.dimensions,[[780,1378],[585,1033]]);assert.equal(scene.post._finalPass,final);assert.equal(scene.post.flare,null);assert.equal(scene.shoreSim.update,update);
color.toBlob=cb=>cb(null);await assert.rejects(captureNativePair({app:scene,beach,overlays,G,GPU:gpu}),/export failed/);assert.equal(scene.post._finalPass,final);assert.equal(scene.engine.renderScale,1.5);assert.equal(scene.post.meterKernel.dispatch,meter);
console.log('PASS: bounded two-frame submissions, exact asynchronous completion watermarks, device-loss/drain handling, 4-frame/250-ms async readback throttles, 120-second completion accounting and same-clock candidate/reference capture restoration. Mock GPU/pixels; no phone FPS claim.');
