// Overnight Round 1: one shared time, with the approved scene left untouched.
let weekPointer=null,lastHapticHour=null,lastHapticDay=null;
const weekStart=()=>localDayStart(Date.now());
const weekEnd=()=>weekStart()+7*24*HOUR;
function selectedDayBounds(t=state.time){const start=localDayStart(t),end=localDayStart(start+36*HOUR);return{start,end,min:Math.max(start,state.data.first),max:Math.min(end-1,state.data.last)};}
function clampDay(t,bounds=selectedDayBounds()){return clamp(t,bounds.min,bounds.max);}
function selectForecastDay(day){const hour=state.time-localDayStart(state.time);if(state.playing||storyCard)stopWatch(false);cancelTimeMotion();clearUserView();state.storyEndPose=null;setDragQuality(false);setTime(clampDay(day+hour,selectedDayBounds(day)));setSkyView(true);setSkyView(false);hapticTime(state.time);}

function realForecast(){return ['live','saved'].includes(state.data.source)&&Date.now()-state.data.retrievedAt<24*HOUR;}
function smallClock(t){return clock(t).replace(' AM','a').replace(' PM','p').replace('am','a').replace('pm','p').replace(/\s/g,'');}
function hapticTime(t){
 const hour=Math.floor(t/HOUR),day=localDayStart(t);if(lastHapticHour!==null&&hour!==lastHapticHour){
  const strong=day!==lastHapticDay;
  // Native shells may provide this bridge. Safari without it stays silent.
  if(window.webkit?.messageHandlers?.daybuoyHaptic)window.webkit.messageHandlers.daybuoyHaptic.postMessage({kind:strong?'day':'hour'});
  else navigator.vibrate?.(strong?[12,20,12]:7);
 }
 lastHapticHour=hour;lastHapticDay=day;
}
function backToNow(){cancelTimeMotion();if(state.playing||storyCard)stopWatch(true);openSheet(null);state.manualShear=HOME_LENS_SHIFT;setDockCompact(false);state.timeCameraHeld=false;state.skyView=false;state.storyEndPose=null;resetBeach();beginBeachReturn();setTime(Date.now(),{live:true});state.scrubbing=false;state.dirty=true;}
function initWeekScrubber(){
 const control=$('#week-scrubber');if(control.dataset.ready==='true')return;control.dataset.ready='true';
 $('#back-to-now').addEventListener('click',backToNow);
 control.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();e.stopPropagation();if(control.getAttribute('aria-disabled')==='true')return;cancelTimeMotion();const b=selectedDayBounds(),raw=e.key==='Home'?b.min:e.key==='End'?b.max:state.time+(e.key==='ArrowLeft'?-1:1)*HOUR;setTime(clampDay(raw,b));setSkyView(true);setSkyView(false);if(raw<b.min||raw>b.max)timeHaptic('boundary');hapticTime(state.time);});
}

function scrubWeek(x){const r=$('#week-scrubber').getBoundingClientRect(),b=selectedDayBounds(),f=clamp((x-r.left)/r.width,0,1);setTime(clampDay(Math.round((b.start+f*(b.end-b.start))/MIN)*MIN,b));hapticTime(state.time);}
function renderOvernight(){
 initWeekScrubber();const bounds=selectedDayBounds(),start=bounds.start,span=bounds.end-start,control=$('#week-scrubber'),key=start+':'+state.version;
 if(control.dataset.weekKey!==key){control.dataset.weekKey=key;const sun=sunDay(start+12*HOUR),pct=t=>clamp((t-start)/span*100,0,100),rise=pct(sun.sunrise),set=pct(sun.sunset);
  control.querySelector('.week-track').style.background=`linear-gradient(90deg,rgba(22,57,77,.14) 0% ${rise}%,var(--sun) ${rise}% ${set}%,rgba(22,57,77,.14) ${set}% 100%)`;
  const rows=state.data.rows.filter(r=>r.time>=start&&r.time<bounds.end&&Number.isFinite(r.uv)),peak=rows.reduce((a,b)=>!a||b.uv>a.uv?b:a,null);
  control.querySelector('.day-marks').innerHTML=[[sun.sunrise,'Sunrise'],[peak?.uv>0?peak.time:null,'Peak UV'],[sun.sunset,'Sunset']].filter(([t])=>Number.isFinite(t)).map(([t,label])=>`<i title="${label} ${clock(t)}" style="left:${pct(t)}%"></i>`).join('');
 }
 control.style.setProperty('--selected',clamp((state.time-start)/span*100,0,100)+'%');control.style.setProperty('--now',clamp((Date.now()-start)/span*100,0,100)+'%');control.querySelector('.week-now').hidden=start!==localDayStart(Date.now());
 control.dataset.selectedDay=String(start);control.setAttribute('aria-label',weekday(state.time)+', midnight to midnight');
 control.setAttribute('aria-valuemin',bounds.min);control.setAttribute('aria-valuemax',bounds.max);control.setAttribute('aria-valuenow',state.time);control.setAttribute('aria-valuetext',weekday(state.time)+' '+clock(state.time));
 $('#back-to-now').hidden=state.live||state.playing&&!state.paused;$('#app').dataset.scrubbing=String(!!state.scrubbing);
 // Day names are stable. Selected time lives in the header and drag tooltip.
 renderTimeReadout();
 renderSheetPeek();
 renderStory();
 renderNight();
 // Never present the old generated sample as a measured forecast.
 $('#app').dataset.forecastAvailable=String(realForecast());
 if(!realForecast()){$('#hero-temp').textContent='—';$('#headline').textContent='Forecast unavailable';for(const e of document.querySelectorAll('.metric strong'))e.textContent='—';for(const e of document.querySelectorAll('.metric .meaning'))e.textContent='Unavailable';$('#moment-action .action-copy').textContent='Forecast unavailable';if(state.sheet)$('#sheet-content').innerHTML='<h2 class="sheet-title">Forecast unavailable</h2><p>Check your connection and try again.</p>';}
}
// Round 2: selected forecast time is the single source for every readout.
function hourVerdict(){
 const c=conditions(),sun=sunDay(state.time),uv=forecastUV(state.time),burn=burnMinutes();
 if(isStorm(c))return `${c.weatherCode>=95?'Storms':'Rain'} ${stormWindow()} · plan indoors`;
 if(sun.sunset&&state.time>=sun.sunset-90*MIN&&state.time<=sun.sunset+20*MIN){const score=sunsetFor(state.data,state.time).score?.score;return `${Number.isFinite(score)?'Sunset outlook '+Math.round(score)+'/10':'Sunset '+clock(sun.sunset)} · arrive ${clock(sun.sunset-20*MIN)}`;}
 if(sunPosition(state.time).altitude<0)return `${c.cloud<25?'Clear':c.cloud<65?'Partly cloudy':'Cloudy'} night · Moon ${Math.round(moonPhase(state.time).fraction*100)}%`;
 if(uv!=null&&uv>=3)return `Strong sun · ${Number.isFinite(burn)?'est. burn '+Math.round(burn)+' min':'use sun protection'}`;
 if(c.rainProbability>=50)return `Rain ${Math.round(c.rainProbability)}% · bring a rain plan`;
 if(c.swell>=3||c.wind>=15)return `Choppy water · ${c.swell.toFixed(1)} ft · check flags`;
 return Number.isFinite(c.sst)?`Beach time · water ${Math.round(cToF(c.sst))}° · check flags`:'Beach time · check beach flags';
}
function renderTimeReadout(){
 const c=conditions(),active=!!state.scrubbing||exploreGesture?.kind==='arc'||drag?.type==='sun'||drag?.type==='ribbon';
 $('#app').dataset.scrubbing=String(active);
 $('#app').dataset.timeHeld=String(!!state.timeCameraHeld);
 $('#source-label').textContent=state.live?'Inlet Beach':`${weekday(state.time)} · ${clock(state.time)}`;
 $('#source-label').dataset.live=String(state.live&&realForecast());
 const air=$('[data-sheet="air"] .meaning');if(air)air.textContent=Number.isFinite(c.rainProbability)?`${Math.round(c.rainProbability)}% rain`:'—';
 const uv=forecastUV(state.time),label=$('[data-sheet="sun"] small');if(label){const dot=document.createElement('i');dot.className='uv-dot';dot.style.background=uvColour(uv);dot.setAttribute('aria-hidden','true');label.prepend(dot);}
 if(realForecast()){$('#moment-action .action-copy').textContent=hourVerdict();$('#moment-action').dataset.action=isStorm(c)?'storm':'sun';}
}
window.__overnight={backToNow,scrubWeek,realForecast};
// Round 3: sheet gestures retain a usable scene and never reset time.
let sheetGesture=null,peekKind=null;
function renderSheetPeek(){
 const el=$('#expanded-sheet');if(!state.sheet)peekKind=null;
 el.classList.toggle('peek',!!state.sheet&&peekKind===state.sheet);
 if(state.sheet&&!$('#sheet-peek-line')){const line=document.createElement('p');line.id='sheet-peek-line';line.textContent=sheetPeekAnswer(state.sheet);$('.sheet-title')?.after(line);}
}
document.addEventListener('pointerdown',e=>{
 if(!state.sheet||!e.target.closest('#expanded-sheet'))return;
 if(e.target.closest('.forecast-method'))return; // Reading a method may scroll; it never scrubs time.
 sheetGesture={id:e.pointerId,x:e.clientX,y:e.clientY,peek:peekKind===state.sheet,grab:!!e.target.closest('.grab'),moved:false};
 if(sheetGesture.peek&&sheetGesture.grab){e.preventDefault();e.stopImmediatePropagation();$('#expanded-sheet').setPointerCapture(e.pointerId);}
},true);
document.addEventListener('pointermove',e=>{
 const g=sheetGesture;if(!g||e.pointerId!==g.id)return;
 const dy=e.clientY-g.y;if(Math.hypot(e.clientX-g.x,dy)<6)return;g.moved=true;
 if(g.peek&&dy<-32){peekKind=null;state.dirty=true;}
 else if(!g.peek){peekKind=state.sheet;state.dirty=true;}
},true);
document.addEventListener('pointerup',()=>{if(sheetGesture?.moved)ignoreClickUntil=performance.now()+400;sheetGesture=null;},true);
document.addEventListener('pointercancel',()=>{sheetGesture=null;},true);
// Round 7: the same astronomy powers both the sky and its night readout.
let nightDay=null,nightEvents=[],seaCardOpen=false,boPress=null,intro=null,introChecked=false;
function nightInfo(t=state.time){
 const d=localDayStart(t);if(nightDay!==d){nightDay=d;nightEvents=__mods['astro.js'].moonEvents(d,d+3*24*HOUR);}
 const today=sunDay(t),rise=nightEvents.find(e=>e.rising&&e.time>t),next=today.sunrise>t?today.sunrise:sunDay(d+36*HOUR).sunrise,m=moonPosition(t),ph=moonPhase(t),c=sampleAt(state.data.rows,t),covered=Math.max(c?.cloudLow||0,c?.cloudMid||0)>=85;
 return{rise:rise?.time??null,sunrise:next,moon:m,fraction:ph.fraction,description:m.altitude<=0?'Below the horizon':covered?'Above the horizon · clouded over':'Above the horizon toward '+compass(m.azimuth)};
}
function renderNight(){
 const night=sunPosition(state.time).altitude<0;$('#app').dataset.night=String(night);
 if(state.sheet==='sun'&&!night&&!$('#lunar-details')){const n=nightInfo(),info=document.createElement('section');info.id='lunar-details';info.innerHTML=`<h3>Your night sky</h3><p>Moon ${Math.round(n.fraction*100)}% illuminated · ${n.description.toLowerCase()}</p><p>${n.rise?'Next moonrise '+weekday(n.rise)+' · '+clock(n.rise):'No moonrise in the next three days'}<br>Next sunrise ${clock(n.sunrise)}</p>`;$('#sheet-content').append(info);}
 let card=$('#sea-card');if(!card){card=document.createElement('section');card.id='sea-card';card.className='glass';$('#app').append(card);}
 card.hidden=!seaCardOpen;if(seaCardOpen){const c=conditions(),fmt=(v,unit,places=0)=>Number.isFinite(v)?v.toFixed(places)+unit:'Unavailable';card.innerHTML=`<button class="sea-close" aria-label="Close sea card">×</button><h2>Sea report</h2><p>${weekday(state.time)} · ${clock(state.time)}</p><div class="sea-values"><div><strong>${fmt(c.swell,' ft',1)}</strong><small>Waves</small></div><div><strong>${fmt(c.period,' s',1)}</strong><small>Period</small></div><div><strong>${fmt(Number.isFinite(c.sst)?cToF(c.sst):null,'°')}</strong><small>Water</small></div><div><strong>${fmt(Number.isFinite(c.tide)?c.tide*FT:null,' ft',1)}</strong><small>Tide · MSL</small></div></div><p class="sea-source">Marine forecast · NOAA 8729210 tide prediction</p>`;}
}
function openSeaCard(){if(!realForecast()){notice('Sea forecast unavailable.');return;}seaCardOpen=true;state.dirty=true;}
document.addEventListener('click',e=>{if(e.target.closest('.sea-close')){seaCardOpen=false;state.dirty=true;}});
function updateIntro(){
 if(!introChecked&&realForecast()){
  introChecked=true;let seen=false;try{seen=localStorage.getItem('daybuoy.welcomed')==='1';}catch{}
  if(!seen&&!q.has('hour')&&!q.has('t')&&!review){const end=state.time;intro={start:performance.now(),sunrise:sunDay(end).sunrise,end,live:state.live};const el=document.createElement('div');el.id='welcome-line';el.textContent='See your beach before you go.';$('#app').append(el);$('#app').classList.add('first-open');state.live=false;try{localStorage.setItem('daybuoy.welcomed','1');}catch{}}
 }
 if(intro){const f=reduced?1:clamp((performance.now()-intro.start)/2600,0,1);setTime(mix(intro.sunrise,intro.end,f*f*(3-2*f)));if(f>=1){state.live=intro.live;intro=null;$('#welcome-line')?.remove();$('#app').classList.remove('first-open');}}
}
window.__overnight.openSeaCard=openSeaCard;window.__overnight.nightInfo=nightInfo;
