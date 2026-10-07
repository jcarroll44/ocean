import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {PASSES,HOST_PASSES,NATIVE_PASSES,LOOP_PASSES,profileConfig,PROFILE_REVISION,hostCuts,installHostRuntime} from '../ocean-proof/proof/profile.js';
import {SunShadows} from '../ocean-proof/vendor/tidewater/src/engine/render/Shadows.js';
import {ShadowUniforms} from '../ocean-proof/vendor/tidewater/src/engine/render/wgsl/lighting.js';
const noop=()=>{};
for(const pass of ['baseline',...HOST_PASSES]){
 let atmosphereCalls=0;
 const oceanNames=['fft','shoreSim','breakers','spray','query','caustics','underwaterLighting','environment','oceanLOD'];
 const app={shadows:{enabled:true},atmosphere:{update:()=>atmosphereCalls++}};
 for(const name of oceanNames)app[name]={update:noop};
 installHostRuntime(app,{pass});app.atmosphere.update();app.atmosphere.update();
 assert.equal(atmosphereCalls,['host-sky','host-all'].includes(pass)?1:2);
 assert.equal(app.shadows.enabled,!['host-shadows','host-all'].includes(pass));
 for(const name of oceanNames)assert.equal(app[name].update,noop,'Host cut altered '+name);
 assert.equal(profileConfig('?ocean-profile=1&profile-pass='+pass).dpr,2);
 const cuts=hostCuts({pass});assert.equal(Object.values(cuts).filter(Boolean).length,pass==='host-all'?4:['baseline','proof-alone'].includes(pass)?0:1);
}
// Execute upstream disabled-shadow behavior: no cascade fitting and the shader
// uniform forces light visibility without texture sampling.
const cuts=SunShadows.prototype.update.call({frame:0,enabled:false},{updateMatrixWorld(){throw Error('Disabled shadows fitted camera');}},{y:1});
assert.deepEqual(cuts,[]);assert.equal(ShadowUniforms.fields.enabled.value,0);
// Exercise the actual runner routing and JSON acceptance. Standalone proof must
// never load the DayBuoy document. Resolution/output/geometry mismatches fail.
const source=fs.readFileSync('ocean-proof/proof/profile-page.js','utf8').replace(/^import .*;\n/,'');
function runner(mode='round3'){
 const elements=new Map(),events={},timeouts=[];
 const node=()=>({style:{},append(){},replaceChildren(){},contentWindow:{}});
 const $=id=>elements.get(id)||elements.set(id,node()).get(id);
 const c={PASSES,HOST_PASSES,NATIVE_PASSES,LOOP_PASSES,profileConfig,PROFILE_REVISION,document:{getElementById:$,createElement:node,addEventListener(k,f){events['doc-'+k]=f;}},window:{addEventListener(k,f){events[k]=f;}},localStorage:{getItem:()=>null,setItem(){}},performance:{now:()=>1000},location:{origin:'https://test'},innerWidth:390,innerHeight:689,setTimeout(fn){timeouts.push(fn);return timeouts.length;},clearTimeout(){},URL,Blob,navigator:{clipboard:{writeText:noop}}};
 vm.createContext(c);vm.runInContext(source,c);$(mode).onclick();
 return {$,c,events,timeouts,result(pass,overrides={}){const r={pass,config:profileConfig('?ocean-profile=1&profile-pass='+pass),fps:30,minOneSecondFPS:30,p95FrameMs:33,resolution:[780,1378],output:[780,1378],resolutionVerifiedEveryFrame:true,oceanVisible:true,sprayVisible:true,breakerVisible:true,...overrides};events.message({origin:c.location.origin,source:$('stage').contentWindow,data:{type:'daybuoy-profile',status:'profile-result',result:r}});}};
}
const r=runner();
for(const pass of ['baseline',...HOST_PASSES,'baseline']){
 const url=r.$('stage').src;
 assert(url.includes('profile-pass='+pass));
 assert.equal(url.startsWith('/ocean-proof/proof/frame.html?'),pass==='proof-alone');
 if(pass==='proof-alone')assert(url.includes('noClouds=1&height=3&quality=0'));
 r.result(pass);assert.equal(r.$('error').textContent,'');r.timeouts.at(-1)();
}
assert.equal(r.$('stage').src,'about:blank');
for(const overrides of [{output:[624,1102]},{resolution:[390,689]},{config:{revision:'old',seconds:20}},{resolutionVerifiedEveryFrame:false}]){const bad=runner();bad.result('baseline',overrides);assert(bad.$('error').textContent);}
const hidden=runner();hidden.result('baseline');hidden.timeouts.at(-1)();hidden.result('proof-alone',{oceanVisible:false});assert.match(hidden.$('error').textContent,/disabled ocean/);
const native=runner('native');
for(const pass of [...NATIVE_PASSES,'native']){
 assert(native.$('stage').src.startsWith('/?review=1'));assert(native.$('stage').src.includes('profile-pass='+pass));
 const dpr=profileConfig('?ocean-profile=1&profile-pass='+pass).dpr;const size=[Math.floor(390*dpr),Math.floor(689*dpr)];
 native.result(pass,{resolution:size,output:size});assert.equal(native.$('error').textContent,'');native.timeouts.at(-1)();
}
assert.equal(native.$('stage').src,'about:blank');
const loop=runner('loop');
for(const pass of ['native',...LOOP_PASSES,'native']){
 assert(loop.$('stage').src.includes('profile-pass='+pass));
 const empty=pass.includes('empty'),raf=['native-empty-raf','native-readback','native-raf'].includes(pass);
 loop.result(pass,{clearOnly:empty,metric:raf?'raf-submitted':'gpu-completed',cpuFrame:{samples:400,meanMs:2},cpuRender:{samples:400},oceanVisible:!empty,sprayVisible:!empty,breakerVisible:!empty,cpuReadbacksEnabled:pass!=='native-readback',perFrameCompletionWait:!raf,readbackRequests:{waterHeight:{accepted:0},atmosphere:{accepted:0}}});
 assert.equal(loop.$('error').textContent,'');loop.timeouts.at(-1)();
}
assert.equal(loop.$('stage').src,'about:blank');
const badCPU=runner('loop');badCPU.result('native');badCPU.timeouts.at(-1)();badCPU.result('native-empty',{clearOnly:true});assert.match(badCPU.$('error').textContent,/loop\/CPU/);
console.log('PASS: six DPR-2 host cases; ocean update functions untouched; actual disabled-shadow uniform path; first-frame atmosphere prime; direct-proof routing; rejection of stale/DPR/hidden-ocean results. CPU/source only.');
