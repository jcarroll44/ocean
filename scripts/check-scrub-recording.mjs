import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const source=fs.readFileSync('ocean-proof/proof/scrub-evidence.js','utf8').replace(/^import .*;\n/gm,'').replace('export async function','async function');
for(const rendered of [true,false]){
 let now=0,next=0,opened=null,closed=false,stopped=false;const callbacks=new Map(),root={dataset:{}},state={fixtureId:'scrub-day',scrubbing:false};
 const step=()=>{now+=100;const batch=[...callbacks.values()];callbacks.clear();for(const f of batch)f(now);};
 const bridge={beginScrub(){state.scrubbing=true;return{start:0,end:86400000};},scrubTo(time){assert(state.scrubbing);return{time};},openPaywall(){opened=now;state.scrubbing=false;},closePaywall(){closed=true;},endScrub(){state.scrubbing=false;}};
 const capture={canvas:{},validate(){},state:()=>({uiFrames:100,sceneFrames:100,paywallFrames:rendered?20:0,paywallVisibleMs:rendered?now-opened:0}),stop(){stopped=true;}};
 const c={performance:{now:()=>now},requestAnimationFrame(f){const id=++next;callbacks.set(id,f);return id;},cancelAnimationFrame:id=>callbacks.delete(id),liveOcean:()=>({evidence:()=>({weather:{}})}),fullAppCapture:async()=>capture,recordLiveCanvas:async(canvas,options)=>{assert.equal(options.duration,32);const start=now;while(now-start<options.duration*1000){step();options.validate();}return{duration:32};}};
 vm.createContext(c);vm.runInContext(source,c);
 const win={__daybuoy:{state,renderUI(){}},__daybuoyFixture:bridge,document:{getElementById:()=>root,querySelector:()=>null}};
 const pending=c.recordDayScrub(win);await new Promise(r=>setImmediate(r));step();step();
 if(rendered){const clip=await pending;assert(clip.paywallIncluded);assert(clip.composition.paywallVisibleMs>=8000);assert.equal(clip.samples.at(-1).time,86399999);}
 else await assert.rejects(pending,/Paywall did not reach/);
 assert(closed&&stopped&&!state.scrubbing);assert.equal(root.dataset.recordingFull,undefined);
}
console.log('PASS: actual 24-second day scrub + eight-second paywall hold; absent composed paywall frames reject, cleanup retained. Mock recording only.');
