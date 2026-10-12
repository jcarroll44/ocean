import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {create,globals} from 'webgpu';
import {CloudSchedule,CLOUD_BUDGET,SCRUB_CLOUD_BUDGET,createCloudCache} from '../ocean-proof/proof/cloud-cache.js';
import {installNativeWeather} from '../ocean-proof/proof/native-weather.js';
import {ShaderModule} from '../ocean-proof/vendor/tidewater/src/engine/gpu/Shader.js';
const s=new CloudSchedule();assert.equal(s.mix(0),1);assert(!s.valid);
for(let cycle=0;cycle<12;cycle++){
 const previous=s.current;s.begin('hour'+cycle,cycle*3000);
 for(let row=0;row<CLOUD_BUDGET.height;row+=CLOUD_BUDGET.rows){assert.equal(s.current,previous);s.row=row;}
 s.complete(cycle*3000+1800);assert.notEqual(s.current,s.staging);assert.notEqual(s.previous,s.staging);assert.equal(s.previous,previous);
 assert.equal(s.completedKey,'hour'+cycle);assert.equal(s.mix(cycle*3000+1800),0);assert.equal(s.mix(cycle*3000+2000),.5);assert.equal(s.mix(cycle*3000+2200),1);
}
assert.equal(CLOUD_BUDGET.columns*CLOUD_BUDGET.rows,256);assert.equal(CLOUD_BUDGET.primarySteps,18);assert.equal(CLOUD_BUDGET.shadowSteps,3);
assert.equal(SCRUB_CLOUD_BUDGET.columns*SCRUB_CLOUD_BUDGET.rows,256);assert.equal(SCRUB_CLOUD_BUDGET.height/SCRUB_CLOUD_BUDGET.rows,16);
assert.deepEqual([CLOUD_BUDGET.width,CLOUD_BUDGET.height],[512,128],'Keep approved detail');
assert.equal(CLOUD_BUDGET.refreshMs,20000);
const covered=new Set();for(let y=0;y<128;y++)for(let x=0;x<512;x+=256)for(let i=0;i<256;i++)covered.add(y*512+x+i);
assert.equal(covered.size,512*128,'Half-row tiles cover the complete unchanged atlas');
s.begin(s.completedKey,40000);s.complete(47000);assert.equal(s.mix(47800),.5);assert.equal(s.mix(48600),1,'Rest refresh has a longer smooth fade');
Object.assign(globalThis,globals);Object.defineProperty(globalThis,'navigator',{value:{gpu:create(['backend=null'])},configurable:true});
globalThis.fetch=async url=>new Response(fs.readFileSync(url));
const {GPU}=await import('../ocean-proof/vendor/tidewater/src/engine/gpu/GPU.js');await GPU.init({headless:true});await import('../ocean-proof/vendor/tidewater/src/engine/render/Frame.js');
GPU.device.pushErrorScope('validation');
const app={settings:{exposure:.55},sky:{module:new ShaderModule({code:'return base; return base;'})}},weather=installNativeWeather(app);
weather.update({sun:[0,.8,.6],moon:[0,-.8,-.6],forecast:{forecastTime:123,cloudLow:80,cloudMid:40,cloudHigh:30,rain:2,thunder:.5}});
await weather.initialize();
const info=await GPU.device.createShaderModule({code:weather.cache.source}).getCompilationInfo();
assert.equal(info.messages.filter(m=>m.type==='error').length,0,info.messages.map(m=>m.message).join('\n'));
assert(!weather.module.code.includes('nativeLayerMask'));assert(!weather.module.code.includes('nativeOffshoreSky'));assert(!weather.module.code.includes('marchLayer'));
// Real bind groups/dispatch validation on null; no rendered-pixel claim.
await weather.cache.warm();assert(weather.cache.state().ready);assert.equal(weather.cache.schedule.generations,1);
const started=weather.cache.schedule.bakedAt;
weather.cache.step(started+19999);assert(!weather.cache.schedule.active,'No background refresh before 20 seconds');
weather.cache.step(started+20000);GPU.submit();assert(weather.cache.schedule.active);assert.equal(weather.cache.schedule.column,256);assert.equal(weather.cache.schedule.row,0);
// A newly selected weather state must bake the target, not its first eased frame.
weather.update({sun:[0,.8,.6],forecast:{forecastTime:456,cloud:100,cloudLow:100,cloudMid:75,cloudHigh:40}});
weather.uniforms.fields.covers.value.set(.24,.10,.18);
weather.cache.setKey('scrub',true);const at=performance.now()+30000;
for(let i=0;i<16;i++){weather.cache.step(at+i*30);GPU.submit();await GPU.queue.onSubmittedWorkDone();}
assert.equal(weather.cache.schedule.generations,2);assert.equal(weather.cache.state(at+900).ready,true);assert.deepEqual(weather.cache.state().activeResolution,[128,32]);
assert.deepEqual(weather.cache.state().snapshotLayers,[1,.75,.4],'Completed target sky cannot retain interpolated holes');
weather.cache.setKey('rest');
for(let i=0;i<16;i++){weather.cache.step(at+1000+i*30);GPU.submit();await GPU.queue.onSubmittedWorkDone();}
assert.equal(weather.cache.state(at+1900).ready,false,'Gallery waits for full detail after a quick forecast transition');
weather.cache.step(at+2000);GPU.submit();assert.deepEqual(weather.cache.state().activeResolution,[512,128]);assert.equal(weather.cache.schedule.row,0);assert.equal(weather.cache.schedule.column,256);assert.equal(weather.cache.schedule.generations,3,'Unpublished refinement never replaces a complete sky');
for(let i=0;i<16;i++){weather.cache.setKey('moving-hour-'+i,true);weather.cache.step(at+2100+i*30);GPU.submit();await GPU.queue.onSubmittedWorkDone();}
assert.equal(weather.cache.schedule.generations,4,'Continuous scrubs publish instead of restarting every time the selected hour changes');
assert.equal(weather.cache.schedule.completedKey,'moving-hour-0:scrub','One coherent weather snapshot per generation');
assert.equal(weather.cache.schedule.mix(at+2550),0,'New generation begins a full crossfade');
// Empty clear/night fields publish the mathematically identical zero cloud,
// crossfade coherently and never schedule periodic work until weather changes.
weather.update({sun:[0,-.4,.9],forecast:{forecastTime:789,cloud:0,cloudLow:0,cloudMid:0,cloudHigh:0,rain:0,offshore:[]}});
weather.cache.step(at+3100);GPU.submit();assert.equal(weather.cache.state(at+3600).empty,true);assert.equal(weather.cache.state(at+3600).ready,true);
const clearGeneration=weather.cache.schedule.generations;
weather.cache.step(at+90000);assert.equal(weather.cache.schedule.generations,clearGeneration);assert(!weather.cache.schedule.active);
weather.update({sun:[0,.8,.6],forecast:{forecastTime:456,cloud:100,cloudLow:100,cloudMid:75,cloudHigh:40}});
weather.cache.setKey('return-clouds',true);
for(let i=0;i<16;i++){weather.cache.step(at+91000+i*30);GPU.submit();await GPU.queue.onSubmittedWorkDone();}
assert.equal(weather.cache.state(at+92000).empty,false);assert.equal(weather.cache.schedule.generations,clearGeneration+1,'Clouds return after zero-work clear sky');
await GPU.queue.onSubmittedWorkDone();const error=await GPU.device.popErrorScope();assert.equal(error,null,error?.message);
const hashes=Object.fromEntries(['shape','detail'].map(name=>[name,crypto.createHash('sha256').update(fs.readFileSync('ocean-proof/proof/takram-'+name+'.bin')).digest('hex')]));
const report={revision:'2026-10-12-weather-cadence-v4',checks:['coherent triple-buffer publication','400 ms forecast / 1600 ms rest whole-cache crossfade','256 cache pixels per submitted frame','20-second rest cadence','fast coherent forecast preview then full-detail refinement','exact zero-work clear-sky cache','18 primary and 3 shadow samples bounded','real 3D bake WGSL/pipeline/bindings validate','sun/moon and offshore layer inputs','volumetric cloud cache and data-located offshore rain extinction'],budget:CLOUD_BUDGET,assetHashes:hashes,takramCommit:'b012ad06d858fc035d88aacfd73f092f93c994e4',backend:'Dawn null',renderedPixels:false,physicalIPhoneFPS:null};
fs.writeFileSync('night-report/cloud-cache-checks.json',JSON.stringify(report,null,2));console.log('PASS: cloud scheduler + actual volumetric WGSL/pipeline/bindings on Dawn null. No rendered pixels or iPhone throughput claim.');process.exit(0);
