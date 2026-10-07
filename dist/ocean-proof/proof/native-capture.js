// Device-generated evidence, never an illustration. Capture is separate from
// cadence measurement. One simulation state/clock is shared by both panels.
export async function captureNativePair({app,beach,overlays,G,GPU}){
 await GPU.queue.onSubmittedWorkDone();
 const seconds=G.time.value,width=app.engine.width,height=app.engine.height;
 const output=document.createElement('canvas');output.width=width*2;output.height=height+96;
 const ctx=output.getContext('2d'),saved=[];
 const meter=app.post.meterKernel.dispatch;app.post.meterKernel.dispatch=()=>{};
 for(const key of ['shoreSim','spray','breakers']){const o=app[key];saved.push([o,o.update]);o.update=()=>{};}
 const background=app.sceneRenderer.background,stand=beach.stand.visible,arc=overlays.root.visible;
 try{
  for(const [i,label] of ['Embedded Tidewater proof reference','DayBuoy native scene'].entries()){
   app.sceneRenderer.background=i?background:app.sky.background;beach.stand.visible=i?stand:false;overlays.root.visible=i?arc:false;
   // Restart temporal history at the same phase for each scene background.
   app.post.taau._needsRestart=true;
   for(let n=0;n<4;n++){G.time.value=seconds;app.fft.time.value=seconds;app.frame(0);ctx.drawImage(app.engine.canvas,i*width,96,width,height);await GPU.queue.onSubmittedWorkDone();}
   ctx.fillStyle='#17394d';ctx.fillRect(i*width,0,width,96);ctx.fillStyle='white';ctx.font='600 26px system-ui';ctx.fillText(label,i*width+20,36);ctx.font='22px system-ui';ctx.fillText(`${width}×${height} · wave ${seconds.toFixed(3)} s`,i*width+20,73);
  }
  const blob=await new Promise(r=>output.toBlob(r,'image/png'));if(!blob)throw Error('Screenshot export failed');
  return {blob,metadata:{waveSeconds:seconds,resolution:[width,height],userAgent:navigator.userAgent,note:'Actual device pixels. Same native ocean state, camera, High detail and DPR 2. Stateful surf is held; post history re-resolves. Left uses the embedded proof sky and WIP white-sand terrain, with the DayBuoy stand/arc hidden. It is not a screenshot of the frozen external proof deployment. No FPS is measured during capture.'}};
 }finally{app.post.meterKernel.dispatch=meter;app.sceneRenderer.background=background;beach.stand.visible=stand;overlays.root.visible=arc;for(const[o,update]of saved)o.update=update;}
}
