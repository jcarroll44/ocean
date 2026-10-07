function uvNow(t=state.time){return review?(sampleAt(state.data.rows,t)?.uv??0):uvFor(state.data,t).at(t);}
function chart(kind){
 const d=localDayStart(state.time),key={sun:'uv',water:'tide',waves:'swell',wind:'wind',air:'rainProbability'}[kind];
 const points=Array.from({length:97},(_,i)=>{const t=d+(i/4)*HOUR;return {t,v:kind==='sun'?uvNow(t):sampleAt(state.data.rows,t)?.[key]};});
 if(points.some(p=>!Number.isFinite(p.v)))return `<div class="chart-wrap"><div class="ribbon-control" role="slider" tabindex="0" aria-label="${kind} forecast time" data-ribbon="${kind}"><div class="chart-caption"><span>${kind==='water'?'Tide':kind} data unavailable</span><span>${clock(state.time)}</span></div></div><div class="chart-hours"><span>6a</span><span>12p</span><span>8p</span></div></div>`;
 const values=points.map(p=>p.v),lo=kind==='water'?Math.min(...values):0,hi=Math.max(...values,lo+.1),scale=v=>67-(v-lo)/(hi-lo)*39;
 const coords=points.map((p,i)=>({x:4+i*92/96,y:scale(p.v)}));let line=`M${coords[0].x},${coords[0].y}`;
 for(let i=1;i<coords.length;i++){const a=coords[Math.max(0,i-2)],b=coords[i-1],c=coords[i],d=coords[Math.min(coords.length-1,i+1)];line+=` C${b.x+(c.x-a.x)/6},${b.y+(c.y-a.y)/6} ${c.x-(d.x-b.x)/6},${c.y-(d.y-b.y)/6} ${c.x},${c.y}`;}
 const area=line+' L100,84 L0,84 Z';
 const f=clamp((state.time-d)/(24*HOUR),0,1),v=kind==='sun'?uvNow():conditions()[key]??0,id='ribbon-'+kind;
 const warm=kind==='sun'||kind==='wind',peak=warm?'#ffb120':'#36a9d4';
 const title={sun:'UV',water:'Tide',waves:'Wave height',wind:'Wind through the day',air:'Rain chance'}[kind];
 const hint=clock(state.time);
 const minIndex=values.indexOf(Math.min(...values)),maxIndex=values.indexOf(Math.max(...values));
 const marks=kind==='water'?`<span class="curve-mark" style="left:${clamp(4+minIndex*92/96,12,83)}%;top:51px">Low</span><span class="curve-mark" style="left:${clamp(4+maxIndex*92/96,16,83)}%;top:31px">High</span>`:'';
 return `<div class="chart-wrap"><div class="ribbon-control ${kind}" role="slider" tabindex="0" aria-label="${kind} forecast time" aria-valuemin="0" aria-valuemax="1440" aria-valuenow="${Math.round((state.time-d)/MIN)}" aria-valuetext="${clock(state.time)}" data-ribbon="${kind}">
 <div class="chart-caption"><span>${title}</span><span>${hint}</span></div>
 <svg viewBox="0 0 100 84" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#79d8c2"/><stop offset=".28" stop-color="${peak}"/><stop offset=".62" stop-color="${peak}"/><stop offset="1" stop-color="#80dacc"/></linearGradient><linearGradient id="${id}-fade" x2="0" y2="1"><stop stop-color="white"/><stop offset="1" stop-color="#ffffff40"/></linearGradient><mask id="${id}-mask"><rect width="100" height="84" fill="url(#${id}-fade)"/></mask></defs>${kind==='sun'?'<rect x="23" y="0" width="14" height="84" fill="#ffda72" opacity=".22"/>':''}<path d="${area}" fill="url(#${id})" mask="url(#${id}-mask)"/><path d="${line}" fill="none" stroke="#f8fff2" stroke-width="2" vector-effect="non-scaling-stroke"/></svg>
 ${marks}<i class="chart-thumb sun-orb" style="left:${4+f*92}%;top:${scale(v)/84*100}%"></i></div><div class="chart-hours"><span>12a</span><span>6a</span><span>12p</span><span>6p</span><span>12a</span></div></div>`;
}
function weatherIcon(c){
 const rain=c.rain>0.5,cloud=c.cloud>40;
 return `<svg class="weather-glyph" viewBox="0 0 48 42" fill="none" aria-hidden="true"><defs><linearGradient id="cloud-glass" x2="0" y2="1"><stop stop-color="#edfaff"/><stop offset="1" stop-color="#78b0c5"/></linearGradient></defs>${!cloud?'<g stroke="#eba92d" stroke-width="2" stroke-linecap="round"><circle cx="15" cy="15" r="7" fill="#ffc74b"/><path d="M15 3V1m0 28v-2M3 15H1m28 0h-2M6 6 4 4m20 20 2 2M6 24l-2 2M24 6l2-2"/></g>':''}<path d="M14 31a8 8 0 0 1-1-16 10 10 0 0 1 18-2 9 9 0 1 1 3 18z" fill="url(#cloud-glass)" stroke="#246179" stroke-width="1.8"/>${rain?'<path d="m16 35-2 3m10-3-2 3m10-3-2 3" stroke="#33a9d1" stroke-width="2.7" stroke-linecap="round"/>':''}</svg>`;
}
function renderSheet(){
 const c=conditions(),k=state.sheet,active=document.activeElement?.dataset.ribbon;
 const night=sunPosition(state.time).altitude<0,title={air:'Air & rain',water:'Water',waves:'Waves',wind:'Wind',sun:night?'Sun & Moon':'Sun'}[k];
 let main='',footer='';
 if(k==='sun'&&night){
  const n=nightInfo(),event=(time,label)=>`<button class="mini-glass" data-hour-time="${time}" ${!Number.isFinite(time)||time>state.data.last?'disabled':''}><span>${label}</span><strong>${Number.isFinite(time)?clock(time):'—'}</strong><small>${Number.isFinite(time)?weekday(time):'No rise in the next three days'} ↗</small></button>`;
  main=`<div class="moon-answer"><strong>${Math.round(n.fraction*100)}<em>%</em></strong><span>Moon illuminated</span></div><p class="moon-description">${n.description}</p>`;
  footer=`<div class="night-events">${event(n.rise,'Next moonrise')}${event(n.sunrise,'Next sunrise')}</div><p class="night-note">The sky follows the real phase, position and forecast clouds.</p>`;
 } else if(k==='sun'){
  const burn=burnMinutes(),burnText=burn==null?'No burn-time estimate':`Est. burn in <b>${Math.round(burn)} min</b>`;
  const elapsed=state.tanStarted?Math.floor((Date.now()-state.tanStarted)/MIN):0;
  main=`<div class="sun-answer">${burnText}<small>estimate · without sunscreen</small></div>`;
  footer=`<div class="sun-tiles"><div class="mini-glass"><span>Tan speed</span><b>${uvNow()<3?'Slow':uvNow()<6?'Moderate':'Fast'}</b></div><button class="mini-glass" data-budget><span>Tan budget</span><b>${Math.max(0,(state.prefs.budget??25)-elapsed)} min</b></button><div class="mini-glass"><span>Reapply</span><b>${state.tanStarted?Math.max(0,120-elapsed)+' min':'2 h'}</b></div></div><div class="skin-chips"><button class="mini-glass" data-skin><i class="skin-dot" style="background:${['#f9d5b9','#e7bb91','#c79164','#a46b46','#754b34','#4c3329'][state.prefs.skin-1]}"></i>Skin · ${['Fair','Light','Medium','Olive','Brown','Deep'][state.prefs.skin-1]}</button><button class="mini-glass" data-spf>${icon('sun')}SPF ${state.prefs.spf}</button></div><button class="amber-action tanning-action" data-start-tan>${icon('sun')}<span>${state.tanStarted?'Tanning · '+elapsed+' min · Stop':'Start tanning'}</span></button><p class="estimate-note">Response varies. This estimate does not predict your skin’s response.</p>`;
 } else if(k==='water'){
  const risk=ripRiskAt(state.time)?.risk,verdict=waterVerdict().replace('stay out of the water','stay ashore');
  main=`<p class="water-verdict" data-risk="${risk?.toLowerCase()||'unknown'}">${verdict}${risk?` <a href="${SURF_URL}" target="_blank" rel="noopener" aria-label="NWS South Walton rip current forecast">NWS ↗</a>`:''}</p><div class="sheet-readings"><div class="reading"><small>Water temp</small><strong>${Number.isFinite(c.sst)?Math.round(cToF(c.sst))+'°':'—'}</strong></div><button class="reading" data-water-detail="waves" aria-label="Open wave details"><small>Waves ↗</small><strong>${Number.isFinite(c.swell)?c.swell.toFixed(1):'—'}<em>ft</em></strong></button><button class="reading" data-water-detail="wind" aria-label="Open wind details"><small>Wind ↗</small><strong>${Number.isFinite(c.wind)?Math.round(c.wind):'—'}<em>kt</em></strong></button></div>`;
 } else if(k==='waves'){
  main=`<div class="sheet-readings"><div class="reading"><small>Height</small><strong>${Number.isFinite(c.swell)?c.swell.toFixed(1):'—'}<em>ft</em></strong></div><div class="reading"><small>Period</small><strong>${Number.isFinite(c.period)?Math.round(c.period):'—'}<em>s</em></strong></div><div class="reading"><small>From</small><strong>${Number.isFinite(c.direction)?compass(c.direction):'—'}</strong></div></div>`;
 } else if(k==='wind'){
  main=`<div class="sheet-readings"><div class="reading"><small>Wind</small><strong>${Math.round(c.wind)}<em>kt</em></strong></div><div class="reading"><small>Gusts</small><strong>${Number.isFinite(c.gust)?Math.round(c.gust):'—'}<em>kt</em></strong></div><div class="reading"><small>From</small><strong>${Number.isFinite(c.windDirection)?compass(c.windDirection):'—'}</strong></div></div>`;
 } else {
  main=`<p class="sheet-value">${Math.round(c.temperature)}°</p><p class="sheet-sub">${Number.isFinite(c.apparent)?'Feels '+Math.round(c.apparent)+'°':'Feels-like unavailable'}</p>`;
  const d=localDayStart(state.time),h=Math.ceil((state.time-d)/HOUR);
  footer=`<div class="hourly-clouds">${Array.from({length:5},(_,i)=>{const t=d+(h+i)*HOUR,row=sampleAt(state.data.rows,t);return `<button class="mini-glass" data-hour-time="${t}" aria-label="${clock(t)}, ${Math.round(row.cloud)} percent cloud cover">${weatherIcon(row)}<b>${clock(t).replace(':00','').replace(' AM','a').replace(' PM','p')}</b></button>`;}).join('')}</div>`;
 }
 $('#sheet-content').innerHTML=`<h2 class="sheet-title">${title}</h2>${main}${chart(k)}${footer}${k==='sun'?sunOutlook():''}`;
 if(active===k&&!drag)$(`[data-ribbon="${k}"]`)?.focus({preventScroll:true});
}
