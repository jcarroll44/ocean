// Presentation and copy only. No scene uniforms, camera targets or gestures.
const textHTML=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function beachAnswer(){
 const c=conditions(),s=sunDay(state.time),uv=forecastUV(state.time),risk=ripRiskAt(state.time)?.risk;
 const answer=(title,detail,action,cta,hazard=false)=>({title,detail,action,cta,hazard});
 if(!realForecast())return answer('Your forecast is taking a break.','Reconnect to update your beach','retry','Try again');
 if(c.weatherCode>=95)return answer('Thunderstorms. Head indoors.',stormWindow(),'air','See the rain window',true);
 if(risk==='High')return answer('High rip risk. Stay ashore.','NWS · South Walton','water','Check water conditions',true);
 if(isStorm(c))return answer('Showers moving through.',stormWindow(),'air','See the rain window');
 if(risk==='Moderate')return answer('Moderate rip risk. Use caution.','NWS · South Walton','water','Check water conditions');
 if(state.time>=s.sunset-90*MIN&&state.time<=s.sunset+20*MIN){const score=sunsetFor(state.data,state.time).score?.score;return answer('Catch the last light.',Number.isFinite(score)?`Sunset ${Math.round(score)}/10 est. · ${clock(s.sunset)}`:`Sunset ${clock(s.sunset)}`,'sun','See the sunset outlook');}
 if(sunPosition(state.time).altitude<0){const n=nightInfo(),rough=c.wind>=15||c.swell>=3;return answer(rough?'Windy night on the Gulf.':c.cloud>=80?'Clouds over the coast.':'A little time by the water.',rough?`${Math.round(c.wind)} kt wind · ${c.swell.toFixed(1)} ft waves`:n.moon.altitude>0?`Moon ${Math.round(n.fraction*100)}% · ${n.description.toLowerCase()}`:n.rise?`Moonrise ${clock(n.rise)}`:`Sunrise ${clock(n.sunrise)}`,rough?'water':'sun',rough?'See the sea outlook':'See tonight’s sky');}
 if(c.swell>=3||c.wind>=15)return answer('Choppy water. Check the flags.',`${c.swell.toFixed(1)} ft waves · ${Math.round(c.wind)} kt wind`,'water','Check water conditions');
 if(Number.isFinite(uv)&&uv>=3){const burn=burnMinutes();return answer(uv>=6?'Strong sun. Make room for shade.':'Sun’s out. Bring your shade.',Number.isFinite(burn)?`UV ${Math.round(uv)} · burn ${Math.round(burn)} min est.`:`UV ${Math.round(uv)} · use sun protection`,'sun','See your sun outlook');}
 if(c.rainProbability>=50)return answer('Keep a rain plan.',`${Math.round(c.rainProbability)}% rain chance`,'air','See when it clears');
 if(c.cloud>=80)return answer('Soft light. A slower beach day.',Number.isFinite(c.sst)?`Water ${Math.round(cToF(c.sst))}° · check flags`:'Check posted beach flags','water','Explore the water');
 return answer(c.wind<7&&c.swell<2?'Easy breeze. Beach time.':'A sea breeze on the sand.',Number.isFinite(c.sst)?`Water ${Math.round(cToF(c.sst))}° · check flags`:'Check posted beach flags','water','Explore the water');
}
function sheetPeekAnswer(k){
 const c=conditions(),uv=forecastUV(state.time),value=(v,unit)=>Number.isFinite(v)?`${Math.round(v)}${unit}`:'—';
 return {water:Number.isFinite(c.tide)?`Tide ${ (c.tide*FT).toFixed(1)} ft · mean sea level`:'Tide forecast not available',waves:Number.isFinite(c.swell)?`${c.swell.toFixed(1)} ft · ${value(c.period,' s')} period`:'Wave forecast not available',wind:`${value(c.wind,' kt')} · from ${Number.isFinite(c.windDirection)?compass(c.windDirection):'—'}`,air:`${value(c.rainProbability,'%')} rain chance`,sun:sunPosition(state.time).altitude<0?`Moon ${Math.round(moonPhase(state.time).fraction*100)}% illuminated`:`UV ${value(uv,'')} · ${uv>=3?'bring sun protection':'lower UV'}`}[k]||'';
}
function forecastMethod(k){
 const stamp=Number.isFinite(state.data.retrievedAt)?`${weekday(state.data.retrievedAt)} · ${clock(state.data.retrievedAt)}`:'unknown';
 let body=`<p>Forecast retrieved ${textHTML(stamp)}. Times are local to Inlet Beach.</p>`;
 if(k==='sun'){
  const threshold=burnThreshold(state.prefs.skin,0),heading=((SITE.facing+(state.cameraYaw||0)/RAD)%360+360)%360;
  body+=`<p><b>Burn time · estimate.</b> The app integrates forecast UV over time for unprotected skin. Current skin setting: ${state.prefs.skin}; model redness threshold: ${threshold} J/m². One UV-index minute contributes 1.5 J/m², multiplied by the model’s fixed 1.10 beach-reflection assumption. Cloud changes and individual response can differ. This model has not been clinically validated; individual response can differ from this estimate. SPF does not extend this displayed estimate.</p><p><b>Sun windows.</b> The lower-UV window uses daylight forecast hours with UV 1–3, rain below 0.2 mm and rain chance below 35%. It is an outlook; it does not predict individual skin response. The session budget is your chosen timer, not a forecast.</p><p><b>Sunset score · estimate.</b> DayBuoy’s own unvalidated 0–10 colour heuristic uses high/mid/low clouds, cloud and rain toward sunset, humidity, visibility and aerosols. Missing inputs use model defaults. It is not an official forecast or probability of a colourful sunset.</p><p><a href="https://open-meteo.com/en/docs" target="_blank" rel="noopener">Open-Meteo forecast inputs ↗</a> · <a href="https://www.who.int/news-room/fact-sheets/detail/ultraviolet-radiation" target="_blank" rel="noopener">WHO sun-protection guidance ↗</a></p><p>View bearing ${Math.round(heading)}° · ${compass(heading)}. Sun position follows our NOAA solar calculation.</p>`;
 }else if(k==='water')body+='<p>Water temperature: Open-Meteo marine forecast. Tide: NOAA predictions at station 8729210, relative to mean sea level; local conditions may differ. Rip risk: current NWS South Walton surf forecast, zone FLZ108. A missing or stale rip-risk feed does not imply low risk.</p><p><a href="https://open-meteo.com/en/docs/marine-weather-api" target="_blank" rel="noopener">Marine forecast ↗</a> · <a href="https://tidesandcurrents.noaa.gov/noaatidepredictions.html?id=8729210" target="_blank" rel="noopener">NOAA tides ↗</a></p>';
 else body+=`<p>${k==='waves'?'Significant wave height, period and direction come from the Open-Meteo marine forecast. Height is a modelled sea-state measure; individual breaking waves vary.':k==='wind'?'Wind and gusts come from Open-Meteo. The direction describes where the wind comes from.':'Temperature, feels-like, clouds and rain probability come from Open-Meteo.'}</p><p><a href="https://open-meteo.com/en/docs${k==='waves'?'/marine-weather-api':''}" target="_blank" rel="noopener">Forecast source ↗</a></p>`;
 if(k==='waves')body+='<p>The scene illustrates forecast conditions; it is not a measured breaking-wave simulation. <a href="assets/licenses/index.html" target="_blank" rel="noopener">Open-source credits ↗</a></p>';
 return `<details class="forecast-method" data-method="${k}" ${state.openMethod===k?'open':''}><summary>${k==='sun'?'Estimates, sources & bearing':'Sources & forecast details'}</summary>${body}</details>`;
}
function sunOutlook(){
 const sun=sunDay(state.time),score=sunsetFor(state.data,state.time).score?.score;
 const rows=state.data.rows.filter(r=>r.time>=sun.sunrise&&r.time<=sun.sunset);
 const best=forecastRuns(rows,r=>Number.isFinite(r.uv)&&r.uv>=1&&r.uv<=3&&r.rain<.2&&r.rainProbability<35).sort((a,b)=>b.length-a.length)[0];
 const window=best?.length>=2?timeRange(best[0].time,Math.min(best.at(-1).time+HOUR,sun.sunset)):'No clear window';
 return `<div class="sun-outlook"><div>Sunset · est.<strong>${Number.isFinite(score)?Math.round(score)+'/10':'—'} · ${clock(sun.sunset)}</strong></div><div>Lower UV · est.<strong>${window}</strong></div></div>`;
}
let presentationReady=false;
function initPresentation(){
 if(presentationReady)return;initHome();initWeekScrubber();presentationReady=true;
 $('#retry-forecast').addEventListener('click',retryForecast);
 $('#reference-skypill').addEventListener('click',requestSunGlance);
 document.addEventListener('toggle',e=>{if(e.target.matches?.('.forecast-method'))state.openMethod=e.target.open?e.target.dataset.method:null;},true);
 document.addEventListener('click',e=>{if(e.target.closest('.retry-forecast'))retryForecast();if(e.target.closest('.sheet-dismiss'))openSheet(null);const detail=e.target.closest('[data-water-detail]');if(detail&&['waves','wind'].includes(detail.dataset.waterDetail))openSheet(detail.dataset.waterDetail);});
 document.addEventListener('keydown',e=>{if(['Enter',' '].includes(e.key)&&e.target.matches('.db-stat,.db-day,.db-btn,.db-share')){e.preventDefault();if(e.target.getAttribute('aria-disabled')!=='true')e.target.click();}});
 for(const event of ['offline','online'])window.addEventListener(event,()=>{state.dirty=true;if(event==='online')retryForecast();});
}
async function retryForecast(){if(state.refreshing)return;state.refreshing=true;state.dirty=true;try{await refresh();}finally{state.refreshing=false;state.dirty=true;}}
function referenceVerdict(a){
 const c=conditions(),s=sunPosition(state.time),day=sunDay(state.time),risk=ripRiskAt(state.time)?.risk,uv=forecastUV(state.time);
 if(!realForecast())return 'Forecast paused.<br>Try again shortly.';
 if(c.weatherCode>=95)return 'Thunderstorms.<br>Head indoors.';
 if(risk==='High')return 'High rip risk.<br>Stay ashore.';
 if(isStorm(c))return 'Showers moving<br>through.';
 if(risk==='Moderate')return 'Rip currents.<br>Use caution.';
 if(state.time>=day.sunset-90*MIN&&state.time<=day.sunset+20*MIN)return (s.altitude>=0&&s.altitude<=6?'Golden hour.':'Sunset ahead.')+'<br>Stay for sunset.';
 if(s.altitude<0)return c.wind>=15||c.swell>=3?'Windy night.<br>Rough water.':c.cloud>=80?'Cloudy night.<br>Along the coast.':c.swell>=2||c.wind>=12?'Night on the Gulf.<br>Check the flags.':c.temperature>=70?'Warm night.<br>Calm water.':'Quiet night.<br>Calm water.';
 if(c.swell>=3||c.wind>=15)return 'Choppy water.<br>Check the flags.';
 if(uv>=6)return 'Peak sun.<br>Find some shade.';
 if(uv>=3)return 'Sun’s out.<br>Bring your shade.';
 if(c.rainProbability>=50)return 'Rain possible.<br>Have a backup.';
 return c.cloud>=80?'Soft light.<br>A quieter beach.':c.wind<7&&c.swell<2?'Easy breeze.<br>Beach time.':'A sea breeze.<br>Beach time.';
}
function referenceAction(a){
 const c=conditions(),s=sunDay(state.time),uv=forecastUV(state.time);
 if(!realForecast())return{html:'Retry forecast',action:'retry'};
 if(c.weatherCode>=95)return{html:'Head indoors · storms',action:'air'};
 if(ripRiskAt(state.time)?.risk==='High')return{html:'Stay ashore · NWS outlook',action:'water'};
 if(isStorm(c))return{html:'Rain '+textHTML(stormWindow()),action:'air'};
 if(sunPosition(state.time).altitude<0){
  const start=localDayStart(state.time+24*HOUR),rows=state.data.rows.filter(r=>r.time>=start&&r.time<start+24*HOUR&&sunPosition(r.time).altitude>0),runs=forecastRuns(rows,r=>r.rain<.2&&r.rainProbability<35&&r.weatherCode<95&&r.wind<12&&r.swell<2&&ripRiskAt(r.time)?.risk!=='High').sort((a,b)=>b.length-a.length),best=runs[0];
  if(best?.length>=2)return{html:'Tomorrow: '+textHTML(timeRange(best[0].time,best.at(-1).time+HOUR)),action:'water',time:best[0].time};
  return{html:'Tomorrow’s beach outlook',action:'water',time:Math.min(state.data.last,start+9*HOUR)};
 }
 if(state.time>=s.sunset-90*MIN&&state.time<=s.sunset+20*MIN){const score=sunsetFor(state.data,state.time).score?.score;return{html:'Sunset '+textHTML(clock(s.sunset).replace(':00',''))+(Number.isFinite(score)?`<em>${Math.round(score)}/10 est.</em>`:''),action:'sun'};}
 if(uv>=3){const rows=state.data.rows.filter(r=>r.time>=Math.max(state.time,s.sunrise)&&r.time<s.sunset),best=forecastRuns(rows,r=>r.uv>=1&&r.uv<=3&&r.rain<.2&&r.rainProbability<35).sort((a,b)=>b.length-a.length)[0];if(best?.length>=2)return{html:'Tan window '+textHTML(timeRange(best[0].time,Math.min(best.at(-1).time+HOUR,s.sunset)))+'<em>est.</em>',action:'sun'};}
 return{html:textHTML(a.cta),action:a.action};
}
function renderPresentation(){
 initPresentation();const app=$('#app'),a=beachAnswer(),c=conditions(),s=sunPosition(state.time),available=realForecast(),loading=!available&&!state.forecastLoaded||!!intro||!state.uiFontsReady;
 const offline=!loading&&(navigator.onLine===false||state.data.source==='saved'||!available||state.forecastFailed),live=!offline&&!loading&&state.live&&available&&state.data.source==='live';
 app.classList.toggle('db-offline',!!offline);app.dataset.live=String(state.live);app.dataset.connectedLive=String(live);app.dataset.forecastTime=String(state.time);app.dataset.referenceState=loading?'loading':offline?'offline':state.playing?'playing':!state.live?'selected':s.altitude<0?'night':'live';
 const sameDay=localDayStart(state.time)===localDayStart(Date.now()),label=state.live&&!offline?'Live':`${sameDay?'Today':weekday(state.time)} ${clock(state.time)}`;
 $('#source-label').textContent=loading?'Reading the Gulf…':`${label} · Inlet Beach`;
 $('#source-label').hidden=false;$('#source-label').disabled=true;
 $('#live-dot').className='db-dot '+(live?'live':'away');
 const watch=$('#watch-day'),now=$('#back-to-now'),retry=$('#retry-forecast');
 watch.hidden=loading||offline||!state.live&&!state.playing;now.hidden=loading||offline||state.live||state.playing;retry.hidden=!offline;
 now.innerHTML='<i></i>Back to now';now.setAttribute('aria-label','Back to now');
 watch.innerHTML=state.playing&&!state.paused?referenceIcons.pause:referenceIcons.play;watch.setAttribute('aria-label',state.playing?(state.paused?'Resume Watch the day':'Pause Watch the day'):'Watch the day');retry.disabled=!!state.refreshing;
 const progress=$('#story-progress');progress.hidden=!state.playing;progress.querySelector('i').style.width=clamp(state.playProgress||0,0,1)*100+'%';progress.setAttribute('aria-valuenow',String(Math.round((state.playProgress||0)*100)));
 const banner=$('#reference-banner'),stamp=Number.isFinite(state.data.retrievedAt)&&state.data.source!=='sample'?clock(state.data.retrievedAt):null;
 banner.hidden=!offline;banner.innerHTML=referenceIcons.off+`<span>${stamp?'Offline · forecast from '+textHTML(stamp):'Offline · no saved forecast'}</span>`;
 const headline=$('#headline'),detail=$('#story-detail'),temp=$('#hero-temp');
 if(!state.story){headline.innerHTML=referenceVerdict(a);detail.textContent=a.detail;}
 else{const moment=storyMoments[storyIndex];headline.innerHTML=moment?.kind==='golden'?'Golden hour.<br>Stay for sunset.':moment?.kind==='uv'?'Peak sun.<br>Find some shade.':textHTML(moment?.title||a.title);detail.textContent=moment?.detail||a.detail;}
 headline.setAttribute('aria-label',headline.innerText.replace(/\s+/g,' '));
 temp.textContent=available&&Number.isFinite(c.temperature)?Math.round(c.temperature)+'°':'—';temp.setAttribute('aria-label',available&&Number.isFinite(c.temperature)?`${Math.round(c.temperature)} degrees Fahrenheit`:'Air temperature not available');
 headline.hidden=loading;temp.parentElement.hidden=loading;detail.hidden=false;
 $('#reference-skeleton').hidden=!loading;$('#reference-wash').hidden=!loading;
 const action=referenceAction(a),button=$('#moment-action');button.dataset.action=action.action;button.dataset.jumpTime=Number.isFinite(action.time)?String(action.time):'';button.querySelector('.action-copy').innerHTML=action.html;button.setAttribute('aria-label',button.textContent);button.setAttribute('aria-disabled',String(loading));
 const sky=s.altitude< -6?'rgba(20,40,80,.06)':s.altitude<10&&state.time>sunDay(state.time).solarNoon?'rgba(230,150,80,.06)':s.altitude<10?'rgba(150,110,120,.06)':'rgba(60,130,200,.06)';$('.db-tint').style.background=sky;
 const track=$('#week-scrubber'),b=selectedDayBounds(),pos=clamp((state.time-b.start)/(b.end-b.start)*100,0,100);
 track.querySelector('.db-thumb').style.left=pos+'%';track.querySelector('.db-thumb').className='db-thumb week-sun '+(s.altitude<0?'moon':'sun');track.querySelector('.db-nowtick').style.left=clamp((Date.now()-b.start)/(b.end-b.start)*100,0,100)+'%';
 if(loading){
  $('#metrics').innerHTML=Array.from({length:5},()=>'<div class="db-stat" style="display:grid;place-items:center"><div class="db-skel" style="width:40px;height:28px"></div></div>').join('');
  $('#days').innerHTML=Array.from({length:7},()=>'<div class="db-day"><div class="db-skel" style="width:32px;height:26px"></div></div>').join('');
  track.querySelector('.db-line').style.background='rgba(22,57,77,.12)';button.querySelector('.action-copy').textContent='Checking conditions…';
 }
 for(const el of track.querySelectorAll('.db-tick,.db-thumb,.db-nowtick'))el.hidden=loading||el.classList.contains('db-nowtick')&&!sameDay;
 button.style.opacity=loading?'.45':'';$('#share-scene').style.opacity=loading?'.5':'';$('#share-scene').setAttribute('aria-disabled',String(loading));track.setAttribute('aria-disabled',String(loading));
 if(state.sheet&&available){const el=$('#sheet-content');if(!el.querySelector('.forecast-method'))el.insertAdjacentHTML('beforeend',forecastMethod(state.sheet));const peek=$('#sheet-peek-line');if(peek)peek.textContent=sheetPeekAnswer(state.sheet);}
}
function updateReferenceSkyPill(){
 const pill=$('#reference-skypill');if(!engine||!sunMesh){pill.hidden=true;return;}
 const point=project(sunMesh.position),head=$('#hero').getBoundingClientRect(),visible=sunEl>50&&sunMesh.visible&&point.visible&&point.x>12&&point.x<innerWidth-12&&point.y>0&&point.y<innerHeight*.38&&point.y+32>head.bottom+8&&!state.sheet&&!state.scrubbing&&realForecast();
 pill.hidden=!visible;if(!visible)return;
 pill.textContent=`☀ ${Math.round(sunEl)}° up · above you`;pill.style.left=clamp(point.x,92,innerWidth-92)+'px';pill.style.top=(point.y+32)+'px';
}
