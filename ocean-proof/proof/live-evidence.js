import {CompletedProfileRun} from './pipeline-profile.js';

export function liveOcean(win){
 const api=win.document.getElementById('tidewater-ocean-layer')?.contentWindow?.__daybuoyOcean;
 if(!api)throw Error('Waiting for the native beach.');return api;
}

// No fixed fixture, review date or camera override belongs in this path.
export function readLiveEvidence(win,now=Date.now()){
 const app=win.__daybuoy,proof=win.__tidewater;
 if(!app||!proof?.metrics||proof.backend!=='WebGPU native scene')throw Error('Waiting for the native beach.');
 const {state}=app,data=state.data,c=app.conditions();
 if(state.review||!state.live||data.source!=='live'||state.forecastFailed||win.navigator.onLine===false)throw Error('Live forecast required. Open the app and reconnect or return to Now.');
 if(!Number.isFinite(data.retrievedAt)||now-data.retrievedAt>3600000||Math.abs(state.time-now)>60000)throw Error('Waiting for a fresh forecast at the current time.');
 if(data.feedStatus?.tide!=='fulfilled'||![c.swell,c.period,c.direction,c.wind,c.windDirection,c.tide].every(Number.isFinite))throw Error('Waiting for complete marine data and NOAA tide; missing values are not a zero tide.');
 const native=liveOcean(win).evidence();
 if(!native.marine||native.pipeline?.maxFramesInFlight!==2)throw Error('Waiting for the production wave pipeline.');
 return {recordedAt:new Date(now).toISOString(),forecastTime:new Date(state.time).toISOString(),retrievedAt:new Date(data.retrievedAt).toISOString(),source:data.source,feedStatus:data.feedStatus,grids:data.grids,
  conditions:Object.fromEntries(['swell','period','direction','wind','windDirection','tide','cloud','rain'].map(k=>[k,c[k]])),native,
  camera:{position:app.engine.camera.position.toArray(),fov:app.engine.camera.fov,projection:app.engine.camera.projectionMatrix.elements.slice()},device:win.navigator.userAgent};
}

export function measureLiveCadence(proof,{validate,onProgress=()=>{},seconds=20,warmup=15}={}){
 if(!Number.isFinite(seconds)||seconds<=0||seconds>120)throw Error('Unsupported live measurement duration');
 const run=new CompletedProfileRun({pass:'native-live',seconds,warmup});
 return new Promise((resolve,reject)=>{
  let unsubscribe,lastProgress=-Infinity;
  const clean=()=>{unsubscribe?.();clearTimeout(timeout);document.removeEventListener('visibilitychange',hidden);};
  const abort=message=>{clean();reject(Error(message));};
  const hidden=()=>{if(document.hidden)abort('Measurement interrupted while hidden.');};
  const timeout=setTimeout(()=>abort('No completed frames; measurement timed out.'),(warmup+seconds+45)*1000);
  document.addEventListener('visibilitychange',hidden);
  unsubscribe=proof.subscribeCompleted(({now,count})=>{
   try{
    validate();const result=run.observe(now,count);
    if(result){clean();resolve({...result,scope:seconds===120?'Live forecast, approved beachPose, production adaptive settings; 120 seconds, every whole second must reach 30 confirmed GPU completions. No video encoding during this gate.':'Live forecast, approved beachPose and production adaptive settings. Measured before recording; this short check does not replace the 120-second gate.'});}
    else if(now-lastProgress>=1000){lastProgress=now;onProgress(run.start===null?'Warming up before measurement…':`Measuring without recording · ${Math.min(seconds,Math.floor((now-run.start)/1000))} / ${seconds} s`);}
   }catch(e){abort(e.message);}
  });
 });
}

export function recordLiveCanvas(canvas,{validate,duration=10}={}){
 if(!globalThis.MediaRecorder||typeof canvas.captureStream!=='function')throw Error('Canvas recording unavailable. Use iPhone Screen Recording on the live app.');
 const type=['video/mp4;codecs=avc1.42E01E','video/mp4','video/webm;codecs=vp9','video/webm'].find(t=>MediaRecorder.isTypeSupported(t));
 if(!type)throw Error('Recording codec unavailable. Use iPhone Screen Recording on the live app.');
 validate();
 const stream=canvas.captureStream(30),chunks=[];
 return new Promise((resolve,reject)=>{
  let recorder,timer,check,done=false;const started=performance.now(),size=[canvas.width,canvas.height];
  const clean=()=>{clearTimeout(timer);clearInterval(check);document.removeEventListener('visibilitychange',hidden);stream.getTracks().forEach(t=>t.stop());};
  const abort=message=>{if(done)return;done=true;if(recorder?.state==='recording')recorder.stop();clean();reject(Error(message));};
  const hidden=()=>{if(document.hidden)abort('Recording discarded: keep this page visible.');};
  try{
   recorder=new MediaRecorder(stream,{mimeType:type,videoBitsPerSecond:6000000});
   recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
   recorder.onerror=e=>abort(e.error?.message||'Recording failed.');
   recorder.onstop=()=>{if(done)return;done=true;clean();if(!chunks.length){reject(Error('No video was produced. Use iPhone Screen Recording.'));return;}resolve({blob:new Blob(chunks,{type:recorder.mimeType}),extension:type.startsWith('video/mp4')?'mp4':'webm',duration:(performance.now()-started)/1000,initialResolution:size,captureRateRequested:30,note:'Real device canvas recording. Encoder output rate is not GPU-completed or display FPS. Adaptive DPR remains enabled and may change during capture.'});};
   document.addEventListener('visibilitychange',hidden);
   recorder.start(1000);timer=setTimeout(()=>recorder.stop(),duration*1000);
   check=setInterval(()=>{try{validate();}catch(e){abort(e.message);}},500);
  }catch(e){abort(e.message);}
 });
}
