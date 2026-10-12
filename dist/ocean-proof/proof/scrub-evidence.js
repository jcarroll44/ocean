import {recordLiveCanvas,liveOcean} from './live-evidence.js';
export async function recordDayScrub(win,{duration=10,onProgress=()=>{}}={}){
 const app=win.__daybuoy,bridge=win.__daybuoyFixture;
 if(app?.state?.fixtureId!=='scrub-day')throw Error('Synthetic day-scrub fixture required.');
 const bounds=bridge.beginScrub(),samples=[],start=performance.now();let request=0,active=true,last=-Infinity;
 const advance=now=>{
  if(!active)return;
  const fraction=Math.max(0,Math.min(1,(now-start)/(duration*1000))),time=bounds.start+fraction*(bounds.end-bounds.start-1);
  const snapshot=bridge.scrubTo(time);
  if(now-last>=100){last=now;samples.push({...snapshot,at:now-start,weather:liveOcean(win).evidence().weather,displayed:{time:win.document.querySelector('.sky-time-label')?.textContent,stats:win.document.querySelector('#compact-values')?.textContent}});onProgress('Recording day scrub · '+Math.min(duration,Math.floor((now-start)/1000))+' / '+duration+' s');}
  request=requestAnimationFrame(advance);
 };
 const validate=()=>{if(document.hidden)throw Error('Day-scrub recording interrupted while hidden.');if(app.state.fixtureId!=='scrub-day'||!app.state.scrubbing)throw Error('Day-scrub fixture changed.');};
 try{
  bridge.scrubTo(bounds.start);request=requestAnimationFrame(advance);
  const clip=await recordLiveCanvas(app.engine.getSceneCanvas(),{duration,validate});
  return{...clip,samples,range:[bounds.start,bounds.end-1],note:'Actual iPhone scene canvas during an automated 10-second forecast scrub, not an OS screen recording. DOM charm/readouts are logged in samples but are not in this canvas video. Synthetic clear → storm → clearing day; no FPS measurement during encoding.'};
 }finally{active=false;cancelAnimationFrame(request);bridge.endScrub();}
}
