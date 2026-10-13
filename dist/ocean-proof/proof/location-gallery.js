import {liveOcean} from './live-evidence.js';
import {captureScreenshot} from './results-upload.js';
import {INTEGRATION_BUILD} from './integration-build.js';
// Actual live forecasts, not recoloured weather fixtures. Runs after all timing.
export async function collectLocationGallery({stage,files,report,untilReady,wait,waitVisible,visibleCapture,onStatus,download}){
 report.locations=[];report.locationAttempts=[];
 function snapshot(){try{const w=stage.contentWindow,a=w.__daybuoy;let native;try{native=liveOcean(w).evidence();}catch{}return{profile:w.__daybuoyProfile?.id,dataProfile:a?.state.data?.profileId,source:a?.state.data?.source,forecastLoaded:a?.state.forecastLoaded,backend:w.__tidewater?.backend,error:w.__tidewater?.error,native};}catch{return{loading:true};}}
 for(const id of ['inlet-beach','cocoa-beach','san-diego']){
  let complete=false;
  for(let attempt=1;attempt<=2&&!complete;attempt++){
   const audit={id,attempt,phase:'release previous renderer'};report.locationAttempts.push(audit);
   try{
    await waitVisible();
    try{liveOcean(stage.contentWindow).dispose?.();}catch{}
    stage.src='about:blank';
    await untilReady(()=>stage.contentWindow.location?.href==='about:blank');
    onStatus('Loading live profile · '+id);audit.phase='live forecast';
    stage.src='/?ocean-debug=1&beach='+id+'&v='+encodeURIComponent(INTEGRATION_BUILD.revision)+'&captureAttempt='+attempt;
    await untilReady(()=>stage.contentWindow.__daybuoy?.state?.data?.profileId===id&&stage.contentWindow.__daybuoy.state.data.source==='live'&&stage.contentWindow.__daybuoyFixture);
    const win=stage.contentWindow,bridge=win.__daybuoyFixture,review=bridge.liveReview(),pending=[];
    if(review.profile.id!==id)throw Error('Selected profile does not match requested beach');
    for(const [phase,time] of review.times){
     audit.phase=phase+' render';const inputs=bridge.reviewAt(time);
     onStatus('Capturing '+review.profile.name+' · '+phase);
     const blob=await visibleCapture(async()=>{
      let pose=null,stableSince=null;
      await untilReady(()=>{const next=Array.from(win.__daybuoy.engine.camera.matrixWorld.elements),now=performance.now();if(!pose||next.some((v,i)=>Math.abs(v-pose[i])>.0001)){pose=next;stableSince=now;return false;}return now-stableSince>=1000;});
      // Wait a full reflection refresh after the camera settles. Three seconds
      // from the start of a long yaw was still capturing motion-blurred frames.
      await wait(3500);await untilReady(()=>{const e=liveOcean(win).evidence();return liveOcean(win).ready&&!e.shoreFieldPending&&e.weather?.cloudCache?.ready;});return captureScreenshot(win,{type:'image/jpeg',quality:.96});});
     const name='location-'+id+'-'+phase+'.jpg';
     pending.push({name,blob,evidence:{name,phase,...review,times:undefined,inputs,native:liveOcean(win).evidence()}});
    }
    for(const item of pending){files.push({name:item.name,blob:item.blob});download(item.blob,item.name,review.profile.name+' · '+item.evidence.phase);report.locations.push(item.evidence);}
    audit.phase='complete';complete=true;
   }catch(e){audit.error=e.message;audit.state=snapshot();onStatus(id+' · retrying capture');}
  }
  if(!complete)(report.captureErrors??=[]).push({file:'locations-'+id,error:'Profile capture failed after two attempts; see locationAttempts.'});
 }
 if(report.locations.length!==12)throw Error('Twelve live location captures required; captured '+report.locations.length);
}
