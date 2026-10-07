import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';
import {PASSES,profileConfig,ProfileRun,installShaderAblation,installRuntimeAblation,breakersForProfile} from '../ocean-proof/proof/profile.js';
import {Breakers} from '../ocean-proof/vendor/tidewater/src/ocean/Breakers.js';
import {WaterSurface} from '../ocean-proof/vendor/tidewater/src/ocean/WaterSurface.js';
import {WaterMaterial} from '../ocean-proof/vendor/tidewater/src/ocean/WaterMaterial.js';
import {ShoreWaves} from '../ocean-proof/vendor/tidewater/src/ocean/ShoreWaves.js';
import {SurfFoam} from '../ocean-proof/vendor/tidewater/src/ocean/SurfFoam.js';
import {ShaderModule} from '../ocean-proof/vendor/tidewater/src/engine/gpu/Shader.js';
import {PerspectiveCamera,Vector3} from '../ocean-proof/vendor/tidewater/src/engine/index.js';
assert.equal(profileConfig('?quality=0'),null);
assert.throws(()=>profileConfig('?ocean-profile=1&profile-pass=garbage'));
assert.equal(profileConfig('?ocean-profile=1&profile-seconds=120').seconds,120);
const untouched=new Proxy({}, {get(){throw Error('Ordinary build accessed profiling internals');}});
installShaderAblation(untouched,null);installRuntimeAblation(untouched,null);
// Generate actual upstream WGSL on the CPU. Validate guarded edits against the
// real interfaces. This checks source composition, not GPU shader validation.
const shoreCode=ShoreWaves.prototype._code.call({});
const shore={module:new ShaderModule({name:'shore',code:shoreCode})};
installShaderAblation({shore},{pass:'shore'});
for(const name of ['shoreEvaluate','shoreEvaluateNoNormal','shoreEvaluateWorld']){
 const body=shore.module.code.slice(shore.module.code.indexOf('fn '+name+'(')).split('}')[0];
 assert(body.includes('o.nShore=vec3f(0.0,1.0,0.0)'));assert(!body.includes('shorePhaseAt'));
}
const sf={module:new ShaderModule({name:'surfFoam',code:SurfFoam.prototype._code.call({bump:.7,period:1.2,maxFlow:2.5})})};
const surface=new WaterSurface({fft:{cascades:4,sizes:[256,64,16,4],module:new ShaderModule({name:'fft'})},cdlod:{module:new ShaderModule({name:'cdlod'})},foamTexture:{}});
surface.shore={module:new ShaderModule({name:'shore',code:shoreCode})};surface.shoreSim={module:new ShaderModule({name:'shoreSim'})};surface.foamShading=sf;
const before=surface.module.code;
installShaderAblation({surface,surfFoam:sf},{pass:'foam'});
assert(before.includes('textureSample( waterFoamTex'));
assert(!surface.module.code.includes('textureSample( waterFoamTex'));
assert(!surface.module.code.includes('surfFoamShading( fa )'));
assert(surface.module.code.includes('o.normal = normal'));
assert(sf.module.code.includes('return vec3f(0.0);'));
const material={waterSurface:surface,_shadeWGSL:WaterMaterial.prototype._shadeWGSL};
const opts={T:true,SH:true,SIM:true,SF:true,CL:false,HULL:false,REFL:false};
const full=material._shadeWGSL(opts);installShaderAblation({waterMaterial:material},{pass:'reflections'});
const reduced=material._shadeWGSL(opts);
assert(full.includes('let Rraw = reflect'));assert(!reduced.includes('let Rraw = reflect'));
assert(!reduced.includes('let r = _waterSSR'));assert(reduced.includes('let sunSpec ='));
for(const [pass] of PASSES){
 const calls=[],fn=n=>()=>calls.push(n);
 const app={fft:{update:fn('fft')},spray:{update:fn('spray'),mesh:{visible:true}},breakers:{kernel:{dispatch:fn('emission')},_budget:fn('budget'),mesh:{visible:true}},shoreSim:{update:fn('swash')},refraction:{render:fn('refraction')},environment:{update:fn('reflections')}};
 const comp={copyBase:fn('base'),copyOverlay:fn('overlay')};installRuntimeAblation(app,{pass},comp);
 app.fft.update();app.spray.update();app.breakers.kernel.dispatch();app.shoreSim.update();app.refraction.render();app.environment.update();
 for(const name of ['fft','spray','swash','refraction','reflections'])assert.equal(calls.includes(name),pass!==name,pass+' altered '+name);
 assert(calls.includes('emission'),'Shared crest kernel must remain active');
 assert.equal(app.spray.mesh.visible,!['spray','transparency'].includes(pass));
 assert.equal(app.breakers.mesh.visible,pass!=='transparency');
 comp.copyBase({});comp.copyBase({});comp.copyOverlay({});comp.copyOverlay({});
 assert.equal(calls.filter(n=>n==='base').length,pass==='composition'?1:2);
}
assert.equal(breakersForProfile(Breakers,null),Breakers);
const NoSpray=breakersForProfile(Breakers,{pass:'spray'});
const emitter=NoSpray.prototype._emitCode.call({spacing:.6});
const body=emitter.slice(emitter.indexOf('fn breakersEmit(')).split('}')[0];
assert(body.includes('return;'));assert(!body.includes('sprayReserve'));assert(!body.includes('let gain'));
// Elapsed-time statistics with deliberate stalls: no frame-count clock and no
// averaging away a multi-second pause. Synthetic input, never a device result.
for(const rate of [6,19,30,60]){
 const run=new ProfileRun({seconds:120,warmup:15,pass:'baseline'});let result;
 for(let t=0;t<140000&&!result;t+=1000/rate)result=run.observe(t);
 assert(result);assert(Math.abs(result.fps-rate)<.01);assert(result.duration>=120);assert(result.minOneSecondFPS>=rate-1);
 if(rate<30)assert.equal(result.meetsCadenceTarget,false);
}
const stalled=new ProfileRun({seconds:20,warmup:0,pass:'baseline'});let result;
for(let t=0;t<23000&&!result;t+=1000/60){if(t>5000&&t<8000)continue;result=stalled.observe(t);}
assert.equal(result.minOneSecondFPS,0);assert(result.maxFrameMs>2900);assert.equal(result.meetsCadenceTarget,false);
// Execute the actual integration path: review data must still render the
// controlled native ocean, and result messages must reach the parent runner.
const elements=new Map(),listeners={},sent=[];
let host,packet,ratio,selected;
const el=()=>({style:{},setAttribute(){},append(){},prepend(){},contentWindow:{}});
const $=id=>elements.get(id)||elements.set(id,el()).get(id);
const camera=new PerspectiveCamera(60,390/844,.3,60000),uniform=v=>({value:v});
const renderer={setPixelRatio:r=>ratio=r,setSize(){},setRenderTarget(){},setClearColor(){},clear(){},render(){}};
const engine={camera,scene:{children:[]},renderer,render(){throw Error('Fixture unexpectedly rendered fallback');}};
const context={engine,THREE:{Vector3},$,q:new URLSearchParams('?review=1&ocean-profile=1&profile-pass=foam'),navigator:{gpu:{}},
 window:{addEventListener:(k,f)=>listeners[k]=f},parent:{postMessage:(d,origin)=>sent.push({d,origin})},
 document:{createElement(tag){const e=el();if(tag==='iframe')host=e;return e;}},location:{origin:'https://test'},setTimeout(){},clearTimeout(){},
 state:{data:{rows:[{}]},live:true},setTime:t=>selected=t,innerWidth:390,innerHeight:844,weatherRoot:null,
 uniforms:{uSun:uniform(new Vector3()),uMoon:uniform(new Vector3()),uMoonInfo:uniform(new Vector3()),uLightning:uniform(0),uCloud:uniform(1),uCloudLayers:uniform(new Vector3(1,1,1)),uRain:uniform(1)},conditions:()=>({}),realForecast:()=>false};
vm.createContext(context);vm.runInContext(fs.readFileSync('src/ocean-layer.js','utf8'),context);
assert.equal(ratio,2);assert.equal(selected,Date.parse('2026-10-05T12:00:00-05:00'));assert.equal(context.state.live,false);
host.contentWindow.__daybuoyOcean={ready:true,begin(p){packet=p;return true;},finish(){}};
const message=d=>listeners.message({origin:'https://test',source:host.contentWindow,data:{type:'daybuoy-ocean',...d}});
message({status:'ready'});engine.render(.016);
assert.equal(packet.forecast.swell,3);assert.equal(packet.forecast.period,8);assert.equal(packet.forecast.tide,0);assert.equal(packet.forecast.cloud,0);
assert.equal(packet.camera.fov,2*Math.atan(.59)*180/Math.PI);assert.equal(packet.sun[0],-.33561098722843147);
message({status:'profile-result',result:{pass:'foam'}});
assert.equal(sent.at(-1).d.type,'daybuoy-profile');assert.equal(sent.at(-1).d.result.pass,'foam');assert.equal(sent.at(-1).origin,'https://test');
// Protect the other workstream byte-for-byte against the supplied checkpoint.
for(const file of ['src/daybuoy.js','src/home.js','src/presentation.js','src/scene-ui.js','src/sheets.js','src/index.html','src/reference.css','src/reference-host.css','src/camera.js','src/interaction.js','src/story.js','src/scene-data.js','src/lighting.js']){
 assert.equal(fs.readFileSync(file,'utf8'),execFileSync('git',['show','dcb23fa253afb0c50225d045d0811cdb805ae0ee:'+file],{encoding:'utf8',maxBuffer:16000000}),file+' changed outside wave scope');
}
for(const file of ['src/ocean-layer.js','ocean-proof/proof/profile.js','ocean-proof/proof/profile-page.js','ocean-proof/proof/ocean-only.js'])execFileSync(process.execPath,['--check',file]);
console.log('PASS: opt-in profiling; real upstream shader-source hooks; isolated runtime switches; elapsed-time/stall statistics; UI/camera byte preservation. CPU/source tests only; iPhone, WGSL pipelines and screenshots unverified.');
