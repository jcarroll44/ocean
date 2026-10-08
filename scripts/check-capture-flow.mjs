import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const script=fs.readFileSync('ocean-live.html','utf8').match(/<script type="module">([\s\S]*?)<\/script>/)[1].replace(/^import .*;\n/gm,'');
for(const seconds of [20,120]){
 const events=[],elements=new Map(),node=()=>({append(){},hidden:false,textContent:'',disabled:false,src:''});
 const get=id=>elements.get(id)||elements.set(id,node()).get(id);
 const win={innerWidth:390,innerHeight:844,__daybuoy:{engine:{getSceneCanvas:()=>({})}}};get('stage').contentWindow=win;
 const evidence={native:{revision:'2026-10-08-overcast-1',post:{aa:'fxaa',flare:true},quality:{dpr:1.5}},conditions:{}};
 const ctx={document:{getElementById:get,createElement:node},location:{search:'?run=0'},navigator:{userAgent:'test'},performance:{now:()=>100},setInterval(){},URL,URLSearchParams,Date,Blob,
  newRunId:()=> 'mock-run',readLiveEvidence:()=>structuredClone(evidence),liveOcean:()=>({}),jsonFile:r=>({name:'report.json',blob:new Blob([JSON.stringify(r)])}),retryPending:async()=>events.push('retry'),
  measureLiveCadence:async(api,options)=>{assert.equal(options.seconds,seconds);assert.equal(options.warmup,15);options.validate();events.push('measured');return {fps:40,minOneSecondFPS:39};},
  captureScreenshot:async()=>{assert(events.includes('measured'));events.push('screenshot');return new Blob(['mock pixels']);},
  recordLiveCanvas:async()=>{assert.deepEqual(events,['retry','measured','screenshot','screenshot']);events.push('clip');return {blob:new Blob(['mock video']),extension:'mp4'};},
  uploadEvidence:async(bundle)=>{assert.equal(get('stage').src,'about:blank');assert(events.includes('clip'));assert.equal(bundle.files.length,4);const report=JSON.parse(await bundle.files[0].blob.text());assert.equal(report.seconds,seconds);assert.equal(report.cadence.fps,40);events.push('upload');}};
 vm.createContext(ctx);vm.runInContext(script,ctx);await vm.runInContext(`run(${seconds})`,ctx);assert.equal(events.at(-1),'upload');
}
console.log('PASS: actual 20/120-second capture handlers measure without encoding, capture after measurement, stop rendering, then upload JSON + two screenshots + clip. Mock device only.');
