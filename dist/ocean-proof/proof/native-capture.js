// Device-generated evidence, never an illustration. Capture is separate from
// cadence measurement. One simulation state/clock is shared by both panels.
export async function captureNativePair({app,beach,overlays,G,GPU}){
 await GPU.queue.onSubmittedWorkDone();
 const seconds=G.time.value,width=Math.floor(innerWidth*2),height=Math.floor(innerHeight*2);
 const candidate={dpr:app.engine.renderScale,aa:app.post.aaMode,flare:!!app.post.flare},reference={dpr:2,aa:'taa',flare:true};
 const originalFinal=app.post._finalPass,originalFlare=app.post.flare,originalQuality=app.activeQuality;
 const shear=[app.camera.projectionMatrix.elements[8],app.camera.projectionMatrix.elements[9]];
 const dimensions=[];
 function settings(value){
  app.engine.setRenderScale(value.dpr);app.post.aaMode=value.aa;app.post.flare=value.flare?app.proofFlare:null;
  app.post._buildFinal();app.post.taau._needsRestart=true;
  app.camera.projectionMatrix.elements[8]=shear[0];app.camera.projectionMatrix.elements[9]=shear[1];app.camera.projectionMatrixInverse.copy(app.camera.projectionMatrix).invert();
 }
 const output=document.createElement('canvas');output.width=width*2;output.height=height+96;
 const ctx=output.getContext('2d'),saved=[];
 const meter=app.post.meterKernel.dispatch;app.post.meterKernel.dispatch=()=>{};
 for(const key of ['shoreSim','spray','breakers']){const o=app[key];saved.push([o,o.update]);o.update=()=>{};}
 const background=app.sceneRenderer.background,stand=beach.stand.visible,arc=overlays.root.visible;
 try{
  for(const [i,label] of ['Embedded Tidewater proof reference','DayBuoy native scene'].entries()){
   const config=i?candidate:reference;settings(config);await GPU.pipelinesReady();
   dimensions.push([app.engine.width,app.engine.height]);
   app.sceneRenderer.background=i?background:app.sky.background;beach.stand.visible=i?stand:false;overlays.root.visible=i?arc:false;
   // Restart temporal history at the same phase for each scene background.
   app.post.taau._needsRestart=true;
   for(let n=0;n<4;n++){G.time.value=seconds;app.fft.time.value=seconds;app.frame(0);ctx.drawImage(app.engine.canvas,i*width,96,width,height);await GPU.queue.onSubmittedWorkDone();}
   ctx.fillStyle='#17394d';ctx.fillRect(i*width,0,width,96);ctx.fillStyle='white';ctx.font='600 26px system-ui';ctx.fillText(label,i*width+20,30);ctx.font='20px system-ui';ctx.fillText(`${app.engine.width}×${app.engine.height} · ${config.aa} · flare ${config.flare?'on':'off'}`,i*width+20,58);ctx.fillText(`wave ${seconds.toFixed(3)} s`,i*width+20,84);
  }
  const blob=await new Promise(r=>output.toBlob(r,'image/png'));if(!blob)throw Error('Screenshot export failed');
  return {blob,metadata:{waveSeconds:seconds,reference,candidate,dimensions,panelResolution:[width,height],userAgent:navigator.userAgent,note:'Actual device pixels at one ocean state and camera. Left: embedded proof sky, DPR 2, TAA, flare on, WIP white-sand terrain; not the frozen external proof deployment. Right: tested candidate settings, scaled to the same panel size to compare sharpness. Stateful surf/exposure held; post history re-resolves. No FPS is measured during capture.'}};
 }finally{
  app.engine.setRenderScale(candidate.dpr);app.activeQuality=originalQuality;app.post.aaMode=candidate.aa;app.post.flare=originalFlare;app.post._finalPass=originalFinal;app.post.taau._needsRestart=true;
  app.camera.projectionMatrix.elements[8]=shear[0];app.camera.projectionMatrix.elements[9]=shear[1];app.camera.projectionMatrixInverse.copy(app.camera.projectionMatrix).invert();
  app.post.meterKernel.dispatch=meter;app.sceneRenderer.background=background;beach.stand.visible=stand;overlays.root.visible=arc;for(const[o,update]of saved)o.update=update;
 }
}
