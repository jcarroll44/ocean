export function recordTimingClip(proof,{duration=10}={}){
 if(!globalThis.MediaRecorder||!HTMLCanvasElement.prototype.captureStream)throw Error('Use iPhone Screen Recording: this browser cannot export the timing clip. The live clock remains on screen.');
 const type=['video/mp4;codecs=avc1.42E01E','video/mp4','video/webm;codecs=vp9','video/webm'].find(t=>MediaRecorder.isTypeSupported(t));
 if(!type)throw Error('No recording codec available. Use iPhone Screen Recording.');
 const canvas=document.createElement('canvas');canvas.width=390;canvas.height=844;const ctx=canvas.getContext('2d');
 const badge=document.createElement('div');badge.style.cssText='position:fixed;top:12px;left:12px;right:12px;z-index:5;background:#102a3cee;color:white;padding:12px;border-radius:10px;font:600 14px system-ui';badge.textContent='Starting 10-second timing clip…';document.body.append(badge);
 const stream=canvas.captureStream(30),recorder=new MediaRecorder(stream,{mimeType:type,videoBitsPerSecond:3500000}),chunks=[],samples=[];
 let origin=null,timeout,unsub,started=false,done=false,stoppedAt=null;
 return new Promise((resolve,reject)=>{
  function clean(){badge.remove();clearTimeout(timeout);unsub?.();document.removeEventListener('visibilitychange',visibility);stream.getTracks().forEach(t=>t.stop());}
  function abort(message){if(done)return;done=true;if(recorder.state==='recording')recorder.stop();clean();reject(Error(message));}
  function visibility(){if(document.hidden)abort('Timing clip discarded: keep Safari visible for all 10 seconds.');}
  recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
  recorder.onerror=e=>abort(e.error?.message||'Recording failed');
  recorder.onstop=()=>{if(done)return;done=true;const wallDuration=((stoppedAt??performance.now())-origin.wall)/1000;clean();const last=samples.at(-1);resolve({blob:new Blob(chunks,{type:recorder.mimeType}),extension:type.startsWith('video/mp4')?'mp4':'webm',result:{durationRequested:duration,wallDuration,lastRenderedSeconds:last?.elapsed,lastWaveSeconds:last?.wave,lastFFTSeconds:last?.fft,maxClockErrorSeconds:Math.max(...samples.map(s=>Math.max(Math.abs(s.wave-s.elapsed),Math.abs(s.fft-s.elapsed)))),renderedFrames:samples.length,period:8,phaseCycles:last?.wave/8,samples,device:navigator.userAgent}});};
  document.addEventListener('visibilitychange',visibility);
  unsub=proof.subscribeFrames(info=>{
   if(done)return;
   if(origin===null){origin={wall:info.now,wave:info.waveSeconds,fft:info.fftSeconds};}
   const elapsed=(info.now-origin.wall)/1000,wave=info.waveSeconds-origin.wave,fft=info.fftSeconds-origin.fft;
   badge.textContent=`Recording ${elapsed.toFixed(1)} / ${duration} seconds · wave ${wave.toFixed(1)}s`;
   samples.push({elapsed,wave,fft,quality:info.quality.name,resolution:info.output});
   ctx.drawImage(proof.canvas,0,0,390,844);ctx.fillStyle='#102a3ce8';ctx.fillRect(0,0,390,132);ctx.fillStyle='#fff';ctx.font='600 16px system-ui';
   ctx.fillText(`REAL CLOCK  ${elapsed.toFixed(2)} s`,16,28);ctx.fillText(`WAVE CLOCK  ${wave.toFixed(2)} s`,16,52);
   ctx.font='13px system-ui';ctx.fillText(`8 s swell · ${(wave/8).toFixed(3)} cycles`,16,77);
   ctx.fillText(`${info.output.join('×')} · ${info.quality.name} · ${info.fps.toFixed(1)} fps`,16,101);
   ctx.fillStyle='#68d4c7';ctx.fillRect(16,116,358*((wave%8)/8),3);
   if(!started){started=true;clearTimeout(timeout);recorder.start(1000);timeout=setTimeout(()=>{stoppedAt=performance.now();recorder.stop();},duration*1000);}
  });
  timeout=setTimeout(()=>abort('No rendered frame arrived for the timing clip.'),15000);
 });
}
