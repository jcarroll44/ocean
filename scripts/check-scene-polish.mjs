import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';
import {cloudField,cloudThreshold} from '../ocean-proof/proof/partial-clouds.js';
import {daylightMoonColour,smallSurfSpan,installSmallSurf} from '../ocean-proof/proof/scene-polish.js';
import {installNativeWeather} from '../ocean-proof/proof/native-weather.js';
import {ShoreWaves} from '../ocean-proof/vendor/tidewater/src/ocean/ShoreWaves.js';
import {marineInput} from '../ocean-proof/proof/forecast.js';
import {RESOLUTION_POLICY,PRODUCTION_SETTINGS} from '../ocean-proof/proof/adaptive-resolution.js';
const read=p=>fs.readFileSync(p,'utf8');
for(const sky of [[.15,.4,.8],[.6,.7,.8]]){
 assert.deepEqual(daylightMoonColour(sky,0,1),sky,'Unlit daytime moon cannot darken any channel');
 assert(daylightMoonColour(sky,1,1).every((v,i)=>v>sky[i]));
 assert(daylightMoonColour(sky,0,0).every(v=>v<.02),'Night limb retains spherical phase');
 assert.deepEqual(daylightMoonColour(sky,1,1,0),sky);
}
const field=Array.from({length:40000},(_,i)=>cloudField(i*.7193%120-60,i*.3737%113-56));
for(const cover of [.1,.25,.34,.5,.7,.9]){
 const actual=field.filter(n=>n>cloudThreshold(cover)).length/field.length;
 assert(Math.abs(actual-cover)<.025,JSON.stringify({cover,actual}));
}
const fake={settings:{exposure:.55},sky:{module:{deps:[],code:'fn a(){return base;} fn b(){return base;}'}}},weather=installNativeWeather(fake);
for(const cloud of [0,.34,34,100]){weather.update({sun:[0,.8,0],forecast:{cloud,cloudLow:cloud,cloudMid:0}});assert.equal(weather.state.cover,cloud/100);}
assert.equal(weather.state.weight,1);assert(weather.module.code.includes('cachedCloud(dir)'));assert(!weather.module.code.includes('fn nativePartialCloud'));
const input=marineInput({swell:2,period:5,direction:203,wind:8,windDirection:267,tide:.07});
assert.equal(input.amplitude,.3048);assert.equal(input.period,5);assert.equal(input.tide,.07);
assert(smallSurfSpan(input.amplitude,input.period)>.21);
assert.equal(smallSurfSpan(0,5),.13);assert.equal(smallSurfSpan(.8,5),.13);assert.equal(smallSurfSpan(.3,10),.13);
const shore={module:{code:ShoreWaves.prototype._code.call({})}};installSmallSurf(shore);
assert.equal(shore.module.code.split('mix( nativeSurf.foamFloor').length-1,3);
assert(shore.module.code.includes('o.foam = s0.z * env * mix('),'Foam still requires physical breaking and shore envelope');
assert(shore.module.code.includes('let landed = smoothstep( 0.86, 0.99, P.b );'),'No white paint on unbroken crests');
assert.equal(RESOLUTION_POLICY.downBelow,38);assert.deepEqual(PRODUCTION_SETTINGS,{dpr:1.5,aa:'fxaa',flare:false});
const native=read('ocean-proof/proof/native-scene.js');assert(native.includes('settings.flare===false'));assert(native.includes('smallSurfSpan(app.marine.amplitude,app.marine.period)'));
const c={conditions:()=>c.row,isStorm:r=>r.weatherCode>=95||r.rain>=1,realForecast:()=>true,ripRiskAt:()=>({risk:c.risk}),sunPosition:()=>({altitude:c.altitude}),state:{time:0},row:{swell:1.9685,wind:8,cloud:34,rain:0,weatherCode:0},risk:'High',altitude:50};
vm.createContext(c);vm.runInContext(read('src/presentation.js'),c);
assert.equal(vm.runInContext('conditionDescription(conditions()).title',c),'Light chop, 1–2 ft, partly cloudy');
assert(vm.runInContext('beachAnswer().detail',c).includes('High rip-current risk · NWS'));
for(const altitude of [-20,0,50])for(const cloud of [0,.34,34,90])for(const risk of ['Low','Moderate','High'])for(const code of [0,95]){
 c.altitude=altitude;c.row.cloud=cloud;c.row.weatherCode=code;c.risk=risk;
 const copy=vm.runInContext('[beachAnswer().title,beachAnswer().detail,referenceVerdict(beachAnswer()),referenceAction(beachAnswer()).html].join(" ")',c);
 assert(!/\bsafe\b|stay ashore|head indoors|use caution|check.*flags|find.*shade|bring|beach time|tan window/i.test(copy),copy);
}
assert(read('src/presentation.js').includes("'Forecast updated '+updated"));
// Pinned implementation, physical input mapping, material and camera stay exact.
for(const prefix of ['ocean-proof/vendor/tidewater/','src/camera.js','src/interaction.js']){
 // The old local-only commit was never published. Use its published pre-polish
 // predecessor: all four frozen paths are byte-identical (vendor tree f0d73bdc).
 const changes=execFileSync('git',['diff','532dfcfccf30e65f9cca41b7bcefa2abb9537618','--',prefix],{encoding:'utf8'});assert.equal(changes,'',prefix);
}
// October 12 explicitly authorizes an additive forecast spectrum adapter.
const originalForecast=execFileSync('git',['show','532dfcfccf30e65f9cca41b7bcefa2abb9537618:ocean-proof/proof/forecast.js'],{encoding:'utf8'});
const baseForecast=read('ocean-proof/proof/forecast.js').replace("import {applyWaveSpectrum} from './forecast-waves.js';\n",'').replace(/ if\(app\.forecastSurf\)\{[\s\S]*?\n \}\n/,'');
assert.equal(baseForecast,originalForecast,'Original physical mapping remains exact outside the authorized wave adapter');
console.log('PASS: daytime unlit moon, historical cloud calibration, forecast percent units, shared cached-cloud reflections, bounded small shore surf, H/2 retained, flare off, DPR 36, condition-only copy and NWS disclosure. CPU/source only; no new phone FPS or pixels.');
