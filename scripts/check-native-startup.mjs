import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';import {parseHTML} from 'linkedom';
const html=fs.readFileSync('dist/index.html','utf8'),native=parseHTML(html),{document}=native;
native.HTMLElement.prototype.getBoundingClientRect=()=>({left:16,right:374,top:60,bottom:250,width:358,height:190});
native.HTMLElement.prototype.animate=()=>({cancel(){}});
let contexts=0,packet,draws=0;const events={},cache=new Map([['daybuoy.welcomed','1']]),raf=[];
const ctx=new Proxy({createRadialGradient:()=>({addColorStop(){}}),createLinearGradient:()=>({addColorStop(){}}),measureText:()=>({width:20})},{get:(o,k)=>o[k]||(()=>{}),set:(o,k,v)=>(o[k]=v,true)});
native.HTMLCanvasElement.prototype.getContext=function(kind){if(kind!=='2d'){contexts++;throw Error('Unexpected graphics context '+kind);}return ctx;};
const c={console,document,parent:{postMessage(){}},window:{addEventListener(k,f){events[k]=f;}},navigator:{gpu:{},onLine:true},URL,URLSearchParams,TextDecoder,Date,location:{search:'?review=1&ocean-profile=1&profile-pass=native',origin:'https://test'},matchMedia:()=>({matches:false}),localStorage:{getItem:k=>cache.get(k)??null,setItem:(k,v)=>cache.set(k,v)},innerWidth:390,innerHeight:689,devicePixelRatio:3,performance:{now:()=>10000,timeOrigin:1000000},setInterval(){},setTimeout(){},clearTimeout(){},requestAnimationFrame:f=>raf.push(f),addEventListener(){},AbortSignal,fetch:()=>new Promise(()=>{})};
vm.createContext(c);vm.runInContext(document.querySelector('script').textContent,c);
const app=c.window.__daybuoy;assert(app.engine.nativeScene);assert.equal(contexts,0);
const host=document.querySelector('#tidewater-ocean-layer');assert(host.src.includes('native-scene.html'));
const canvas={};Object.defineProperty(host,'contentWindow',{value:{__daybuoyOcean:{ready:true,canvas,draw(p){packet=p;draws++;}}}});
events.message({origin:'https://test',source:host.contentWindow,data:{type:'daybuoy-ocean',status:'ready'}});
for(const hour of [9,14,18.667,22]){app.renderForCapture(hour,1/60);assert(packet);assert.equal(packet.forecast.swell,3);assert.equal(packet.forecast.period,8);assert.equal(packet.camera.aspect,390/689);assert.equal(app.engine.getSceneCanvas(),canvas);}
assert.equal(contexts,0);assert.equal(draws,4);assert(packet.overlays);assert(document.querySelector('#ocean').style.opacity==='0');
// Exercise the real scheduled callback, including a GPU-gated frame. Timing
// must wrap CPU/UI work even when engine.render cannot submit another frame.
app.state.capture=false;const probe=host.contentWindow.__daybuoyOcean,starts=[],ends=[];
probe.profileFrameStart=(...args)=>starts.push(args);probe.profileFrameEnd=ms=>ends.push(ms);
raf.shift()(10000); // already queued before the adapter installed the wrapper
raf.shift()(10016);assert.equal(starts.length,1);assert.deepEqual(starts[0],[10016,1000000]);assert.equal(ends.length,1);
const before=draws;probe.ready=false;raf.shift()(10032);assert.equal(draws,before);assert.equal(starts.length,2);assert.equal(ends.length,2);
console.log('PASS: full native app startup and real scene/camera updates at four hours; zero WebGL context requests; one native draw and correct forecast/camera packet; UI source retained. Mock native GPU, no pixel/FPS claim.');

// Ordinary app startup has neither the fixed fixture nor the proof camera.
// Supply synthetic live rows to exercise the real adapter, without changing
// the frozen UI/forecast/camera source or claiming a network/device test.
const liveDOM=parseHTML(html),liveEvents={},liveRAF=[];
const liveNow=Date.parse('2026-10-07T19:00:00Z');class LiveTestDate extends Date{static now(){return liveNow;}}
let livePacket;
const liveContext={...c,Date:LiveTestDate,document:liveDOM.document,window:{addEventListener(k,f){liveEvents[k]=f;}},location:{search:'',origin:'https://test'},requestAnimationFrame:f=>liveRAF.push(f)};
vm.createContext(liveContext);vm.runInContext(liveDOM.document.querySelector('script').textContent,liveContext);
const liveApp=liveContext.window.__daybuoy,liveHost=liveDOM.document.querySelector('#tidewater-ocean-layer');
assert(!liveHost.src.includes('ocean-profile'));assert.equal(liveApp.state.review,false);
Object.defineProperty(liveHost,'contentWindow',{value:{__daybuoyOcean:{ready:true,canvas,draw(p){livePacket=p;}}}});
liveEvents.message({origin:'https://test',source:liveHost.contentWindow,data:{type:'daybuoy-ocean',status:'ready'}});
liveApp.state.data.source='live';liveApp.state.data.retrievedAt=liveNow;liveApp.state.forecastFailed=false;
for(const marine of [{swell:1.2,period:6,direction:185,wind:5,windDirection:155,tide:.27},{swell:4.2,period:11,direction:225,wind:18,windDirection:235,tide:-.13}]){
 for(const row of liveApp.state.data.rows)Object.assign(row,marine);
 for(let i=0;i<350;i++)liveApp.renderForCapture(12,1/30);
 for(const key of Object.keys(marine))assert(Math.abs(livePacket.forecast[key]-marine[key])<1e-9,key);
 assert(livePacket.camera.position[1]>25,JSON.stringify({camera:livePacket.camera,sun:livePacket.sun,time:new Date(liveApp.state.time).toISOString(),sheet:liveApp.state.sheet}));assert(livePacket.camera.fov>79);assert(Math.abs(livePacket.camera.shearY)<1e-9);
 assert(Math.hypot(livePacket.camera.position[0],livePacket.camera.position[2])>69);
}
assert.equal(contexts,0);
liveApp.state.userLook={x:2,y:20,z:50,yaw:.4,pitch:.1,fov:65,shear:0,anchorYaw:.4};
for(let i=0;i<100;i++)liveApp.renderForCapture(12,1/30);
assert.equal(livePacket.camera.position[0],2);assert.equal(livePacket.camera.position[1],20);assert.equal(livePacket.camera.position[2],50);assert(Math.abs(livePacket.camera.fov-65)<.01);
liveApp.state.userLook=null;liveApp.openSheet('water');
for(let i=0;i<350;i++)liveApp.renderForCapture(12,1/30);
assert(Math.abs(livePacket.camera.position[1]-3.8)<.02);assert(Math.abs(livePacket.camera.fov-64)<.01);
console.log('PASS: ordinary native adapter forwards changing live height/period/bearings/wind/tide and settles on approved midday beachPose, with no fixed proof camera. Synthetic data, real app math.');
