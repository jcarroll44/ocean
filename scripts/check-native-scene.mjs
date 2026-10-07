import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {NATIVE_PASSES,profileConfig} from '../ocean-proof/proof/profile.js';
// Execute the actual CPU host with the app's real Three math. The legacy
// constructor throws if touched during native startup or camera changes.
const c={console,TextDecoder,URLSearchParams,window:{},document:{},navigator:{gpu:{}},location:{search:''},innerWidth:390,innerHeight:689,devicePixelRatio:3};
vm.createContext(c);vm.runInContext(fs.readFileSync('src/scene-data.js','utf8'),c);
c.THREE=c.__mods['three.module.js'];let legacyCalls=0;
c.__mods['ocean-engine.js'].createOcean=()=>{legacyCalls++;throw Error('legacy renderer requested');};
vm.runInContext(fs.readFileSync('src/native-host.js','utf8'),c);
const u={},host=c.createSceneHost({},u,()=>{});assert.equal(legacyCalls,0);assert(host.nativeScene);assert.equal(host.renderer,undefined);
host.resize(390,689,2);
for(const [x,y,z,yaw,pitch,fov,shear] of [[0,10,28,0,-.19,55,.13],[15,26,70,.5,.1,80,0],[-5,16,30,-1.2,-.3,35,.08]]){
 host.setPose(x,y,z,yaw,pitch,.59/Math.tan(fov*Math.PI/360),shear);
 const a=host.camera,v=new c.THREE.Vector3();a.getWorldDirection(v);
 assert(Math.abs(a.fov-fov)<1e-9);assert(Math.abs(v.y-Math.sin(pitch))<1e-9);
 assert(Math.abs(v.x-Math.sin(yaw)*Math.cos(pitch))<1e-9);
 assert(Math.abs(a.projectionMatrix.elements[9]+shear/.59)<1e-9);
 assert.deepEqual(Array.from(a.position.toArray()),[x,y,z]);host.render(.016);
}
assert.equal(legacyCalls,0);
assert.throws(()=>host.activateFallback(),/legacy renderer requested/);assert.equal(legacyCalls,1);
for(const search of ['?ocean-profile=1&profile-pass=baseline','?ocean-profile=1&profile-pass=host-all']){c.location.search=search;assert.throws(()=>c.createSceneHost({},{}),/legacy renderer requested/);}
c.location.search='';c.navigator.gpu=null;assert.throws(()=>c.createSceneHost({},{}),/legacy renderer requested/);
for(const pass of NATIVE_PASSES){const cfg=profileConfig('?ocean-profile=1&profile-pass='+pass);assert.equal(cfg.dpr,pass==='native175'?1.75:pass==='native15'?1.5:2);assert.equal(cfg.seconds,20);}
const native=fs.readFileSync('ocean-proof/proof/native-scene.js','utf8');
assert(!/OceanComposite|copyExternalImageToTexture|copyBase|copyOverlay|WebGLRenderer/.test(native));
assert(native.includes("app.post.aaMode='fxaa'"));assert(native.includes("app.post.flare=null"));
assert(native.includes('clock.sample(performance.now())'));assert(native.includes('resolution changed'));
assert(!native.includes('installRuntimeAblation'));assert(!native.includes('tuner.observe'));
const build=fs.readFileSync('dist/index.html','utf8');assert(build.includes('const createOcean=createSceneHost;'));assert(build.includes('native-scene.html?noClouds=1&quality=0'));
console.log('PASS: native camera math, no legacy renderer during native startup/poses, explicit failure/unsupported fallback, independent DPR/AA/flare cases, no external copies or ocean ablations. CPU/source only.');
