import {liveOcean,readLiveEvidence,measureLiveCadence} from './live-evidence.js';
import {PRE_OVERCAST_COMMIT,OVERCAST_COMMIT,CASE_LABELS} from './overcast-profile-config.js';
import {newRunId,jsonFile,uploadEvidence,retryPending} from './results-upload.js';
import {collectScreenshot,collectClip} from './test-evidence.js';
import {isIPhone,screenAwake} from './diagnostic-device.js';
const $=id=>document.getElementById(id),stage=$('stage');let running=false,stopped=false,snapshot,evidence,report,objectURL;
let files=[],runId;
const allowedDevice=isIPhone(navigator);
const awake=screenAwake(navigator,document,text=>$('awake').textContent=text,event=>report?.wakeLockEvents?.push(event));
$('awake').onclick=()=>awake.retry();
addEventListener('pagehide',()=>{stopped=true;void awake.stop();});
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const check=()=>{if(stopped||document.hidden)throw Error('Run interrupted. Keep Safari visible and rerun.');};
async function until(fn,ms=180000){const start=performance.now();while(performance.now()-start<ms){check();const value=fn();if(value)return value;await pause(100);}throw Error('Scene or live forecast did not become ready. Reconnect and rerun.');}
const sourceFor=pass=>(pass==='previous'?'/overcast-previous/':'/')+'ocean-proof/proof/native-scene.html?noClouds=1&quality=0&native-capture=1&overcast-test='+pass;
function installSnapshot(api){
 const original=api.draw.bind(api);let calls=0,total=0,max=0,active=false;
 api.draw=p=>{
  if(!snapshot){
   const {overlays,...data}=p;
   if(data.sun[1]<.25)throw Error('Forced noon did not reach the renderer; result rejected.');
   snapshot=structuredClone({...data,forecast:{...data.forecast,...evidence.conditions,cloud:100,cloudLow:100,cloudMid:100,cloudHigh:100,rain:0},lightning:0,overlays:[]});
  }
  const start=performance.now();const result=original({...p,...snapshot});
  if(active&&result!==false){const dt=performance.now()-start;calls++;total+=dt;max=Math.max(max,dt);}
  return result;
 };
 return {begin(){calls=total=max=0;active=true;},stats(){active=false;return {drawCalls:calls,meanDrawMs:calls?total/calls:0,maxDrawMs:max,scope:'Synchronous native draw JS/encoding only, not GPU time or whole browser main thread.'};}};
}
async function runCase(pass,index,total,seconds=20){
 check();$('status').textContent=`${index}/${total} · ${CASE_LABELS[pass]} · loading…`;
 const win=stage.contentWindow,frame=win.document.getElementById('tidewater-ocean-layer');
 const old=frame.contentWindow.__daybuoyOcean;
 if(index>1){frame.src=sourceFor(pass);await until(()=>frame.contentWindow.__daybuoyOcean&&frame.contentWindow.__daybuoyOcean!==old);}
 const api=await until(()=>frame.contentWindow.__daybuoyOcean),cpu=installSnapshot(api);
 await until(()=>snapshot&&!api.evidence().shoreFieldPending&&api.evidence().marine);
 // Ordinary live interpolation can sit within a quantized forecast-key bucket.
 // Reapply the identical snapshot exactly once before warmup in every renderer.
 frame.contentWindow.__app.setForecast(snapshot.forecast);
 // The same ocean inputs must actually reach the renderer, including the asynchronous shore field.
 const expected=snapshot.forecast,validate=()=>{
  check();const e=api.evidence(),a=frame.contentWindow.__app;
  if(pass!=='previous'&&a.overcastDiagnostic?.pass!==pass)throw Error('Stale or wrong diagnostic build. Reload and rerun.');
  if(win.innerWidth!==report.viewport[0]||win.innerHeight!==report.viewport[1])throw Error('Viewport changed; rerun without moving Safari bars.');
  if(e.quality.dpr!==1.5||e.post.aa!=='fxaa'||!e.post.flare||e.pipeline.maxFramesInFlight!==2)throw Error('Unexpected renderer settings; result rejected.');
  const dimensions=[a.engine.width,a.engine.height,a.engine.canvas.width,a.engine.canvas.height];
  if(dimensions.some((v,i)=>v!==Math.floor((i%2?win.innerHeight:win.innerWidth)*1.5)))throw Error('DPR/output dimensions changed.');
  if(e.shoreFieldPending)throw Error('Shore field changed during measurement.');
  if(Math.abs(e.marine.amplitude-expected.swell*.3048/2)>1e-6||Math.abs(e.marine.period-expected.period)>1e-6||Math.abs(e.marine.tide-expected.tide)>1e-6)throw Error('Live snapshot was not applied.');
  if(Math.abs(a.camera.fov-snapshot.camera.fov)>1e-6)throw Error('FOV changed.');
  return {...e,dimensions,diagnostic:pass==='previous'?{pass,commit:PRE_OVERCAST_COMMIT}:a.overcastDiagnostic};
 };
 // Allow pending first-packet work to complete, then the measurement has its own 15-second warmup.
 await pause(300);await until(()=>!api.evidence().shoreFieldPending);
 const before=validate();cpu.begin();
 const cadence=await measureLiveCadence(api,{seconds,warmup:15,validate,onProgress:text=>$('status').textContent=`${index}/${total} · ${CASE_LABELS[pass]} · ${text}`});
 const row={pass,label:CASE_LABELS[pass],seconds,before,after:validate(),cpu:cpu.stats(),...cadence,
  scope:'Fresh live marine snapshot with forced local noon / full overcast / no rain, held identical across rows; fixed DPR 1.5 / FXAA / flare on. GPU completion counts; no recording.',
  reaches40Average:cadence.fps>=40};
 row.pass=pass;report.rows.push(row);save();
 const tr=document.createElement('tr');for(const value of [row.label+(seconds===120?' · 120 s':''),row.fps.toFixed(1),row.minOneSecondFPS,row.cpu.meanDrawMs.toFixed(2)]){const td=document.createElement('td');td.textContent=value;tr.append(td);}$('rows').append(tr);
 // Collect pixels only after this timed pass has stopped.
 await collectScreenshot(win,files,`${String(index).padStart(2,'0')}-${pass}.png`,report);
}
function save(){try{localStorage.setItem('daybuoy.overcast.results',JSON.stringify(report));}catch{}$('download').hidden=$('copy').hidden=false;}
async function start(){
 if(!allowedDevice){$('error').textContent='iPhone only. Open this link in Safari on your iPhone. No test was started.';$('start').disabled=true;return;}
 if(running)return;running=true;stopped=false;snapshot=null;evidence=null;
 files=[];runId=newRunId();
 $('start').disabled=true;$('rows').replaceChildren();$('error').textContent='';$('main').hidden=true;stage.hidden=$('hud').hidden=false;
 report={schema:2,revision:'2026-10-09-overcast-forced-noon-2',startedAt:new Date().toISOString(),previousCommit:PRE_OVERCAST_COMMIT,overcastCommit:OVERCAST_COMMIT,rows:[],wakeLockEvents:[],notes:['Diagnostic sky is forced to noon/full overcast, not current observed weather. Marine data is captured fresh before the override.','Historical renderer is packaged from its exact commit, with shore-worker pending telemetry only.','All rows use the unchanged approved FOV. Old-FOV row is an explicit repeat control.','CPU draw timing includes warmup; FPS bins exclude warmup.','Repeated baselines expose drift but do not measure temperature.','30 fps every second is the sustained floor; 40 fps average is the recovery target.','iPhone gate uses browser identification; no hardware attestation. Hidden-page measurements are rejected, never counted as valid FPS.']};
 try{
  await awake.start();
  await retryPending(text=>$('status').textContent=text);
  stage.src='/?ocean-debug=1&overcast-test=baseline';
  const win=stage.contentWindow;
  await until(()=>{try{evidence=readLiveEvidence(stage.contentWindow);return evidence;}catch{return false;}});
  report.viewport=[win.innerWidth,win.innerHeight];report.device=evidence.device;report.liveEvidence=evidence;
  const app=win.__daybuoy;
  app.setHour(12);app.resetBeach();
  report.scenario={sky:'forced full overcast',cloud:100,cloudLow:100,cloudMid:100,cloudHigh:100,rain:0,localHour:12,timeZone:'America/Chicago',astronomyTime:new Date(app.state.time).toISOString(),marineForecastTime:evidence.forecastTime};
  $('status').textContent='Setting noon lighting and settling the approved beach camera…';
  // The approved camera eases from the current-time view. Settle before freezing it.
  await pause(20000);check();
  if(app.uniforms.uSun.value.y<.25)throw Error('Could not establish daytime lighting. No timing results accepted.');
  $('conditions').textContent=`Forced noon · 100% overcast · live ${evidence.conditions.swell.toFixed(1)} ft / ${evidence.conditions.period.toFixed(1)} s · wind ${evidence.conditions.wind.toFixed(1)} kt`;
  const cases=['baseline','previous','deck-off','surf-off','exposure-off','old-fov','lip-off','flat','baseline','previous'];
  for(let i=0;i<cases.length;i++){
   await runCase(cases[i],i+1,cases.length+1);
   if(i===0)report.snapshot=snapshot;
  }
  await runCase('flat',cases.length+1,cases.length+1,120);
  const flats=report.rows.filter(r=>r.pass==='flat'),base=report.rows.filter(r=>r.pass==='baseline');
  report.summary={baselineFPS:base.map(r=>r.fps),previousFPS:report.rows.filter(r=>r.pass==='previous').map(r=>r.fps),candidateFPS:flats.map(r=>r.fps),candidate120s:flats.at(-1),phoneTemperature:'not measured'};
  $('summary').textContent=`Baseline ${base.map(r=>r.fps.toFixed(1)).join(' → ')} FPS. Cheap sky: ${flats.at(-1).fps.toFixed(1)} average, ${flats.at(-1).minOneSecondFPS} minimum over 120 s. ${report.warning||''}`;
  $('status').textContent='FPS measurements finished. Recording 10 seconds…';
  await collectClip(stage.contentWindow,files,report,check);
 }catch(error){report.error=error.message;$('error').textContent=error.message;}
 finally{
  report.finishedAt=new Date().toISOString();report.runId=runId;report.captureScope='Native scene canvas screenshots after each pass; clip after the last timed pass.';save();stage.src='about:blank';stage.hidden=$('hud').hidden=true;$('main').hidden=false;
  try{const receipt=await uploadEvidence({runId,kind:'overcast',files:[jsonFile(report),...files]},text=>$('upload').textContent=text);report.upload=receipt;save();}catch{}
  await awake.stop();$('start').disabled=false;running=false;
 }
}
$('start').onclick=start;$('stop').onclick=()=>{stopped=true;void awake.stop();};
$('download').onclick=()=>{if(objectURL)URL.revokeObjectURL(objectURL);objectURL=URL.createObjectURL(new Blob([JSON.stringify(report,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=objectURL;a.download='daybuoy-overcast-diagnosis.json';a.click();};
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText(JSON.stringify(report,null,2));$('copy').textContent='Copied';}catch{$('error').textContent='Clipboard unavailable. Use Download results.';}};
try{const saved=localStorage.getItem('daybuoy.overcast.results');if(saved){report=JSON.parse(saved);$('download').hidden=$('copy').hidden=false;$('summary').textContent='Previous results are saved on this phone.';}}catch{}
if(!allowedDevice||new URLSearchParams(location.search).get('run')!=='0')void start();
