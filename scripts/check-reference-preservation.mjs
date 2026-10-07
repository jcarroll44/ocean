import fs from 'node:fs';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
const read=p=>fs.readFileSync(p,'utf8');
for(const file of ['src/camera.js','src/interaction.js','src/story.js','src/scene-data.js','src/lighting.js','src/weather-effects.js','src/celestial.js','src/explore.js','src/surf.js','src/sheets.js']){
 assert.equal(read(file),execFileSync('git',['show','93a10eb91d888f40984d3edacadd67ced0642778:'+file],{encoding:'utf8',maxBuffer:20000000}),file+' must remain unchanged');
}
const scene=execFileSync('git',['show','d008588a:src/scene-data.js'],{encoding:'utf8',maxBuffer:20000000});
assert.equal(read('src/scene-data.js'),scene);
const html=read('dist/index.html');const compositingScene=scene.replace('new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:', 'new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:');assert(html.includes(compositingScene),'Only framebuffer alpha option may change in retained scene bundle');assert(!html.includes("__mods['breaker-pass.js']"));assert(!html.includes('native-ocean'));assert(html.includes('ocean-proof/proof/ocean-only.html?noClouds=1&quality=auto'));
const reference=read('ui-reference/daybuoy-reference.html'),css=reference.split('/* ================= COPY START ================= */')[1].split('/* ================= COPY END ================= */')[0];
assert.equal(read('src/reference.css'),css,'COPY START / COPY END bytes must match');assert(html.includes(css),'Exact reference CSS must ship');
for(const weight of [200,300,400,500,600])assert(fs.readFileSync(`dist/ui-reference/fonts/poppins-latin-${weight}-normal.woff2`).equals(fs.readFileSync(`ui-reference/fonts/poppins-latin-${weight}-normal.woff2`)));
console.log('PASS: reference CSS/fonts and original camera, gesture, sky, astronomy, NWS and sheet sources unchanged. Native ocean activation is covered separately. No rendered comparison claim.');
