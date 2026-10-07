import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';import {parseHTML} from 'linkedom';
const html=fs.readFileSync('dist/index.html','utf8'),native=parseHTML(html),{document}=native;
native.HTMLElement.prototype.getBoundingClientRect=()=>({left:16,right:374,top:60,bottom:250,width:358,height:190});
native.HTMLElement.prototype.animate=()=>({cancel(){}});
let contexts=0,packet,draws=0;const events={},cache=new Map([['daybuoy.welcomed','1']]);
const ctx=new Proxy({createRadialGradient:()=>({addColorStop(){}}),createLinearGradient:()=>({addColorStop(){}}),measureText:()=>({width:20})},{get:(o,k)=>o[k]||(()=>{}),set:(o,k,v)=>(o[k]=v,true)});
native.HTMLCanvasElement.prototype.getContext=function(kind){if(kind!=='2d'){contexts++;throw Error('Unexpected graphics context '+kind);}return ctx;};
const c={console,document,parent:{postMessage(){}},window:{addEventListener(k,f){events[k]=f;}},navigator:{gpu:{},onLine:true},URL,URLSearchParams,TextDecoder,Date,location:{search:'?review=1&ocean-profile=1&profile-pass=native',origin:'https://test'},matchMedia:()=>({matches:false}),localStorage:{getItem:k=>cache.get(k)??null,setItem:(k,v)=>cache.set(k,v)},innerWidth:390,innerHeight:689,devicePixelRatio:3,performance:{now:()=>10000},setInterval(){},setTimeout(){},clearTimeout(){},requestAnimationFrame(){},addEventListener(){},AbortSignal,fetch:()=>new Promise(()=>{})};
vm.createContext(c);vm.runInContext(document.querySelector('script').textContent,c);
const app=c.window.__daybuoy;assert(app.engine.nativeScene);assert.equal(contexts,0);
const host=document.querySelector('#tidewater-ocean-layer');assert(host.src.includes('native-scene.html'));
const canvas={};Object.defineProperty(host,'contentWindow',{value:{__daybuoyOcean:{ready:true,canvas,draw(p){packet=p;draws++;}}}});
events.message({origin:'https://test',source:host.contentWindow,data:{type:'daybuoy-ocean',status:'ready'}});
for(const hour of [9,14,18.667,22]){app.renderForCapture(hour,1/60);assert(packet);assert.equal(packet.forecast.swell,3);assert.equal(packet.forecast.period,8);assert.equal(packet.camera.aspect,390/689);assert.equal(app.engine.getSceneCanvas(),canvas);}
assert.equal(contexts,0);assert.equal(draws,4);assert(packet.overlays);assert(document.querySelector('#ocean').style.opacity==='0');
console.log('PASS: full native app startup and real scene/camera updates at four hours; zero WebGL context requests; one native draw and correct forecast/camera packet; UI source retained. Mock native GPU, no pixel/FPS claim.');
