(()=>{
'use strict';
const THREE=__mods['three.module.js'];
const {createOcean}=__mods['ocean-engine.js'];
const {SITE,FT}=__mods['config.js'];
const {loadForecast,finalize,savedForecast,saveForecast}=__mods['forecast.js'];
const {sampleForecast}=__mods['sample.js'];
const {sunPosition,sunDay,localDayStart,sceneVector,moonPosition,moonPhase,starToScene,GALACTIC,matmul3,transpose3}=__mods['astro.js'];
const {sampleAt,compass}=__mods['conditions.js'];
const {uvFor}=__mods['model.js'];
const {burnThreshold}=__mods['uv.js'];
const {clock,weekday,cToF}=__mods['format.js'];
const $=s=>document.querySelector(s),HOUR=3600000,MIN=60000,RAD=Math.PI/180;
const q=new URLSearchParams(location.search),review=q.get('review')==='1';
const reviewNow=Date.parse('2026-09-15T14:00:00-05:00');
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),mix=(a,b,t)=>a+(b-a)*t;
const prefs=(()=>{try{return JSON.parse(localStorage.getItem('daybuoy.prefs'))||{skin:3,spf:30};}catch{return{skin:3,spf:30};}})();
const state={time:review?reviewNow+4*24*HOUR:Date.now(),data:null,version:1,sheet:null,live:true,prefs,review,dirty:true,playing:false,cameraFollow:true};
const ui={};let engine=null,pathDay=null,pathPoints=[],pathLine=null,tickGroup=null,sunMesh=null,frameTime=performance.now(),lastUI=0;
const uniforms={uResolution:{value:new THREE.Vector2(1,1)},uTime:{value:30},uPhase:{value:5},uHour:{value:0},uSwell:{value:.35},uWind:{value:4},uCloud:{value:.15},uPeriod:{value:8},uRain:{value:0},uVisibility:{value:24000},uCloudLayers:{value:new THREE.Vector3(.05,.02,.08)},uCloudQuality:{value:1},uTide:{value:0},uDirection:{value:0},uWindDirection:{value:0},uSun:{value:new THREE.Vector3(0,.5,-1).normalize()}};
const current={swell:1,period:8,wind:4,cloud:10,rain:0,visibility:25000,tide:0,clarity:90};
const icon=(kind)=>{
const paths={sun:'<circle cx="14" cy="14" r="5" fill="currentColor"/><path d="M14 2v4m0 16v4M2 14h4m16 0h4M5.5 5.5l3 3m11 11 3 3m-17 0 3-3m11-11 3-3"/>',storm:'<path d="M7 20a6 6 0 0 1 0-12 8 8 0 0 1 15 4 4 4 0 0 1 0 8M15 14l-5 8h5l-3 5"/>',bell:'<path d="M6 20h16l-3-5V11a5 5 0 0 0-10 0v4z" fill="currentColor"/><path d="M11 24q3 3 6 0M14 3v2"/>',cloud:'<path d="M6 22a6 6 0 0 1 1-12 7 7 0 0 1 13-1 6.5 6.5 0 1 1 1 13z" fill="#d3ebf98c"/>',rain:'<path d="M6 17a5 5 0 0 1 1-10 7 7 0 0 1 13 1 5 5 0 0 1 1 9z" fill="#d3ebf9a0"/><path d="m9 21-1 3m7-3-1 3m7-3-1 3"/>',wave:'<path d="M3 18q5-5 11 0t11 0M3 23q5-4 11 0t11 0M8 10q3-8 8-3l-2 4"/>'};
return `<svg class="icon" viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[kind]||paths.sun}</svg>`;
};
function reviewData(){
 const data=sampleForecast(reviewNow),start=localDayStart(reviewNow),base=[{h:0,temperature:77,wind:3,cloud:8,rain:0,uv:0,swell:1,sst:28.9},{h:9,temperature:81,wind:4,cloud:9,rain:0,uv:4,swell:1,sst:28.9},{h:12,temperature:84,wind:10,cloud:35,rain:0,uv:7,swell:1.7,sst:28.9},{h:14,temperature:77,wind:18,cloud:95,rain:4,uv:3,swell:3,sst:28.9},{h:16,temperature:78,wind:12,cloud:55,rain:.2,uv:2,swell:2,sst:29.4},{h:18.6667,temperature:79,wind:6,cloud:22,rain:0,uv:0,swell:1,sst:29.4},{h:24,temperature:76,wind:4,cloud:10,rain:0,uv:0,swell:1,sst:29.1}];
 const rows=[];for(let i=-24;i<=168;i++){const t=start+i*HOUR,h=((i%24)+24)%24;let a=base[0],b=base[1];for(let j=1;j<base.length;j++)if(h<=base[j].h){a=base[j-1];b=base[j];break;}const f=(h-a.h)/(b.h-a.h);const r={...(data.rows[clamp(i+24,0,data.rows.length-1)]),time:t};for(const k of Object.keys(a))if(k!=='h')r[k]=mix(a[k],b[k],f);r.windDirection=225;r.direction=201;r.gust=r.wind*1.5;r.period=8;r.apparent=r.temperature+5;r.rainProbability=r.rain>1?85:r.cloud*.3;r.weatherCode=r.rain>1?95:r.cloud>50?3:1;r.cloudLow=r.cloud*.8;r.cloudMid=r.cloud*.65;r.cloudHigh=Math.max(12,r.cloud*.5);r.visibility=r.rain>1?6000:28000;r.clarity=92;r.uvClear=Math.max(r.uv,7*Math.max(0,Math.sin((h-6)/12*Math.PI)));rows.push(r);}return finalize({rows,source:'review',retrievedAt:reviewNow,tideEvents:null});
}
function adopt(data){state.data=data;state.data.version=++state.version;state.dirty=true;}
adopt(review?reviewData():savedForecast()||finalize(sampleForecast(Date.now())));
function conditions(){return sampleAt(state.data.rows,state.time)||state.data.rows[0];}
function setTime(t,{live=false}={}){state.time=clamp(t,state.data.first,state.data.last);state.live=live;state.dirty=true;}
function setHour(h){setTime(localDayStart(state.time)+h*HOUR);}
const hour=Number(q.get('hour'));if(q.has('hour')&&Number.isFinite(hour))setHour(hour);
const qt=Date.parse(q.get('t')||'');if(Number.isFinite(qt))setTime(qt);
function notice(text){$('#notice').textContent=text;$('#notice').hidden=false;clearTimeout(ui.noticeTimer);ui.noticeTimer=setTimeout(()=>$('#notice').hidden=true,3500);}
function resize(){const w=innerWidth,h=innerHeight;uniforms.uResolution.value.set(w,h);engine?.resize(w,h,Math.min(devicePixelRatio,1.6));}
try{engine=createOcean($('#ocean'),uniforms,e=>notice(e));resize();engine.setZoom(.84);engine.setView(0,-11*RAD);}catch(e){$('#loading').hidden=true;$('#sun-handle').hidden=true;$('#app').dataset.graphics='unavailable';const error=document.createElement('div');error.className='graphics-error';error.textContent='3D unavailable in this browser';$('#app').appendChild(error);console.error(e);}
addEventListener('resize',resize);
/* DAYBUOY_CAMERA */
function project(v){const p=v.clone().project(engine.camera);return{x:(p.x+1)*innerWidth/2,y:(1-p.y)*innerHeight/2,visible:p.z<1};}
function applyScene(dt){
 if(!engine)return;const c=conditions(),k=1-Math.exp(-dt*5);for(const key of Object.keys(current)){const v=c[key];if(Number.isFinite(v))current[key]=mix(current[key],v,k);}
 uniforms.uSwell.value=clamp(current.swell/FT,.01,3);uniforms.uPeriod.value=current.period;uniforms.uWind.value=current.wind;uniforms.uCloud.value=current.cloud/100;uniforms.uRain.value=current.rain;uniforms.uVisibility.value=current.visibility;uniforms.uTide.value=current.tide||0;uniforms.uClarity.value=current.clarity/100;
 uniforms.uDirection.value=((c.direction??201)-SITE.facing)*RAD;uniforms.uWindDirection.value=((c.windDirection??201)-SITE.facing)*RAD;uniforms.uCloudLayers.value.set((c.cloudLow??current.cloud*.5)/100,(c.cloudMid??current.cloud*.3)/100,(c.cloudHigh??current.cloud*.2)/100);
 const s=sunPosition(state.time),m=moonPosition(state.time),ph=moonPhase(state.time),M=starToScene(state.time);uniforms.uSun.value.set(...sceneVector(s.azimuth,s.altitude));uniforms.uMoon.value.set(...sceneVector(m.azimuth,m.altitude));uniforms.uMoonInfo.value.set(ph.fraction,m.radius*RAD,m.altitude>0?ph.fraction*Math.min(1,Math.sin(m.altitude*RAD)/.3):0,Math.pow(1-ph.fraction,2));uniforms.uDark.value=clamp((-s.altitude-4)/14,0,1);uniforms.uExposure.value=1+uniforms.uDark.value*.25;uniforms.uGalactic.value.set(...matmul3(GALACTIC,transpose3(M)));uniforms.uGlow.value=.55;engine.sky.update({matrix:M,limit:6.2-(1-uniforms.uDark.value)*3,planets:[],figures:false});
 updateSunCamera(dt);
 updateSceneDetails();

}
/* DAYBUOY_SCENE_UI */
function metrics(){const c=conditions(),uv=review?c.uv:uvFor(state.data,state.time).at(state.time);return[['air','Air',Math.round(c.temperature)+'°'],['water','Water',Number.isFinite(c.sst)?Math.round(cToF(c.sst))+'°':'—'],['waves','Waves',c.swell.toFixed(c.swell<1?1:0)+' ft'],['wind','Wind',Math.round(c.wind)+' kt'],['sun','UV',Math.round(uv)+'']];}
function burnMinutes(){if(review)return 42;return uvFor(state.data,state.time).minutesTo(state.time,burnThreshold(state.prefs.skin,0));}
function renderUI(){
 const c=conditions(),h=(state.time-localDayStart(state.time))/HOUR,storm=c.weatherCode>=95||c.rain>=1,sunset=h>17&&h<20,night=sunPosition(state.time).altitude<0;
 $('#source-label').textContent=`${weekday(state.time).toUpperCase()} · ${review?'DESIGN PREVIEW':state.data.source==='sample'?'DEMO':state.data.source==='saved'?'SAVED':'FORECAST'}`;
 $('#app').dataset.weather=storm?'storm':sunset?'sunset':'clear';
 $('#hero-temp').textContent=Math.round(c.temperature)+'°';$('#headline').textContent=storm?'Storms · 2–4 PM.':sunset?'Sunset · 8/10.':night?'Your beach after dark':c.wind<7?'Glassy & calm.':c.wind<14?'A little sea breeze':'Breezy on the beach';
 $('#sun-time').textContent=clock(state.time);$('#sun-handle').setAttribute('aria-valuenow',Math.round(h*60));$('#sun-handle').setAttribute('aria-valuetext',clock(state.time));
 const day=localDayStart(state.time),today=localDayStart(review?reviewNow:Date.now());$('#days').innerHTML=Array.from({length:7},(_,i)=>{const t=today+i*24*HOUR;return`<button data-day="${t}" aria-pressed="${day===t}" ${t>state.data.last?'disabled':''}>${i===0?'Today':weekday(t+12*HOUR)}</button>`;}).join('');
 $('#metrics').innerHTML=metrics().map(([key,name,v])=>`<button class="metric" data-sheet="${key}" aria-label="${name}, ${v}. Open details"><strong>${v.replace(/ (ft|kt)$/,'<em>$1</em>')}</strong><small>${name.toUpperCase()}</small></button>`).join('');
 const action=$('#moment-action'),burn=burnMinutes();action.classList.toggle('storm',storm);
 action.innerHTML=storm?`${icon('storm')}<span class="action-copy">Storm warning · Head indoors</span>`:sunset?`${icon('bell')}<span class="action-copy">Remind me at ${review?'6:25':clock((sunDay(state.time).sunset||state.time)-15*MIN)}</span>`:night?`${icon('sun')}<span class="action-copy">See tomorrow's sun</span>`:`${icon('sun')}<span class="action-copy">Tan · ${burn==null?'UV below 1':`burn in ${Math.round(burn)} min`}</span><span class="action-end">Start</span>`;
 action.dataset.action=storm?'storm':sunset?'remind':night?'tomorrow':'sun';
 if(state.sheet)renderSheet();
 $('#watch-day').innerHTML=state.playing?`${state.paused?'▶':'Ⅱ'} · ${clock(state.time)}`:'<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2.5 13 8 4 13.5z" fill="currentColor"/></svg>Watch the day';$('#watch-close').hidden=!state.playing;
}
/* DAYBUOY_SHEETS */
function openSheet(k){state.sheet=k;$('#expanded-sheet').hidden=!k;$('#glass-dock').inert=!!k;$('#expanded-sheet').classList.toggle('sun-sheet',k==='sun');if(k)$('#app').dataset.sheet=k;else delete $('#app').dataset.sheet;state.dirty=true;}
document.addEventListener('click',e=>{
 const metric=e.target.closest('[data-sheet]');if(metric?.classList.contains('metric'))openSheet(metric.dataset.sheet);
 const day=e.target.closest('[data-day]');if(day){const h=(state.time-localDayStart(state.time));setTime(Number(day.dataset.day)+h);}
 if(e.target.closest('.grab'))openSheet(null);
 const hourly=e.target.closest('[data-hour-time]');if(hourly)setTime(Number(hourly.dataset.hourTime));
 if(e.target.closest('[data-skin]')){state.prefs.skin=state.prefs.skin%6+1;state.dirty=true;}
 if(e.target.closest('[data-spf]')){const list=[15,30,50];state.prefs.spf=list[(list.indexOf(state.prefs.spf)+1)%3];state.dirty=true;}
 if(e.target.closest('[data-budget]')){const list=[15,20,25,30];state.prefs.budget=list[(list.indexOf(state.prefs.budget??25)+1)%4];state.dirty=true;}
 if(e.target.closest('[data-start-tan]')){state.tanStarted=state.tanStarted?null:Date.now();state.dirty=true;}
 if(e.target.closest('[data-skin],[data-spf],[data-budget]'))localStorage.setItem('daybuoy.prefs',JSON.stringify(state.prefs));
 if(e.target.closest('#watch-day')){if(state.playing){state.paused=!state.paused;state.playStart=performance.now()-state.playProgress*20000;state.dirty=true;}else startWatch();}if(e.target.closest('#watch-close'))stopWatch(true);
 if(e.target.closest('#moment-action')){const a=$('#moment-action').dataset.action;if(a==='sun')openSheet('sun');else if(a==='tomorrow'){setTime(localDayStart(state.time)+33*HOUR);}else if(a==='remind'){notice('Sunset reminder saved on this device.');localStorage.setItem('daybuoy.sunsetReminder',String(sunDay(state.time).sunset));}else openSheet('air');}
});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(state.playing)stopWatch(true);else openSheet(null);}if(e.target.matches('[role=slider]')&&['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();setTime(e.key==='Home'?localDayStart(state.time)+6*HOUR:e.key==='End'?localDayStart(state.time)+20*HOUR:state.time+(e.key==='ArrowLeft'?-15:15)*MIN);}});
let drag=null;
document.addEventListener('pointerdown',e=>{
 const ribbon=e.target.closest('[data-ribbon]'),sun=e.target.closest('#sun-handle'),grab=e.target.closest('.grab');if(!ribbon&&!sun&&!grab)return;e.preventDefault();const target=ribbon||sun||grab;(grab?target:$('#app')).setPointerCapture(e.pointerId);drag={type:ribbon?'ribbon':sun?'sun':'grab',rect:target.getBoundingClientRect(),x:e.clientX,y:e.clientY,time:state.time,target,path:sun?pathPoints.map(p=>({t:p.t,...project(p.position)})):null};if(ribbon)dragTime(e);
});
function dragTime(e){if(!drag)return;if(drag.type==='ribbon'){const f=clamp((e.clientX-drag.rect.left)/drag.rect.width,0,1);setTime(localDayStart(state.time)+(6+14*f)*HOUR);}else if(drag.type==='sun'){let best=null,distance=1e9;for(const p of drag.path||[]){if(!p.visible)continue;const d=Math.hypot(p.x-e.clientX,p.y-e.clientY);if(d<distance){distance=d;best=p;}}if(best&&distance<110)setTime(best.t);else{const delta=(e.clientX-drag.x-(e.clientY-drag.y)*.25)/innerWidth;setTime(drag.time+delta*12*HOUR);}state.cameraFollow=true;}else if(e.clientY-drag.y>45){openSheet(null);drag=null;}}
document.addEventListener('pointermove',e=>{if(drag){e.preventDefault();dragTime(e);}}, {passive:false});document.addEventListener('pointerup',()=>drag=null);document.addEventListener('pointercancel',()=>drag=null);
async function refresh(){if(review)return;try{const data=await loadForecast();if(data.source==='live'){adopt(data);saveForecast(data);}else if(state.data.source==='sample')adopt(data);}catch(e){console.warn('Forecast refresh unavailable',e);}}
function frame(now){requestAnimationFrame(frame);const dt=Math.min((now-frameTime)/1000,.05);frameTime=now;if(document.hidden||state.capture)return;if(state.playing)advanceWatch(now);else if(state.live)state.time=Date.now();if(state.tanStarted&&Math.floor(now/1000)!==ui.timerSecond){ui.timerSecond=Math.floor(now/1000);state.dirty=true;}if(!reduced){uniforms.uTime.value+=dt;uniforms.uPhase.value+=dt/Math.max(2,current.period);}applyScene(dt);if(engine)engine.render(reduced?0:dt);const minute=Math.floor(state.time/MIN);if(minute!==lastUI||state.dirty){lastUI=minute;state.dirty=false;renderUI();}if(engine)$('#loading').hidden=true;}
refresh();setInterval(refresh,15*MIN);requestAnimationFrame(frame);
if(['sun','water','waves','wind','air'].includes(q.get('sheet')))openSheet(q.get('sheet'));
window.__daybuoy={state,engine,uniforms,setTime,setHour,openSheet,conditions,refresh,reviewData,renderUI,startWatch,stopWatch,watchAt,renderForCapture(h,dt=0){state.capture=true;setHour(h);applyScene(10);uniforms.uTime.value+=dt;uniforms.uPhase.value+=dt/Math.max(2,current.period);renderUI();engine.render(dt);}};window.__ocean=window.__daybuoy;
})();
