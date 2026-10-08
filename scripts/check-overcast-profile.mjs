import fs from 'node:fs';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {overcastConfig,OVERCAST_CASES,PRE_OVERCAST_COMMIT,OVERCAST_COMMIT} from '../ocean-proof/proof/overcast-profile-config.js';
import {installNativeWeather} from '../ocean-proof/proof/native-weather.js';
import {Sky} from '../ocean-proof/vendor/tidewater/src/sky/Sky.js';
for(const pass of OVERCAST_CASES){const c=overcastConfig('?overcast-test='+pass);assert.equal(c.pass,pass);assert.equal(c.deck,pass!=='deck-off');assert.equal(c.surf,pass!=='surf-off');assert.equal(c.exposure,pass!=='exposure-off');assert.equal(c.lip,pass!=='lip-off');assert.equal(c.cheap,pass==='flat');}
assert.equal(overcastConfig('').pass,null);assert.throws(()=>overcastConfig('?overcast-test=invalid'));
for(const cheap of [false,true]){
 const app={sky:new Sky({module:{name:'test-atmosphere'}}),settings:{exposure:.55}},base=app.sky.module.code;
 const weather=installNativeWeather(app,{cheap});weather.update({sun:[0,.8,0],forecast:{cloud:100}});
 assert.equal(app.settings.exposure,.55*1.12);
 const signatures=['fn skyRadianceWithClouds( dir: vec3f, withSun: bool ) -> vec3f {','fn skyReflectionRadiance( dir: vec3f ) -> vec3f {'];
 for(const signature of signatures){const body=app.sky.module.code.split(signature)[1];assert.equal(body.trimStart().startsWith('if(nativeWeather.deck'),cheap);}
 if(cheap){assert(!weather.module.code.includes('sin('));assert(!weather.module.code.includes('pow('));assert(weather.module.code.includes('0.12*h*h'));}
 else assert.equal(app.sky.module.code,base.replaceAll('return base;','return nativeWeatherSky(dir,base);'));
}
const noExposure={sky:new Sky({module:{name:'test-atmosphere'}}),settings:{exposure:.55}};
installNativeWeather(noExposure,{exposure:false}).update({sun:[0,.8,0],forecast:{cloud:100}});assert.equal(noExposure.settings.exposure,.55);
// The stated old FOV is exactly the same camera implementation as overcast-1.
for(const path of ['src/camera.js','src/explore.js','src/native-layer.js']){
 const a=execFileSync('git',['show',PRE_OVERCAST_COMMIT+':'+path]),b=execFileSync('git',['show',OVERCAST_COMMIT+':'+path]);assert(a.equals(b),path);
}
const scene=fs.readFileSync('ocean-proof/proof/native-scene.js','utf8');
assert(scene.includes('if(regression.deck)'));assert(scene.includes('if(regression.lip)'));assert(scene.includes('retainSurf:regression.surf'));
const page=fs.readFileSync('ocean-proof/proof/overcast-profile-page.js','utf8');
assert(page.includes("['baseline','previous','deck-off','surf-off','exposure-off','old-fov','lip-off','flat','baseline','previous']"));
assert(page.includes("await runCase('flat',cases.length+1,cases.length+1,120)"));
assert(page.includes('readLiveEvidence'));assert(page.includes('original({...p,...snapshot})'));assert(page.includes('e.quality.dpr!==1.5'));assert(!page.includes('recordLiveCanvas('));
assert(page.includes('Viewport changed'));assert(page.includes('e.shoreFieldPending'));assert(page.includes('liveEvidence=evidence'));assert(page.includes('native-capture=1'));
console.log('PASS: independent overcast ablations, historical source/camera identity, cheap grey gradient + early reflection/environment return, fixed live snapshot/DPR guards, repeated baselines and 120-second candidate. CPU/source tests only.');
