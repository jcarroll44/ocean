import {WEATHER_FIXTURES,HEAVIEST_FIXTURE,fixtureData,scrubDayData} from './weather-fixtures.js';
import {liveOcean,measureLiveCadence,recordLiveCanvas} from './live-evidence.js';
import {newRunId,jsonFile,captureScreenshot,uploadEvidence,retryPending} from './results-upload.js';
import {isIPhone,screenAwake} from './diagnostic-device.js';
import {pinTestViewport} from './test-viewport.js';
import {INTEGRATION_BUILD} from './integration-build.js';
import {fixtureContactSheet} from './fixture-contact-sheet.js';
import {recordDayScrub} from './scrub-evidence.js';
const $=id=>document.getElementById(id),stage=$('stage'),query=new URLSearchParams(location.search),gateRequested=query.get('gate')==='1',allowed=isIPhone(navigator),events=[],wakeEvents=[];
const viewport=pinTestViewport(stage,window,e=>events.push(e)),awake=screenAwake(navigator,document,text=>$('awake').textContent=text,e=>wakeEvents.push(e));
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));let busy=false,selected=null;
for(const f of WEATHER_FIXTURES){const option=document.createElement('option');option.value=f.id;option.textContent=f.title;$('fixture').append(option);}
$('fixture').value=gateRequested?HEAVIEST_FIXTURE:(query.get('fixture')||'clear');
const download=(blob,name,label)=>{const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.textContent=label;$('downloads').append(a);return a.href;};
async function waitVisible(){while(document.hidden){$('status').textContent='Captures paused. Return to this page to finish and upload.';await wait(250);}await awake.start();}
async function untilReady(test,timeout=180000){let start=performance.now();for(;;){if(document.hidden){await waitVisible();start=performance.now();}try{if(test())return;}catch{}if(performance.now()-start>timeout)throw Error('Native fixture initialization timed out.');await wait(100);}}
async function select(id){
 await waitVisible();selected=id==='scrub-day'?scrubDayData():fixtureData(id);stage.contentWindow.__daybuoyFixture.apply(selected);viewport.bindScene();
 await untilReady(()=>{const api=liveOcean(stage.contentWindow),e=api.evidence();return api.ready&&e.weather?.offshoreSamples===21&&!e.shoreFieldPending;});
 // Let stateful shore/lighting settle outside, and before, the fixed gate warmup.
 await wait(2500);
 // Never pair new fixture numbers with a partially baked or older sky.
 await untilReady(()=>liveOcean(stage.contentWindow).evidence().weather?.cloudCache?.ready);
 $('status').textContent='Fixture · '+selected.title;return selected;
}
function evidence(){
 const win=stage.contentWindow,app=win.__daybuoy,native=liveOcean(win).evidence();viewport.bindScene();
 if(app?.state?.fixture!==true||app.state.data.source!=='fixture'||app.state.fixtureId!==HEAVIEST_FIXTURE||app.state.live)throw Error('Heaviest synthetic fixture required.');
 if(native.revision!==INTEGRATION_BUILD.revision||native.pipeline?.maxFramesInFlight!==2||native.post?.aa!=='fxaa'||native.post.flare||!native.adaptiveResolution)throw Error('Production renderer settings changed.');
 const dpr=native.quality.dpr;if(dpr<1.25||dpr>1.6||Math.abs(dpr*20-Math.round(dpr*20))>1e-8)throw Error('DPR outside production policy.');
 const dimensions=viewport.verify(win,dpr),c=app.conditions();
 for(const k of ['rain','wind','gust','swell','period','cloudLow','cloudMid','cloudHigh'])if(Math.abs(c[k]-selected.rows[0][k])>1e-6)throw Error('Fixture input changed: '+k);
 return {source:'fixture',fixture:HEAVIEST_FIXTURE,forecastTime:app.state.time,conditions:c,native,dimensions};
}
async function collectGallery(files,report){
 const captures=[];
 for(const f of WEATHER_FIXTURES){
  try{const blob=await visibleCapture(async()=>{await select(f.id);$('status').textContent='Capturing '+f.title+'…';return captureScreenshot(stage.contentWindow);}),name=f.id+'.png';files.push({name,blob});captures.push({id:f.id,title:f.title,blob});const figure=document.createElement('figure'),img=document.createElement('img'),caption=document.createElement('figcaption');img.src=URL.createObjectURL(blob);img.alt=f.title+' · actual rendered synthetic fixture';caption.textContent=f.title;figure.append(img,caption);$('gallery').append(figure);report.gallery.push({id:f.id,inputs:selected.rows[0],native:liveOcean(stage.contentWindow).evidence()});}
  catch(e){(report.captureErrors??=[]).push({fixture:f.id,error:e.message});}
 }
 if(captures.length===10){try{const sheet=await fixtureContactSheet(captures,{revision:INTEGRATION_BUILD.revision,runId:report.runId});files.push(sheet);report.contactSheet={name:sheet.name,revision:INTEGRATION_BUILD.revision,source:'ten actual rendered captures, unretouched'};download(sheet.blob,sheet.name,'All ten fixtures · contact sheet');}catch(e){(report.captureErrors??=[]).push({file:'contact-sheet',error:e.message});}}
}
async function visibleCapture(capture){
 // Recording while hidden is still discarded. Retry from its start only after
 // foreground return; do not splice clips or change the completed FPS report.
 for(;;){await waitVisible();try{return await capture();}catch(e){if(!/hidden|visible/i.test(e.message))throw e;}}
}
async function run(){
 if(busy||!allowed)return;busy=true;$('start').disabled=$('fixture').disabled=true;
 const runId=newRunId(),files=[],report={schema:3,runId,kind:'weather',build:INTEGRATION_BUILD,source:'synthetic fixtures',device:navigator.userAgent,startedAt:new Date().toISOString(),heaviest:HEAVIEST_FIXTURE,viewport:viewport.size,viewportEvents:events,wakeLockEvents:wakeEvents,gallery:[],samples:[]};
 try{
  await awake.start();await retryPending(text=>$('upload').textContent=text);await select(HEAVIEST_FIXTURE);report.before=evidence();let last=-Infinity;
  report.cadence=await measureLiveCadence(liveOcean(stage.contentWindow),{seconds:120,warmup:15,validate(){const e=evidence(),now=performance.now();if(now-last>=1000){last=now;report.samples.push({at:now,dpr:e.native.quality.dpr,dimensions:e.dimensions,weather:e.native.weather});}},onProgress:text=>$('status').textContent=text});
  report.cadence.scope='Synthetic night-storm fixture, production settings, 120 seconds; every whole second >=30 GPU completions. Not live-weather or native-WKWebView evidence.';
  report.after=evidence();report.diagnostics=liveOcean(stage.contentWindow).diagnostics?.();
  try{const clip=await visibleCapture(()=>recordLiveCanvas(stage.contentWindow.__daybuoy.engine.getSceneCanvas(),{validate:evidence}));files.push({name:'clip.'+clip.extension,blob:clip.blob});report.clip={...clip,blob:undefined};download(clip.blob,'night-storm.'+clip.extension,'Phone clip');}catch(e){(report.captureErrors??=[]).push({file:'clip',error:e.message});}
  await collectGallery(files,report);
  try{const clip=await visibleCapture(async()=>{await select('scrub-day');return recordDayScrub(stage.contentWindow,{onProgress:text=>$('status').textContent=text});});files.push({name:'scrub-day.'+clip.extension,blob:clip.blob});report.scrubClip={...clip,blob:undefined};download(clip.blob,'scrub-day.'+clip.extension,'10-second day scrub');}catch(e){(report.captureErrors??=[]).push({file:'scrub-day',error:e.message});}
  const c=report.cadence;$('status').textContent=`${c.meetsCadenceTarget?'PASS':'FAIL'} · ${c.fps.toFixed(1)} avg · ${c.minOneSecondFPS} minimum · ${c.oneSecondFPS.filter(n=>n<30).length} seconds below 30.`;
 }catch(e){report.error=e.message;$('status').textContent=e.message;}
 finally{report.finishedAt=new Date().toISOString();const file=jsonFile(report);download(file.blob,'weather-gate.json','Conditions + FPS JSON');stage.src='about:blank';stage.hidden=true;try{await uploadEvidence({runId,kind:'weather',files:[file,...files]},text=>$('upload').textContent=text);}catch{}await awake.stop();busy=false;$('start').textContent='Reload to run again';$('start').disabled=false;$('start').onclick=()=>location.reload();}
}
$('start').onclick=run;$('awake').onclick=()=>awake.start();$('fixture').onchange=()=>{if(!busy)void select($('fixture').value);};
addEventListener('pagehide',()=>{void awake.stop();viewport.dispose();});
if(gateRequested&&!allowed){$('status').textContent='iPhone only. No scene or test was started. Open this link in Safari on your iPhone.';$('start').disabled=true;stage.hidden=true;}
else{
 stage.src='/?ocean-debug=1';
 try{await untilReady(()=>stage.contentWindow.__daybuoyFixture&&stage.contentWindow.__daybuoy?.state.forecastLoaded);await select($('fixture').value);if(gateRequested&&query.get('run')!=='0')await run();else if(!allowed){$('start').disabled=true;$('note').textContent='Desktop fixture review only. An iPhone is required to run the performance gate.';}}
 catch(e){$('status').textContent=e.message;}
}
