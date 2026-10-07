const $=s=>document.querySelector(s),views=$('#views'),stats={};let mode='tidewater',height=3,quality='auto',busy=false,interrupted=false;
let benchmark=null,benchmarkAt=0,report={createdAt:new Date().toISOString(),userAgent:navigator.userAgent,platform:navigator.platform,dpr:devicePixelRatio,sourcePin:'4811ba48d795197de5621985f404e765c0b7c0ef',baselinePin:'30826de2b421b6fae157e69374433aa0fb75b701',benchmarks:[],priorUserReport:{device:'iPhone Safari',fpsApprox:6,output:[1170,2532],source:'User reported; not measured by this session'}};
function frameFor(engine){return document.querySelector(`iframe[data-engine="${engine}"]`);}
function render(){
 const engines=mode==='compare'?['baseline','tidewater']:[mode];
 views.replaceChildren();for(const key of Object.keys(stats))delete stats[key];
 for(const engine of engines){const section=document.createElement('section');section.className='view';section.innerHTML=`<h2>${engine==='baseline'?'Current DayBuoy · WebGL':'Tidewater · WebGPU'} · ${height} ft test</h2><div class="meter" id="meter-${engine}">Starting…</div><div class="phone"><iframe data-engine="${engine}" title="${engine} ocean, ${height} foot test" src="${engine==='baseline'?'baseline':'proof'}/frame.html?height=${height}&quality=${quality}"></iframe></div>`;views.append(section);}
 for(const b of document.querySelectorAll('[data-mode]'))b.setAttribute('aria-pressed',b.dataset.mode===mode);
 for(const b of document.querySelectorAll('[data-height]'))b.setAttribute('aria-pressed',+b.dataset.height===height);
 $('#status').textContent='Loading '+height+' ft test. First shader compilation can take a minute.';
}
function lock(value){busy=value;if(value)interrupted=document.hidden;for(const b of document.querySelectorAll('nav button,#measure,#record,#timing,#quality'))b.disabled=value;}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function ready(engine){const end=performance.now()+180000;while(performance.now()<end){if(stats[engine]?.status==='failed')throw Error(stats[engine].error);if(['ready','running'].includes(stats[engine]?.status))return;await sleep(250);}throw Error('Renderer did not become ready within three minutes.');}
window.addEventListener('message',e=>{
 if(e.origin!==location.origin||e.data?.type!=='proof')return;
 const d=e.data,frame=frameFor(d.engine);if(e.source!==frame?.contentWindow)return;
 stats[d.engine]={...stats[d.engine],...d};const s=stats[d.engine];
 const meter=$('#meter-'+d.engine);if(meter)meter.textContent=s.status==='failed'?'Could not run · '+s.error:s.fps!=null?`${s.backend} · ${(s.recentFps??s.fps).toFixed(1)} frames/s · ${s.output?.join('×')} px`:(s.stage||s.status);
 if(d.engine==='tidewater'&&s.quality){const q=s.quality;$('#quality-status').textContent=`${q.state} · ${q.name} · DPR ${q.dpr} · ${s.output?.join('×')} pixels · wave LOD ${q.lod} · spray ${q.spray.toLocaleString()} · refraction ${Math.round(q.reflection*100)}% · reflection update ${q.reflectionSeconds}s`;}
 if(s.status==='failed')$('#status').textContent=s.error;
 else if(s.status==='ready')$('#status').textContent=s.backend+' initialized. No phone benchmark has been completed yet.';
});
$('#quality').onchange=e=>{quality=e.target.value;frameFor('tidewater')?.contentWindow.postMessage({type:'quality',value:quality},location.origin);};
$('#modes').addEventListener('click',e=>{const b=e.target.closest('[data-mode]');if(b&&!busy){mode=b.dataset.mode;render();}});
$('#heights').addEventListener('click',e=>{const b=e.target.closest('[data-height]');if(b&&!busy){height=+b.dataset.height;render();}});
$('#measure').onclick=async()=>{lock(true);try{
 if(mode!=='tidewater'){mode='tidewater';render();}await ready('tidewater');frameFor('tidewater').scrollIntoView({block:'start',behavior:'smooth'});$('#status').textContent='Warming up for 5 seconds…';await sleep(5000);
 frameFor('tidewater').contentWindow.postMessage({type:'reset-metrics'},location.origin);benchmarkAt=performance.now();
 for(let seconds=20;seconds>0;seconds--){$('#status').textContent=`Measuring Tidewater on this device · ${seconds}s remaining`;await sleep(1000);if(interrupted)throw Error('Benchmark discarded: keep this page visible for the entire measurement.');if(stats.tidewater.status==='failed')throw Error(stats.tidewater.error);}
 benchmark={...stats.tidewater,heightFeet:height,completedAt:new Date().toISOString(),wallSeconds:(performance.now()-benchmarkAt)/1000,userAgent:navigator.userAgent};
 if(benchmark.backend!=='WebGPU'||benchmark.fps==null||benchmark.seconds<18)throw Error('No valid WebGPU measurement was received.');
 report.benchmarks.push(benchmark);$('#result').textContent=JSON.stringify(benchmark,null,2);$('#status').textContent=`Measured here: ${benchmark.fps.toFixed(1)} completed frames/s. ${benchmark.output.join('×')} pixels, scale ${benchmark.internalScale}.`;
 }catch(e){$('#status').textContent=e.message;}finally{lock(false);}};
$('#export').onclick=()=>{const blob=new Blob([JSON.stringify({...report,lastStatus:stats},null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='daybuoy-ocean-device-results.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),5000);};
$('#record').onclick=async()=>{lock(true);let stream,drawId,recorder,stopA,stopB;try{
 if(!window.MediaRecorder||!HTMLCanvasElement.prototype.captureStream)throw Error('This browser cannot export a canvas recording. Use the phone screen recorder.');
 if(mode!=='compare'){mode='compare';render();}await Promise.all([ready('baseline'),ready('tidewater')]);
 const a=frameFor('baseline').contentWindow.__proof,b=frameFor('tidewater').contentWindow.__proof;
 stopA=a.enableSnapshots();stopB=b.enableSnapshots();
 const output=document.createElement('canvas');output.width=780;output.height=844;const ctx=output.getContext('2d');
 const draw=()=>{a.copyFrame(ctx,0,0,390,844);b.copyFrame(ctx,390,0,390,844);ctx.fillStyle='#102f42cc';ctx.fillRect(0,0,780,32);ctx.fillStyle='white';ctx.font='600 13px system-ui';ctx.fillText(`Current · ${height} ft test`,14,21);ctx.fillText(`Tidewater · ${height} ft test`,404,21);drawId=requestAnimationFrame(draw);};draw();
 const type=['video/mp4;codecs=avc1.42E01E','video/mp4','video/webm;codecs=vp9','video/webm'].find(t=>MediaRecorder.isTypeSupported(t));if(!type)throw Error('No recording codec is supported.');
 stream=output.captureStream(30);recorder=new MediaRecorder(stream,{mimeType:type,videoBitsPerSecond:7000000});const chunks=[];recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};const finished=new Promise((resolve,reject)=>{recorder.onstop=resolve;recorder.onerror=e=>reject(e.error);});recorder.start(1000);
 for(let i=20;i>0;i--){$('#record-status').textContent=`Recording ${height} ft comparison · ${i}s`;await sleep(1000);if(interrupted)throw Error('Recording discarded: keep this page visible while recording.');if(stats.baseline.status==='failed'||stats.tidewater.status==='failed')throw Error('A renderer failed during recording.');}
 recorder.stop();await finished;const blob=new Blob(chunks,{type:recorder.mimeType});const link=$('#download');if(link.href.startsWith('blob:'))URL.revokeObjectURL(link.href);link.href=URL.createObjectURL(blob);link.download=`daybuoy-vs-tidewater-${height}ft.${type.startsWith('video/mp4')?'mp4':'webm'}`;link.hidden=false;link.textContent='Download '+height+' ft comparison';$('#record-status').textContent='Recorded in this browser · 390×844 per panel · 30 fps requested.';
 }catch(e){$('#record-status').textContent=e.message;if(recorder?.state==='recording')recorder.stop();}finally{stopA?.();stopB?.();cancelAnimationFrame(drawId);stream?.getTracks().forEach(t=>t.stop());lock(false);}};
$('#timing').onclick=async()=>{lock(true);try{
 if(mode!=='tidewater'){mode='tidewater';render();}await ready('tidewater');frameFor('tidewater').scrollIntoView({block:'start',behavior:'smooth'});
 $('#record-status').textContent='Recording 10 real seconds. Keep Safari visible.';
 const capture=await frameFor('tidewater').contentWindow.__proof.recordTimingClip();
 const link=$('#download');if(link.href.startsWith('blob:'))URL.revokeObjectURL(link.href);link.href=URL.createObjectURL(capture.blob);link.download='daybuoy-10-second-wave-clock.'+capture.extension;link.hidden=false;link.textContent='Download 10-second timing clip';
 report.timing=capture.result;$('#result').textContent=JSON.stringify(capture.result,null,2);$('#record-status').textContent=`Recorded on this device · ${capture.result.wallDuration.toFixed(2)} real seconds · wave clock error ${(capture.result.maxClockErrorSeconds*1000).toFixed(2)} ms. Review the clip for visual motion.`;
 }catch(e){$('#record-status').textContent=e.message;}finally{lock(false);}};
document.addEventListener('visibilitychange',()=>{if(document.hidden&&busy){interrupted=true;$('#status').textContent='Page hidden: discard this benchmark and run again in the foreground.';}});
render();
