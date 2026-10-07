import assert from 'node:assert/strict';
import fs from 'node:fs';
import {WaveClock,renderAt,phaseCycles,AutoQuality} from '../proof/timing.js';
import {PRESETS,applyQuality} from '../proof/quality.js';
import {CDLOD} from '../vendor/tidewater/src/core/CDLOD.js';
import {PerspectiveCamera} from '../vendor/tidewater/src/engine/index.js';
// Frame-rate independence of the actual pre-frame clock adapter, including
// backpressure (no calls while GPU busy), long stalls and quality changes.
for(const fps of [1,6,15,30,60,120]){
 const clock=new WaveClock(1000,30),G={time:{value:0}},app={fft:{time:{value:0}},frame(dt){G.time.value+=dt;this.fft.time.value+=dt;}};
 for(let i=1;i<=10*fps;i++){const t=1000+i*1000/fps;const r=renderAt(app,G,clock.sample(t));assert(Math.abs(r.waveSeconds-(30+i/fps))<1e-9);assert(Math.abs(r.fftSeconds-r.waveSeconds)<1e-9);}
 assert.equal(G.time.value,40);assert.equal(phaseCycles(G.time.value)-phaseCycles(30),1.25);
 const at8=renderAt(app,G,new WaveClock(0,30).sample(8000));assert.equal(phaseCycles(at8.waveSeconds)-phaseCycles(30),1);
}
{
 const clock=new WaveClock(0,30),G={time:{value:0}},app={fft:{time:{value:0}},frame(dt){G.time.value+=dt;this.fft.time.value+=dt;}};
 for(const now of [0,16,33,700,701,3400,7999,8000,10000]){const r=renderAt(app,G,clock.sample(now));assert.equal(r.waveSeconds,30+now/1000);assert.equal(r.fftSeconds,r.waveSeconds);}
}
const auto=new AutoQuality(2);assert.equal(auto.observe(6),true);assert.equal(auto.level,3);assert.equal(auto.observe(29),false);assert.equal(auto.observe(29),true);assert.equal(auto.level,4);assert.equal(auto.observe(35),false);assert.equal(auto.state,'30 fps target met');auto.observe(6);assert.equal(auto.level,5);auto.observe(6);assert.match(auto.state,/below 30/);
// Verify the quality switch reduces real selected mesh work at our camera,
// changes effective DPR / budgets, and never changes height or period.
globalThis.devicePixelRatio=3;
const camera=new PerspectiveCamera(61,390/844,.3,60000);camera.position.set(0,10,-28);camera.lookAt(0,4.56,0);
const app={engine:{setRenderScale(v){this.renderScale=v;}},oceanLOD:new CDLOD({gridSize:32,leafSize:8,levels:12}),spray:{setBudget(v){this.active=v;}},breakers:{params:{spray:{value:1}}},refraction:{},environment:{size:64},clouds:{},shore:{period:{value:8},amplitude:{value:.4572}}};
const counts=[];
for(let i=0;i<PRESETS.length;i++){applyQuality(app,i);app.oceanLOD.update(camera);counts.push(app.oceanLOD.count);assert(app.engine.renderScale>=1&&app.engine.renderScale<=1.5);assert.equal(app.spray.active,PRESETS[i].spray);assert.equal(app.refraction.scale,PRESETS[i].reflection);assert.equal(app.shore.period.value,8);assert.equal(app.shore.amplitude.value,.4572);}
assert(counts.at(-1)<counts[0],`LOD not reducing work: ${counts}`);
const shader=fs.readFileSync('vendor/tidewater/src/ocean/ShoreWaves.js','utf8');assert(shader.includes('( frame.time - T ) / shoreP.period'));
const loop=fs.readFileSync('proof/tidewater.js','utf8');assert(loop.includes('renderAt(app,G,clock.sample(now))'));assert(!loop.includes('app.frame(0)'));
console.log('PASS: 8-second phase in 8 real seconds at 1/6/15/30/60/120 fps; backpressure/stalls; auto quality/floor; LOD node counts '+counts.join(' → ')+'. No phone rendering claim.');
