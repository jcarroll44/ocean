import {PASSES,profileConfig,PROFILE_REVISION} from './profile.js';
const $=id=>document.getElementById(id),stage=$('stage'),key='daybuoy-iphone-profile-v1';
let results=[];try{results=JSON.parse(localStorage.getItem(key)||'[]');}catch{}
let queue=[],current=null,watchdog,lastDimensions,startedAt;
for(const [,label,scope] of PASSES){const p=document.createElement('p');p.textContent=label+': '+scope;$('definitions').append(p);}
function save(){localStorage.setItem(key,JSON.stringify(results));}
function render(){
 $('rows').replaceChildren();
 for(const r of results){
  const tr=document.createElement('tr');
  const values=[PASSES.find(p=>p[0]===r.pass)?.[1]+(r.config.seconds===120?' · 120 s':''),r.fps.toFixed(1),r.minOneSecondFPS,r.p95FrameMs.toFixed(1)];
  for(const value of values){const td=document.createElement('td');td.textContent=value;tr.append(td);}
  $('rows').append(tr);
 }
}
function stop(reason=''){
 queue=[];current=null;clearTimeout(watchdog);stage.src='about:blank';stage.style.display='none';$('progress').style.display='none';
 for(const id of ['suite','round2','sustain','candidate'])$(id).disabled=false;$('error').textContent=reason;render();
}
function next(){
 clearTimeout(watchdog);
 current=queue.shift();if(!current){stop();return;}
 startedAt=performance.now();lastDimensions=[innerWidth,innerHeight];
 $('status').textContent=PASSES.find(p=>p[0]===current.pass)[1]+' · loading';
 stage.src='/?review=1&hour=12&ocean-profile=1&profile-pass='+current.pass+'&profile-seconds='+current.seconds;
 watchdog=setTimeout(()=>stop('This case stalled or could not initialize. No result was recorded. Retry this page in Safari.'),300000);
}
function start(mode='suite'){
 results=[];save();render();$('error').textContent='';
 const runId=new Date().toISOString();
 const passes=mode==='sustain'?['baseline']:mode==='candidate'?['atlas']:mode==='round2'?['baseline','atlas','baseline','dpr1','dpr15','all-off','grid128','lod','baseline']:[...PASSES.map(p=>p[0]),'baseline'];
 queue=passes.map(pass=>({pass,seconds:['sustain','candidate'].includes(mode)?120:20,runId}));
 for(const id of ['suite','round2','sustain','candidate'])$(id).disabled=true;stage.style.display='block';$('progress').style.display='block';next();
}
window.addEventListener('message',e=>{
 if(!current||e.origin!==location.origin||e.source!==stage.contentWindow||e.data?.type!=='daybuoy-profile')return;
 const d=e.data;
 if(d.status==='failed'){stop(d.reason);return;}
 if(d.status==='loading')$('status').textContent=current.pass+' · '+d.label;
 if(d.status==='running')$('status').textContent=current.pass+' · '+d.fps.toFixed(1)+' fps · '+d.resolution.join('×')+' · warm-up + '+current.seconds+' s';
 if(d.status==='profile-result'){
  const r=d.result;
  if(r.pass!==current.pass||r.config.seconds!==current.seconds||r.config.revision!==PROFILE_REVISION){stop('Mismatched profiling result; reload this page. No measurement accepted.');return;}
  if(innerWidth!==lastDimensions[0]||innerHeight!==lastDimensions[1]){stop('Viewport changed during the case. Hold the phone upright and rerun.');return;}
  const dpr=profileConfig('?ocean-profile=1&profile-pass='+current.pass).dpr;
  if(r.config.dpr!==dpr||!r.resolutionVerifiedEveryFrame||[r.resolution,r.output].some(size=>size?.[0]!==Math.floor(innerWidth*dpr)||size?.[1]!==Math.floor(innerHeight*dpr))){stop('Requested DPR '+dpr+' was not retained for ocean AND output. Result rejected.');return;}
  results.push({...r,runId:current.runId,recordedAt:new Date().toISOString(),pageElapsedSeconds:(performance.now()-startedAt)/1000,viewport:lastDimensions});save();render();
  // Destroy the old iframe document before loading the next GPU renderer.
  stage.src='about:blank';setTimeout(next,1500);
 }
});
document.addEventListener('visibilitychange',()=>{if(current&&document.hidden)stop('Test interrupted while hidden. Completed cases remain in the results.');});
$('suite').onclick=()=>start();$('round2').onclick=()=>start('round2');$('sustain').onclick=()=>start('sustain');$('candidate').onclick=()=>start('candidate');$('cancel').onclick=()=>stop('Stopped. Completed cases are retained.');
const report=()=>JSON.stringify({schema:2,results,notes:'No physical iPhone result exists until this runner is used on that device. Diagnostic ablations are not optimized visuals. Atlas only batches transfers; both legacy layer draws remain. Compare repeated baseline rows for drift, not proof of thermal state. Grid/LOD/DPR rows are separate changes. Ocean and final output dimensions are checked every frame. Screenshots and physical-device visual acceptance remain separate requirements.'},null,2);
$('export').onclick=()=>{const url=URL.createObjectURL(new Blob([report()],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='daybuoy-iphone-profile.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);};
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText(report());$('error').textContent='Results copied.';}catch{$('error').textContent=report();}};
render();
