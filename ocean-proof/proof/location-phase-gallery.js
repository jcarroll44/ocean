import {fixtureData} from './weather-fixtures.js';
import {liveOcean} from './live-evidence.js';
import {captureScreenshot} from './results-upload.js';
import {auditImage} from './pixel-audit.js';
import {INTEGRATION_BUILD} from './integration-build.js';
export const PHASES=Object.freeze([
 ['sunrise','Sunrise'],['midday','Midday'],['goldenHour','Golden hour'],['sunset','Sunset'],
 ['dusk','Dusk'],['overcastDawn','Overcast dawn'],['night','Night']
]);
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function contactSheet(entries,runId){
 if(entries.length!==21)throw Error('Three locations × seven rendered phases required, got '+entries.length);
 const w=216,h=385,gap=14,pad=18,head=100;
 const canvas=document.createElement('canvas');canvas.width=pad*2+7*w+6*gap;canvas.height=head+3*(h+46+gap)+28;
 const ctx=canvas.getContext('2d');ctx.fillStyle='#e9efed';ctx.fillRect(0,0,canvas.width,canvas.height);
 ctx.fillStyle='#183339';ctx.font='600 25px system-ui';ctx.fillText('DayBuoy · three coastlines · seven solar phases',pad,35);
 ctx.font='14px system-ui';ctx.fillText('Actual iPhone scene captures · bundled synthetic weather · unretouched · '+INTEGRATION_BUILD.revision,pad,60);
 ctx.fillText(runId,pad,82);
 for(const [i,entry] of entries.entries()){
  const x=pad+(i%7)*(w+gap),y=head+Math.floor(i/7)*(h+46+gap);
  ctx.fillStyle='#183339';ctx.font='600 15px system-ui';ctx.fillText(entry.profile,x,y+17);ctx.font='13px system-ui';ctx.fillText(entry.label,x,y+35);
  const image=await createImageBitmap(entry.blob);
  try{ctx.fillStyle='#081826';ctx.fillRect(x,y+46,w,h);const k=Math.min(w/image.width,h/image.height);ctx.drawImage(image,x+(w-image.width*k)/2,y+46+(h-image.height*k)/2,image.width*k,image.height*k);}
  finally{image.close();}
 }
 const blob=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error('Phase sheet encoding failed')),'image/jpeg',.91));
 return{name:'location-phases-contact-sheet.jpg',blob};
}
export async function collectPhaseGallery({stage,report,files,untilReady,waitVisible,visibleCapture,onStatus,download}){
 const entries=[];report.phaseGallery=[];report.phaseAttempts=[];
 for(const [id,label] of [['inlet-beach','Inlet Beach'],['cocoa-beach','Cocoa Beach'],['san-diego','Mission Beach']]){
  for(let attempt=1;attempt<=2;attempt++){
   const audit={profile:id,attempt,status:'initializing'};report.phaseAttempts.push(audit);
   try{
    await waitVisible();try{liveOcean(stage.contentWindow).dispose?.();}catch{}
    stage.src='about:blank';
    await untilReady(()=>stage.contentWindow.location?.href==='about:blank');
    onStatus('Preparing bundled fixtures · '+label);
    stage.src='/?ocean-debug=1&gate-fixture=1&beach='+id+'&captureAttempt='+attempt;
    await untilReady(()=>stage.contentWindow.__daybuoyFixture&&stage.contentWindow.__daybuoyProfile?.id===id);
    const win=stage.contentWindow,bridge=win.__daybuoyFixture,profile=win.__daybuoyProfile;
    const base=fixtureData('partly-cloudy',Date.now(),profile),times=bridge.syntheticTimes(base.time);
    const candidate=[];
    for(const [key,title] of PHASES){
     audit.status=title;
     const fixture=fixtureData(key==='overcastDawn'?'overcast':key==='night'?'clear':'partly-cloudy',Date.now(),profile);
     fixture.id='location-phase-'+id+'-'+key;fixture.title=title+' · '+label;
     bridge.apply(fixture);bridge.reviewAt(times[key]);onStatus(label+' · '+title+' · settling sky and camera');
     let pose=null,stableSince=null;
     await untilReady(()=>{
      const a=liveOcean(win),e=a.evidence(),now=performance.now();
      const next=Array.from(win.__daybuoy.engine.camera.matrixWorld.elements);
      if(!pose||next.some((v,i)=>Math.abs(v-pose[i])>.0001)){pose=next;stableSince=now;return false;}
      return now-stableSince>=900&&a.ready&&!e.shoreFieldPending&&e.weather?.cloudCache?.ready;
     });
     await wait(250);
     const blob=await visibleCapture(()=>captureScreenshot(win,{type:'image/jpeg',quality:.96}));
     const color=await auditImage(blob,{phase:id+'-'+key});
     const meta={profile:id,title,phase:key,forecastTime:times[key],source:'bundled synthetic fixture',colors:color,
      camera:{position:win.__daybuoy.engine.camera.position.toArray(),fov:win.__daybuoy.engine.camera.fov},
      native:liveOcean(win).evidence()};
     candidate.push({profile:label,label:title,blob,meta});
    }
    entries.push(...candidate);report.phaseGallery.push(...candidate.map(c=>c.meta));audit.status='complete';break;
   }catch(error){
    audit.error=String(error.message||error);audit.status='failed';
    onStatus(label+' · phase retry '+attempt);
    if(attempt===2)(report.captureErrors??=[]).push({file:'phase-gallery-'+id,error:audit.error});
   }
  }
 }
 if(entries.length!==21)throw Error('Location phase gallery incomplete: '+entries.length+'/21 actual device captures');
 const sheet=await contactSheet(entries,report.runId);
 files.push(sheet);report.phaseContactSheet={name:sheet.name,count:entries.length,source:'21 rendered frames, never recolored',allPixelChecksPass:report.phaseGallery.every(x=>x.colors.pass)};
 download(sheet.blob,sheet.name,'Three beaches · seven phases');
 return {sheet,entries};
}
