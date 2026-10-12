// User-initiated, bounded 8-second capture. Never runs inside a performance gate.
let sharingClip=false;
async function shareBeachClip(){
 if(sharingClip)return;const source=engine?.getSceneCanvas?.();
 if(!source||typeof MediaRecorder==='undefined'){notice('Clip recording is unavailable on this device. The share image is still available.');return;}
 sharingClip=true;const canvas=document.createElement('canvas'),width=720,height=Math.round(width*source.height/source.width);canvas.width=width;canvas.height=height;const ctx=canvas.getContext('2d');let raf,stream,recorder,hidden=false;
 const onVisibility=()=>{if(document.hidden){hidden=true;if(recorder?.state==='recording')recorder.stop();}};
 try{
  if(!canvas.captureStream)throw Error('Capture unavailable');const mime=['video/mp4;codecs=avc1.42E01E','video/mp4','video/webm;codecs=vp8','video/webm'].find(v=>MediaRecorder.isTypeSupported(v));if(!mime)throw Error('Encoder unavailable');
  const mark=!plusActive(),stamp=weekday(state.time)+' · '+clock(state.time),chunks=[];
  const draw=()=>{ctx.drawImage(source,0,0,width,height);if(mark){ctx.fillStyle='#153c4dcc';ctx.fillRect(0,height-64,width,64);ctx.fillStyle='#fff';ctx.font='500 21px Poppins, sans-serif';ctx.fillText('DayBuoy · '+SITE.name,24,height-34);ctx.font='15px Poppins, sans-serif';ctx.fillText(stamp+' · visual est.',24,height-13);}raf=requestAnimationFrame(draw);};
  draw();stream=canvas.captureStream(30);recorder=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:2000000});recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};const done=new Promise((resolve,reject)=>{recorder.onstop=resolve;recorder.onerror=reject;});
  document.addEventListener('visibilitychange',onVisibility);recorder.start();notice('Recording 8 seconds…');const timer=setTimeout(()=>{if(recorder.state==='recording')recorder.stop();},8000);await done;clearTimeout(timer);if(hidden)throw Error('Interrupted');
  const blob=new Blob(chunks,{type:mime}),file=new File([blob],'DayBuoy-'+SITE.id+(mime.startsWith('video/mp4')?'.mp4':'.webm'),{type:mime});if(!file.size||file.size>12*1024*1024)throw Error('Clip unavailable');
  if(navigator.canShare?.({files:[file]}))await navigator.share({files:[file],title:'DayBuoy · '+SITE.name});else{const a=document.createElement('a'),url=URL.createObjectURL(blob);a.href=url;a.download=file.name;a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);}
 }catch(e){if(e?.name!=='AbortError')notice(hidden?'Recording interrupted. Keep the app open and try again.':'Clip recording is unavailable here. The share image is still available.');}
 finally{cancelAnimationFrame(raf);stream?.getTracks().forEach(t=>t.stop());document.removeEventListener('visibilitychange',onVisibility);sharingClip=false;}
}
