import assert from 'node:assert/strict';
import fs from 'node:fs';
import {overcastState,installNativeWeather,guardNativeBreakerLip} from '../ocean-proof/proof/native-weather.js';
import {retainObliqueSurf} from '../ocean-proof/proof/open-coast-shore.js';
import {createBeachTerrain} from '../ocean-proof/proof/beach-land.js';
import {computeShoreField} from '../ocean-proof/vendor/tidewater/src/world/ShoreField.js';
import {marineInput} from '../ocean-proof/proof/forecast.js';
import {CompletedProfileRun} from '../ocean-proof/proof/pipeline-profile.js';
assert.equal(overcastState(.8,1).deck,1);assert.equal(overcastState(.8,1).weight,1);
assert.equal(overcastState(.8,0).deck,0);assert.equal(overcastState(-.2,1).exposure,1);
assert(overcastState(.8,1).radiance>.7);assert(overcastState(.8,1).exposure<=1.12);
const fake={settings:{exposure:.55},sky:{module:{deps:[],code:'fn a(){return base;} fn b(){return base;}'}}};
const weather=installNativeWeather(fake);weather.update({sun:[0,.8,0],forecast:{cloud:100,rain:0}});
assert.equal((fake.sky.module.code.match(/nativeWeatherSky/g)||[]).length,2);
assert.equal(fake.sky.module.deps[0],weather.module);
const color=(r,g,b)=>({r,g,b,multiplyScalar(k){this.r*=k;this.g*=k;this.b*=k;}});
const G={sunColor:{value:color(1,.7,.6)},skyIrradiance:{value:color(.2,.3,.9)},horizonColor:{value:color(.2,.2,.8)}};
weather.light(G);assert.equal(G.sunColor.value.r,0);assert(Math.abs(G.skyIrradiance.value.b/G.skyIrradiance.value.r-1)<.011);
weather.update({sun:[0,.8,0],forecast:{cloud:0}});assert.equal(fake.settings.exposure,.55);
const source=fs.readFileSync('ocean-proof/vendor/tidewater/src/ocean/Breakers.js','utf8');
const material={vertex:source.slice(source.indexOf('let id = v.sheetId;'),source.indexOf('output: /* wgsl */'))};
guardNativeBreakerLip({mesh:{material}});assert(material.vertex.includes('rootsBounded && connected'));assert(!material.vertex.includes('v.worldPos = select( vec3f( 0.0, -1e5'));assert(material.vertex.includes('mOther > 0.5'));
const terrain=createBeachTerrain(),input=marineInput({swell:2.4,period:4.4,direction:112.5,wind:9,windDirection:67.5,tide:0});
assert(Math.abs(input.amplitude-.36576)<1e-9);assert.equal(input.period,4.4);
const field=computeShoreField(terrain,{res:512,swellDir:input.propagation}),before=field.data.slice();
retainObliqueSurf(field,input.propagation);
let increased=0;
for(let i=0;i<field.depth.length;i++){
 const k=i*4;assert.equal(field.data[k],before[k]);assert.equal(field.data[k+3],before[k+3]);
 const e=Math.hypot(before[k+1],before[k+2]),n=Math.hypot(field.data[k+1],field.data[k+2]);
 assert(n<=1.000001);assert(n+1e-6>=e);
 if(n>e+1e-5){increased++;assert(Math.abs(field.data[k+1]*before[k+2]-field.data[k+2]*before[k+1])<1e-6);}
}
assert(increased>0);
for(const p of [[0,-1],[.99,.1]]){const f={...field,data:before.slice()};retainObliqueSurf(f,p);assert.deepEqual(f.data,before);}
// Exact completed-frame gate: include a full below-target second and prove average cannot pass it.
for(const dip of [false,true]){
 const run=new CompletedProfileRun({pass:'native-live',seconds:120,warmup:0});let result;run.observe(0);
 for(let i=1;i<=120;i++){run.observe(i*1000-1,dip&&i===65?28:40);result=run.observe(i*1000,1)||result;}
 assert.equal(result.oneSecondFPS.length,120);assert.equal(result.meetsCadenceTarget,!dip);
 assert.equal(result.secondsUnder30,dip?1:0);
}
// The shared runner now records after either duration. Execute both paths in
// check-capture-flow; keep the existing strict completion-bin assertions above.
const page=fs.readFileSync('ocean-live.html','utf8');
assert(page.includes("query.get('gate')==='1'?120:20"));assert(page.includes('seconds,warmup:15'));assert(page.includes('Viewport changed'));
assert(page.indexOf('await measureLiveCadence')<page.indexOf('await recordLiveCanvas'));
const host=fs.readFileSync('ocean-proof/proof/BeachApp.js','utf8');assert(host.indexOf('this.configureNativeWeather?.()')<host.indexOf('new Environment'));
console.log('PASS: shared neutral overcast, unchanged clear exposure, symmetric lip bounds, H/2 and period, oblique surf retains phase/direction, strict live 120-second gate. CPU/source only, no phone pixel/FPS claim.');
