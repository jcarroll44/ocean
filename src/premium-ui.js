// October 12 explicit UI revision. Gesture ownership/camera remain unchanged.
const premiumHome=renderHome,premiumPresentation=renderPresentation,premiumMethod=forecastMethod;
const marineAPI=__mods['marine-data.js'];
const statUnits={air:'°',water:'°',waves:'ft',wind:'kt',sun:''};
const statNumber=(v,digits=0)=>Number.isFinite(v)?v.toFixed(digits):'—';
function directionArrow(degrees){return Number.isFinite(degrees)?`<svg class="direction-arrow" style="transform:rotate(${degrees}deg)" viewBox="0 0 20 20" aria-hidden="true"><path d="m10 2 5 13-5-3-5 3Z" fill="currentColor"/></svg>`:'—';}
renderHome=function(){
 premiumHome();const c=conditions();
 for(const tile of document.querySelectorAll('#metrics [data-sheet]')){
  const key=tile.dataset.sheet,icon=key==='wind'?directionArrow(c.windDirection):homeIcon(key);
  if(key==='air'||key==='water'){const value=tile.querySelector('b');value.innerHTML=value.innerHTML.replace('°','<small>°</small>');}
  tile.insertAdjacentHTML('afterbegin',`<i class="stat-symbol">${icon}</i>`);tile.insertAdjacentHTML('beforeend','<i class="stat-open" aria-hidden="true">›</i>');
 }
};
referenceAction=function(){return realForecast()?{html:'Hour by hour',action:'air'}:{html:'Retry forecast',action:'retry'};};
renderPresentation=function(){
 premiumPresentation();const available=realForecast(),c=conditions(),detail=$('#story-detail'),temp=$('#hero-temp');
 const value=(n,suffix)=>Number.isFinite(n)?Math.round(n)+suffix:'—';
 if(available){
  // Separate elements guarantee a single meta line and a quiet timestamp below.
  detail.innerHTML=`<span class="premium-meta">${value(c.wind,' kt wind')} <i>·</i> ${value(c.period,' s period')}</span><small class="premium-updated">Updated ${Number.isFinite(state.data.retrievedAt)?textHTML(clock(state.data.retrievedAt)):'—'}${state.data.attribution?' · <a aria-label="Apple Weather data sources" href="https://weatherkit.apple.com/legal-attribution.html" target="_blank" rel="noopener"> Weather</a>':''}</small>`;
  detail.style.whiteSpace='normal';temp.textContent=value(c.temperature,'°');
 }
 const label=$('#source-label');
 if($('#app').dataset.connectedLive==='true')label.textContent='LIVE · '+SITE.name.toUpperCase();
 else if(available&&state.data.source!=='saved'&&navigator.onLine!==false)label.textContent=weekday(state.time)+' '+clock(state.time)+' · '+SITE.name.toUpperCase();
 const chip=$('#release-rip-chip');if(chip)chip.textContent='High rip current · NWS';
};
function hourlyStatChart(kind,series,title){
 const bounds=selectedDayBounds(),points=Array.from({length:25},(_,i)=>{const t=bounds.start+(bounds.end-bounds.start)*i/24,c=sampleAt(state.data.rows,t);return {t,c};});
 const colors=['#3a91ac','#ac9b6f','#7e8ac0','#9bb9c3'];
 const values=series.flatMap(s=>points.map(p=>s.value(p.c,p.t)).filter(Number.isFinite)),lo=values.length?Math.min(...values):0,hi=values.length?Math.max(lo+.1,...values):1;
 const y=v=>62-(v-lo)/(hi-lo)*42;
 const paths=series.map((s,index)=>{let path='',active=false;for(let i=0;i<points.length;i++){const v=s.value(points[i].c,points[i].t);if(!Number.isFinite(v)){active=false;continue;}path+=(active?' L':' M')+(5+i*90/24).toFixed(2)+','+y(v).toFixed(2);active=true;}return `<path d="${path}" fill="none" stroke="${colors[index%4]}" stroke-width="2" ${index===1?'stroke-dasharray="4 3"':''} vector-effect="non-scaling-stroke"/>`;}).join('');
 const pct=clamp((state.time-bounds.start)/(bounds.end-bounds.start)*100,0,100),unit=statUnits[kind];
 return `<div class="chart-wrap premium-chart"><div class="ribbon-control ${kind}" data-ribbon="${kind}" role="slider" tabindex="0" aria-label="${title} forecast time" aria-valuemin="0" aria-valuemax="1440" aria-valuenow="${Math.round((state.time-bounds.start)/MIN)}" aria-valuetext="${clock(state.time)}"><div class="chart-caption"><span>${title}</span><span>${clock(state.time)}</span></div><svg viewBox="0 0 100 80" preserveAspectRatio="none" aria-hidden="true"><path d="M5 63H95M5 21H95" stroke="#527482" stroke-opacity=".12" vector-effect="non-scaling-stroke"/>${paths}<path d="M${5+pct*.9} 14V70" stroke="#ffffff" stroke-width="1.5" vector-effect="non-scaling-stroke"/></svg>${!values.length?'<span class="chart-unavailable">Data unavailable for this day</span>':''}</div><div class="chart-hours"><span>12a</span><span>6a</span><span>12p</span><span>6p</span><span>12a</span></div><div class="chart-legend">${series.map((s,i)=>`<span><i style="background:${colors[i%4]}"></i>${s.label}</span>`).join('')}<span>${statNumber(lo,kind==='waves'?1:0)}–${statNumber(hi,kind==='waves'?1:0)} ${unit}</span></div></div>`;
}
function wavePartitionRows(c){
 return [['Primary swell','swell_wave'],['Secondary swell','secondary_swell_wave'],['Wind waves','wind_wave'],...(Number.isFinite(c.tertiary_swell_wave_height)?[['Tertiary swell','tertiary_swell_wave']]:[])].map(([label,p])=>{
  const height=c[p+'_height'],period=c[p+'_period'],direction=c[p+'_direction'];
  return `<div class="wave-partition"><span>${label}</span><strong>${Number.isFinite(height)?(height*FT).toFixed(1):'—'}<small> ft</small></strong><b>${statNumber(period,1)}<small> s</small></b><span class="wave-bearing">${directionArrow(direction)}${Number.isFinite(direction)?compass(direction):'—'}</span></div>`;
 }).join('');
}
renderSheet=function(){
 const c=conditions(),kind=state.sheet,active=document.activeElement?.dataset.ribbon,source='<p class="sheet-source">est. · '+(kind==='water'||kind==='waves'?'Open-Meteo Marine':textHTML(state.data.weatherSource||'Weather forecast'))+'</p>';
 let title={air:'Air',water:'Water',waves:'Waves',wind:'Wind',sun:'UV & sun'}[kind],body='';
 const series=(key,label,convert=v=>v)=>({label,value:r=>Number.isFinite(r?.[key])?convert(r[key]):null});
 if(kind==='air')body=`<div class="sheet-readings"><div class="reading"><small>Air</small><strong>${statNumber(c.temperature)}<em>°</em></strong></div><div class="reading"><small>Feels like</small><strong>${statNumber(c.apparent)}<em>°</em></strong></div></div>${hourlyStatChart(kind,[series('temperature','Air'),series('apparent','Feels like')],'Temperature')}`;
 if(kind==='water')body=`${ripRiskRow()}<div class="sheet-readings"><div class="reading"><small>Water temperature</small><strong>${Number.isFinite(c.sst)?statNumber(cToF(c.sst)):'—'}<em>°</em></strong></div><button class="reading" data-water-detail="waves"><small>Waves ›</small><strong>${statNumber(c.swell,1)}<em>ft</em></strong></button><button class="reading" data-water-detail="wind"><small>Wind ›</small><strong>${statNumber(c.wind)}<em>kt</em></strong></button></div>${hourlyStatChart(kind,[series('sst','Water',cToF)],'Water temperature')}${chart('water')}<p class="sheet-source">Tide est. · ${c.marineTide?'Open-Meteo Marine sea level, MSL':'NOAA predictions, MSL'}${Number.isFinite(c.ocean_current_velocity)?`<br>Current est. ${c.ocean_current_velocity.toFixed(2)} m/s toward ${Number.isFinite(c.ocean_current_direction)?compass(c.ocean_current_direction):'direction unavailable'} · Open-Meteo Marine`:''}</p>`;
 if(kind==='waves'){
  const surf=ripRiskAt(state.time)?.breakers,peak=c.wave_peak_period,cal=c.waveCalibrationSource;
  body=`<div class="sheet-readings"><div class="reading"><small>Combined sea</small><strong>${statNumber(c.swell,1)}<em>ft</em></strong></div><div class="reading"><small>Period</small><strong>${statNumber(c.period,1)}<em>s</em></strong></div><div class="reading"><small>From</small><strong>${directionArrow(c.direction)}${Number.isFinite(c.direction)?compass(c.direction):'—'}</strong></div></div><div class="wave-partitions">${wavePartitionRows(c)}</div>${hourlyStatChart(kind,[series('swell','Combined'),series('swell_wave_height','Primary',v=>v*FT),series('secondary_swell_wave_height','Secondary',v=>v*FT),series('wind_wave_height','Wind waves',v=>v*FT)],'Wave height')}<p class="sheet-source">est. · Open-Meteo Marine${state.data.marineField?.waveModel?' · '+textHTML(state.data.marineField.waveModel):''}<br>Peak period ${Number.isFinite(peak)?peak.toFixed(1)+' s':'unavailable'} · directions from${surf?'<br>Surf forecast '+surf.low+'–'+surf.high+' ft · NWS '+textHTML(SITE.surfZone||'unavailable')+'':''}${cal?'<br>'+textHTML(cal):''}</p>`;
 }
 if(kind==='wind')body=`<div class="sheet-readings"><div class="reading"><small>Wind</small><strong>${statNumber(c.wind)}<em>kt</em></strong></div><div class="reading"><small>Gusts</small><strong>${statNumber(c.gust)}<em>kt</em></strong></div><div class="reading"><small>From</small><strong>${directionArrow(c.windDirection)}${Number.isFinite(c.windDirection)?compass(c.windDirection):'—'}</strong></div></div>${hourlyStatChart(kind,[series('wind','Wind'),series('gust','Gusts')],'Wind & gusts')}<div class="hourly-directions">${[0,6,12,18].map(h=>{const r=sampleAt(state.data.rows,selectedDayBounds().start+h*HOUR);return `<span>${directionArrow(r?.windDirection)}<small>${h===0?'12a':h===12?'12p':h<12?h+'a':h-12+'p'}</small></span>`;}).join('')}</div>`;
 if(kind==='sun')body=`<div class="sheet-readings"><div class="reading"><small>UV index</small><strong>${statNumber(forecastUV(state.time),1)}</strong></div><div class="reading"><small>Moon illuminated</small><strong>${Math.round(moonPhase(state.time).fraction*100)}<em>%</em></strong></div></div>${hourlyStatChart(kind,[{label:'UV',value:(r,t)=>forecastUV(t)}],'UV index')}${sunOutlook()}`;
 $('#sheet-content').innerHTML=`<h2 class="sheet-title">${title||''}</h2>${body}${kind==='waves'?'':source}${forecastMethod(kind)}`;
 if(active===kind&&!drag)$(`[data-ribbon="${kind}"]`)?.focus({preventScroll:true});
};
forecastMethod=function(kind){
 if(kind!=='waves')return premiumMethod(kind);
 const observations=state.data.marineField?.observations||[],now=Date.now();
 return `<details class="forecast-method" data-method="waves"><summary>Sources & wave model</summary><p>Waves est. · Open-Meteo Marine. Separate forecast partitions share Tidewater’s spectrum. Wavelength est. uses gT² / 2π; mean period is used where peak period is unavailable. Bar geometry is a typical Gulf two-bar profile, not a current seabed survey. Breaking positions and set timing are illustrative estimates.</p><p>NOAA tide predictions set local water level when available. Open-Meteo sea level is a fallback; it is never added to the NOAA tide.</p><p>Regional calibration est. · NOAA NDBC. Fresh buoy/model height residuals adjust the near-now visual amplitude by at most 15%; no adjustment beyond two hours. This method is unvalidated for local breaker height. Directions and periods remain local forecasts.</p>${observations.filter(o=>now-o.time<3*HOUR).map(o=>`<p>Buoy ${textHTML(o.id)} · ${Math.round(o.distanceKm)} km offshore · observed ${(o.height*FT).toFixed(1)} ft${Number.isFinite(o.dominantPeriod)?' / '+o.dominantPeriod.toFixed(1)+' s dominant':''} · ${textHTML(clock(o.time))}</p>`).join('')||'<p>Recent regional buoy observations unavailable.</p>'}<p><a href="https://open-meteo.com/en/docs/marine-weather-api" target="_blank" rel="noopener">Open-Meteo</a> · <a href="https://www.ndbc.noaa.gov/" target="_blank" rel="noopener">NOAA NDBC</a> · <a href="${SURF_URL}" target="_blank" rel="noopener">NWS FLZ108</a> · <a href="/credits.html" target="_blank" rel="noopener">MIT credits: Tidewater & Takram</a></p></details>`;
};
