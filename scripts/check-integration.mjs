import fs from 'node:fs';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {applyApprovedCopy} from './approved-condition-copy.mjs';
import {INTEGRATION_BUILD} from '../ocean-proof/proof/integration-build.js';
const read=p=>fs.readFileSync(p,'utf8');
assert.equal(INTEGRATION_BUILD.branch,'wip/tidewater-verdict-first');
assert.equal(INTEGRATION_BUILD.evidenceBranch,'wip/tidewater-in-app');
const app=read('dist/index.html');
assert(app.includes('const createOcean=createSceneHost;'));
assert(app.includes("host.src='ocean-proof/proof/native-scene.html"));
assert(app.includes('class="db-screen'));
// Oct 11 explicitly authorizes the native sky/surf changes. Those files are
// checked by check-scene-polish, including the unchanged pinned ocean vendor.
for(const file of ['src/index.html','src/daybuoy.js','src/reference.css','src/reference-host.css','src/reference-fonts.css','src/home.js','src/camera.js','src/native-layer.js']){
 const before=execFileSync('git',['show','0b253b18e47aa73a1417f4dcc7a577fb7b48c49d:'+file],{encoding:'utf8',maxBuffer:20000000});
 assert.equal(read(file),applyApprovedCopy(file,before),file+' must remain byte-identical except approved condition copy');
}
const retired=read('ocean-overcast-profile.html');assert(retired.includes('diagnosis closed'));assert(!retired.includes('<script'));assert(retired.includes('/ocean-live.html?gate=1'));
const live=read('ocean-live.html');assert(live.includes('INTEGRATION_BUILD'));assert(live.includes('pinTestViewport'));assert(!live.includes('overcast-test='));assert(!live.includes('native-capture='));
console.log('PASS: one build includes native Tidewater and approved Verdict-first; scene/UI/camera unchanged; diagnosis retired; live adaptive gate has no forced sky or capture-mode override. Source checks, not rendered UI.');
