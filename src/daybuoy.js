(()=>{
'use strict';
const THREE=__mods['three.module.js'];
const {createOcean}=__mods['ocean-engine.js'];
const {SITE,FT}=__mods['config.js'];
SITE.lat=30.28;SITE.lon=-86.0;
const {loadForecast,finalize,savedForecast,saveForecast}=__mods['forecast.js'];
const {sampleForecast}=__mods['sample.js'];
const {sunPosition,sunDay,localDayStart,sceneVector,moonPosition,moonPhase,starToScene,GALACTIC,matmul3,transpose3}=__mods['astro.js'];
const {sampleAt,compass}=__mods['conditions.js'];
const {uvFor,sunsetFor}=__mods['model.js'];
const {burnThreshold}=__mods['uv.js'];
const {clock,weekday,cToF}=__mods['format.js'];
const $=s=>document.querySelector(s),HOUR=3600000,MIN=60000,RAD=Math.PI/180;
const q=new URLSearchParams(location.search),review=q.get('review')==='1';
const reviewNow=Date.parse('2026-09-30T14:00:00-05:00');
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),mix=(a,b,t)=>a+(b-a)*t;
const prefs=(()=>{try{return JSON.parse(localStorage.getItem('daybuoy.prefs'))||{skin:3,spf:30};}catch{return{skin:3,spf:30};}})();
const state={time:review?reviewNow:Date.now(),data:null,version:1,sheet:null,live:true,prefs,review,dirty:true,playing:false,cameraFollow:true,debug:q.get('debug')==='1'};
const ui={};let engine=null,pathDay=null,pathPoints=[],pathLine=null,tickGroup=null,sunMesh=null,frameTime=performance.now(),lastUI=0,lastTextAt=-Infinity,lastCompassAt=-Infinity;
const uniforms={uResolution:{value:new THREE.Vector2(1,1)},uTime:{value:30},uPhase:{value:5},uHour:{value:0},uSwell:{value:.35},uWind:{value:4},uCloud:{value:.15},uPeriod:{value:8},uRain:{value:0},uVisibility:{value:24000},uCloudLayers:{value:new THREE.Vector3(.05,.02,.08)},uCloudQuality:{value:1},uTide:{value:0},uDirection:{value:0},uWindDirection:{value:0},uSun:{value:new THREE.Vector3(0,.5,-1).normalize()}};
uniforms.uLightning={value:0};uniforms.uAfternoon={value:0};uniforms.uHazeStrength={value:0};
const current={swell:1,period:8,wind:4,cloud:10,rain:0,visibility:25000,tide:0,clarity:90};
const icon=(kind)=>{
const paths={sun:'<circle cx="14" cy="14" r="5" fill="currentColor"/><path d="M14 2v4m0 16v4M2 14h4m16 0h4M5.5 5.5l3 3m11 11 3 3m-17 0 3-3m11-11 3-3"/>',storm:'<path d="M7 20a6 6 0 0 1 0-12 8 8 0 0 1 15 4 4 4 0 0 1 0 8M15 14l-5 8h5l-3 5"/>',bell:'<path d="M6 20h16l-3-5V11a5 5 0 0 0-10 0v4z" fill="currentColor"/><path d="M11 24q3 3 6 0M14 3v2"/>',cloud:'<path d="M6 22a6 6 0 0 1 1-12 7 7 0 0 1 13-1 6.5 6.5 0 1 1 1 13z" fill="#d3ebf98c"/>',rain:'<path d="M6 17a5 5 0 0 1 1-10 7 7 0 0 1 13 1 5 5 0 0 1 1 9z" fill="#d3ebf9a0"/><path d="m9 21-1 3m7-3-1 3m7-3-1 3"/>',wave:'<path d="M3 18q5-5 11 0t11 0M3 23q5-4 11 0t11 0M8 10q3-8 8-3l-2 4"/>'};
return `<svg class="icon" viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[kind]||paths.sun}</svg>`;
};
function reviewData(){
 const data=sampleForecast(reviewNow),start=localDayStart(reviewNow),base=[{h:0,temperature:77,wind:3,cloud:8,rain:0,uv:0,swell:1,sst:28.9},{h:9,temperature:81,wind:4,cloud:9,rain:0,uv:4,swell:1,sst:28.9},{h:12,temperature:84,wind:10,cloud:35,rain:0,uv:7,swell:1.7,sst:28.9},{h:14,temperature:77,wind:18,cloud:95,rain:4,uv:3,swell:3,sst:28.9},{h:16,temperature:78,wind:12,cloud:55,rain:.2,uv:2,swell:2,sst:29.4},{h:18.6667,temperature:79,wind:6,cloud:22,rain:0,uv:0,swell:1,sst:29.4},{h:24,temperature:76,wind:4,cloud:10,rain:0,uv:0,swell:1,sst:29.1}];
 const rows=[];for(let i=-24;i<=168;i++){const t=start+i*HOUR,h=((i%24)+24)%24;let a=base[0],b=base[1];for(let j=1;j<base.length;j++)if(h<=base[j].h){a=base[j-1];b=base[j];break;}const f=(h-a.h)/(b.h-a.h);const r={...(data.rows[clamp(i+24,0,data.rows.length-1)]),time:t};for(const k of Object.keys(a))if(k!=='h')r[k]=mix(a[k],b[k],f);r.windDirection=225;r.direction=201;r.gust=r.wind*1.5;r.period=8;r.apparent=r.temperature+5;r.rainProbability=r.rain>1?85:r.cloud*.3;r.weatherCode=r.rain>1?95:r.cloud>50?3:1;r.cloudLow=r.cloud*.8;r.cloudMid=r.cloud*.65;r.cloudHigh=Math.max(12,r.cloud*.5);r.visibility=r.rain>1?6000:28000;r.clarity=92;r.uvClear=Math.max(r.uv,7*Math.max(0,Math.sin((h-6)/12*Math.PI)));rows.push(r);}return finalize({rows,source:'review',retrievedAt:reviewNow,tideEvents:null});
}
function adopt(data){
 // Review-only fixture: daylight UV anchors, not a midnight-to-9AM ramp.
 // Production forecast rows are never adjusted here.
 if(data.source==='review'){const points=[[0,0],[6,0],[7,.1],[8,1.5],[9,4],[12,7],[14,3],[16,2],[17,1],[18,.2],[19,0],[24,0]];for(const row of data.rows){const h=(row.time-localDayStart(row.time))/HOUR;const i=points.findIndex(p=>p[0]>=h);const a=points[Math.max(0,i-1)],b=points[Math.max(0,i)];row.uv=mix(a[1],b[1],b[0]===a[0]?0:(h-a[0])/(b[0]-a[0]));}}
 state.data=data;state.data.version=++state.version;state.dirty=true;
}
adopt(review?reviewData():savedForecast()||finalize(sampleForecast(Date.now())));
function conditions(){return sampleAt(state.data.rows,state.time)||state.data.rows[0];}
function setTime(t,{live=false}={}){state.time=clamp(t,state.data.first,state.data.last);state.live=live;state.dirty=true;if(state.skyView||state.scrubbing)hapticTime(state.time);}
function setHour(h){setTime(localDayStart(state.time)+h*HOUR);}
const hour=Number(q.get('hour'));if(q.has('hour')&&Number.isFinite(hour))setHour(hour);
const qt=Date.parse(q.get('t')||'');if(Number.isFinite(qt))setTime(qt);
function notice(text){$('#notice').textContent=text;$('#notice').hidden=false;clearTimeout(ui.noticeTimer);ui.noticeTimer=setTimeout(()=>$('#notice').hidden=true,3500);}
function resize(){const w=innerWidth,h=innerHeight;uniforms.uResolution.value.set(w,h);engine?.resize(w,h,state.dragQuality?Math.min(devicePixelRatio,.8):Math.min(devicePixelRatio,1.6));}
try{engine=createOcean($('#ocean'),uniforms,e=>notice(e));engine.scene=engine.buoy.group.parent;engine.buoy.group.removeFromParent();engine.buoy.update=()=>{};engine.buoy.group.traverse(o=>{o.geometry?.dispose();for(const m of Array.isArray(o.material)?o.material:[o.material]){m?.map?.dispose();m?.dispose();}});engine.buoy.group.clear();resize();engine.setZoom(.84);engine.setView(0,-11*RAD);}catch(e){$('#loading').hidden=true;$('#sun-handle').hidden=true;$('#app').dataset.graphics='unavailable';const error=document.createElement('div');error.className='graphics-error';error.textContent='3D unavailable in this browser';$('#app').appendChild(error);console.error(e);}
let compassHold;$('#compass-strip').addEventListener('pointerdown',()=>{compassHold=setTimeout(()=>{state.debug=!state.debug;state.dirty=true;},750);});for(const type of ['pointerup','pointercancel','pointerleave'])$('#compass-strip').addEventListener(type,()=>clearTimeout(compassHold));
addEventListener('keydown',e=>{if(e.key.toLowerCase()==='d'&&e.shiftKey){state.debug=!state.debug;state.dirty=true;}});
addEventListener('resize',()=>{resize();updateCompass();});updateCompass();
/* DAYBUOY_CAMERA */
/* DAYBUOY_EXPLORE */
/* DAYBUOY_LIGHTING */
/* DAYBUOY_CELESTIAL */
function project(v){const p=v.clone().project(engine.camera);return{x:(p.x+1)*innerWidth/2,y:(1-p.y)*innerHeight/2,visible:p.z<1};}
function applyScene(dt){
 updateInteraction(dt);
 updateIntro();
 if(!engine)return;const c=conditions(),k=1-Math.exp(-dt*5);for(const key of Object.keys(current)){const v=c[key];if(Number.isFinite(v))current[key]=mix(current[key],v,k);}
 uniforms.uSwell.value=clamp(current.swell/FT,.01,3);uniforms.uPeriod.value=current.period;uniforms.uWind.value=current.wind;uniforms.uCloud.value=current.cloud/100;uniforms.uRain.value=current.rain;uniforms.uVisibility.value=current.visibility;uniforms.uTide.value=current.tide||0;uniforms.uClarity.value=current.clarity/100;
 const fog=[45,48].includes(c.weatherCode),humidityHaze=Number.isFinite(c.humidity)?smooth(85,98,c.humidity):0;uniforms.uHazeStrength.value=mix(uniforms.uHazeStrength.value,fog?1:humidityHaze,k);
 uniforms.uDirection.value=((c.direction??201)-SITE.facing)*RAD;uniforms.uWindDirection.value=((c.windDirection??201)-SITE.facing)*RAD;uniforms.uCloudLayers.value.set((c.cloudLow??current.cloud*.5)/100,(c.cloudMid??current.cloud*.3)/100,(c.cloudHigh??current.cloud*.2)/100);
 const s=sunPosition(state.time),m=moonPosition(state.time),ph=moonPhase(state.time),M=starToScene(state.time);uniforms.uSun.value.set(...sceneVector(s.azimuth,s.altitude));uniforms.uMoon.value.set(...sceneVector(m.azimuth,m.altitude));uniforms.uMoonInfo.value.set(ph.fraction,m.radius*RAD,m.altitude>0?ph.fraction*Math.min(1,Math.sin(m.altitude*RAD)/.3):0,Math.pow(1-ph.fraction,2));uniforms.uDark.value=clamp((-s.altitude-4)/14,0,1);uniforms.uExposure.value=1+uniforms.uDark.value*.25;uniforms.uGalactic.value.set(...matmul3(GALACTIC,transpose3(M)));uniforms.uGlow.value=.8;uniforms.uAfternoon.value=state.time>sunDay(state.time).solarNoon?1:0;engine.sky.update({matrix:M,limit:6.2-(1-uniforms.uDark.value)*3,planets:[],figures:false});
 updateSunCamera(dt);
 updateCelestialPresentation();
 updateReferenceSkyPill();
 updateSceneDetails();
 updateTimeExploration();
 // No bare line segments or floating solar labels in the scrubber view.
 for(const o of [pathLine,pathTrail,tickGroup,groundRing,dropLine])if(o)o.visible=false;
 for(const o of uvArcGlow)o.visible=state.playing||timeGesture?.kind==='sun'&&timeGesture.moved;
 updateWeatherEffects();

}
/* DAYBUOY_SCENE_UI */
function metrics(){const c=conditions(),uv=review?c.uv:uvFor(state.data,state.time).at(state.time);return[['air','Air',Math.round(c.temperature)+'°'],['water','Water',Number.isFinite(c.sst)?Math.round(cToF(c.sst))+'°':'—'],['waves','Waves',c.swell.toFixed(c.swell<1?1:0)+' ft'],['wind','Wind',Math.round(c.wind)+' kt'],['sun','UV',Math.round(uv)+'']];}
function burnMinutes(){if(review)return 42;return uvFor(state.data,state.time).minutesTo(state.time,burnThreshold(state.prefs.skin,0));}
const isStorm=c=>c.weatherCode>=95||c.rain>=1;
function rangeClock(t){const text=clock(t);return text==='12:00 AM'?'midnight':text==='12:00 PM'?'noon':text.replace(':00','');}
function timeRange(start,end){const a=rangeClock(start),b=rangeClock(end),samePeriod=/[AP]M$/.test(a)&&a.slice(-2)===b.slice(-2)&&localDayStart(start)===localDayStart(end);return `${samePeriod?a.slice(0,-3):a}–${b}`;}
function stormWindow(){
 const rows=state.data.rows,d=localDayStart(state.time),thunder=conditions().weatherCode>=95,wet=r=>thunder?r.weatherCode>=95:isStorm(r);let i=rows.findIndex(r=>r.time>=state.time);if(i<0)i=rows.length-1;
 if(!wet(rows[i])&&i>0)i--;if(!wet(rows[i]))return rangeClock(state.time);
 let first=i,last=i;while(first>0&&rows[first-1].time>=d&&wet(rows[first-1]))first--;while(last+1<rows.length&&rows[last+1].time<d+24*HOUR&&wet(rows[last+1]))last++;
 return timeRange(rows[first].time,Math.min(rows[last].time+HOUR,d+24*HOUR));
}
async function sunsetReminder(){
 const sunset=sunDay(state.time).sunset;
 if(review){notice('Design preview. Open the current forecast to add a reminder.');return;}
 if(!sunset||sunset-15*MIN<=Date.now()){notice('This reminder time has passed. Choose a future day.');return;}
 const stamp=t=>new Date(t).toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z');
 const content=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//DayBuoy//Sunset//EN','CALSCALE:GREGORIAN','BEGIN:VEVENT',`UID:inlet-sunset-${sunset}@daybuoy`, `DTSTAMP:${stamp(Date.now())}`,`DTSTART:${stamp(sunset)}`,`DTEND:${stamp(sunset+30*MIN)}`,'SUMMARY:Sunset at Inlet Beach','LOCATION:Inlet Beach','DESCRIPTION:Your DayBuoy sunset. Arrive 15 minutes early.','BEGIN:VALARM','TRIGGER:-PT15M','ACTION:DISPLAY','DESCRIPTION:Sunset in 15 minutes','END:VALARM','END:VEVENT','END:VCALENDAR',''].join('\r\n');
 const file=new File([content],'DayBuoy-Sunset.ics',{type:'text/calendar'});
 try{
  if(navigator.canShare?.({files:[file]})){await navigator.share({files:[file],title:'DayBuoy sunset'});notice('Open the calendar file to add your reminder.');}
  else{const url=URL.createObjectURL(file),a=document.createElement('a');a.href=url;a.download=file.name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);notice('Open the downloaded calendar file to add your reminder.');}
 }catch(e){if(e.name!=='AbortError')notice('Could not open the calendar file. Please try again.');}
}
function renderUI(){
 const c=conditions(),h=(state.time-localDayStart(state.time))/HOUR,storm=isStorm(c),sunsetTime=sunDay(state.time).sunset,sunset=review?h>17&&h<20:!!sunsetTime&&state.time>=sunsetTime-90*MIN&&state.time<=sunsetTime+25*MIN,night=sunPosition(state.time).altitude<0;
 $('#source-label').textContent=`${weekday(state.time).toUpperCase()} · ${review?'FORECAST':state.data.source==='sample'?'DEMO':state.data.source==='saved'?'SAVED':'FORECAST'}`;
 $('#source-label').disabled=review||state.live;$('#source-label').setAttribute('aria-label',review?'Design preview':state.live?'Current forecast':'Return to current time');if(!review&&!state.live)$('#source-label').innerHTML+='<small>Back to now</small>';
 $('#app').dataset.weather=storm?'storm':sunset?'sunset':'clear';
 const sunsetScore=sunset?(review?8:sunsetFor(state.data,state.time).score?.score):null;
 $('#hero-temp').textContent=Math.round(c.temperature)+'°';$('#headline').textContent=storm?(review?'Storms · 2–4 PM.':`${c.weatherCode>=95?'Storms':'Rain'} · ${stormWindow()}.`):sunset?(sunsetScore==null?'Sunset on the water.':`Sunset · ${Math.round(sunsetScore)}/10.`):night?'Your beach after dark':c.wind<7?'Glassy & calm.':c.wind<14?'A little sea breeze':'Breezy on the beach';
 $('#sun-time').textContent=clock(state.time)+(state.playing?' · UV '+(forecastUV(state.time)==null?'—':Math.round(forecastUV(state.time))):'')+' · '+Math.round(sunPosition(state.time).altitude)+'° up';$('#sun-handle').setAttribute('aria-valuenow',Math.round(h*60));$('#sun-handle').setAttribute('aria-valuetext',clock(state.time));
 const day=localDayStart(state.time),today=localDayStart(review?reviewNow:Date.now());$('#days').innerHTML=Array.from({length:7},(_,i)=>{const t=today+i*24*HOUR;return`<button data-day="${t}" aria-pressed="${day===t}" ${t>state.data.last?'disabled':''}>${i===0?'Today':weekday(t+12*HOUR)}</button>`;}).join('');
 $('#metrics').innerHTML=metrics().map(([key,name,v])=>`<button class="metric" data-sheet="${key}" aria-label="${name}, ${v}. Open details"><strong>${v.replace(/ (ft|kt)$/,'<em>$1</em>')}</strong><small>${name.toUpperCase()}</small></button>`).join('');
 const action=$('#moment-action'),burn=burnMinutes();action.classList.toggle('storm',storm);
 action.innerHTML=storm?`${icon('storm')}<span class="action-copy">${review?'Storm warning · Head indoors':c.weatherCode>=95?'Thunderstorms · Head indoors':'Rain · View forecast'}</span>`:sunset?`${icon('bell')}<span class="action-copy">Remind me at ${clock((sunDay(state.time).sunset||state.time)-15*MIN)}</span>`:night?`${icon('sun')}<span class="action-copy">See tomorrow's sun</span>`:`${icon('sun')}<span class="action-copy">Tan · ${burn==null?'UV below 1':`burn in ${Math.round(burn)} min`}</span><span class="action-end">Start</span>`;
 action.dataset.action=storm?'storm':sunset?'remind':night?'tomorrow':'sun';
 if(state.sheet)renderSheet();
 $('#watch-day').innerHTML=state.playing?`Stop · ${clock(state.time)}`:'<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2.5 13 8 4 13.5z" fill="currentColor"/></svg>Watch the day';$('#watch-close').hidden=!state.playing;
 renderHome();renderOvernight();renderInteractionReadout();renderPresentation();
}
/* DAYBUOY_SHEETS */
function openSheet(k){if(k)state.storyEndPose=null;state.sheetCameraLocked=['water','waves','wind'].includes(k);state.sheet=k;$('#expanded-sheet').hidden=!k;$('#glass-dock').inert=!!k;$('#expanded-sheet').classList.toggle('sun-sheet',k==='sun');if(k)$('#app').dataset.sheet=k;else delete $('#app').dataset.sheet;state.dirty=true;}
document.addEventListener('click',e=>{
 if(e.target.closest('#look-back'))toggleLookBack();
 if(e.target.closest('#source-label')&&!review)backToNow();
 const metric=e.target.closest('[data-sheet]');if(metric?.classList.contains('metric'))openSheet(metric.dataset.sheet);
 const day=e.target.closest('[data-day]');if(day&&day.getAttribute('aria-disabled')!=='true'){selectForecastDay(Number(day.dataset.day));}
 if(e.target.closest('.grab'))openSheet(null);
 const hourly=e.target.closest('[data-hour-time]');if(hourly)setTime(Number(hourly.dataset.hourTime));
 if(e.target.closest('[data-skin]')){state.prefs.skin=state.prefs.skin%6+1;state.dirty=true;}
 if(e.target.closest('[data-spf]')){const list=[15,30,50];state.prefs.spf=list[(list.indexOf(state.prefs.spf)+1)%3];state.dirty=true;}
 if(e.target.closest('[data-budget]')){const list=[15,20,25,30];state.prefs.budget=list[(list.indexOf(state.prefs.budget??25)+1)%4];state.dirty=true;}
 if(e.target.closest('[data-start-tan]')){state.tanStarted=state.tanStarted?null:Date.now();state.dirty=true;}
 if(e.target.closest('[data-skin],[data-spf],[data-budget]'))localStorage.setItem('daybuoy.prefs',JSON.stringify(state.prefs));
 if(e.target.closest('#watch-day')){if(state.playing)toggleStoryPause();else startWatch();}if(e.target.closest('#watch-close'))stopWatch(true);
 if(e.target.closest('#moment-action')){const button=$('#moment-action');if(button.getAttribute('aria-disabled')==='true')return;const jump=Number(button.dataset.jumpTime);if(button.dataset.jumpTime&&Number.isFinite(jump))setTime(jump);const a=button.dataset.action;if(['sun','water','waves','wind','air'].includes(a))openSheet(a);else if(a==='retry')retryForecast();else if(a==='tomorrow'){setTime(localDayStart(state.time)+33*HOUR);}else if(a==='remind')sunsetReminder();else openSheet('air');}
});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(state.playing)stopWatch(true);else openSheet(null);}if(e.target.matches('[role=slider]')&&['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();holdTimeExploration();setTime(e.key==='Home'?localDayStart(state.time)+6*HOUR:e.key==='End'?localDayStart(state.time)+20*HOUR:state.time+(e.key==='ArrowLeft'?-15:15)*MIN);}});
let drag=null;
// Time gestures are owned exclusively by interaction.js; sheet grabs by overnight.js.
/* DAYBUOY_OVERNIGHT */
async function refresh(){
 loadDailyHighs();loadRipForecast();if(review){state.forecastLoaded=true;return;}
 try{const data=await loadForecast();state.forecastFailed=data.source!=='live';if(data.source==='live'){adopt(data);saveForecast(data);}else if(state.data.source==='sample')adopt(data);}
 catch(e){state.forecastFailed=true;console.warn('Forecast refresh unavailable',e);}
 finally{state.forecastLoaded=true;state.dirty=true;}
}

function frame(now){requestAnimationFrame(frame);const dt=Math.min((now-frameTime)/1000,.05);frameTime=now;if(document.hidden||state.capture)return;if(state.playing)advanceWatch(now);else if(state.live)state.time=Date.now();if(state.tanStarted&&Math.floor(now/1000)!==ui.timerSecond){ui.timerSecond=Math.floor(now/1000);state.dirty=true;}if(!reduced){uniforms.uTime.value+=dt;uniforms.uPhase.value+=dt/Math.max(2,current.period);}applyScene(dt);if(engine)engine.render(reduced?0:dt);const minute=Math.floor(state.time/MIN);if((minute!==lastUI||state.dirty)&&now-lastTextAt>=100){lastTextAt=now;lastUI=minute;state.dirty=false;renderUI();}if(engine)$('#loading').hidden=true;}
refresh();setInterval(refresh,15*MIN);requestAnimationFrame(frame);
if(['sun','water','waves','wind','air'].includes(q.get('sheet')))openSheet(q.get('sheet'));
window.__daybuoy={state,engine,uniforms,homeProof(){return{arcVisible:pathLine?.visible,arcOpacity:timeExploreOpacity,watchDuration:WATCH_DURATION_MS,until:timeExploreUntil,now:performance.now()};},solarProof,skyProof,timeRange,stormWindow,explorationProof,resetBeach,advanceWatch,forecastUV,uvColour,sunPathScreen,setSkyView,toggleLookBack,setTime,setHour,openSheet,conditions,refresh,reviewData,renderUI,startWatch,stopWatch,watchAt,captureFrame(dt=1/8){state.capture=true;applyScene(dt);uniforms.uTime.value+=dt;uniforms.uPhase.value+=dt/Math.max(2,current.period);if(performance.now()-lastTextAt>=100){lastTextAt=performance.now();renderUI();}engine.render(dt);},renderForCapture(h,dt=0){state.capture=true;setHour(h);applyScene(dt||10);uniforms.uTime.value+=dt;uniforms.uPhase.value+=dt/Math.max(2,current.period);if(performance.now()-lastTextAt>=100){lastTextAt=performance.now();renderUI();}engine.render(dt);}};window.__ocean=window.__daybuoy;
})();
