// v1 product layer. The approved renderer, camera and gesture sources stay pinned.
// Loaded after their definitions and before the first forecast request / frame.
const releaseBase={parseSurfProduct,renderSheet,renderPresentation,forecastMethod,buildStory,storySummary,refresh};
let ripFeedFailed=false,releaseReady=false;
const releaseStamp=t=>new Intl.DateTimeFormat('en-US',{timeZone:SITE.zone,month:'short',day:'numeric',hour:'numeric',minute:'2-digit',timeZoneName:'short'}).format(t);
const releaseReport=(source,code)=>window.dispatchEvent?.(new CustomEvent('daybuoy:diagnostic',{detail:{source,code}}));
function validRipCache(v,now=Date.now()){
 return v?.zone===SURF_ZONE&&Number.isFinite(v.issued)&&v.issued<=now+5*MIN&&now-v.issued<7*24*HOUR&&Array.isArray(v.periods)&&v.periods.length>0&&v.periods.every(p=>Number.isFinite(p.start)&&Number.isFinite(p.end)&&p.end>p.start&&['Low','Moderate','High'].includes(p.risk));
}
try{const cached=JSON.parse(localStorage.getItem('daybuoy.nws-surf')||'null');if(validRipCache(cached))surfForecast=cached;}catch{}
parseSurfProduct=function(product,now=Date.now()){
 // NWS holidays replace weekday headings. Infer only an isolated day bounded
 // by dated neighbours (e.g. Sunday / COLUMBUS DAY / Tuesday); never guess risk.
 const weekdays=['SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'];
 const issued=Date.parse(product.issuanceTime);if(!Number.isFinite(issued))throw Error('Invalid NWS issue time');
 const base=weekdays.indexOf(new Intl.DateTimeFormat('en-US',{timeZone:SITE.zone,weekday:'long'}).format(issued).toUpperCase());
 let text=String(product.productText||'').replace(/\r/g,'');
 const headers=[...text.matchAll(/^\.([A-Z][A-Z '’-]*)\.\.\./gm)];
 const offset=name=>/^(TODAY|REST OF TODAY|THIS AFTERNOON|THIS MORNING|TONIGHT)$/.test(name)?0:weekdays.some(d=>name.startsWith(d))?(weekdays.findIndex(d=>name.startsWith(d))-base+7)%7:null;
 for(let i=headers.length-2;i>0;i--){
  const h=headers[i];if(offset(h[1])!==null||h[1].includes('NIGHT'))continue;
  const before=offset(headers[i-1][1]),after=offset(headers[i+1][1]);
  if(before!==null&&after===before+2){const name=weekdays[(base+before+1)%7];text=text.slice(0,h.index)+'.'+name+'...'+text.slice(h.index+h[0].length);}
 }
 return releaseBase.parseSurfProduct({...product,productText:text},now);
};
loadRipForecast=async function(){
 if(Date.now()-surfRequestedAt<15*MIN)return;surfRequestedAt=Date.now();
 try{
  const get=async url=>{const r=await fetch(url,{headers:{Accept:'application/ld+json'},signal:AbortSignal.timeout(14000)});if(!r.ok)throw Error('NWS HTTP '+r.status);return r.json();};
  const list=await get('https://api.weather.gov/products/types/SRF/locations/TAE');
  const candidates=(list['@graph']||[]).filter(p=>p.productCode==='SRF'&&/^https:\/\/api\.weather\.gov\/products\/[a-f0-9-]+$/.test(p['@id'])&&Date.now()-Date.parse(p.issuanceTime)<30*HOUR).sort((a,b)=>Date.parse(b.issuanceTime)-Date.parse(a.issuanceTime)).slice(0,3);
  let result;for(const p of candidates){try{result=parseSurfProduct(await get(p['@id']));break;}catch{}}
  if(!result)throw Error('No current South Walton forecast');
  surfForecast=result;ripFeedFailed=false;
  try{localStorage.setItem('daybuoy.nws-surf',JSON.stringify(result));}catch{}
 }catch{ripFeedFailed=true;releaseReport('nws-surf','refresh-failed');}
 state.dirty=true;
};
ripRiskAt=function(t){
 if(!validRipCache(surfForecast)||Date.now()-surfForecast.issued>30*HOUR)return null;
 return surfForecast.periods.filter(p=>t>=p.start&&t<p.end).sort((a,b)=>(a.end-a.start)-(b.end-b.start))[0]??null;
};
function releaseRipDetail(){
 const current=ripRiskAt(state.time),cached=validRipCache(surfForecast);
 const last=cached?[...surfForecast.periods].filter(p=>p.start<=Date.now()).sort((a,b)=>b.start-a.start)[0]:null;
 const stamp=cached?'Issued '+releaseStamp(surfForecast.issued):'';
 if(current)return {risk:current.risk,high:current.risk==='High',label:'Rip current: '+current.risk+' · NWS',detail:(ripFeedFailed?'Refresh unavailable · cached report. ':'')+stamp};
 return {risk:null,high:false,label:'Rip current: Unavailable · NWS',detail:last?'Last report: '+last.risk+' · '+stamp+'. Not current for the selected time.':'No NWS report for the selected time.'};
}
ripRiskRow=function(){const r=releaseRipDetail();return `<a class="rip-row" href="${SURF_URL}" target="_blank" rel="noopener"><span>${textHTML(r.label)}<small>${textHTML(r.detail)}</small></span><strong>↗</strong></a>`;};
beachAnswer=function(){
 const c=conditions(),d=conditionDescription(c);
 if(!realForecast())return {title:'Forecast unavailable',detail:'No current forecast',action:'retry',cta:'Retry forecast',hazard:false};
 return {title:d.title,detail:[Number.isFinite(c.wind)?Math.round(c.wind)+' kt wind':null,Number.isFinite(c.period)?Math.round(c.period)+' s period':null].filter(Boolean).join(' · '),action:isStorm(c)?'air':'water',cta:isStorm(c)?'Rain forecast':'Water conditions',hazard:c.weatherCode>=95};
};
referenceAction=function(a){
 if(!realForecast())return {html:'Retry forecast',action:'retry'};
 const c=conditions();if(c.weatherCode>=95)return {html:'Thunderstorm forecast',action:'air'};if(isStorm(c))return {html:'Rain forecast',action:'air'};
 if(sunPosition(state.time).altitude<0)return {html:'Tonight’s sky',action:'sun'};
 return {html:textHTML(a.cta),action:a.action};
};
sunOutlook=function(){const s=sunDay(state.time);return `<div class="sun-outlook"><div>Sunrise<strong>${Number.isFinite(s.sunrise)?clock(s.sunrise):'—'}</strong></div><div>Sunset<strong>${Number.isFinite(s.sunset)?clock(s.sunset):'—'}</strong></div></div>`;};
forecastMethod=function(k){
 if(k!=='sun')return releaseBase.forecastMethod(k).replace('assets/licenses/index.html','/credits.html');
 const heading=((SITE.facing+(state.cameraYaw||0)/RAD)%360+360)%360;
 return `<details class="forecast-method" data-method="sun" ${state.openMethod==='sun'?'open':''}><summary>Sources & sun position</summary><p>UV is an Open-Meteo forecast. Sunrise, sunset and the sun’s position use NOAA solar calculations for Inlet Beach. View bearing ${Math.round(heading)}° · ${compass(heading)}.</p><p>The session timer measures elapsed time only.</p><p><a href="https://open-meteo.com/en/docs" target="_blank" rel="noopener">Forecast source ↗</a></p></details>`;
};
renderSheet=function(){
 if(state.sheet!=='sun'||sunPosition(state.time).altitude<0){releaseBase.renderSheet();if(state.sheet==='water'){const verdict=$('.water-verdict');if(verdict)verdict.outerHTML=ripRiskRow();}return;}
 const active=document.activeElement?.dataset.ribbon,uv=forecastUV(state.time),elapsed=state.tanStarted?Math.floor((Date.now()-state.tanStarted)/MIN):0;
 $('#sheet-content').innerHTML=`<h2 class="sheet-title">Sun</h2><div class="sun-answer">UV <b>${Number.isFinite(uv)?uv.toFixed(1):'—'}</b><small>forecast at ${clock(state.time)}</small></div>${chart('sun')}${sunOutlook()}<button class="amber-action" data-start-tan><span>${state.tanStarted?'Session '+elapsed+' min · Stop':'Start session timer'}</span></button>`;
 if(active==='sun'&&!drag)$('[data-ribbon="sun"]')?.focus({preventScroll:true});
};
buildStory=function(){return releaseBase.buildStory().map(m=>({...m,detail:m.kind==='uv'?'UV forecast':m.kind==='sunset'?'Sunset at '+clock(m.time):m.kind==='water'?conditionDescription(sampleAt(state.data.rows,m.time)).title:m.detail}));};
storySummary=function(day){return releaseBase.storySummary(day).replace(/ · sunset \d+\/10 est\.$/,'');};
renderPresentation=function(){
 releaseBase.renderPresentation();
 const r=releaseRipDetail(),detail=$('#story-detail');let chip=$('#release-rip-chip');
 if(!chip){chip=document.createElement('button');chip.id='release-rip-chip';chip.className='release-rip-chip';chip.addEventListener('click',()=>openSheet('water'));detail.after(chip);}
 chip.hidden=!r.high||!realForecast();chip.textContent='High rip-current risk · NWS';chip.setAttribute('aria-label',r.label+'. Open Water details');
 // Ten-Hz text updates accompany the existing per-frame sun/tide/wave response.
 // No new animation loop, particle system, shader, or camera movement.
 if(state.scrubbing&&realForecast()){
  const c=conditions();detail.textContent=clock(state.time)+' · '+beachAnswer().detail+(Number.isFinite(c.tide)?' · Tide '+(c.tide*FT).toFixed(1)+' ft':'')+'\nForecast updated '+releaseStamp(state.data.retrievedAt);
 }
 $('#app').classList.toggle('release-scrubbing',!!state.scrubbing);
 if(state.sheet){const el=$('#sheet-content');if(!el.querySelector('[data-legal]'))el.insertAdjacentHTML('beforeend','<p data-legal><a href="/privacy.html" target="_blank" rel="noopener">Privacy</a> · <a href="/credits.html" target="_blank" rel="noopener">Credits</a></p>');}
 if(!releaseReady){releaseReady=true;window.dispatchEvent?.(new Event('daybuoy:ready'));}
};
refresh=async function(){
 await releaseBase.refresh();
 if(state.forecastFailed)releaseReport('forecast','refresh-failed');
 for(const [source,status]of Object.entries(state.data.feedStatus||{}))if(status==='rejected')releaseReport(source,'refresh-failed');
};
window.addEventListener('daybuoy:now',()=>{stopWatch(true);backToNow();});
// Startup acknowledgement comes from the first completed UI render above.
