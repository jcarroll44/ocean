import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import assert from 'node:assert/strict';import vm from 'node:vm';import {execFileSync} from 'node:child_process';
const hash=b=>crypto.createHash('sha256').update(b).digest('hex'),manifest=JSON.parse(fs.readFileSync('upstream-integrity.json'));
let files=0;for(const [p,h] of Object.entries(manifest.files)){const full='vendor/tidewater/'+p;if(fs.existsSync(full)){assert.equal(hash(fs.readFileSync(full)),h,p+' upstream changed');files++;}}
for(const p of ['baseShape64.bin','blueNoise.bin','LICENSING.md'])assert.equal(hash(fs.readFileSync('public/clouds/'+p)),manifest.files['public/clouds/'+p]);
for(const p of ['area.png','search.png'])assert.equal(hash(fs.readFileSync('public/textures/smaa/'+p)),manifest.files['public/textures/smaa/'+p]);
const js=fs.readdirSync('proof').filter(p=>p.endsWith('.js')).map(p=>'proof/'+p).concat(['baseline/baseline.js','baseline/lighting.js']);
for(const p of js)execFileSync(process.execPath,['--check',p]);
// Walk every static import in the complete host graph; a missing dependency is a build error.
const seen=new Set();function visit(file){file=path.resolve(file);if(seen.has(file))return;seen.add(file);const s=fs.readFileSync(file,'utf8');for(const m of s.matchAll(/(?:from\s+|import\s*)['"]([^'"]+)['"]/g)){if(m[1].startsWith('.')){const child=path.resolve(path.dirname(file),m[1]);assert(fs.existsSync(child),'Missing '+child);visit(child);}else throw Error('Unbundled external import: '+m[1]);}}visit('proof/BeachApp.js');
globalThis.location={search:'?height=5'};const {CAMERA,TEST}=await import('../proof/inputs.js');assert.equal(TEST.feet,5);assert.equal(CAMERA.bearing,201);assert(Math.abs(CAMERA.y-10)<.03);
const host=fs.readFileSync('proof/BeachApp.js','utf8');assert(!/mobile\?|installOceanOutput|WHITE_SAND_SURFACE/.test(host));assert(host.includes('size:380,res:768'));assert(host.includes('gridSize:32'));assert(host.includes('size:2048'));assert(host.includes('this.setRenderScale(1)'));assert(!host.includes('new Player'));
// Numeric pose equivalence between the original Three camera and native camera.
const c={URLSearchParams,TextDecoder,Math,Map,Date,window:{}};vm.createContext(c);vm.runInContext(fs.readFileSync('baseline/scene-data.js','utf8'),c);const T=c.window.__baselineModules['three.module.js'];
const {PerspectiveCamera,Vector3}=await import('../vendor/tidewater/src/engine/index.js');
const a=new T.PerspectiveCamera(CAMERA.fov,390/844,.3,60000),b=new PerspectiveCamera(CAMERA.fov,390/844,.3,60000);
a.position.set(0,CAMERA.y,CAMERA.z);a.lookAt(0,CAMERA.y+Math.sin(CAMERA.pitch),CAMERA.z-Math.cos(CAMERA.pitch));b.position.set(0,CAMERA.y,-CAMERA.z);b.lookAt(0,CAMERA.y+Math.sin(CAMERA.pitch),-CAMERA.z+Math.cos(CAMERA.pitch));
for(const cam of [a,b]){cam.updateProjectionMatrix();cam.projectionMatrix.elements[9]=-CAMERA.shear/.59;cam.updateMatrixWorld();}
for(const [x,y,z] of [[0,0,-3.5],[0,1,-20],[6,3,-35],[-12,0,-80]]){const p=new T.Vector3(x,y,z).project(a),q=new Vector3(-x,y,-z).applyMatrix4(b.matrixWorldInverse).applyMatrix4(b.projectionMatrix);assert(Math.abs(p.x-q.x)<1e-7&&Math.abs(p.y-q.y)<1e-7,'camera mismatch');}
const {beachHeight}=await import('../proof/beach-land.js');assert(Math.abs(beachHeight(0,1)-beachHeight(0,0)-.105)<1e-9);
assert.match(fs.readFileSync('proof/tidewater.js','utf8'),/no fallback|never substitutes WebGL/);
console.log(`PASS: ${files} pinned upstream files unchanged; ${seen.size} imports resolve; matched 390×844 camera projection; 0.105 beach slope; quality host; syntax. No rendered or iPhone claim.`);

execFileSync(process.execPath,['scripts/check-timing.mjs'],{stdio:'inherit'});
