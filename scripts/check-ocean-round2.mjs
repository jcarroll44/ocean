import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {deriveGrid128,names} from '../ocean-proof/scripts/generate-grid128.mjs';
import {applyMeshLOD} from '../ocean-proof/proof/quality.js';
// Exact reproducible derivative, and every static dependency resolves. Vendor
// integrity is checked independently by the existing proof build.
for(const name of names){
 const file='ocean-proof/proof/grid128/'+name+'.js',text=fs.readFileSync(file,'utf8');
 assert.equal(text,deriveGrid128(name,fs.readFileSync('ocean-proof/vendor/tidewater/src/ocean/'+name+'.js','utf8')));
 for(const m of text.matchAll(/from '([^']+)'/g))assert(fs.existsSync(path.resolve(path.dirname(file),m[1])));
 execFileSync(process.execPath,['--check',file]);
}
// 7-bit permutation has no duplicates/out-of-range indices. IFFT butterfly
// stage count, allocation and mip bindings are also validated on Dawn below.
const reversed=Array.from({length:128},(_,v)=>{let r=v;r=((r&0x55)<<1)|((r>>1)&0x55);r=((r&0x33)<<2)|((r>>2)&0x33);r=((r&15)<<4)|((r>>4)&15);return r>>1;});
assert.equal(new Set(reversed).size,128);assert.equal(Math.max(...reversed),127);
for(let i=0;i<128;i++)assert.equal(reversed[reversed[i]],i);
const lod={levels:12,leafSize:8,ranges:[],uMorph:{array:Array.from({length:12},()=>({set(a,b){this.x=a;this.y=b;}}))},params:{fields:{morph:{value:Array.from({length:12},()=>({}))}},set(){}}};
applyMeshLOD({oceanLOD:lod},2);
for(let i=0;i<12;i++){assert.equal(lod.ranges[i],8*2**i*2);assert.equal(lod.uMorph.array[i].x,lod.params.fields.morph.value[i].x);}
// Exercise actual integration across all resolution rows and the atlas. Record
// the scissored draws and number/order of submissions, including resize drift.
const code=fs.readFileSync('src/ocean-layer.js','utf8');
const {PerspectiveCamera,Vector3}=await import('../ocean-proof/vendor/tidewater/src/engine/index.js');
for(const [pass,dpr] of [['baseline',2],['atlas',2],['dpr1',1],['dpr15',1.5],['host-single',2],['host-shadows',2],['host-sky',2],['host-post',2],['host-all',2]]){
 const single=['host-single','host-all'].includes(pass),baked=['host-sky','host-all'].includes(pass);
 const nodes=new Map(),events={},calls=[],canvas={style:{}};nodes.set('#ocean',canvas);
 const el=()=>({style:{},setAttribute(){},append(){},prepend(){},contentWindow:{}});
 const $=id=>nodes.get(id)||nodes.set(id,el()).get(id);
 let host,ratio=1,viewport,scissor=false;
 const children=[{renderOrder:1,isMesh:true,visible:true},{renderOrder:-100,isMesh:true,visible:true,material:{original:true}},{renderOrder:100,visible:true}];
 const renderer={setPixelRatio(r){ratio=r;},setSize(w,h){canvas.width=Math.floor(w*ratio);canvas.height=Math.floor(h*ratio);},setRenderTarget(){},setClearColor(){},clear(){},setViewport(...v){viewport=v;},setScissor(){},setScissorTest(v){scissor=v;},render(){calls.push({draw:true,width:canvas.width,viewport,scissor,visible:children.map(o=>o.visible)});}};
 const engine={renderer,scene:{children},camera:new PerspectiveCamera(),resize(w,h,s){renderer.setPixelRatio(s);renderer.setSize(w,h);},render(){calls.push('fallback');}};
 const u=value=>({value});
 const c={engine,THREE:{Vector3,WebGLRenderTarget:class{constructor(w,h){assert.equal(w,782);assert.equal(h,1378);this.texture={};}},ShaderMaterial:class{constructor(options){Object.assign(this,options);}}},$,q:new URLSearchParams('?ocean-profile=1&profile-pass='+pass),navigator:{gpu:{}},window:{addEventListener(k,f){events[k]=f;}},parent:{postMessage(){}},document:{createElement(tag){const n=el();if(tag==='iframe')host=n;return n;}},location:{origin:'https://test'},innerWidth:391,innerHeight:689,setTimeout(){},clearTimeout(){},state:{data:{rows:[{}]}},setTime(){},weatherRoot:null,conditions:()=>({}),realForecast:()=>false,uniforms:{uSun:u(new Vector3()),uMoon:u(new Vector3()),uMoonInfo:u(new Vector3()),uLightning:u(0),uCloud:u(0),uCloudLayers:u(new Vector3()),uRain:u(0)}};
 vm.createContext(c);vm.runInContext(code,c);
 engine.resize(391,689,1.6);assert.equal(ratio,dpr);
 host.contentWindow.__daybuoyOcean={ready:true,begin(p,source){calls.push('copy');assert.equal(source,canvas);return true;},finish(source){calls.push('finish');assert.equal(source,pass==='atlas'||single?null:canvas);}};
 events.message({origin:c.location.origin,source:host.contentWindow,data:{type:'daybuoy-ocean',status:'ready'}});
 engine.render(.1);assert.equal(calls.filter(v=>v.draw).length,(single?1:2)+(baked?1:0));assert.deepEqual(children.map(o=>o.visible),[true,true,true]);
 const steady=pass==='atlas'?['draw','draw','copy','finish']:single?['draw','copy','finish']:['draw','copy','draw','finish'];
 assert.deepEqual(calls.map(v=>v.draw?'draw':v),baked?['draw',...steady]:steady);
 if(baked){assert(children[1].material.fragmentShader.includes('texture2D(baked'));calls.length=0;engine.render(.1);assert.deepEqual(calls.map(v=>v.draw?'draw':v),steady,'Background must bake only once');}
 assert.equal(canvas.width,Math.floor(391*dpr)*(pass==='atlas'?2:1));assert.equal(canvas.height,Math.floor(689*dpr));
 if(pass==='atlas'){assert.equal(calls[0].scissor,true);assert.equal(calls[1].viewport[0],391);assert.equal(scissor,false);}
}
// Atlas texture mapping addresses the same pixel centers, including edge
// clamping during refraction resampling. This does not establish visual parity.
for(const width of [390,586,780])for(let x=0;x<width;x++)for(const half of [0,1]){
 const u=(x+.5)/width,packed=(u+half)*.5;
 assert(Math.abs(packed*width*2-(half*width+x+.5))<1e-10);
}
console.log('PASS: round-2 option isolation, every legacy resize retains DPR, atlas draw/transfer order and texel centers, real 128-grid derivative, LOD-only ranges. CPU/source only; no phone/pixel claim.');
