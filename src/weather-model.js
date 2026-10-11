// Forecast values retain their units and missingness. Visual morphology is an
// estimate, never radar, a lightning observation, or a minute-accurate nowcast.
export const WEATHER_HOUR=3600000;
export const WEATHER_FIELDS={cloud:'cloud_cover',cloudLow:'cloud_cover_low',cloudMid:'cloud_cover_mid',cloudHigh:'cloud_cover_high',rain:'precipitation',weatherCode:'weather_code',visibility:'visibility',humidity:'relative_humidity_2m',temperature:'temperature_2m',wind:'wind_speed_10m',windDirection:'wind_direction_10m',gust:'wind_gusts_10m',cape:'cape',lightningPotential:'lightning_potential',radiation:'shortwave_radiation_instant',directRadiation:'direct_radiation_instant',lowWind:'wind_speed_850hPa',lowDirection:'wind_direction_850hPa',midWind:'wind_speed_500hPa',midDirection:'wind_direction_500hPa',highWind:'wind_speed_250hPa',highDirection:'wind_direction_250hPa'};
export const WEATHER_EXTRAS=['cape','lightningPotential','radiation','directRadiation','lowWind','lowDirection','midWind','midDirection','highWind','highDirection'];
export const weatherClamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
export function weatherDestination(lat,lon,miles,bearing){
 const d=miles*1609.344/6371000,b=bearing*Math.PI/180,p=lat*Math.PI/180,l=lon*Math.PI/180;
 const y=Math.asin(Math.sin(p)*Math.cos(d)+Math.cos(p)*Math.sin(d)*Math.cos(b));
 return {lat:y*180/Math.PI,lon:(l+Math.atan2(Math.sin(b)*Math.sin(d)*Math.cos(p),Math.cos(d)-Math.sin(p)*Math.sin(y)))*180/Math.PI};
}
export function offshorePoints(site){
 return [5,20,40].flatMap(miles=>Array.from({length:7},(_,sector)=>{const bearing=(site.facing-90+sector*30+360)%360;return {...weatherDestination(site.lat,site.lon,miles,bearing),miles,bearing,sector};}));
}
export function weatherURL(site){
 const points=[site,...offshorePoints(site)],url=new URL('https://api.open-meteo.com/v1/forecast');
 url.search=new URLSearchParams({latitude:points.map(p=>p.lat.toFixed(4)).join(','),longitude:points.map(p=>p.lon.toFixed(4)).join(','),hourly:Object.values(WEATHER_FIELDS).join(','),wind_speed_unit:'kn',temperature_unit:'fahrenheit',precipitation_unit:'mm',timeformat:'unixtime',timezone:'UTC',past_days:1,forecast_days:7,cell_selection:'sea'});
 return url.href;
}
export function parseWeatherField(payload,site,now=Date.now()){
 const locations=[{...site,miles:0,bearing:site.facing,sector:-1},...offshorePoints(site)];
 if(!Array.isArray(payload)||payload.length!==locations.length)throw Error('Incomplete offshore forecast field');
 const series=payload.map((p,index)=>{
  const u=p?.hourly_units,h=p?.hourly;
  if(u?.time!=='unixtime'||u.wind_speed_10m!=='kn'||u.precipitation!=='mm'||u.visibility!=='m'||u.temperature_2m!=='°F'||!Array.isArray(h?.time))throw Error('Unexpected weather field units');
  for(const k of ['cloud_cover','cloud_cover_low','cloud_cover_mid','cloud_cover_high','relative_humidity_2m'])if(u[k]!=='%')throw Error('Unexpected cloud/humidity units');
  for(const k of ['shortwave_radiation_instant','direct_radiation_instant'])if(u[k]!=='W/m²')throw Error('Unexpected radiation units');
  for(const k of ['wind_gusts_10m','wind_speed_850hPa','wind_speed_500hPa','wind_speed_250hPa'])if(u[k]!=='kn')throw Error('Unexpected layer wind units');
  for(const k of ['wind_direction_10m','wind_direction_850hPa','wind_direction_500hPa','wind_direction_250hPa'])if(u[k]!=='°')throw Error('Unexpected wind bearing units');
  const rows=h.time.map((t,i)=>({time:t*1000,...Object.fromEntries(Object.entries(WEATHER_FIELDS).map(([key,field])=>[key,Number.isFinite(h[field]?.[i])?h[field][i]:null]))})).filter(r=>Number.isFinite(r.time)).sort((a,b)=>a.time-b.time);
  if(rows.length<6||rows.some((r,i)=>i&&r.time<=rows[i-1].time))throw Error('Invalid weather timestamps');
  return {...locations[index],grid:{lat:p.latitude,lon:p.longitude},rows};
 });
 return {schema:1,source:'Open-Meteo',retrievedAt:now,series};
}
export function weatherBracket(rows,time){
 if(!rows?.length||!Number.isFinite(time)||time<rows[0].time||time>rows.at(-1).time)return null;
 const i=rows.findLastIndex(r=>r.time<=time),a=rows[i],b=rows[Math.min(i+1,rows.length-1)];
 return {a,b,f:a.time===b.time?0:(time-a.time)/(b.time-a.time)};
}
export function weatherValue(a,b,f,key){
 const x=a?.[key],y=b?.[key];
 if(f===0)return Number.isFinite(x)?x:null;
 if(f===1)return Number.isFinite(y)?y:null;
 if(!Number.isFinite(x)||!Number.isFinite(y))return null;
 if(key==='weatherCode')return f<.5?x:y;
 if(/Direction$|^direction$/.test(key))return (x+((y-x+540)%360-180)*f+360)%360;
 return x+(y-x)*f;
}
export function sampleWeather(rows,time){const v=weatherBracket(rows,time);if(!v)return null;return {time,...Object.fromEntries(Object.keys(WEATHER_FIELDS).map(k=>[k,weatherValue(v.a,v.b,v.f,k)]))};}
export function thunderPotential(c){
 if(!c)return null;
 // LPI is unavailable for some models/locations. CAPE is instability, not a
 // lightning probability: require forecast precipitation as well, label est.
 if(Number.isFinite(c.lightningPotential))return {value:weatherClamp(c.lightningPotential/10),method:'LPI est. · Open-Meteo'};
 if(c.weatherCode>=95)return {value:1,method:'Thunderstorm code est. · Open-Meteo'};
 if(Number.isFinite(c.cape)&&Number.isFinite(c.rain))return {value:weatherClamp((c.cape-400)/1600)*weatherClamp(c.rain/2),method:'CAPE + precipitation est. · Open-Meteo'};
 return null;
}
export function sampledOffshore(field,time,now=Date.now()){
 if(field?.schema!==1||field.series?.length!==22||!Number.isFinite(field.retrievedAt)||field.retrievedAt>now+300000||now-field.retrievedAt>24*WEATHER_HOUR)return [];
 const bracket=weatherBracket(field.series[0].rows,time),R=Math.PI/180;
 const xy=p=>[Math.sin(p.bearing*R)*p.miles*1609.344,Math.cos(p.bearing*R)*p.miles*1609.344];
 const grids=bracket?[bracket.a.time,bracket.b.time].map(t=>field.series.map(p=>({xy:xy(p),c:sampleWeather(p.rows,t)}))):[];
 function spatial(grid,position,key){
  const points=grid.map(p=>({...p,d:(p.xy[0]-position[0])**2+(p.xy[1]-position[1])**2})).sort((a,b)=>a.d-b.d).slice(0,4);
  const value=p=>key==='potential'?thunderPotential(p.c)?.value:p.c?.[key];
  if(points[0]?.d<1)return value(points[0])??null;
  if(points.some(p=>!Number.isFinite(value(p))))return null;
  const weight=points.map(p=>1/(p.d+1)),sum=weight.reduce((a,b)=>a+b,0);
  return points.reduce((sum,p,i)=>sum+value(p)*weight[i],0)/sum;
 }
 return field.series.slice(1).map(p=>{
  let c=sampleWeather(p.rows,time),potential=thunderPotential(c);
  // Advect both bounding hourly fields with their forecast wind, then blend.
  // This is exact at each model timestamp, reversible on scrub, and avoids
  // inventing a storm's velocity from a decorative animation clock. Spatial
  // interpolation is an estimate over sparse model samples, not radar motion.
  if(c&&bracket&&bracket.f>0&&bracket.f<1&&grids.length){
   const endpoints=[sampleWeather(p.rows,bracket.a.time),sampleWeather(p.rows,bracket.b.time)],position=xy(p);
   const origins=endpoints.map((v,i)=>{if(!Number.isFinite(v?.wind)||!Number.isFinite(v?.windDirection))return position;const seconds=(time-(i?bracket.b.time:bracket.a.time))/1000,d=v.wind*.514444*seconds,a=v.windDirection*R;return [position[0]+Math.sin(a)*d,position[1]+Math.cos(a)*d];});
   const mix=key=>{const a=spatial(grids[0],origins[0],key),b=spatial(grids[1],origins[1],key);return Number.isFinite(a)&&Number.isFinite(b)?a+(b-a)*bracket.f:null;};
   c={...c,cloud:mix('cloud'),rain:mix('rain')};const value=mix('potential');potential=value===null?null:{value,method:'Wind-advection interpolation est. · Open-Meteo'};
  }
  return {bearing:p.bearing,miles:p.miles,sector:p.sector,grid:p.grid,conditions:c,potential};
 });
}
export function integrateCloudWind(rows,time,layer,origin=0){
 const v=weatherBracket(rows,time);if(!v)return [0,0];
 // Integrate from the forecast's fixed first timestamp, so reverse scrubbing
 // cannot change the cloud location at a given forecast time.
 const start=rows[0].time;
 let x=0,z=0;
 for(let t=start;t<time;){const end=Math.min(time,t+WEATHER_HOUR),v=weatherBracket(rows,(t+end)/2),c=v?{[layer+'Wind']:weatherValue(v.a,v.b,v.f,layer+'Wind'),[layer+'Direction']:weatherValue(v.a,v.b,v.f,layer+'Direction')}:null;if(!Number.isFinite(c?.[layer+'Wind'])||!Number.isFinite(c?.[layer+'Direction'])){t=end;continue;}
  const a=(c[layer+'Direction']-201)*Math.PI/180,d=c[layer+'Wind']*.514444*(end-t)/1000;x+=Math.sin(a)*d;z-=Math.cos(a)*d;t=end;
 }
 return [x+origin,z+origin];
}
