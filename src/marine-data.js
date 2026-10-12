// Add complete marine partitions without modifying the pinned base forecast.
(()=>{
 /* MARINE_MODEL */
 const api=__mods['marine-data.js']={MARINE_FIELDS,MARINE_SOURCE,marineURL,parseMarine,sampleMarine,waveTrains,regionalAdjustment,surfHeightRange};
 const forecast=__mods['forecast.js'],conditions=__mods['conditions.js'],baseLoad=forecast.loadForecast,baseSample=conditions.sampleAt,baseSaved=forecast.savedForecast;
 let field=null;try{const v=JSON.parse(localStorage.getItem('daybuoy.marine.v2')||'null');if(v?.schema===2&&Array.isArray(v.rows)&&Date.now()-v.retrievedAt<86400000)field=v;}catch{}
 const get=async url=>{const r=await fetch(url,{signal:AbortSignal.timeout(18000)});if(!r.ok)throw Error('Marine provider HTTP '+r.status);const j=await r.json();if(j.error)throw Error('Marine fields unavailable');return j;};
 function attach(data){if(!data||!field||Date.now()-field.retrievedAt>=86400000)return data;data.marineField=field;for(const row of data.rows){const m=sampleMarine(field.rows,row.time);if(m)Object.assign(row,m,{swell:Number.isFinite(m.wave_height)?m.wave_height/.3048:row.swell,period:m.wave_period??row.period,direction:m.wave_direction??row.direction,marineModel:field.waveModel,tide:Number.isFinite(row.tide)?row.tide:m.sea_level_height_msl,marineTide:!Number.isFinite(row.tide)&&Number.isFinite(m.sea_level_height_msl)});}return data;}
 forecast.loadForecast=async options=>{
  const site=__mods['config.js'].SITE.marine;
  const extra=(async()=>{const waveFields=MARINE_FIELDS.filter(k=>k.includes('wave'));
   const [m,o,g]=await Promise.allSettled([get(marineURL(site)),get('/api/marine-observations'),get(marineURL(site,waveFields,'ncep_gfswave025'))]);if(m.status!=='fulfilled')throw m.reason;
   const rows=parseMarine(m.value),gfs=g.status==='fulfilled'?parseMarine(g.value):null;
   const coherentGFS=gfs?.length&&rows.every(row=>gfs.some(p=>p.time===row.time&&Number.isFinite(p.wave_height)&&Number.isFinite(p.wave_period)));
   if(coherentGFS){const byTime=new Map(gfs.map(r=>[r.time,r]));for(const row of rows){const part=byTime.get(row.time);if(part&&Number.isFinite(part.wave_height)&&Number.isFinite(part.wave_period))for(const key of waveFields)row[key]=part[key];}}
   field={waveModel:coherentGFS?'GFS Wave 0.25°':'Best match',schema:2,retrievedAt:Date.now(),source:MARINE_SOURCE,rows,observations:o.status==='fulfilled'?o.value.observations||[]:[],observationStatus:o.status,availableFields:MARINE_FIELDS.filter(k=>rows.some(r=>Number.isFinite(r[k])))};
   try{localStorage.setItem('daybuoy.marine.v2',JSON.stringify(field));}catch{}return field;
  })();
  const [base,extended]=await Promise.allSettled([baseLoad(options),extra]);if(base.status!=='fulfilled')throw base.reason;
  const data=attach(base.value);data.feedStatus={...data.feedStatus,marinePartitions:extended.status};return data;
 };
 forecast.savedForecast=(...args)=>attach(baseSaved(...args));
 conditions.sampleAt=(rows,t)=>{const out=baseSample(rows,t);if(!out)return out;const m=sampleMarine(rows,t);if(m)Object.assign(out,m);
  const isFixture=rows[0]?.marineFixture===true,cal=regionalAdjustment(isFixture||field?.waveModel!=='GFS Wave 0.25°'?[]:field?.observations,t);
  out.waveCalibration=cal.factor;out.waveCalibrationSource=cal.stations.length?'regional calibration est. · NOAA NDBC '+cal.stations.join(', '):null;
  out.marineTide=rows.find(r=>r.time>=t)?.marineTide??false;return out;
 };
})();
