import fs from 'node:fs';import path from 'node:path';import vm from 'node:vm';import assert from 'node:assert/strict';import {parseHTML} from 'linkedom';
const read=p=>fs.readFileSync(p,'utf8'),dir='production/dist';
const files=fs.readdirSync(dir,{recursive:true}).filter(p=>fs.statSync(path.join(dir,p)).isFile());
for(const p of files){assert(/^(index\.html|scene\.html|privacy\.html|credits\.html|404\.html|robots\.txt|icon\.svg|icon-180\.png|assets\/(app\.js|scene\.js|shore\.js|app\.css)|fonts\/poppins-latin-(200|300|400|500|600)-normal\.woff2)$/.test(p),'Unapproved published file '+p);
 if(/\.(html|js|css|svg)$/.test(p))assert(!/sourceMappingURL|github_pat_|ghp_[A-Za-z0-9]{20}|GITHUB_RESULTS_TOKEN|api\/results|daybuoy-night-pass|ocean-live\.html|native-capture|hitch-trace|profile-pass|renderForCapture|captureFrame/.test(read(dir+'/'+p)),'Private/test code in '+p);
}
assert(files.includes('icon-180.png'));assert(read(dir+'/credits.html').includes('Copyright (c) 2026 DRG Software Solutions LLC'));assert(read(dir+'/credits.html').includes('SIL OPEN FONT LICENSE'));
const html=read(dir+'/index.html'),dom=parseHTML(html),{document}=dom;assert(!html.includes('<script>'));
for(const node of document.querySelectorAll('script[src],link[href]')){const u=node.getAttribute('src')||node.getAttribute('href');if(u.startsWith('/'))assert(fs.existsSync(dir+u),'Missing '+u);}
dom.HTMLElement.prototype.getBoundingClientRect=()=>({left:16,right:374,top:60,bottom:250,width:358,height:190});dom.HTMLElement.prototype.animate=()=>({cancel(){}});
let contexts=0,packet,draws=0;const events={},cache=new Map([['daybuoy.welcomed','1']]),raf=[];
const ctx=new Proxy({createRadialGradient:()=>({addColorStop(){}}),createLinearGradient:()=>({addColorStop(){}}),measureText:()=>({width:20})},{get:(o,k)=>o[k]||(()=>{}),set:(o,k,v)=>(o[k]=v,true)});
dom.HTMLCanvasElement.prototype.getContext=function(kind){if(kind!=='2d'){contexts++;throw Error('Unexpected graphics context '+kind);}return ctx;};
class TestDate extends Date{static now(){return Date.parse('2026-10-07T19:00:00Z');}}
let now=10000;const c={console,document,parent:{postMessage(){}},window:{addEventListener(k,f){events[k]=f;}},navigator:{gpu:{},onLine:true},URL,URLSearchParams,TextDecoder,Date:TestDate,location:{search:'?review=1&debug=1&ocean-profile=1&profile-pass=native&hour=12',origin:'https://test'},matchMedia:()=>({matches:false}),localStorage:{getItem:k=>cache.get(k)??null,setItem:(k,v)=>cache.set(k,v)},innerWidth:390,innerHeight:689,devicePixelRatio:3,performance:{now:()=>now,timeOrigin:1000000},setInterval(){},setTimeout(){},clearTimeout(){},requestAnimationFrame:f=>raf.push(f),addEventListener(k,f){events[k]=f;},AbortSignal,fetch:()=>new Promise(()=>{})};
vm.createContext(c);vm.runInContext(read(dir+'/assets/app.js'),c);
const app=c.window.__daybuoy;assert(app.engine.nativeScene);assert.equal(contexts,0);assert.equal(app.state.review,false);assert.equal(app.state.debug,false);assert(!app.captureFrame&&!app.renderForCapture&&!app.reviewData&&!c.window.__ocean);
assert.equal(Object.keys(app).sort().join(','),'conditions,engine,state,uniforms');
const host=document.querySelector('#tidewater-ocean-layer');assert.equal(host.src,'/scene.html');
const canvas={};Object.defineProperty(host,'contentWindow',{value:{__daybuoyOcean:{ready:true,canvas,draw(p){packet=p;draws++;}}}});
events.message({origin:'https://test',source:host.contentWindow,data:{type:'daybuoy-ocean',status:'ready'}});
app.state.data.source='live';app.state.data.retrievedAt=TestDate.now();app.state.forecastFailed=false;
const marine={swell:2,period:5,direction:201,wind:6,windDirection:190,tide:.2,cloud:34};for(const row of app.state.data.rows)Object.assign(row,marine);
// Approved camera translation is capped at 5 m/s; allow its full approach.
for(let i=0;i<900;i++){now+=1000/60;raf.shift()(now);}
assert(draws>800);for(const [key,value]of Object.entries(marine))assert(Math.abs(packet.forecast[key]-value)<1e-8,key);
assert.equal(packet.camera.aspect,390/689);assert.equal(app.engine.getSceneCanvas(),canvas);assert.equal(contexts,0);
assert.equal(document.querySelector('#ocean').style.opacity,'0');assert.equal(document.querySelector('#ocean-engine-status').hidden,true);
assert(packet.camera.position[1]>25,JSON.stringify({camera:packet.camera,time:app.state.time,live:app.state.live,playing:app.state.playing}));assert(packet.camera.fov>79);assert(Math.abs(packet.camera.shearY)<1e-8);
assert(!events.keydown,'No debug keyboard control');
console.log(`PASS: ${files.length} allowlisted production files, no maps/credentials/test routes; actual minified app startup, live forecast forwarding and approved camera with mocked GPU. No device/FPS claim.`);
