import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';
import {marineInput,applyMarine} from '../ocean-proof/proof/forecast.js';
import {coastalHeight,createBeachTerrain} from '../ocean-proof/proof/beach-land.js';
import {createLandward} from '../ocean-proof/proof/landward.js';
import {Scene,Vector2,Vector4,PerspectiveCamera,Vector3} from '../ocean-proof/vendor/tidewater/src/engine/index.js';
const checks=[];const ok=(name)=>checks.push({check:name,result:'PASS',scope:'CPU / source checks; not rendered'});
for(const ft of [1,3,5]){const a=marineInput({swell:ft,period:8,direction:201,wind:10,windDirection:201,tide:.2,cloud:30});assert.equal(a.amplitude,ft*.3048/2);assert.equal(a.period,8);assert.deepEqual(a.propagation,[0,-1]);assert.equal(a.tide,.2);assert.equal(a.cloud,.3);}
assert.equal(marineInput({swell:NaN}),null);assert.equal(marineInput({swell:1,period:0,direction:201,wind:5,windDirection:201}),null);
const east=marineInput({swell:3,period:10,direction:291,wind:5,windDirection:111});assert(Math.abs(east.propagation[0]-1)<1e-12);assert(Math.abs(east.windVector[0]+1)<1e-12);
const app={shore:{amplitude:{},period:{}},fft:{local:{},swell:{},choppiness:{},params:{fields:{sysB:{value:[new Vector4(),new Vector4()]}},set(){}},updateSpectrumUniforms(){}},clouds:{coverage:{}}};const G={windSpeed:{},windDir:{value:new Vector2()},seaLevel:{}};
assert(applyMarine(app,G,{swell:5,period:12,direction:240,wind:14,windDirection:230,tide:.3,cloud:84}));assert.equal(app.fft.params.fields.sysB.value[1].y,2*Math.PI/12);assert.equal(app.shore.period.value,12);assert.equal(G.seaLevel.value,.3);ok('1/3/5 ft → H/2; period, incoming bearings, wind and cloud units; missing data rejected');
const t=createBeachTerrain();for(let x=-100;x<=100;x+=10)for(let z=33;z<220;z+=4)assert(coastalHeight(x,z)>=2&&coastalHeight(x,z)<=4);assert.equal(coastalHeight(0,0),.3675);
const scene=new Scene();const group=createLandward({scene,terrainData:t});const plants=group.children.filter(x=>x.isInstancedMesh&&x.name!=='Walkover and empty stand');assert.deepEqual(plants.map(x=>x.count),[360,84,108,28]);for(const m of plants)assert([...m.instanceMatrix.array].every(Number.isFinite));ok('Dunes stay 2–4 m; unchanged nearshore slope; 580 finite plant instances in four draws');
// Actual stage-1 adapter, controlled DOM. Verify that unsupported and failing
// WebGPU never suppress the existing renderer, and data comes from the app.
const elements=new Map(),element=()=>({style:{},dataset:{},hidden:false,setAttribute(){},append(){},prepend(){},contentWindow:{sent:[],postMessage(x){this.sent.push(x);}}});
const $=s=>elements.get(s)||elements.set(s,element()).get(s),listeners={};let native,rendered=0,now=1000;
const camera=new PerspectiveCamera(60,390/844,.3,60000);camera.position.set(0,10,28);camera.lookAt(0,10,27);
const context={q:new URLSearchParams('?ocean=webgpu'),engine:{camera,render(){rendered++;}},document:{hidden:false,createElement(tag){const x=element();if(tag==='iframe')native=x;return x;}},window:{addEventListener(k,fn){listeners[k]=fn;}},performance:{now:()=>now},setTimeout:()=>1,clearTimeout(){},THREE:{Vector3},$,location:{origin:'https://test'},state:{playing:false,scrubbing:false,dirty:false},uniforms:{uSun:{value:new Vector3(0,.5,-.5)}},timeExploreOpacity:0,isStorm:()=>false,conditions:()=>({swell:3,period:8,direction:201,wind:10,windDirection:240}),realForecast:()=>true};vm.createContext(context);vm.runInContext(fs.readFileSync('src/night-bridge.js','utf8'),context);
context.engine.render(.016);assert.equal(rendered,1);assert.equal($('#ocean').style.opacity,'1');
listeners.message({origin:'https://test',source:native.contentWindow,data:{type:'proof',status:'ready'}});context.engine.render(.016);assert.equal($('#ocean').style.opacity,'0');assert.equal(rendered,1);assert(native.contentWindow.sent.some(x=>x.type==='daybuoy-frame'&&x.forecast.swell===3));
context.state.playing=true;context.engine.render(.016);assert.equal($('#ocean').style.opacity,'1');context.state.playing=false;context.uniforms.uSun.value.y=-.3;context.engine.render(.016);assert.equal($('#ocean').style.opacity,'1');
listeners.message({origin:'https://test',source:native.contentWindow,data:{type:'proof',status:'failed'}});context.uniforms.uSun.value.y=.5;context.engine.render(.016);assert.equal($('#ocean').style.opacity,'1');ok('Archived adapter only (not shipped): packet, handoff and failure behavior');
for(const file of ['src/camera.js','src/interaction.js','src/story.js','src/scene-data.js','src/lighting.js','src/weather-effects.js','src/celestial.js'])assert.equal(fs.readFileSync(file,'utf8'),execFileSync('git',['show','30826de2b421b6fae157e69374433aa0fb75b701:'+file],{encoding:'utf8',maxBuffer:16000000}));ok('Camera, gestures, astronomy, weather and story source hashes preserved');
for(const f of ['src/night-presentation.js','src/night-bridge.js'])execFileSync(process.execPath,['--check',f]);
const html=fs.readFileSync('dist/index.html','utf8');new vm.Script(html.match(/<script>([\s\S]*)<\/script>/)[1]);ok('Final app bundle parses');
fs.mkdirSync('night-report',{recursive:true});fs.writeFileSync('night-report/validation.json',JSON.stringify({date:'2026-10-06',checks,unverified:['iPhone sustained fps','full renderer shader compilation','visual comparison, screenshots and video','live forecast network reliability','rendered CSS, contrast and touch ergonomics']},null,2));console.log(JSON.stringify(checks,null,2));
