import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
import {PRE_OVERCAST_COMMIT,OVERCAST_COMMIT,CASE_LABELS} from '../ocean-proof/proof/overcast-profile-config.js';
const code=fs.readFileSync('ocean-proof/proof/overcast-profile-page.js','utf8').replace(/^import .*;\n/gm,'');
for(const breakDimensions of [false,true]){
 let now=0,current,drawNumber=0,runs=0;const urls=[],saved=new Map();
 const elem=()=>({hidden:false,textContent:'',children:[],append(x){this.children.push(x);},replaceChildren(){this.children=[];},click(){}});
 const elements=Object.fromEntries(['stage','main','hud','start','stop','rows','summary','error','status','conditions','download','copy','upload'].map(id=>[id,elem()]));
 const f={swell:2.4,period:4.4,direction:112.5,wind:9,windDirection:67.5,tide:.15,cloud:100,rain:0};
 const packet=()=>({camera:{position:[0,26,70],direction:[0,0,-1],fov:78,aspect:390/689,near:.3,far:2500,shearX:0,shearY:0},forecast:{...f,swell:f.swell+drawNumber++*.00001},sun:[0,.6,0],moon:[0,-1,0],overlays:[]});
 const frame={};Object.defineProperty(frame,'src',{set(url){urls.push(url);const a={overcastDiagnostic:{pass:new URL(url,'https://test').searchParams.get('overcast-test')||'baseline'},engine:{width:585,height:1033,canvas:{width:585,height:1033}},camera:{fov:78},setForecast(x){this.marine={amplitude:x.swell*.3048/2,period:x.period,tide:x.tide};}};a.setForecast(f);const api={draw(p){a.setForecast(p.forecast);a.camera.fov=p.camera.fov;return true;},evidence(){return {marine:a.marine,shoreFieldPending:false,quality:{dpr:1.5},post:{aa:'fxaa',flare:true},pipeline:{maxFramesInFlight:2}};}};current=frame.contentWindow={__app:a,__daybuoyOcean:api};}});
 const win={innerWidth:390,innerHeight:689,document:{getElementById:()=>frame}};
 Object.defineProperty(elements.stage,'src',{set(url){if(url==='about:blank')return;frame.src='initial-baseline';}});elements.stage.contentWindow=win;
 const document={hidden:false,getElementById:id=>elements[id],createElement:elem};
 const ctx={console,document,structuredClone,URL,URLSearchParams,Blob,Date,location:{search:'?run=0'},navigator:{clipboard:{writeText:async()=>{}}},performance:{now:()=>now++},localStorage:{getItem:k=>saved.get(k),setItem:(k,v)=>saved.set(k,v)},
  setTimeout(cb){current?.__daybuoyOcean.draw(packet());queueMicrotask(cb);},
  liveOcean:()=>current.__daybuoyOcean,readLiveEvidence:()=>({device:'synthetic test, not a phone',conditions:f}),
  PRE_OVERCAST_COMMIT,OVERCAST_COMMIT,CASE_LABELS,
  newRunId:()=> 'test-run',jsonFile:r=>({name:'report.json',blob:JSON.stringify(r)}),retryPending:async()=>{},
  collectScreenshot:async(win,files,name,report)=>{assert.equal(runs,report.rows.length);files.push({name,blob:'mock pixels'});},
  collectClip:async()=>{assert.equal(runs,11);},
  uploadEvidence:async(bundle)=>{assert.equal(bundle.kind,'overcast');assert.equal(bundle.files.length,breakDimensions?1:12);return {ok:true};},
  measureLiveCadence:async(api,{validate,seconds,warmup,onProgress})=>{assert.equal(warmup,15);runs++;if(breakDimensions)current.__app.engine.width=10;validate();api.draw(packet());validate();onProgress('synthetic');return {fps:40,minOneSecondFPS:40,oneSecondFPS:Array(seconds).fill(40),metric:'synthetic-test-only'};}};
 vm.createContext(ctx);vm.runInContext(code,ctx);await elements.start.onclick();
 const result=JSON.parse(saved.get('daybuoy.overcast.results'));assert.equal(elements.start.disabled,false);assert(elements.stage.hidden);
 if(breakDimensions){assert(result.error.includes('dimensions'));assert.equal(result.rows.length,0);}
 else{assert.equal(runs,11);assert.equal(result.rows.length,11);assert.equal(result.rows.at(-1).seconds,120);assert.equal(result.rows.at(-1).pass,'flat');assert.equal(urls.filter(u=>u.includes('/overcast-previous/')).length,2);assert.equal(result.snapshot.forecast.swell,result.rows[0].before.marine.amplitude*2/.3048);for(const r of result.rows)assert(Math.abs(r.before.marine.amplitude-result.rows[0].before.marine.amplitude)<1e-10);assert(!result.error);}
}
console.log('PASS: actual runner executes all 11 rows, retains one snapshot, uses two historical loads, saves partial results and rejects changed dimensions. Mock DOM/GPU/cadence only.');
