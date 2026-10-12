import {recordLiveCanvas,liveOcean} from './live-evidence.js';
import {fullAppCapture} from './full-app-capture.js';
export async function recordDayScrub(win,{duration=28,onProgress=()=>{}}={}){
 const app=win.__daybuoy,bridge=win.__daybuoyFixture;
 if(app?.state?.fixtureId!=='scrub-day')throw Error('Synthetic day-scrub fixture required.');
 win.document.getElementById('app').dataset.recordingFull='true';
 const bounds=bridge.beginScrub(),samples=[];let request=0,active=true,last=-Infinity,capture,paywall=false,lastSnapshot;const scrubDuration=duration-4;
 try{
  bridge.scrubTo(bounds.start);app.renderUI();capture=await fullAppCapture(win);const start=performance.now();
  const advance=now=>{
   if(!active)return;
   const fraction=Math.max(0,Math.min(1,(now-start)/(scrubDuration*1000))),time=bounds.start+fraction*(bounds.end-bounds.start-1);
   const snapshot=paywall?lastSnapshot:bridge.scrubTo(time);lastSnapshot=snapshot;if(fraction>=1&&!paywall){paywall=true;bridge.openPaywall();}
   if(now-last>=100){last=now;samples.push({...snapshot,at:now-start,weather:liveOcean(win).evidence().weather,displayed:{time:win.document.querySelector('.sky-time-label')?.textContent,stats:win.document.querySelector('#compact-values')?.textContent,weatherIcon:win.document.querySelector('.sky-charm')?.dataset.iconKey}});onProgress('Recording full app · day scrub · '+Math.min(duration,Math.floor((now-start)/1000))+' / '+duration+' s');}
   request=requestAnimationFrame(advance);
  };
  const validate=()=>{capture.validate();if(app.state.fixtureId!=='scrub-day'||(!app.state.scrubbing&&!paywall))throw Error('Day-scrub fixture changed.');};
  request=requestAnimationFrame(advance);
  // First recording frame must already contain both scene and UI.
  await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
  const clip=await recordLiveCanvas(capture.canvas,{duration,validate,videoBitsPerSecond:2400000}),composition=capture.state();
  if(composition.uiFrames<2||composition.sceneFrames<2)throw Error('Full-app recording did not update.');
  return{...clip,samples,composition,range:[bounds.start,bounds.end-1],paywallIncluded:paywall,note:'Actual full app: live WebGPU scene composited with rasterized live DOM, including weather glyph, light/rain/tide track and rolling values. One forecast hour per second, followed by four seconds of the real paywall. Synthetic clear → storm → clearing → night. Not an OS screen recording; backdrop blur can differ in DOM capture. Full UI held expanded for inspection. No FPS measurement during encoding.'};
 }finally{active=false;cancelAnimationFrame(request);capture?.stop();delete win.document.getElementById('app').dataset.recordingFull;bridge.closePaywall();bridge.endScrub();}
}
