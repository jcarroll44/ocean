// Runtime authority: every provider request is on the shared server, never here.
(()=>{
 const F=__mods['forecast.js'],C=__mods['conditions.js'],site=__mods['config.js'].SITE;
 const key='daybuoy.shared.v3.'+site.id;let cached=null,pending=null;
 const valid=v=>v?.schema===3&&v.profileId===site.id&&Array.isArray(v.rows)&&v.rows.length>=6&&v.rows.every(r=>Number.isFinite(r.time))&&Number.isFinite(v.retrievedAt)&&v.retrievedAt<=Date.now()+300000&&Date.now()-v.retrievedAt<86400000;
 try{const c=JSON.parse(localStorage.getItem(key)||'null');if(valid(c))cached=c;}catch{}
 const api=__mods['shared-forecast.js']={get data(){return cached;},endpoint:()=>new URL('/api/forecast?beach='+encodeURIComponent(site.id),globalThis.__DAYBUOY_API_ORIGIN__||location.origin).href};
 F.saveForecast=data=>{if(valid(data))try{localStorage.setItem(key,JSON.stringify(data));}catch{}};
 F.savedForecast=()=>valid(cached)?F.finalize({...cached,source:'saved'}):null;
 F.loadForecast=async()=>{
  if(pending)return pending;
  pending=(async()=>{let last;
   for(let i=0;i<12;i++){try{const response=await fetch(api.endpoint(),{signal:AbortSignal.timeout(55000),credentials:'same-origin'});if(!response.ok)throw Error('Shared forecast HTTP '+response.status);const data=await response.json();if(!valid(data))throw Error('Invalid shared forecast');cached=F.finalize(data);F.saveForecast(cached);return cached;}catch(e){last=e;if(i<11)await new Promise(r=>setTimeout(r,5000));}}
   if(valid(cached))return F.finalize({...cached,source:'saved',error:'Refresh unavailable'});throw last;
  })().finally(()=>pending=null);return pending;
 };
 const baseSample=C.sampleAt;
 C.sampleAt=(rows,time)=>{const out=baseSample(rows,time);if(!out)return out;const m=__mods['marine-data.js'],cal=m.regionalAdjustment(rows[0]?.marineFixture||cached?.marineField?.waveModel!=='GFS Wave 0.25°'?[]:cached.marineField.observations,time);out.waveCalibration=cal.factor;out.waveCalibrationSource=cal.stations.length?'regional calibration est. · NOAA NDBC '+cal.stations.join(', '):null;return out;};
})();
