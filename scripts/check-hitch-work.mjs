import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {ShoreWaves} from '../ocean-proof/vendor/tidewater/src/ocean/ShoreWaves.js';
import {Texture} from '../ocean-proof/vendor/tidewater/src/engine/gpu/Texture.js';
import {shoreDirection} from '../ocean-proof/proof/shore-direction.js';
import {ShoreUpload} from '../ocean-proof/proof/shore-upload.js';
import {installSmallSurf,smallSurfStrength} from '../ocean-proof/proof/scene-polish.js';
import {installHitchTrace} from '../ocean-proof/proof/hitch-trace.js';
const res=32,data=Float32Array.from({length:res*res*4},(_,i)=>Math.sin(i*.113)),terrain={origin:-190,size:380,shoreField:{res,data}};
const fake={terrain,dirMin:{value:{copy(){}}},dirSize:{},uniforms:{fields:{dirOn:{}}}};
const expected=ShoreWaves.prototype.buildDirTexture.call(fake,{min:{x:-190,y:-170},size:380}).pendingData;
assert.deepEqual(shoreDirection(data,res,terrain.origin,terrain.size),expected,'Worker bytes equal pinned native resampling');
const shore={module:{code:ShoreWaves.prototype._code.call({})},amplitude:{value:0},period:{value:5}};
installSmallSurf(shore);
for(const a of [0,.02,.03,.08,.14,.3048,.36,.5,.7,1])for(const t of [2,5,6,7.5,9,12]){
 shore.amplitude.value=a;shore.period.value=t;shore.updateNativeSurf();
 assert.equal(shore.nativeSurf.fields.foamFloor.value,.3+.25*smallSurfStrength(a,t));
}
const original=Texture.prototype.upload,uploads=[];
Texture.prototype.upload=function(bytes,region){uploads.push({label:this.label,bytes:bytes.slice(),region});};
const field={res:512,data:Float32Array.from({length:512*512*4},(_,i)=>i/4096)},direction=new Float32Array(128*128*4).fill(.625);
const job=new ShoreUpload(field,direction);let steps=0;while(!job.step())assert(++steps<100);
assert.equal(steps+1,17);assert(uploads.every(x=>x.bytes.byteLength<=262144));
for(const [label,expected] of [['terrainShoreField',field.data],['shoreDir',direction]]){
 const actual=new Float32Array(expected.length);
 for(const u of uploads.filter(u=>u.label===label))actual.set(u.bytes,u.region.y*u.region.width*4);
 assert.deepEqual(actual,expected);
}
Texture.prototype.upload=original;
let retired=0,retire;const app={terrainGPU:{shoreTexture:{destroy(){retired++;}},uniforms:{fields:{shoreRes:{}}}},shore:{dirTexture:{destroy(){retired++;}},dirMin:{value:{set(){}}},dirSize:{},uniforms:{fields:{dirOn:{}}}}};
job.commit(app,{onSubmit(before,after){retire=after;}});assert.equal(retired,0);assert.equal(app.terrainGPU.shoreTexture,job.texture);retire();assert.equal(retired,2);
// Timestamp-disabled devices still collect CPU/work events; no invented GPU time.
const gpu={frame:0,hasTimestamp:false,_pending:new Set(),_async:d=>({label:d.label}),ready:h=>h,getEncoder(){return {};}};
const trace=installHitchTrace(gpu);trace.begin();gpu._async({label:'test'},'compute');gpu.ready({label:'test'});trace.end({});
assert.equal(trace.result().timestampSupported,false);assert.deepEqual(trace.result().gpuSamples,[]);assert.equal(trace.result().events.filter(e=>e.type.startsWith('pipeline')).length,2);
const page=fs.readFileSync('ocean-live.html','utf8');assert(page.includes('report.diagnostics=liveOcean(win).diagnostics?.()'));
assert(page.indexOf('report.diagnostics=')<page.indexOf('await captureScreenshot(win)'));
console.log('PASS: native shore resampling byte equivalence, identical foam mapping, bounded staged uploads/coherent retirement, truthful timestamp fallback and trace captured before video. CPU/source checks only.');
// Each supported sample resolves only query pairs that were actually written,
// and a pending readback prevents a second sample from reusing its query set.
globalThis.GPUBufferUsage={QUERY_RESOLVE:1,COPY_SRC:2,COPY_DST:4,MAP_READ:8};globalThis.GPUMapMode={READ:1};
const descriptors=[],resolved=[],hooks=[];let mapping,unmapped=false;
const raw=new BigUint64Array([100n,2100n,3000n,6000n]).buffer;
const device={createQuerySet:()=>({}),createBuffer(){return {mapAsync:()=>new Promise(r=>mapping=r),getMappedRange:()=>raw,unmap(){unmapped=true;}};}};
const encoder=()=>({beginComputePass:d=>descriptors.push(d),beginRenderPass:d=>descriptors.push(d),resolveQuerySet:(...a)=>resolved.push(a),copyBufferToBuffer(){}});
const gpu2={...gpu,hasTimestamp:true,device,encoder:null,_async:d=>({label:d.label}),ready:h=>h,getEncoder(){return this.encoder??=encoder();},onSubmit(before,after){hooks.push({before,after});}};
const trace2=installHitchTrace(gpu2),enc=gpu2.getEncoder();enc.beginComputePass({label:'shore'});enc.beginRenderPass({label:'water'});
assert.equal(descriptors[0].timestampWrites.beginningOfPassWriteIndex,0);assert.equal(descriptors[1].timestampWrites.endOfPassWriteIndex,3);
hooks[0].before(enc);hooks[0].after();assert.equal(resolved[0][2],4);
gpu2.encoder=null;gpu2.getEncoder().beginRenderPass({label:'unmeasured'});assert.equal(descriptors.at(-1).timestampWrites,undefined);
mapping();await new Promise(r=>setTimeout(r,0));assert(unmapped);assert.deepEqual(trace2.result().gpuSamples[0].passes,{shore:.002,water:.003});
console.log('PASS: supported timestamp sampling resolves only written pairs, keeps readback asynchronous and does not reuse in-flight query data. Mock GPU timing mechanics only.');

// Exercise the actual host-recognition function at varying Sites iframe depths.
const nativeSource=fs.readFileSync('ocean-proof/proof/native-scene.js','utf8');
const diagnosticSource=nativeSource.match(/function diagnosticHost\(\)\{[^\n]+/)[0];
for(const [path,search,expected] of [['/weather-fixtures.html','',true],['/','?ocean-debug=1',true],['/','',false]]){
 const host={location:{pathname:path,search}};host.parent=host;
 for(let depth=0;depth<4;depth++){let leaf=host;for(let i=0;i<depth;i++)leaf={location:{pathname:'/ocean-proof/proof/native-scene.html',search:''},parent:leaf};
  assert.equal(vm.runInNewContext(diagnosticSource+';diagnosticHost()',{window:leaf,URLSearchParams}),expected,'Diagnostic recognition at depth '+depth);
 }
}
assert(nativeSource.includes("if(diagnosticHost())trace=installHitchTrace(GPU)"));
assert(fs.readFileSync('ocean-proof/proof/hitch-trace.js','utf8').includes("wrap(app.nativeWeather?.cache,'step','cloud-cache.step')"));
console.log('PASS: diagnostic host recognition through Sites wrappers; ordinary production hosts do not opt in.');
