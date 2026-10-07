// A 20-second forecast story. Camera geometry remains the approved beachPose.
const STORY_DURATION=20000,STORY_HOLD=2000;
let storyMoments=[],storyCard=false,storyIndex=0,storyReturn=null,storyDay=null;
function forecastRuns(rows,predicate){
 const groups=[];let run=[];
 for(const row of rows){if(predicate(row)){if(run.length&&row.time-run.at(-1).time>HOUR*1.1){groups.push(run);run=[];}run.push(row);}else if(run.length){groups.push(run);run=[];}}
 if(run.length)groups.push(run);return groups;
}
function buildStory(){
 const d=sunDay(state.time),rows=state.data.rows.filter(r=>r.time>=d.sunrise&&r.time<=d.sunset),moments=[];
 const add=(time,title,detail='',kind='light')=>{if(Number.isFinite(time)&&time>=state.data.first&&time<=state.data.last)moments.push({time,title,detail,kind});};
 const at=t=>sampleAt(state.data.rows,t),cloudText=r=>r.cloud>=80?'Overcast':r.cloud>=40?'Cloudy spells':'Open skies';
 add(d.sunrise,'Sunrise',`${cloudText(at(d.sunrise))} · the beach wakes up`,'sunrise');
 const calm=forecastRuns(rows,r=>ripRiskAt(r.time)?.risk==='Low'&&Number.isFinite(r.swell)&&r.swell<2&&Number.isFinite(r.wind)&&r.wind<12&&r.rain<.2&&r.rainProbability<35&&!isStorm(r)).sort((a,b)=>b.length-a.length)[0];
 if(calm?.length>=2){const first=calm[0],end=Math.min(calm.at(-1).time+HOUR,d.sunset);add(first.time,'Calmest water',`${timeRange(first.time,end)} · Low NWS rip risk · check flags`,'water');}
 else if(rows.length){const r=rows[Math.min(rows.length-1,2)],risk=ripRiskAt(r.time)?.risk;add(r.time,'Water outlook',risk==='High'?'High NWS rip risk · stay out of the water':risk==='Moderate'?'Moderate NWS rip risk · use caution':'Check local beach flags before entering','water');}
 const uvRows=rows.filter(r=>Number.isFinite(r.uv));
 if(uvRows.length){const peak=uvRows.reduce((a,b)=>b.uv>a.uv?b:a);if(peak.uv>=3){const burn=uvFor(state.data,peak.time).minutesTo(peak.time,burnThreshold(state.prefs.skin,0));add(peak.time,`Peak UV ${Math.round(peak.uv)}`,Number.isFinite(burn)?`Est. burn ${Math.round(burn)} min · unprotected skin`:'Use sun protection','uv');}}
 const thunderRuns=forecastRuns(rows,r=>r.weatherCode>=95),wet=(thunderRuns.length?thunderRuns:forecastRuns(rows,isStorm)).sort((a,b)=>b.length-a.length)[0];
 if(wet){const thunder=wet.some(r=>r.weatherCode>=95),end=Math.min(wet.at(-1).time+HOUR,d.sunset);add(wet[0].time,thunder?'Thunderstorm window':'Rain window',`${timeRange(wet[0].time,end)} · ${thunder?'head indoors':'plan around the showers'}`,'rain');}
 const evening=at(d.goldenEveningStart);add(d.goldenEveningStart,'Evening light',evening.cloud>=80?'Overcast · soft silver light':'Golden-hour light on the beach','golden');
 const score=sunsetFor(state.data,state.time).score?.score;add(d.sunset,'Sunset',Number.isFinite(score)?`Outlook ${Math.round(score)}/10 · forecast estimate`:'Last light on your beach','sunset');
 // A minute is one story stop. Hazards take precedence over optional light/UV stops.
 const priority=m=>m.kind==='rain'?100:m.kind==='water'&&/High NWS/.test(m.detail)?90:({sunrise:80,sunset:80,water:60,uv:50,golden:30}[m.kind]||0),unique=new Map();
 for(const m of moments){const key=Math.floor(m.time/MIN),old=unique.get(key);if(!old||priority(m)>priority(old))unique.set(key,m);}
 return [...unique.values()].sort((a,b)=>a.time-b.time);
}
function storySummary(day=storyDay??state.time){
 const sun=sunDay(day+12*HOUR),rows=state.data.rows.filter(r=>r.time>=sun.sunrise&&r.time<=sun.sunset);
 const dry=r=>r.rain<.2&&r.rainProbability<35&&!isStorm(r)&&Number.isFinite(r.wind)&&r.wind<12;
 const best=predicate=>forecastRuns(rows,predicate).sort((a,b)=>b.length-a.length)[0];
 const calm=best(r=>dry(r)&&ripRiskAt(r.time)?.risk==='Low'&&Number.isFinite(r.swell)&&r.swell<2),beach=best(dry),run=calm?.length>=2?calm:beach;
 const score=sunsetFor(state.data,day).score?.score;
 let summary=run?.length>=2?`Best: ${run===calm?'calm water':'dry beach'} ${timeRange(run[0].time,Math.min(run.at(-1).time+HOUR,sun.sunset))}`:rows.some(r=>isStorm(r)||r.rainProbability>=35)?'Showery day · plan around the rain':'Beach outlook · check wind and flags';
 if(Number.isFinite(score))summary+=` · sunset ${Math.round(score)}/10 est.`;
 return summary;
}
function storySample(elapsed){
 const n=storyMoments.length,travel=Math.max(0,(STORY_DURATION-STORY_HOLD*n)/Math.max(1,n-1));let cursor=0;
 for(let i=0;i<n;i++){
  if(elapsed<=cursor+STORY_HOLD||i===n-1)return{index:i,time:storyMoments[i].time,holding:true,holdAt:clamp(elapsed-cursor,0,STORY_HOLD)};
  cursor+=STORY_HOLD;
  if(elapsed<cursor+travel){const f=clamp((elapsed-cursor)/travel,0,1);return{index:i,time:mix(storyMoments[i].time,storyMoments[i+1].time,f*f*(3-2*f)),holding:false,holdAt:0};}
  cursor+=travel;
 }
}
const storyBaseStart=startWatch,storyBaseStop=stopWatch;
startWatch=function(){
 if(state.playing)return;
 if(!realForecast()){notice('A current forecast is needed to watch the day.');return;}
 storyMoments=buildStory();if(storyMoments.length<2)return;
 storyReturn={time:state.time,live:state.live,sheet:state.sheet,orbit:{...freeOrbit},current:{...current},phase:uniforms.uPhase.value,sceneTime:uniforms.uTime.value,held:!!state.timeCameraHeld,sky:!!state.skyView,shear:uniforms.uShear.value,compact:dockCompact,peek:peekKind,pose:{...cameraPose},fov:engine.camera.fov,userLook:state.userLook?{...state.userLook}:null,sheetCameraLocked:state.sheetCameraLocked};
 cancelTimeMotion();clearUserView();setDragQuality(false);setDockCompact(false);seaCardOpen=false;storyCard=false;state.storyEndPose=null;storyDay=localDayStart(state.time);
 storyBaseStart();state.story=true;storyIndex=0;setTime(storyMoments[0].time);state.dirty=true;
};
function restoreStoryView(){
 const saved=storyReturn;storyReturn=null;state.watchRestore=null;
 if(!saved)return;
 setTime(saved.time,{live:saved.live});freeOrbit={...saved.orbit};Object.assign(current,saved.current);uniforms.uPhase.value=saved.phase;uniforms.uTime.value=saved.sceneTime;
 state.timeCameraHeld=saved.held;state.skyView=saved.sky;state.manualShear=saved.shear;peekKind=saved.peek;setDockCompact(saved.compact);openSheet(saved.sheet);
 state.userLook=saved.userLook;state.sheetCameraLocked=saved.sheetCameraLocked;lookVelocity={};lookInertia={yaw:0,pitch:0};
 cameraPose={...saved.pose};state.cameraYaw=saved.pose.yaw;engine.setPose(saved.pose.x,saved.pose.y,saved.pose.z,saved.pose.yaw,saved.pose.pitch,.59/Math.tan(saved.fov*RAD/2),saved.shear??HOME_LENS_SHIFT);cameraReturn=null;
}
stopWatch=function(restore=true){
 if(!storyReturn){storyBaseStop(restore);return;}
 state.playing=false;state.paused=false;state.story=false;state.storyGlance=0;state.storyEndPose=null;storyCard=false;delete $('#app').dataset.playing;delete $('#app').dataset.paused;
 if(restore)restoreStoryView();else{storyReturn=null;state.watchRestore=null;state.timeCameraHeld=true;state.skyView=false;}
 holdTimeExploration();state.dirty=true;
};
function pauseStoryForInteraction(){
 if(!state.playing||state.paused)return;
 state.pauseStarted=performance.now();state.paused=true;state.storyGlance=0;captureUserView();$('#app').dataset.paused='true';state.dirty=true;
}
function toggleStoryPause(){
 if(!state.playing)return;
 if(state.paused){state.playStart+=performance.now()-state.pauseStarted;cancelTimeMotion();clearUserView();state.paused=false;delete $('#app').dataset.paused;}else pauseStoryForInteraction();
 state.dirty=true;
}
advanceWatch=function(now){
 if(state.paused||!storyMoments.length)return;
 const elapsed=Math.max(0,now-state.playStart),s=storySample(Math.min(elapsed,STORY_DURATION));storyIndex=s.index;setTime(s.time);state.storyHolding=s.holding;state.storyGlance=0;
 const t=(s.holdAt-250)/1500;if(s.holding&&storyMoments[s.index].kind==='uv'&&t>0&&t<1)state.storyGlance=Math.sin(t*Math.PI);
 state.playProgress=Math.min(1,elapsed/STORY_DURATION);
 if(elapsed>=STORY_DURATION){setTime(storyMoments.at(-1).time);state.playing=false;state.story=false;state.storyGlance=0;state.paused=false;state.skyView=false;state.timeCameraHeld=true;delete $('#app').dataset.playing;storyCard=true;state.storyEndPose={...cameraPose,fov:engine.camera.fov,shear:0};state.dirty=true;}
};
function renderStory(){
 let card=$('#story-card');if(!card){card=document.createElement('section');card.id='story-card';card.className='glass';card.hidden=true;card.setAttribute('aria-label','Your day summary');$('#app').append(card);}
 let detail=$('#story-detail');if(!detail){detail=document.createElement('p');detail.id='story-detail';detail.hidden=true;$('#hero').append(detail);}
 card.hidden=!storyCard;detail.hidden=!state.story;$('#app').dataset.story=String(!!state.story);$('#app').dataset.storyCard=String(storyCard);
 if(state.story){const m=storyMoments[storyIndex];$('#source-label').textContent=`${weekday(state.time)} · ${clock(state.time)}`;$('#headline').textContent=state.storyHolding?m.title:'';detail.textContent=state.storyHolding?m.detail:'';$('#watch-day').textContent=state.paused?'Resume':'Pause';$('#watch-day').setAttribute('aria-label',state.paused?'Resume Watch the day':'Pause Watch the day');$('#watch-day').title=state.paused?'Resume':'Pause';
 }
 if(storyCard){const day=new Intl.DateTimeFormat('en-US',{timeZone:SITE.zone,weekday:'long'}).format(storyDay+12*HOUR),key=storyMoments.map(m=>m.time+m.title+m.detail).join('|');
  if(card.dataset.key!==key){card.dataset.key=key;card.innerHTML=`<button class="story-close" aria-label="Return to your previous view">×</button><h2>Your ${day}</h2><p class="story-note">${storySummary()}</p><div class="story-list">${storyMoments.map((m,i)=>`<button data-moment="${i}"><time>${clock(m.time)}</time><span>${m.title}<small>${m.detail}</small></span><b>↗</b></button>`).join('')}</div><div class="story-actions"><button class="story-return">Back to my view</button><button class="story-share">Share day ↗</button></div>`;}
 }
}
function jumpToStoryMoment(index){
 const m=storyMoments[index];if(!m)return;stopWatch(false);openSheet(null);setTime(m.time);holdTimeExploration();state.dirty=true;
}
document.addEventListener('click',e=>{const m=e.target.closest('[data-moment]');if(m)jumpToStoryMoment(Number(m.dataset.moment));if(e.target.closest('.story-close,.story-return'))stopWatch(true);if(e.target.closest('.story-share'))shareStory();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&storyCard)stopWatch(true);});
function shareMoments(){
 const priority=m=>m.kind==='rain'?100:m.kind==='water'&&/High|Moderate/.test(m.detail)?95:m.kind==='uv'?80:m.kind==='water'?75:m.kind==='golden'?65:m.kind==='sunset'?50:20;
 return [...storyMoments].sort((a,b)=>priority(b)-priority(a)).slice(0,3).sort((a,b)=>a.time-b.time);
}
async function storyShareCanvas(){
 await document.fonts.ready;const canvas=document.createElement('canvas');canvas.width=canvas.height=1080;const ctx=canvas.getContext('2d');
 // A real square render keeps the beach, horizon and sunset in the image.
 // Restore the phone viewport immediately; the user's camera pose never changes.
 try{uniforms.uResolution.value.set(1080,1080);engine.resize(1080,1080,1);engine.render(0);ctx.drawImage($('#ocean'),0,0,1080,1080);}finally{resize();engine.render(0);}
 const x=36,y=666,w=1008,h=378;ctx.save();ctx.beginPath();ctx.roundRect(x,y,w,h,32);ctx.clip();
 const backdrop=document.createElement('canvas');backdrop.width=backdrop.height=1080;backdrop.getContext('2d').drawImage(canvas,0,0);ctx.filter='blur(18px)';ctx.drawImage(backdrop,0,0);ctx.filter='none';const glass=ctx.createLinearGradient(0,y,0,y+h);glass.addColorStop(0,'#f7fbffdf');glass.addColorStop(1,'#d3ebf9e8');ctx.fillStyle=glass;ctx.fillRect(x,y,w,h);ctx.restore();
 ctx.strokeStyle='#ffffffb0';ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(x,y,w,h,32);ctx.stroke();ctx.fillStyle='#1A435A';
 const fit=(text,size,min,width,weight='500')=>{while(size>min){ctx.font=`${weight} ${size}px Poppins`;if(ctx.measureText(text).width<=width)break;size--;}return size;};
 ctx.font='500 48px Poppins';ctx.fillText($('#story-card h2')?.textContent||'Your beach day',70,726);
 fit(storySummary(),28,22,940);ctx.fillText(storySummary(),70,772);
 ctx.strokeStyle='#1a435a22';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(70,793);ctx.lineTo(1010,793);ctx.stroke();
 shareMoments().forEach((m,i)=>{const baseline=831+i*55;ctx.fillStyle='#1a435a';ctx.font='500 23px Poppins';ctx.fillText(rangeClock(m.time),70,baseline);fit(m.title,28,22,730);ctx.fillText(m.title,275,baseline);ctx.fillStyle='#365d70';fit(m.detail,20,16,730,'400');ctx.fillText(m.detail,275,baseline+23);});
 ctx.fillStyle='#1a435aaa';ctx.font='500 19px Poppins';ctx.fillText('DayBuoy · Inlet Beach',70,1019);return canvas;
}
async function shareStory(){
 try{const canvas=await storyShareCanvas(),blob=await new Promise(r=>canvas.toBlob(r,'image/png'));if(!blob)throw Error('Image unavailable');const file=new File([blob],'DayBuoy-Your-Day.png',{type:'image/png'});if(navigator.canShare?.({files:[file]}))await navigator.share({files:[file]});else{const a=document.createElement('a'),url=URL.createObjectURL(blob);a.href=url;a.download=file.name;a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);notice('Your day image downloaded.');}}catch(e){if(e.name!=='AbortError')notice('Could not export the day card.');}
}
window.__story={buildStory,shareMoments,storySummary,storySample,toggleStoryPause,jumpToStoryMoment,storyShareCanvas,proof:()=>({moments:storyMoments,card:storyCard,index:storyIndex,day:storyDay,restore:storyReturn,duration:STORY_DURATION,hold:STORY_HOLD,paused:state.paused,glance:state.storyGlance})};
