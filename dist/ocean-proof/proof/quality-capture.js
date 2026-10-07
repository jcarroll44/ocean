// A diagnostic, not an FPS test. Both captures use one fixed wave clock.
export async function captureQualityPair({app,G,GPU,changeQuality,getQuality,setPaused}){
 const original=getQuality(),seconds=G.time.value;setPaused(true);
 const output=document.createElement('canvas');output.width=780;output.height=900;const ctx=output.getContext('2d');
 const metadata={waveSeconds:seconds,createdAt:new Date().toISOString(),panels:[],note:'Same wave phase. Swash/whitewater history is held by disabling updates in both captures. Spray buffers reset when the quality budget changes; compare foam and curl, not individual spray particles. Reflection/postprocess histories are re-resolved. Full means original ocean detail at native DPR up to 3; phone reflection cubemap remains 64² in both.'};
 // Freeze stateful simulation, render full FFT/shore displacement at dt=0.
 const saved=[];for(const key of ['shoreSim','spray','breakers']){const obj=app[key];saved.push([obj,obj.update]);obj.update=()=>{};}
 try{
  await GPU.queue.onSubmittedWorkDone();
  for(const [x,level,full] of [[0,0,true],[390,original.level,false]]){
   await changeQuality(level);if(full)app.engine.setRenderScale(Math.min(devicePixelRatio||1,3));
   const capture=document.createElement('canvas');capture.width=390;capture.height=844;const c=capture.getContext('2d');
   // Draw in the same task as frame submission; WebGPU canvas contents may be
   // cleared after presentation. Queue completion is awaited between renders.
   for(let i=0;i<3;i++){G.time.value=seconds;app.fft.time.value=seconds;app.frame(0);c.drawImage(app.engine.canvas,0,0,390,844);await GPU.queue.onSubmittedWorkDone();}
   ctx.drawImage(capture,x,56);ctx.fillStyle='#153d50';ctx.fillRect(x,0,390,56);ctx.fillStyle='white';ctx.font='600 14px system-ui';ctx.fillText(full?'Full ocean detail':'Tuned · '+app.activeQuality.name,x+16,23);ctx.font='12px system-ui';ctx.fillText(`${app.engine.width}×${app.engine.height} · wave clock ${seconds.toFixed(3)}s`,x+16,44);
   metadata.panels.push({label:full?'full':'tuned',settings:{...app.activeQuality,dpr:app.engine.renderScale},output:[app.engine.width,app.engine.height],waveSeconds:G.time.value});
  }
  const blob=await new Promise(r=>output.toBlob(r,'image/png'));if(!blob)throw Error('Image export failed');return {blob,metadata};
 }finally{for(const [obj,fn]of saved)obj.update=fn;await changeQuality(original.level);setPaused(false);}
}
