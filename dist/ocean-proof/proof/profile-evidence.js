import {newRunId,jsonFile,uploadEvidence,retryPending} from './results-upload.js';
import {collectScreenshot,collectClip} from './test-evidence.js';
export {newRunId};
export async function finishProfileEvidence(stage,url,report,onStatus){
 const files=[];
 try{
  await retryPending(onStatus);
  if(url&&!report.error){
   report.captureScope='Separate final diagnostic scene loaded after all FPS tests. Fixed review forecast; capture is not part of the measured gate.';
   report.captureURL=url+'&native-capture=1';
   stage.src=url+'&native-capture=1';stage.style.display='block';onStatus('FPS measurements finished. Capturing separate evidence…');
   const begin=Date.now();let win;
   while(Date.now()-begin<90000){
    win=stage.contentWindow;
    try{if(win.__tidewater?.backend==='WebGPU native scene'&&win.document.getElementById('tidewater-ocean-layer')?.contentWindow.__daybuoyOcean?.evidence().marine)break;}catch{}
    await new Promise(r=>setTimeout(r,200));win=null;
   }
   if(!win)throw Error('The separate capture scene did not initialize.');
   await collectScreenshot(win,files,'final-scene.png',report);
   await collectClip(win,files,report,()=>{if(document.hidden)throw Error('Recording interrupted while hidden.');});
  }
 }catch(error){(report.captureErrors??=[]).push({file:'separate-capture',error:error.message});}
 finally{
  stage.src='about:blank';stage.style.display='none';report.finishedAt=new Date().toISOString();
  try{await uploadEvidence({runId:report.runId,kind:'profile',files:[jsonFile(report),...files]},onStatus);}catch{}
 }
}
