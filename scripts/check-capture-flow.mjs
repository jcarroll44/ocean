import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
import {isIPhone,screenAwake} from '../ocean-proof/proof/diagnostic-device.js';
import {pinTestViewport} from '../ocean-proof/proof/test-viewport.js';
import {INTEGRATION_BUILD} from '../ocean-proof/proof/integration-build.js';
const script=fs.readFileSync('ocean-live.html','utf8').match(/<script type="module">([\s\S]*?)<\/script>/)[1].replace(/^import .*;\n/gm,'');
for(const scenario of ['clip','gate','bad-dpr','bad-dimensions','no-adaptive','desktop']){
 const seconds=scenario==='clip'?20:120,bad=scenario.startsWith('bad')||scenario==='no-adaptive';let ticks=0,wakeReleased=0;
 const events=[],elements=new Map(),node=()=>({style:{},append(){},hidden:false,textContent:'',disabled:false,src:''});
 const get=id=>elements.get(id)||elements.set(id,node()).get(id);
 const native={innerWidth:390,innerHeight:844,__app:{engine:{width:585,height:1266,canvas:{width:585,height:1266}}}};
 const frame={...node(),contentWindow:native},app=node(),win={innerWidth:390,innerHeight:844,document:{getElementById:id=>id==='app'?app:frame},__daybuoy:{engine:{getSceneCanvas:()=>native.__app.engine.canvas}}};get('stage').contentWindow=win;
 const listeners=new Map(),outer={innerWidth:390,innerHeight:844,addEventListener:(k,v)=>listeners.set(k,v),removeEventListener:k=>listeners.delete(k)};
 const evidence={native:{revision:'2026-10-08-overcast-1',post:{aa:'fxaa',flare:true},quality:{dpr:1.5},adaptiveResolution:{currentDpr:1.5}},conditions:{}};
 const ctx={document:{getElementById:get,createElement:node,addEventListener(){},removeEventListener(){}},window:outer,addEventListener(){},location:{search:'?run=0'},navigator:{userAgent:scenario==='desktop'?'Macintosh':'iPhone',maxTouchPoints:5,wakeLock:{async request(){return{addEventListener(){},async release(){wakeReleased++;}};}}},isIPhone,screenAwake,pinTestViewport,INTEGRATION_BUILD,performance:{now:()=>ticks+=1000},setInterval(){},URL,URLSearchParams,Date,Blob,
  newRunId:()=> 'mock-run',readLiveEvidence:()=>structuredClone(evidence),liveOcean:()=>({}),jsonFile:r=>({name:'report.json',blob:new Blob([JSON.stringify(r)])}),retryPending:async()=>events.push('retry'),
  measureLiveCadence:async(api,options)=>{
   assert.equal(options.seconds,seconds);assert.equal(options.warmup,15);options.validate();
   // Safari bars change only the outer viewport. The same measured run continues.
   outer.innerHeight=756;listeners.get('resize')();options.validate();assert.equal(frame.style.height,'844px');assert.equal(app.style.height,'844px');
   if(scenario==='bad-dpr')evidence.native.quality.dpr=2;
   else if(scenario==='no-adaptive')evidence.native.adaptiveResolution=null;
   else{evidence.native.quality.dpr=1.6;Object.assign(native.__app.engine,{width:624,height:1350});Object.assign(native.__app.engine.canvas,{width:624,height:1350});}
   if(scenario==='bad-dimensions')native.__app.engine.canvas.width=500;
   options.validate();events.push('measured');return {fps:40,minOneSecondFPS:39,meetsCadenceTarget:seconds===120};},
  captureScreenshot:async()=>{assert(events.includes('measured'));events.push('screenshot');return new Blob(['mock pixels']);},
  recordLiveCanvas:async()=>{assert.deepEqual(events,['retry','measured','screenshot','screenshot']);events.push('clip');return {blob:new Blob(['mock video']),extension:'mp4'};},
  uploadEvidence:async(bundle)=>{assert.equal(get('stage').src,'about:blank');const report=JSON.parse(await bundle.files[0].blob.text());assert.equal(report.seconds,seconds);assert.equal(report.build.branch,'wip/tidewater-verdict-first');assert.equal(report.viewportEvents.length,1);if(bad){assert(report.error);assert.equal(bundle.files.length,1);assert(!events.includes('clip'));}else{assert(events.includes('clip'));assert.equal(bundle.files.length,4);assert.equal(report.cadence.fps,40);assert.equal(report.samples.at(-1).dpr,1.6);}events.push('upload');}};
 vm.createContext(ctx);vm.runInContext(script,ctx);await vm.runInContext(`run(${seconds})`,ctx);
 if(scenario==='desktop'){assert.equal(get('stage').src,'');assert.deepEqual(events,[]);continue;}
 assert.equal(events.at(-1),'upload');assert.equal(wakeReleased,1);
}
console.log('PASS: live gate keeps one FPS run through toolbar resize, retains exact pinned dimensions, permits adaptive DPR, rejects bad DPR/output/missing adaptation, blocks desktop, then captures/uploads after timing and releases wake lock. Mock device only.');
