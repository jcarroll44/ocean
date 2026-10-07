import fs from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';
const code=fs.readFileSync('src/ocean-layer.js','utf8');
const v=()=>({toArray:()=>[0,.5,-1],z:.1});
const children=[{isMesh:true,renderOrder:1,visible:true},{isPoints:true,renderOrder:2,visible:true},{renderOrder:-100,visible:true},{renderOrder:100,visible:true}];
const scene={children},elements=new Map(),listeners={};
const element=()=>({style:{},hidden:false,set id(value){this._id=value;elements.set('#'+value,this);},get id(){return this._id;},setAttribute(){},append(){},prepend(){},contentWindow:{}});
const $=id=>elements.get(id)||elements.set(id,element()).get(id);
let original=0,native=0,framePacket,host;
const renderer={setRenderTarget(){},setClearColor(){},clear(){},render(){assert(!children[0].visible&&!children[1].visible,'Old water/spray must not draw during Tidewater composition');}};
const engine={scene,renderer,camera:{position:v(),getWorldDirection(){},fov:60,aspect:390/844,near:.1,far:2500,projectionMatrix:{elements:new Array(16).fill(0)}},render(){original++;}};
const c={engine,THREE:{Vector3:class{toArray(){return[0,0,-1];}}},$,q:new URLSearchParams(),navigator:{gpu:{}},window:{addEventListener(k,f){listeners[k]=f;}},document:{createElement(tag){const el=element();if(tag==='iframe')host=el;return el;}},location:{origin:'https://test'},setTimeout(){},clearTimeout(){},weatherRoot:null,state:{playing:false,scrubbing:false},uniforms:{uSun:{value:v()},uMoon:{value:v()},uMoonInfo:{value:v()},uLightning:{value:0}},conditions:()=>({swell:7,period:8,direction:201,wind:19,windDirection:240,tide:.2,cloud:95}),realForecast:()=>true};
vm.createContext(c);vm.runInContext(code,c);
assert.equal(host.src,'ocean-proof/proof/ocean-only.html?noClouds=1&quality=auto','Default route must load native ocean, no opt-in');
engine.render(.016);assert.equal(original,1,'Loading retains usable original app');
const canvas={};host.contentWindow.__daybuoyOcean={ready:true,canvas,begin(p){framePacket=p;return true;},finish(){native++;}};
listeners.message({origin:'https://test',source:host.contentWindow,data:{type:'daybuoy-ocean',status:'ready'}});
for(const mode of ['rest','scrub','story','storm','night']){
 c.state.scrubbing=mode==='scrub';c.state.playing=mode==='story';
 if(mode==='night')c.uniforms.uSun.value.toArray=()=>[0,-.3,-1];
 engine.render(.016);assert.equal(original,1,mode+' must not fall back');assert.equal($('#ocean').style.opacity,'0');assert(!host.hidden);assert(children.every(o=>o.visible),'Scene visibility must be restored');
}
assert.equal(native,5);assert.equal(framePacket.forecast.swell,7);assert.equal(framePacket.forecast.period,8);assert.equal(engine.getSceneCanvas(),canvas);
listeners.message({origin:'https://test',source:host.contentWindow,data:{type:'daybuoy-ocean',status:'failed',reason:'Device lost'}});
engine.render(.016);assert.equal(original,2);assert.equal($('#ocean').style.opacity,'1');assert.equal(c.window.__tidewater.backend,'WebGL fallback');assert($('#ocean-engine-status').textContent.includes('unavailable'));
const out=fs.readFileSync('dist/index.html','utf8');assert(out.includes(code));assert(out.includes('engine.getSceneCanvas?.()'));assert(!out.includes("q.get('ocean')==='webgpu'"));
console.log('PASS: default native ocean; old water suppressed; scrubbing, playback, storm and night stay native; exact camera/forecast packet; share uses native canvas; actual failure disclosed. CPU checks, not phone pixels/FPS.');
