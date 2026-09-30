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
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),mix=(a,b,t)=>a+(b-a)*t;
const prefs=(()=>{try{return JSON.parse(localStorage.getItem('daybuoy.prefs'))||{skin:3,spf:30};}catch{return{skin:3,spf:30};}})();
const state={time:Date.now(),data:null,version:1,sheet:null,live:true,prefs,review,dirty:true,playing:false,cameraFollow:false};
const ui={};let engine=null,pathDay=null,pathPoints=[],pathLine=null,tickGroup=null,sunMesh=null,frameTime=performance.now(),lastUI=0;
const uniforms={uResolution:{value:new THREE.Vector2(1,1)},uTime:{value:30},uPhase:{value:5},uHour:{value:0},uSwell:{value:.35},uWind:{value:4},uCloud:{value:.15},uPeriod:{value:8},uRain:{value:0},uVisibility:{value:24000},uCloudLayers:{value:new THREE.Vector3(.05,.02,.08)},uCloudQuality:{value:1},uTide:{value:0},uDirection:{value:0},uWindDirection:{value:0},uSun:{value:new THREE.Vector3(0,.5,-1).normalize()}};
const current={swell:1,period:8,wind:4,cloud:10,rain:0,visibility:25000,tide:0,clarity:90};
const icon=(kind)=>{
const paths={sun:'<circle cx="14" cy="14" r="5" fill="currentColor"/><path d="M14 2v4m0 16v4M2 14h4m16 0h4M5.5 5.5l3 3m11 11 3 3m-17 0 3-3m11-11 3-3"/>',storm:'<path d="M7 20a6 6 0 0 1 0-12 8 8 0 0 1 15 4 4 4 0 0 1 0 8M15 14l-5 8h5l-3 5"/>',bell:'<path d="M6 20h16l-3-5V11a5 5 0 0 0-10 0v4z" fill="currentColor"/><path d="M11 24q3 3 6 0M14 3v2"/>',cloud:'<path d="M6 22a6 6 0 0 1 1-12 7 7 0 0 1 13-1 6.5 6.5 0 1 1 1 13z" fill="#d3ebf98c"/>',rain:'<path d="M6 17a5 5 0 0 1 1-10 7 7 0 0 1 13 1 5 5 0 0 1 1 9z" fill="#d3ebf9a0"/><path d="m9 21-1 3m7-3-1 3m7-3-1 3"/>',wave:'<path d="M3 18q5-5 11 0t11 0M3 23q5-4 11 0t11 0M8 10q3-8 8-3l-2 4"/>'};
return `<svg class="icon" viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[kind]||paths.sun}</svg>`;
};
function reviewData(){
 const data=sampleForecast(Date.now()),start=localDayStart(Date.now()),base=[{h:0,temperature:77,wind:3,cloud:8,rain:0,uv:0,swell:1,sst:28.9},{h:9,temperature:81,wind:4,cloud:9,rain:0,uv:4,swell:1,sst:28.9},{h:12,temperature:84,wind:10,cloud:35,rain:0,uv:7,swell:1.7,sst:28.9},{h:14,temperature:77,wind:18,cloud:95,rain:4,uv:3,swell:3,sst:28.9},{h:16,temperature:78,wind:12,cloud:55,rain:.2,uv:2,swell:2,sst:29.4},{h:18.6667,temperature:79,wind:6,cloud:22,rain:0,uv:0,swell:1,sst:29.4},{h:24,temperature:76,wind:4,cloud:10,rain:0,uv:0,swell:1,sst:29.1}];
 const rows=[];for(let i=-24;i<=168;i++){const t=start+i*HOUR,h=((i%24)+24)%24;let a=base[0],b=base[1];for(let j=1;j<base.length;j++)if(h<=base[j].h){a=base[j-1];b=base[j];break;}const f=(h-a.h)/(b.h-a.h);const r={...(data.rows[clamp(i+24,0,data.rows.length-1)]),time:t};for(const k of Object.keys(a))if(k!=='h')r[k]=mix(a[k],b[k],f);r.windDirection=225;r.direction=201;r.gust=r.wind*1.5;r.period=8;r.apparent=r.temperature+5;r.rainProbability=r.rain>1?85:r.cloud*.3;r.weatherCode=r.rain>1?95:r.cloud>50?3:1;r.cloudLow=r.cloud*.8;r.cloudMid=r.cloud*.65;r.cloudHigh=Math.max(12,r.cloud*.5);r.visibility=r.rain>1?6000:28000;r.clarity=92;r.uvClear=Math.max(r.uv,7*Math.max(0,Math.sin((h-6)/12*Math.PI)));rows.push(r);}return finalize({rows,source:'review',retrievedAt:Date.now(),tideEvents:null});
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
function makePath(){
 if(!engine)return;const d=localDayStart(state.time);if(d===pathDay)return;pathDay=d;
 const scene=engine.buoy.group.parent;for(const o of [pathLine,tickGroup,sunMesh])if(o){scene.remove(o);o.geometry?.dispose();o.material?.dispose();}
 const day=sunDay(state.time);pathPoints=[];const start=day.sunrise??d+6*HOUR,end=day.sunset??d+18.5*HOUR;
 for(let t=start;t<=end+1;t+=(end-start)/144){const s=sunPosition(t),dir=sceneVector(s.azimuth,s.altitude);pathPoints.push({t,position:new THREE.Vector3(dir[0]*120,dir[1]*120,14+dir[2]*120)});}
 const geo=new THREE.BufferGeometry().setFromPoints(pathPoints.map(p=>p.position));pathLine=new THREE.Line(geo,new THREE.LineBasicMaterial({color:0xffeed0,transparent:true,opacity:.58,depthTest:false}));pathLine.renderOrder=110;scene.add(pathLine);
 tickGroup=new THREE.Group();for(let h=6;h<20;h++){const t=d+h*HOUR,s=sunPosition(t);if(s.altitude<0)continue;const v=sceneVector(s.azimuth,s.altitude),p=new THREE.Vector3(v[0]*120,v[1]*120,14+v[2]*120);const m=new THREE.Mesh(new THREE.SphereGeometry(.24,6,6),new THREE.MeshBasicMaterial({color:0xfff1d5,transparent:true,opacity:.75,depthTest:false}));m.position.copy(p);m.userData={hour:h,time:t};m.renderOrder=111;tickGroup.add(m);}scene.add(tickGroup);
 sunMesh=new THREE.Mesh(new THREE.SphereGeometry(1.05,16,16),new THREE.MeshBasicMaterial({color:0xffdd73,depthTest:false}));sunMesh.renderOrder=112;scene.add(sunMesh);
 $('#path-labels').innerHTML=tickGroup.children.map(m=>`<span class="path-tick" data-hour="${m.userData.hour}">${m.userData.hour>12?m.userData.hour-12:m.userData.hour}${m.userData.hour>=12?'p':'a'}</span>`).join('');
}
function project(v){const p=v.clone().project(engine.camera);return{x:(p.x+1)*innerWidth/2,y:(1-p.y)*innerHeight/2,visible:p.z<1};}
function applyScene(dt){
 if(!engine)return;const c=conditions(),k=1-Math.exp(-dt*5);for(const key of Object.keys(current)){const v=c[key];if(Number.isFinite(v))current[key]=mix(current[key],v,k);}
 uniforms.uSwell.value=clamp(current.swell/FT,.01,3);uniforms.uPeriod.value=current.period;uniforms.uWind.value=current.wind;uniforms.uCloud.value=current.cloud/100;uniforms.uRain.value=current.rain;uniforms.uVisibility.value=current.visibility;uniforms.uTide.value=current.tide||0;uniforms.uClarity.value=current.clarity/100;
 uniforms.uDirection.value=((c.direction??201)-SITE.facing)*RAD;uniforms.uWindDirection.value=((c.windDirection??201)-SITE.facing)*RAD;uniforms.uCloudLayers.value.set((c.cloudLow??current.cloud*.5)/100,(c.cloudMid??current.cloud*.3)/100,(c.cloudHigh??current.cloud*.2)/100);
 const s=sunPosition(state.time),m=moonPosition(state.time),ph=moonPhase(state.time),M=starToScene(state.time);uniforms.uSun.value.set(...sceneVector(s.azimuth,s.altitude));uniforms.uMoon.value.set(...sceneVector(m.azimuth,m.altitude));uniforms.uMoonInfo.value.set(ph.fraction,m.radius*RAD,m.altitude>0?ph.fraction*Math.min(1,Math.sin(m.altitude*RAD)/.3):0,Math.pow(1-ph.fraction,2));uniforms.uDark.value=clamp((-s.altitude-4)/14,0,1);uniforms.uExposure.value=1+uniforms.uDark.value*.25;uniforms.uGalactic.value.set(...matmul3(GALACTIC,transpose3(M)));uniforms.uGlow.value=.55;engine.sky.update({matrix:M,limit:6.2-(1-uniforms.uDark.value)*3,planets:[],figures:false});
 const horizon=state.sheet?innerHeight*.2:innerHeight*.415;engine.setShear((1-2*horizon/innerHeight)*.59+Math.tan(-11*RAD)*.84);
 updateFlatArc();

}
function arcPoint(f){return{x:14+(innerWidth-28)*f,y:innerHeight*.414-Math.sin(f*Math.PI)*101};}
function updateFlatArc(){
 const h=(state.time-localDayStart(state.time))/HOUR,f=clamp((h-6)/13.333,0,1),p=arcPoint(f),points=Array.from({length:81},(_,i)=>arcPoint(i/80));
 const path=points.map((p,i)=>`${i?'L':'M'}${p.x},${p.y}`).join(' '),lit=points.slice(0,Math.max(2,Math.round(f*80)+1)).map((p,i)=>`${i?'L':'M'}${p.x},${p.y}`).join(' ');
 $('#time-arc').setAttribute('viewBox',`0 0 ${innerWidth} ${innerHeight}`);
 $('#time-arc').innerHTML=`<defs><filter id="trail-glow"><feGaussianBlur stdDeviation="3"/></filter></defs><path d="${path}" fill="none" stroke="#fff9e6" stroke-opacity=".68" stroke-width="1.2"/><path d="${lit}" fill="none" stroke="#ffd876" stroke-width="4" stroke-opacity=".65" filter="url(#trail-glow)"/><path d="${lit}" fill="none" stroke="#fff0bf" stroke-width="1.5"/>`+Array.from({length:14},(_,i)=>{const p=arcPoint(i/13.333),slope=-Math.cos(i/13.333*Math.PI)*101*Math.PI/(innerWidth-28),dx=-slope*3,dy=3;return`<path d="M${p.x-dx},${p.y-dy}L${p.x+dx},${p.y+dy}" stroke="#fffaeb" stroke-opacity=".65"/>`;}).join('');
 const handle=$('#sun-handle');handle.classList.remove('edge');handle.style.left=p.x+'px';handle.style.top=p.y+'px';
 $('#path-labels').innerHTML=[{f:0,t:'6a'},{f:6/13.333,t:'12p'},{f:12/13.333,t:'6p'}].map(a=>{const p=arcPoint(a.f);return`<span class="path-tick" style="left:${clamp(p.x,26,innerWidth-26)}px;top:${p.y-17}px">${a.t}</span>`;}).join('');
}
function metrics(){const c=conditions(),uv=review?c.uv:uvFor(state.data,state.time).at(state.time);return[['air','Air',Math.round(c.temperature)+'°'],['water','Water',Number.isFinite(c.sst)?Math.round(cToF(c.sst))+'°':'—'],['waves','Waves',c.swell.toFixed(c.swell<1?1:0)+' ft'],['wind','Wind',Math.round(c.wind)+' kt'],['sun','UV',Math.round(uv)+'']];}
function burnMinutes(){if(review)return 42;return uvFor(state.data,state.time).minutesTo(state.time,burnThreshold(state.prefs.skin,0));}
function renderUI(){
 const c=conditions(),h=(state.time-localDayStart(state.time))/HOUR,storm=c.weatherCode>=95||c.rain>=1,sunset=h>17&&h<20,night=sunPosition(state.time).altitude<0;
 $('#source-label').textContent=`${weekday(state.time).toUpperCase()} · ${review?'DESIGN PREVIEW':state.data.source==='sample'?'DEMO':state.data.source==='saved'?'SAVED':'FORECAST'}`;
 $('#hero-temp').textContent=Math.round(c.temperature)+'°';$('#headline').textContent=storm?'Storms · 2–4 PM.':sunset?'Sunset · 8/10.':night?'Your beach after dark':c.wind<7?'Glassy & calm.':c.wind<14?'A little sea breeze':'Breezy on the beach';
 $('#sun-time').textContent=clock(state.time);$('#sun-handle').setAttribute('aria-valuenow',Math.round(h*60));$('#sun-handle').setAttribute('aria-valuetext',clock(state.time));
 const day=localDayStart(state.time),today=localDayStart(Date.now());$('#days').innerHTML=Array.from({length:7},(_,i)=>{const t=today+i*24*HOUR;return`<button data-day="${t}" aria-pressed="${day===t}" ${t>state.data.last?'disabled':''}>${i===0?'Today':weekday(t+12*HOUR)}</button>`;}).join('');
 $('#metrics').innerHTML=metrics().map(([key,name,v])=>`<button class="metric" data-sheet="${key}" aria-label="${name}, ${v}. Open details"><strong>${v.replace(/ (ft|kt)$/,'<em>$1</em>')}</strong><small>${name.toUpperCase()}</small></button>`).join('');
 const action=$('#moment-action'),burn=burnMinutes();action.classList.toggle('storm',storm);
 action.innerHTML=storm?`${icon('storm')}<span class="action-copy">Storm warning · Head indoors</span>`:sunset?`${icon('bell')}<span class="action-copy">Remind me at ${review?'6:25':clock((sunDay(state.time).sunset||state.time)-15*MIN)}</span>`:night?`${icon('sun')}<span class="action-copy">See tomorrow's sun</span>`:`${icon('sun')}<span class="action-copy">Tan · ${burn==null?'UV below 1':`burn in ${Math.round(burn)} min`}</span><span class="action-end">Start</span>`;
 action.dataset.action=storm?'storm':sunset?'remind':night?'tomorrow':'sun';
 if(state.sheet)renderSheet();
}
function chart(kind){
 const d=localDayStart(state.time),key={sun:'uv',water:'tide',waves:'swell',wind:'wind',air:'rainProbability'}[kind],points=Array.from({length:49},(_,i)=>{const t=d+(6+i/4)*HOUR,c=sampleAt(state.data.rows,t);return{t,v:kind==='sun'?uvFor(state.data,t).at(t):c?.[key]??0};}),values=points.map(p=>p.v),lo=kind==='water'?Math.min(...values):0,hi=Math.max(...values,lo+.1),scale=v=>57-(v-lo)/(hi-lo)*39;
 const coords=points.map((p,i)=>`${i*100/48},${scale(p.v)}`),line='M'+coords.join(' L'),area=line+' L100,70 L0,70 Z',f=clamp((state.time-d-6*HOUR)/(12*HOUR),0,1),v=kind==='sun'?uvFor(state.data,state.time).at(state.time):conditions()[key]??0,id='ribbon-'+kind;
 return`<div class="chart-wrap"><div class="chart-caption"><span>${{sun:'UV through the day',water:'Tide',waves:'Wave height',wind:'Wind through the day',air:'Rain chance'}[kind]}</span><span>${clock(state.time)}</span></div><div class="ribbon-control" role="slider" tabindex="0" aria-label="${kind} forecast time" aria-valuemin="360" aria-valuemax="1080" aria-valuenow="${Math.round((state.time-d)/MIN)}" data-ribbon="${kind}"><svg viewBox="0 0 100 70" preserveAspectRatio="none"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${kind==='sun'?'#f3a43a':'#54b6c2'}" stop-opacity=".96"/><stop offset="1" stop-color="#71daca" stop-opacity=".28"/></linearGradient></defs><path d="${area}" fill="url(#${id})"/><path d="${line}" fill="none" stroke="#f7ffed" stroke-width="1.3" vector-effect="non-scaling-stroke"/></svg><i class="chart-thumb" style="left:${f*100}%;top:${scale(v)}px"></i></div><div class="chart-hours"><span>6a</span><span>9a</span><span>12p</span><span>3p</span><span>6p</span></div></div>`;
}
function renderSheet(){
 const c=conditions(),k=state.sheet,title={air:'Sky / Air',water:'Water',waves:'Waves',wind:'Wind',sun:'Sun'}[k];
 const value=k==='sun'?`${Math.round(burnMinutes()??0)} min`:metrics().find(m=>m[0]===k)?.[2];
 const sub={air:`Feels ${Math.round(c.apparent??c.temperature)}°`,water:'Water temperature',waves:`${Math.round(c.period)} sec`,wind:`from ${compass(c.windDirection)} · Gusts ${Math.round(c.gust??c.wind)} kt`,sun:'Estimated time to burn'}[k];
 $('#sheet-content').innerHTML=`<h2 class="sheet-title">${title}</h2><p class="sheet-value">${value}</p><p class="sheet-sub">${sub}</p>${chart(k)}`;
}
function openSheet(k){state.sheet=k;$('#expanded-sheet').hidden=!k;$('#glass-dock').inert=!!k;$('#expanded-sheet').classList.toggle('sun-sheet',k==='sun');if(k)$('#app').dataset.sheet=k;else delete $('#app').dataset.sheet;state.dirty=true;}
document.addEventListener('click',e=>{
 const metric=e.target.closest('[data-sheet]');if(metric?.classList.contains('metric'))openSheet(metric.dataset.sheet);
 const day=e.target.closest('[data-day]');if(day){const h=(state.time-localDayStart(state.time));setTime(Number(day.dataset.day)+h);}
 if(e.target.closest('.grab'))openSheet(null);
 if(e.target.closest('#moment-action')){const a=$('#moment-action').dataset.action;if(a==='sun')openSheet('sun');else if(a==='tomorrow'){setTime(localDayStart(state.time)+33*HOUR);}else if(a==='remind'){notice('Sunset reminder saved on this device.');localStorage.setItem('daybuoy.sunsetReminder',String(sunDay(state.time).sunset));}else openSheet('air');}
});
document.addEventListener('keydown',e=>{if(e.key==='Escape')openSheet(null);if(e.target.matches('[role=slider]')&&['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();setTime(e.key==='Home'?localDayStart(state.time)+6*HOUR:e.key==='End'?localDayStart(state.time)+18*HOUR:state.time+(e.key==='ArrowLeft'?-15:15)*MIN);}});
let drag=null;
document.addEventListener('pointerdown',e=>{
 const ribbon=e.target.closest('[data-ribbon]'),sun=e.target.closest('#sun-handle'),grab=e.target.closest('.grab');if(!ribbon&&!sun&&!grab)return;e.preventDefault();const target=ribbon||sun||grab;target.setPointerCapture(e.pointerId);drag={type:ribbon?'ribbon':sun?'sun':'grab',rect:target.getBoundingClientRect(),x:e.clientX,y:e.clientY,time:state.time,target};if(ribbon)dragTime(e);
});
function dragTime(e){if(!drag)return;if(drag.type==='ribbon'){const f=clamp((e.clientX-drag.rect.left)/drag.rect.width,0,1);setTime(localDayStart(state.time)+(6+12*f)*HOUR);}else if(drag.type==='sun'){setTime(localDayStart(state.time)+(6+13.333*clamp((e.clientX-14)/(innerWidth-28),0,1))*HOUR);}else if(e.clientY-drag.y>45){openSheet(null);drag=null;}}
document.addEventListener('pointermove',e=>{if(drag){e.preventDefault();dragTime(e);}}, {passive:false});document.addEventListener('pointerup',()=>drag=null);document.addEventListener('pointercancel',()=>drag=null);
async function refresh(){if(review)return;try{const data=await loadForecast();if(data.source==='live'){adopt(data);saveForecast(data);}else if(state.data.source==='sample')adopt(data);}catch(e){console.warn('Forecast refresh unavailable',e);}}
function frame(now){requestAnimationFrame(frame);const dt=Math.min((now-frameTime)/1000,.05);frameTime=now;if(document.hidden)return;if(state.live)state.time=Date.now();if(!reduced){uniforms.uTime.value+=dt;uniforms.uPhase.value+=dt/Math.max(2,current.period);}applyScene(dt);if(engine)engine.render(reduced?0:dt);const minute=Math.floor(state.time/MIN);if(minute!==lastUI||state.dirty){lastUI=minute;state.dirty=false;renderUI();}if(engine)$('#loading').hidden=true;}
refresh();setInterval(refresh,15*MIN);requestAnimationFrame(frame);
if(['sun','water','waves','wind','air'].includes(q.get('sheet')))openSheet(q.get('sheet'));
window.__daybuoy={state,engine,uniforms,setTime,setHour,openSheet,conditions,refresh,reviewData,renderUI,renderForCapture(h){setHour(h);applyScene(10);renderUI();engine.render(0);}};window.__ocean=window.__daybuoy;
})();
