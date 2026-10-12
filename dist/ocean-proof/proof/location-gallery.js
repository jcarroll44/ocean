import {liveOcean} from './live-evidence.js';
import {captureScreenshot} from './results-upload.js';
// Actual live forecasts, not recoloured weather fixtures. Runs after all timing.
export async function collectLocationGallery({stage,files,report,untilReady,wait,waitVisible,visibleCapture,onStatus,download}){
 report.locations=[];
 for(const id of ['inlet-beach','cocoa-beach','san-diego']){
  await waitVisible();onStatus('Loading live profile · '+id);stage.src='/?ocean-debug=1&beach='+id;
  await untilReady(()=>stage.contentWindow.__daybuoy?.state?.data?.profileId===id&&stage.contentWindow.__daybuoy.state.data.source==='live'&&stage.contentWindow.__daybuoyFixture);
  const win=stage.contentWindow,bridge=win.__daybuoyFixture,review=bridge.liveReview();
  for(const [phase,time] of review.times){
   const inputs=bridge.reviewAt(time);onStatus('Capturing '+review.profile.name+' · '+phase);
   const blob=await visibleCapture(async()=>{await wait(3000);await untilReady(()=>{const e=liveOcean(win).evidence();return liveOcean(win).ready&&!e.shoreFieldPending&&e.weather?.cloudCache?.ready;});return captureScreenshot(win,{type:'image/jpeg',quality:.9});});
   const name='location-'+id+'-'+phase+'.jpg';files.push({name,blob});download(blob,name,review.profile.name+' · '+phase);
   report.locations.push({name,phase,...review,times:undefined,inputs,native:liveOcean(win).evidence()});
  }
 }
 if(report.locations.length!==12)throw Error('Twelve live location captures required');
}
