import {recordLiveCanvas,liveOcean} from './live-evidence.js';
import {fullAppCapture} from './full-app-capture.js';
import {videoFrameAudit} from './pixel-audit.js';
export async function recordSunsetScrub(win,{onProgress=()=>{}}={}){
 const app=win.__daybuoy,bridge=win.__daybuoyFixture;
 if(!app?.state?.fixture||win.__daybuoyProfile?.id!=='inlet-beach')throw Error('Inlet bundled sunset fixture required');
 const times=bridge.syntheticTimes(app.state.time),from=times.sunset-30*60000,to=times.sunset+10*60000;
 bridge.reviewAt(from);bridge.beginScrub();
 const samples=[],pixel=videoFrameAudit();let capture=null,active=true,request=0,last=-Infinity;
 try{
  bridge.scrubTo(from);app.renderUI();
  capture=await fullAppCapture(win,{onSceneFrame:(ctx,width,height)=>pixel.inspect(ctx,width,height)});
  const start=performance.now();
  const frame=now=>{
   if(!active)return;
   const f=Math.min(1,Math.max(0,(now-start)/10000)),input=bridge.scrubTo(from+(to-from)*f);
   if(now-last>500){last=now;const n=liveOcean(win).evidence();
    samples.push({elapsedMs:now-start,time:input.time,cloudCache:n.weather?.cloudCache?.ready,phase:input.charm});
    onProgress('Recording Inlet sunset · '+Math.min(10,Math.floor((now-start)/1000))+' / 10 s');
   }
   request=requestAnimationFrame(frame);
  };
  request=requestAnimationFrame(frame);
  await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
  const movie=await recordLiveCanvas(capture.canvas,{duration:10,videoBitsPerSecond:3000000,validate(){capture.validate();if(!app.state.fixture||!app.state.scrubbing)throw Error('Sunset fixture changed while recording');}});
  const pixels=pixel.result(),composition=capture.state();
  if(composition.sceneFrames<2||composition.uiFrames<2||pixels.frames<2)throw Error('Sunset video contains too few rendered/verified frames');
  return{...movie,pixelAudit:pixels,composition,samples,range:[from,to],synthetic:true,note:'Actual WebGPU scene and DOM, synthetic Inlet sunset. Every composited scene frame audited before UI overlay. Not an FPS gate.'};
 }finally{active=false;cancelAnimationFrame(request);capture?.stop();bridge.endScrub();}
}
