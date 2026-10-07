import {PASSES,HOST_PASSES,NATIVE_PASSES,LOOP_PASSES,profileConfig,PROFILE_REVISION} from './profile.js';
const $=id=>document.getElementById(id),stage=$('stage'),key='daybuoy-iphone-profile-v1';
let results=[];try{results=JSON.parse(localStorage.getItem(key)||'[]');}catch{}
let queue=[],current=null,watchdog,lastDimensions,startedAt;
for(const [,label,scope] of PASSES){const p=document.createElement('p');p.textContent=label+': '+scope;$('definitions').append(p);}
function save(){localStorage.setItem(key,JSON.stringify(results));}
function render(){
 $('rows').replaceChildren();
 for(const r of results){
  const tr=document.createElement('tr');
  const values=[PASSES.find(p=>p[0]===r.pass)?.[1]+(r.config.seconds===120?' · 120 s':''),r.fps.toFixed(1),r.metric==='raf-submitted'?'rAF submit':'GPU done',r.minOneSecondFPS,r.p95FrameMs.toFixed(1),r.cpuFrame?.meanMs?.toFixed(2)??'—',r.queueDrainMs?.toFixed(1)??'—'];
  for(const value of values){const td=document.createElement('td');td.textContent=value;tr.append(td);}
  $('rows').append(tr);
 }
}
function stop(reason=''){
 queue=[];current=null;clearTimeout(watchdog);stage.src='about:blank';stage.style.display='none';$('progress').style.display='none';
 for(const id of ['suite','round2','round3','native','loop','nativeSustain','sustain','candidate'])$(id).disabled=false;$('error').textContent=reason;render();
}
function next(){
 clearTimeout(watchdog);
 current=queue.shift();if(!current){stop();return;}
 startedAt=performance.now();lastDimensions=[innerWidth,innerHeight];
 $('status').textContent=PASSES.find(p=>p[0]===current.pass)[1]+' · loading';
 stage.src=(current.pass==='proof-alone'?'/ocean-proof/proof/frame.html?noClouds=1&height=3&quality=0':'/?review=1&hour=12')+'&ocean-profile=1&profile-pass='+current.pass+'&profile-seconds='+current.seconds;
 watchdog=setTimeout(()=>stop('This case stalled or could not initialize. No result was recorded. Retry this page in Safari.'),300000);
}
function start(mode='suite'){
 results=[];save();render();$('error').textContent='';
 const runId=new Date().toISOString();
 const passes=mode==='loop'?['native',...LOOP_PASSES,'native']:mode==='native'?['native','native175','native15','native-fxaa','native-flare','native']:mode==='nativeSustain'?['native']:mode==='sustain'?['baseline']:mode==='candidate'?['atlas']:mode==='round3'?['baseline',...HOST_PASSES,'baseline']:mode==='round2'?['baseline','atlas','baseline','dpr1','dpr15','all-off','grid128','lod','baseline']:[...PASSES.map(p=>p[0]),'baseline'];
 queue=passes.map(pass=>({pass,seconds:['sustain','candidate','nativeSustain'].includes(mode)?120:20,runId}));
 for(const id of ['suite','round2','round3','native','loop','nativeSustain','sustain','candidate'])$(id).disabled=true;stage.style.display='block';$('progress').style.display='block';next();
}
window.addEventListener('message',e=>{
 if(!current||e.origin!==location.origin||e.source!==stage.contentWindow||e.data?.type!=='daybuoy-profile')return;
 const d=e.data;
 if(d.status==='failed'){stop(d.reason);return;}
 if(d.status==='loading')$('status').textContent=current.pass+' · '+d.label;
 if(d.status==='running')$('status').textContent=current.pass+' · '+d.fps.toFixed(1)+(d.metric==='raf-submitted'?' rAF submits/s':' GPU done/s')+' · '+d.resolution.join('×')+' · warm-up + '+current.seconds+' s';
 if(d.status==='profile-result'){
  const r=d.result;
  if(r.pass!==current.pass||r.config.seconds!==current.seconds||r.config.revision!==PROFILE_REVISION){stop('Mismatched profiling result; reload this page. No measurement accepted.');return;}
  const empty=['native-empty','native-empty-raf'].includes(r.pass);
  if([...HOST_PASSES,...NATIVE_PASSES,...LOOP_PASSES].includes(r.pass)&&!empty&&(!r.oceanVisible||!r.sprayVisible||!r.breakerVisible)){stop('A host comparison disabled ocean geometry. Result rejected.');return;}
  if(LOOP_PASSES.includes(r.pass)&&(!r.cpuFrame?.samples||!r.cpuRender?.samples||r.clearOnly!==empty||r.metric!==(['native-empty-raf','native-readback','native-raf'].includes(r.pass)?'raf-submitted':'gpu-completed'))){stop('Missing or mismatched loop/CPU measurements. Result rejected.');return;}
  if(r.pass==='native-readback'&&(r.cpuReadbacksEnabled!==false||r.perFrameCompletionWait!==false||!r.readbackRequests||Object.values(r.readbackRequests).some(x=>x.accepted!==0))){stop('Readback-free case performed CPU readbacks or retained its completion wait. Result rejected.');return;}
  if(innerWidth!==lastDimensions[0]||innerHeight!==lastDimensions[1]){stop('Viewport changed during the case. Hold the phone upright and rerun.');return;}
  const dpr=profileConfig('?ocean-profile=1&profile-pass='+current.pass).dpr;
  if(r.config.dpr!==dpr||!r.resolutionVerifiedEveryFrame||[r.resolution,r.output].some(size=>size?.[0]!==Math.floor(innerWidth*dpr)||size?.[1]!==Math.floor(innerHeight*dpr))){stop('Requested DPR '+dpr+' was not retained for ocean AND output. Result rejected.');return;}
  results.push({...r,runId:current.runId,recordedAt:new Date().toISOString(),pageElapsedSeconds:(performance.now()-startedAt)/1000,viewport:lastDimensions});save();render();
  // Destroy the old iframe document before loading the next GPU renderer.
  stage.src='about:blank';setTimeout(next,1500);
 }
});
document.addEventListener('visibilitychange',()=>{if(current&&document.hidden)stop('Test interrupted while hidden. Completed cases remain in the results.');});
$('loop').onclick=()=>start('loop');$('native').onclick=()=>start('native');$('nativeSustain').onclick=()=>start('nativeSustain');$('suite').onclick=()=>start();$('round2').onclick=()=>start('round2');$('round3').onclick=()=>start('round3');$('sustain').onclick=()=>start('sustain');$('candidate').onclick=()=>start('candidate');$('cancel').onclick=()=>stop('Stopped. Completed cases are retained.');
const report=()=>JSON.stringify({schema:5,results,notes:'Round 5: native baseline, clear-only with original wait, clear-only without wait, native with CPU readbacks and completion wait removed, native with only completion wait removed, repeated baseline. All DPR 2; 15 s warm-up and 20 s measurement. Compare metric labels: rAF submissions are NOT GPU completions or displayed frames and cannot pass the 30-fps acceptance gate. A terminal queue drain exposes backlog. CPU means synchronous JS callback time, excludes async callbacks and GPU execution. Readback-free rows retain GPU queries and prime cached lighting before suppression. Clear-only retains parent CPU/UI work and allocated scene resources. No result is inferred until this runner executes on the device. No screenshot pair or two-minute acceptance is inferred. Earlier suites retain their independent scopes in each result.'},null,2);
$('export').onclick=()=>{const url=URL.createObjectURL(new Blob([report()],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='daybuoy-iphone-profile.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);};
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText(report());$('error').textContent='Results copied.';}catch{$('error').textContent=report();}};
render();
