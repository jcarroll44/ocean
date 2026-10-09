import fs from 'node:fs';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {INTEGRATION_BUILD} from '../ocean-proof/proof/integration-build.js';
const read=p=>fs.readFileSync(p,'utf8');
assert.equal(INTEGRATION_BUILD.branch,'wip/tidewater-verdict-first');
assert.equal(INTEGRATION_BUILD.evidenceBranch,'wip/tidewater-in-app');
const app=read('dist/index.html');
assert(app.includes('const createOcean=createSceneHost;'));
assert(app.includes("host.src='ocean-proof/proof/native-scene.html"));
assert(app.includes('class="db-screen'));
for(const file of ['src/index.html','src/daybuoy.js','src/reference.css','src/reference-host.css','src/reference-fonts.css','src/home.js','src/camera.js','src/native-layer.js','ocean-proof/proof/native-scene.js','ocean-proof/proof/NativeBeachScene.js','ocean-proof/proof/native-weather.js']){
 const before=execFileSync('git',['show','0b253b18e47aa73a1417f4dcc7a577fb7b48c49d:'+file],{encoding:'utf8',maxBuffer:20000000});
 assert.equal(read(file),before,file+' must remain byte-identical for integration');
}
const retired=read('ocean-overcast-profile.html');assert(retired.includes('diagnosis closed'));assert(!retired.includes('<script'));assert(retired.includes('/ocean-live.html?gate=1'));
const live=read('ocean-live.html');assert(live.includes('INTEGRATION_BUILD'));assert(live.includes('pinTestViewport'));assert(!live.includes('overcast-test='));assert(!live.includes('native-capture='));
console.log('PASS: one build includes native Tidewater and approved Verdict-first; scene/UI/camera unchanged; diagnosis retired; live adaptive gate has no forced sky or capture-mode override. Source checks, not rendered UI.');
