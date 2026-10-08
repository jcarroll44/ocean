import assert from 'node:assert/strict';
import fs from 'node:fs';
import {daylightProofWeight} from '../ocean-proof/proof/NativeBeachScene.js';
import {readLiveEvidence,measureLiveCadence,recordLiveCanvas} from '../ocean-proof/proof/live-evidence.js';
globalThis.location={search:''};
const {BeachApp}=await import('../ocean-proof/proof/BeachApp.js');

// Config must exist before native-scene chooses its loop, DPR and capture mode.
// This executes the real constructor and catches the former init-order bug.
for(const [query,dpr,aa] of [['',null,null],['native-pipe',2,'taa'],['native-adaptive',1.5,'fxaa'],['native-pipe-combo&profile-dpr=1.5&profile-aa=fxaa&profile-flare=1&native-capture=1',1.5,'fxaa']]){
 globalThis.location={search:query?'?ocean-profile=1&profile-pass='+query:''};
 const a=new BeachApp();assert.equal(a.profileConfig?.dpr??null,dpr);assert.equal(a.profileConfig?.aa??null,aa);
}
assert.equal(daylightProofWeight(.8086,0,0),1);
for(const sun of [-1,-.05,.05,.3])assert.equal(daylightProofWeight(sun,0,0),0);
assert.equal(daylightProofWeight(.8,1,0),0);assert.equal(daylightProofWeight(.8,0,2),0);
assert(daylightProofWeight(.5,.4,.2)>0&&daylightProofWeight(.5,.4,.2)<1);
const sky=fs.readFileSync('ocean-proof/proof/NativeBeachScene.js','utf8');assert(sky.includes('modules:[app.atmosphere.module]'));assert(sky.includes('col=mix(col,atmosphereSkyLuminance(rd),clearMidday)'));

const now=Date.now(),conditions={swell:2,period:5,direction:190,wind:9,windDirection:140,tide:.12};
const state={live:true,time:now,data:{source:'live',retrievedAt:now,feedStatus:{tide:'fulfilled'}}};
const ocean={evidence:()=>({marine:{amplitude:.3048},pipeline:{maxFramesInFlight:2}})};
const win={navigator:{onLine:true,userAgent:'test'},document:{getElementById:()=>({contentWindow:{__daybuoyOcean:ocean}})},__daybuoy:{state,conditions:()=>conditions,engine:{camera:{position:{toArray:()=>[0,26,70]},fov:80,projectionMatrix:{elements:[1,2,3]}}}},__tidewater:{backend:'WebGPU native scene',metrics:{}}};
assert.equal(readLiveEvidence(win,now).conditions.tide,.12);
for(const alter of [()=>state.review=true,()=>state.data.source='saved',()=>state.forecastFailed=true,()=>state.data.retrievedAt=now-7200000,()=>conditions.tide=null,()=>state.data.feedStatus.tide='rejected']){
 const original=structuredClone({state,conditions});alter();assert.throws(()=>readLiveEvidence(win,now));Object.keys(state).forEach(k=>delete state[k]);Object.assign(state,original.state);Object.assign(conditions,original.conditions);
}
// The real async measurement observes only completed-frame counts; it stops
// listening on success and on a hidden page, with no encoder running.
const listeners=new Map();globalThis.document={hidden:false,addEventListener:(k,f)=>listeners.set(k,f),removeEventListener:k=>listeners.delete(k)};
let receive,unsubscribed=0;const proof={subscribeCompleted(fn){receive=fn;return()=>unsubscribed++;}};
const measured=measureLiveCadence(proof,{validate:()=>readLiveEvidence(win,now),seconds:2,warmup:1});
for(let i=0;i<=120;i++)receive({now:i*25,count:1});
const result=await measured;assert.equal(result.fps,40);assert.equal(result.minOneSecondFPS,39);assert.equal(unsubscribed,1);assert.equal(result.meetsCadenceTarget,false);
const interrupted=measureLiveCadence(proof,{validate:()=>{},seconds:2,warmup:0});document.hidden=true;listeners.get('visibilitychange')();await assert.rejects(interrupted,/hidden/);assert.equal(unsubscribed,2);document.hidden=false;
assert.throws(()=>recordLiveCanvas({},{}),/unavailable/);
// Mock only the encoder. Validate cleanup and refusal of an empty recording.
let stopped=0;class Recorder{static isTypeSupported(){return true;}constructor(stream,{mimeType}){this.mimeType=mimeType;}start(){this.state='recording';this.ondataavailable({data:new Blob(['mock video'])});}stop(){this.state='inactive';this.onstop();}}
globalThis.MediaRecorder=Recorder;
const canvas={width:585,height:1033,captureStream:()=>({getTracks:()=>[{stop(){stopped++;}}]})};
const clip=await recordLiveCanvas(canvas,{validate:()=>{},duration:.001});assert.equal(clip.extension,'mp4');assert(clip.blob.size);assert.equal(stopped,1);
const page=fs.readFileSync('ocean-live.html','utf8');assert(page.includes('src="/?ocean-debug=1"'));assert(!/review=1|ocean-profile=1|profile-pass=/.test(page));assert(page.indexOf('await measureLiveCadence')<page.indexOf('await recordLiveCanvas'));
assert(fs.readFileSync('ocean-proof/proof/native-compare.html','utf8').includes('Forecast requests are paused'));
console.log('PASS: proof atmosphere selection, unchanged twilight/storm path, constructor-time diagnostic isolation, fresh live/tide evidence guards, completion measurement before encoding, interruption/encoder cleanup. CPU/mock encoder only; no iPhone clip or FPS.');
