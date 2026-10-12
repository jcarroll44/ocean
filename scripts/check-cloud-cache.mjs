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
 for(let row=0;row<128;row+=2){assert.equal(s.current,previous);s.row=row;}
 s.complete(cycle*3000+1800);assert.notEqual(s.current,s.staging);assert.notEqual(s.previous,s.staging);assert.equal(s.previous,previous);
 assert.equal(s.completedKey,'hour'+cycle);assert.equal(s.mix(cycle*3000+1800),0);assert.equal(s.mix(cycle*3000+2000),.5);assert.equal(s.mix(cycle*3000+2200),1);
}
assert.equal(CLOUD_BUDGET.width*CLOUD_BUDGET.rows,512);assert.equal(CLOUD_BUDGET.primarySteps,18);assert.equal(CLOUD_BUDGET.shadowSteps,3);
assert.equal(SCRUB_CLOUD_BUDGET.width*SCRUB_CLOUD_BUDGET.rows,512);assert.equal(SCRUB_CLOUD_BUDGET.height/SCRUB_CLOUD_BUDGET.rows,8);
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
weather.cache.setKey('scrub',true);const at=performance.now()+1000;
for(let i=0;i<8;i++){weather.cache.step(at+i*30);GPU.submit();await GPU.queue.onSubmittedWorkDone();}
assert.equal(weather.cache.schedule.generations,2);assert.equal(weather.cache.state(at+700).ready,true);assert.deepEqual(weather.cache.state().activeResolution,[128,32]);
weather.cache.setKey('rest');weather.cache.step(at+800);GPU.submit();assert.deepEqual(weather.cache.state().activeResolution,[256,128]);assert.equal(weather.cache.schedule.row,2);assert.equal(weather.cache.schedule.generations,2,'Unpublished refinement never replaces a complete sky');
for(let i=0;i<8;i++){weather.cache.setKey('moving-hour-'+i,true);weather.cache.step(at+900+i*30);GPU.submit();await GPU.queue.onSubmittedWorkDone();}
assert.equal(weather.cache.schedule.generations,3,'Continuous scrubs publish instead of restarting every time the selected hour changes');
assert.equal(weather.cache.schedule.completedKey,'moving-hour-0:scrub','One coherent weather snapshot per generation');
assert.equal(weather.cache.schedule.mix(at+1110),0,'New generation begins a full crossfade');
await GPU.queue.onSubmittedWorkDone();const error=await GPU.device.popErrorScope();assert.equal(error,null,error?.message);
const hashes=Object.fromEntries(['shape','detail'].map(name=>[name,crypto.createHash('sha256').update(fs.readFileSync('ocean-proof/proof/takram-'+name+'.bin')).digest('hex')]));
const report={revision:'2026-10-12-storm-scrub-v2',checks:['coherent triple-buffer publication','400 ms whole-cache crossfade','512 cache pixels per submitted frame','18 primary and 3 shadow samples bounded','real 3D bake WGSL/pipeline/bindings validate','sun/moon and offshore layer inputs','no stencil clouds or curtain sheets in native path'],budget:CLOUD_BUDGET,assetHashes:hashes,takramCommit:'b012ad06d858fc035d88aacfd73f092f93c994e4',backend:'Dawn null',renderedPixels:false,physicalIPhoneFPS:null};
fs.writeFileSync('night-report/cloud-cache-checks.json',JSON.stringify(report,null,2));console.log('PASS: cloud scheduler + actual volumetric WGSL/pipeline/bindings on Dawn null. No rendered pixels or iPhone throughput claim.');process.exit(0);
