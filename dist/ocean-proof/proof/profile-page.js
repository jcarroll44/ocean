import {PASSES,HOST_PASSES,NATIVE_PASSES,LOOP_PASSES,PIPE_PASSES,ADAPTIVE_PASS,validateAdaptiveResult,comboQuery,chooseCombo,chooseSustained,profileConfig,PROFILE_REVISION} from './profile.js';
const $=id=>document.getElementById(id),stage=$('stage'),key='daybuoy-iphone-profile-v1';
let results=[];try{results=JSON.parse(localStorage.getItem(key)||'[]');}catch{}
let queue=[],current=null,watchdog,lastDimensions,startedAt,pipelineRound=null;
for(const [,label,scope] of PASSES){const p=document.createElement('p');p.textContent=label+': '+scope;$('definitions').append(p);}
function save(){localStorage.setItem(key,JSON.stringify(results));}
function render(){
 $('rows').replaceChildren();
 for(const r of results){
  const tr=document.createElement('tr');
  const settings=PIPE_PASSES.includes(r.pass)?` · DPR ${r.adaptiveResolution?`${r.adaptiveResolution.minDpr}–${r.adaptiveResolution.maxDpr}`:r.config.dpr} / ${r.config.aa} / flare ${r.config.flare?'on':'off'}`:'';
  const values=[PASSES.find(p=>p[0]===r.pass)?.[1]+settings+(r.config.seconds===120?' · 120 s':''),r.fps.toFixed(1),r.metric==='raf-submitted'?'rAF submit':'GPU done',r.minOneSecondFPS,r.secondsUnder30??'—',(r.p95CompletionGapMs??r.p95FrameMs)?.toFixed(1)??'—',r.cpuFrame?.meanMs?.toFixed(2)??'—',r.queueDrainMs?.toFixed(1)??'—'];
  for(const value of values){const td=document.createElement('td');td.textContent=value;tr.append(td);}
  $('rows').append(tr);
 }
 const chosen=results.findLast(r=>PIPE_PASSES.includes(r.pass)&&r.config.seconds===120&&r.config.revision===PROFILE_REVISION);
 $('captureCandidate').hidden=!chosen;
 if(chosen){
  const adaptive=chosen.pass===ADAPTIVE_PASS;
  $('captureCandidate').href='/ocean-proof/proof/native-compare.html?profile-pass='+(adaptive?'native-pipe-combo':chosen.pass)+comboQuery(chosen.config);
  $('captureCandidate').textContent=(adaptive?'Capture fixed DPR 1.5 / FXAA / flare on vs embedded proof':'Capture tested candidate / proof pair')+(chosen.meetsCadenceTarget?' · cadence target met':' · cadence target not met');
 }
}
function stop(reason=''){
 queue=[];current=null;pipelineRound=null;clearTimeout(watchdog);stage.src='about:blank';stage.style.display='none';$('progress').style.display='none';
 for(const id of ['adaptive','suite','round2','round3','native','loop','pipeline','nativeSustain','sustain','candidate'])$(id).disabled=false;$('error').textContent=reason;render();
}
function next(){
 clearTimeout(watchdog);
 if(!queue.length&&pipelineRound){
  if(pipelineRound.phase==='singles'){
   queue.push({...chooseCombo(results),seconds:20,runId:pipelineRound.runId});pipelineRound.phase='combo';
  }else if(pipelineRound.phase==='combo'){
   const config=chooseSustained(results);if(!config){stop('No valid pipeline candidate to sustain.');return;}
   queue.push({...config,seconds:120,runId:pipelineRound.runId});pipelineRound.phase='sustain';
  }else pipelineRound=null;
 }
 current=queue.shift();if(!current){stop();return;}
 startedAt=performance.now();lastDimensions=[innerWidth,innerHeight];
 $('status').textContent=PASSES.find(p=>p[0]===current.pass)[1]+' · loading';
 stage.src=(current.pass==='proof-alone'?'/ocean-proof/proof/frame.html?noClouds=1&height=3&quality=0':'/?review=1&hour=12')+'&ocean-profile=1&profile-pass='+current.pass+'&profile-seconds='+current.seconds+(current.pass==='native-pipe-combo'?comboQuery(current):'');
 watchdog=setTimeout(()=>stop('This case stalled or could not initialize. No result was recorded. Retry this page in Safari.'),300000);
}
function start(mode='suite'){
 results=[];save();render();$('error').textContent='';
 const runId=new Date().toISOString();
 pipelineRound=mode==='pipeline'?{phase:'singles',runId}:null;
 const passes=mode==='adaptive'?[ADAPTIVE_PASS]:mode==='pipeline'?[...PIPE_PASSES.filter(p=>!['native-pipe-combo',ADAPTIVE_PASS].includes(p)),'native-pipe']:mode==='loop'?['native',...LOOP_PASSES,'native']:mode==='native'?['native','native175','native15','native-fxaa','native-flare','native']:mode==='nativeSustain'?['native-pipe']:mode==='sustain'?['baseline']:mode==='candidate'?['atlas']:mode==='round3'?['baseline',...HOST_PASSES,'baseline']:mode==='round2'?['baseline','atlas','baseline','dpr1','dpr15','all-off','grid128','lod','baseline']:[...PASSES.map(p=>p[0]),'baseline'];
 queue=passes.map(pass=>({...profileConfig('?ocean-profile=1&profile-pass='+pass),seconds:pass===ADAPTIVE_PASS||['sustain','candidate','nativeSustain'].includes(mode)?120:20,runId}));
 for(const id of ['adaptive','suite','round2','round3','native','loop','pipeline','nativeSustain','sustain','candidate'])$(id).disabled=true;stage.style.display='block';$('progress').style.display='block';next();
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
  if([...HOST_PASSES,...NATIVE_PASSES,...LOOP_PASSES,...PIPE_PASSES].includes(r.pass)&&!empty&&(!r.oceanVisible||!r.sprayVisible||!r.breakerVisible)){stop('A host comparison disabled ocean geometry. Result rejected.');return;}
  if(LOOP_PASSES.includes(r.pass)&&(!r.cpuFrame?.samples||!r.cpuRender?.samples||r.clearOnly!==empty||r.metric!==(['native-empty-raf','native-readback','native-raf'].includes(r.pass)?'raf-submitted':'gpu-completed'))){stop('Missing or mismatched loop/CPU measurements. Result rejected.');return;}
  if(r.pass==='native-readback'&&(r.cpuReadbacksEnabled!==false||r.perFrameCompletionWait!==false||!r.readbackRequests||Object.values(r.readbackRequests).some(x=>x.accepted!==0))){stop('Readback-free case performed CPU readbacks or retained its completion wait. Result rejected.');return;}
  if(innerWidth!==lastDimensions[0]||innerHeight!==lastDimensions[1]){stop('Viewport changed during the case. Hold the phone upright and rerun.');return;}
  const expected=profileConfig('?ocean-profile=1&profile-pass='+current.pass+(current.pass==='native-pipe-combo'?comboQuery(current):'')),dpr=expected.dpr;
  if(PIPE_PASSES.includes(r.pass)&&(r.metric!=='gpu-completed-pipelined'||r.perFrameCompletionWait!==false||r.pipeline?.maxFramesInFlight!==2||r.pipeline?.maxObservedInFlight>2||r.pipeline?.outstanding!==0||r.pipeline?.completed!==r.pipeline?.submitted||r.readbackThrottle?.waterMinFrameInterval!==4||!r.cpuFrame?.samples||r.config.aa!==expected.aa||r.config.flare!==expected.flare||r.nativePost?.aa!==expected.aa||r.nativePost?.lensFlare!==expected.flare)){stop('Pipeline, completed counter, readbacks or actual post settings mismatched. Result rejected.');return;}
  if(r.pass===ADAPTIVE_PASS){
   if(!validateAdaptiveResult(r,innerWidth,innerHeight)){stop('Adaptive policy, resize audit or ocean/output dimensions mismatched. Result rejected.');return;}
   const bins=r.oneSecondFPS;
   if(!Array.isArray(bins)||bins.length!==Math.floor(r.duration)||bins.some(n=>!Number.isInteger(n)||n<0)||!Number.isFinite(r.duration)||r.duration<120||r.minOneSecondFPS!==Math.min(...bins)||r.secondsUnder30!==bins.filter(n=>n<30).length||r.meetsCadenceTarget!==(r.fps>=30&&bins.every(n=>n>=30))){stop('Invalid 120-second completion gate. Result rejected.');return;}
  }else if(r.config.dpr!==dpr||!r.resolutionVerifiedEveryFrame||[r.resolution,r.output].some(size=>size?.[0]!==Math.floor(innerWidth*dpr)||size?.[1]!==Math.floor(innerHeight*dpr))){stop('Requested DPR '+dpr+' was not retained for ocean AND output. Result rejected.');return;}
  results.push({...r,runId:current.runId,recordedAt:new Date().toISOString(),pageElapsedSeconds:(performance.now()-startedAt)/1000,viewport:lastDimensions});save();render();
  // Destroy the old iframe document before loading the next GPU renderer.
  stage.src='about:blank';setTimeout(next,1500);
 }
});
document.addEventListener('visibilitychange',()=>{if(current&&document.hidden)stop('Test interrupted while hidden. Completed cases remain in the results.');});
$('adaptive').onclick=()=>start('adaptive');$('pipeline').onclick=()=>start('pipeline');$('loop').onclick=()=>start('loop');$('native').onclick=()=>start('native');$('nativeSustain').onclick=()=>start('nativeSustain');$('suite').onclick=()=>start();$('round2').onclick=()=>start('round2');$('round3').onclick=()=>start('round3');$('sustain').onclick=()=>start('sustain');$('candidate').onclick=()=>start('candidate');$('cancel').onclick=()=>stop('Stopped. Completed cases are retained.');
const report=()=>JSON.stringify({schema:7,results,notes:'Round 7 tests the authorized production settings: initial DPR 1.5, FXAA, flare on, full High waves, max 2 outstanding frames. Adaptive DPR moves in 0.05 steps from confirmed GPU completions in 1-second windows: below 32 down toward 1.35 and, if still low, as far as 1.25; above 38 up to 1.6; otherwise hold. Resize waits for an empty submission window; all pauses remain counted. Actual dimensions are checked on every submission and every resize is audited. The strict 120-second gate requires every whole second >=30 GPU-completed frames, not just the average. Final drain is outside measurement. Completion notifications may cover multiple frames; timestamps are callback delivery times, not individual GPU timestamps or display scanout. Capture is separate and fixed at DPR 1.5 / FXAA / flare on against the embedded DPR 2 / TAA proof reference, not the frozen external deployment. Older suites retain their original metrics and independent settings; rAF submissions never establish completed/displayed FPS.'},null,2);
$('export').onclick=()=>{const url=URL.createObjectURL(new Blob([report()],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='daybuoy-iphone-profile.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);};
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText(report());$('error').textContent='Results copied.';}catch{$('error').textContent=report();}};
render();
