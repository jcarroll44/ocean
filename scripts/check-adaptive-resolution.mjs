import assert from 'node:assert/strict';
import fs from 'node:fs';
import {AdaptiveResolution,PRODUCTION_SETTINGS} from '../ocean-proof/proof/adaptive-resolution.js';
import {profileConfig} from '../ocean-proof/proof/profile.js';
import {CompletedProfileRun} from '../ocean-proof/proof/pipeline-profile.js';
const dimensions=d=>[Math.floor(390*d),Math.floor(689*d),Math.floor(390*d),Math.floor(689*d)];
assert.deepEqual(PRODUCTION_SETTINGS,{dpr:1.5,aa:'fxaa',flare:true});
// Strict thresholds: neither 32 nor 38 changes resolution. Count frames in a
// completion batch individually and exclude a completion on the next boundary.
for(const [fps,expected] of [[28,1.45],[31,1.45],[32,1.5],[36,1.5],[38,1.5],[39,1.55]]){
 const a=new AdaptiveResolution();a.observe(0,fps);
 a.observe(1000,3);a.prepare(1000,0,dimensions);
 assert.equal(a.dpr,expected);assert.equal(a.frames,3);
}
const a=new AdaptiveResolution();let time=0,resizes=0;
a.observe(time,31);
const resize=d=>{resizes++;return dimensions(d);};
assert.equal(a.prepare(1000,2,resize),false);assert.equal(a.prepare(1016,1,resize),false);assert.equal(resizes,0);assert.equal(a.dpr,1.5);
assert.equal(a.prepare(1050,0,resize),true);assert.equal(a.dpr,1.45);assert.equal(resizes,1);
// A stalled GPU still yields zero-completion windows. Sustained low cadence
// traverses 1.35 and stops at 1.25; sustained high cadence stops at 1.6.
for(time=2000;time<=12000;time+=1000)a.prepare(time,0,resize);
assert.equal(a.dpr,1.25);assert(a.changes.some(c=>c.to===1.35));assert(a.samples.some(s=>s.fps===0));
for(;time<=25000;time+=1000){a.observe(time-1,40);a.prepare(time,0,resize);}
assert.equal(a.dpr,1.6);assert(a.changes.every(c=>c.to>=1.25&&c.to<=1.6&&c.inFlight===0));
a.verifyFrame(390,689,dimensions(a.dpr));assert.throws(()=>a.verifyFrame(390,689,[780,1378,780,1378]),/dimensions/);
a.resetWindow();a.prepare(100000,0,resize);assert.equal(a.pending,null);assert.equal(a.dpr,1.6);
// Integrate the controller with actual profile accounting over 120 s. An
// injected resize/drain-sized pause remains visible in the strict gate even
// though the mean is comfortably above 30. Controller changes cannot reset it.
const config=profileConfig('?ocean-profile=1&profile-pass=native-adaptive&profile-seconds=120');
assert.equal(config.adaptive,true);assert.equal(config.dpr,1.5);assert.equal(config.aa,'fxaa');assert.equal(config.flare,true);
const run=new CompletedProfileRun(config),adaptive=new AdaptiveResolution();let result;
for(let ms=0;ms<=136000;ms+=25){
 adaptive.prepare(ms,0,dimensions);
 if(ms>=60000&&ms<60500)continue;
 adaptive.observe(ms,1);result=run.observe(ms,1)||result;
}
assert(result.fps>30);assert(result.minOneSecondFPS<30);assert(result.secondsUnder30>=1);assert.equal(result.meetsCadenceTarget,false);assert.equal(result.oneSecondFPS.length,120);
for(const pass of ['native-pipe','native-pipe175','native-pipe15','native-pipe-fxaa','native-pipe-flare','native-pipe-combo','native'])assert.equal(profileConfig('?ocean-profile=1&profile-pass='+pass).adaptive,undefined);
const source=fs.readFileSync('ocean-proof/proof/native-scene.js','utf8');
assert(source.includes('const settings=app.profileConfig??PRODUCTION_SETTINGS'));
assert(source.includes("!app.qs.has('native-capture')?new AdaptiveResolution():null"));
assert(source.includes('adaptive.prepare(performance.now(),gate.inFlight'));
assert(source.includes('adaptive.verifyFrame(innerWidth,innerHeight'));
assert(source.includes('a.projectionMatrix.elements[9]=c.shearY'));
assert(source.includes('clock.sample(performance.now())'));
console.log('PASS: production settings, exact 32/38 thresholds, idle-only resizing, zero-completion seconds, bounded 1.25–1.6 steps, unchanged fixed cases/capture and strict gate retaining stalls. Synthetic accounting only; no iPhone FPS or pixels.');
