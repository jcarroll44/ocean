// Provider units are checked at the boundary. Internally: metres, seconds,
// degrees FROM for waves/wind, degrees TO for currents, Unix milliseconds.
export const MARINE_FIELDS=['wave_height','wave_period','wave_peak_period','wave_direction','wind_wave_height','wind_wave_period','wind_wave_peak_period','wind_wave_direction','swell_wave_height','swell_wave_period','swell_wave_peak_period','swell_wave_direction','secondary_swell_wave_height','secondary_swell_wave_period','secondary_swell_wave_direction','tertiary_swell_wave_height','tertiary_swell_wave_period','tertiary_swell_wave_direction','ocean_current_velocity','ocean_current_direction','sea_level_height_msl'];
export const MARINE_SOURCE='est. · Open-Meteo Marine';
const finite=Number.isFinite,clampMarine=(x,a,b)=>Math.max(a,Math.min(b,x));
export function marineURL(site,fields=MARINE_FIELDS,model){
 const u=new URL('https://marine-api.open-meteo.com/v1/marine');
 u.search=new URLSearchParams({latitude:site.lat,longitude:site.lon,hourly:fields.join(','),timeformat:'unixtime',timezone:'GMT',past_days:1,forecast_days:7,cell_selection:'sea',wind_speed_unit:'ms',...(model?{models:model}:{})});return u.href;
}
export function parseMarine(data){
 const h=data?.hourly,u=data?.hourly_units;if(!Array.isArray(h?.time)||u?.time!=='unixtime')throw Error('Invalid marine time axis');
 return h.time.map((t,i)=>{const row={time:t*1000};for(const k of MARINE_FIELDS){
  let v=h[k]?.[i];if(!finite(v)){row[k]=null;continue;}
  const unit=u[k];if(k.endsWith('direction')){if(unit!=='°'||v<0||v>360)v=null;else v=v%360;}
  else if(k==='ocean_current_velocity'){if(unit==='km/h')v/=3.6;else if(unit==='kn')v*=.514444;else if(unit!=='m/s')v=null;}
  else if(k.includes('period')){if(unit!=='s'||v<=0||v>60)v=null;}
  else if(unit!=='m')v=null;
  if(k!=='sea_level_height_msl'&&!k.endsWith('direction')&&finite(v)&&v<0)v=null;
  row[k]=v;
 }return row;}).filter(r=>finite(r.time));
}
export function sampleMarine(rows,t){
 if(!rows?.length||t<rows[0].time||t>rows.at(-1).time)return null;
 let low=0,high=rows.length-1;while(high-low>1){const m=(low+high)>>1;if(rows[m].time<=t)low=m;else high=m;}
 const a=rows[low],b=rows[high],f=clampMarine((t-a.time)/Math.max(1,b.time-a.time),0,1),out={time:t};
 for(const k of MARINE_FIELDS){const x=a[k],y=b[k];out[k]=f===0?(finite(x)?x:null):f===1?(finite(y)?y:null):!finite(x)||!finite(y)?null:k.endsWith('direction')?(x+(((y-x+540)%360)-180)*f+360)%360:x+(y-x)*f;}
 return out;
}
export function waveTrains(c={}){
 const specs=[['wind','Wind waves','wind_wave'],['primary','Primary swell','swell_wave'],['secondary','Secondary swell','secondary_swell_wave'],['tertiary','Tertiary swell','tertiary_swell_wave']];
 const trains=specs.map(([id,label,prefix])=>({id,label,height:c[prefix+'_height'],period:c[prefix+'_peak_period']??c[prefix+'_period'],meanPeriod:c[prefix+'_period'],direction:c[prefix+'_direction'],source:MARINE_SOURCE})).filter(t=>finite(t.height)&&t.height>0&&finite(t.period)&&t.period>0&&finite(t.direction));
 // Missing partitions never become invented primary/secondary measurements.
 if(!trains.length&&finite(c.swell)&&finite(c.period)&&finite(c.direction))return [{id:'combined',label:'Combined waves',height:c.swell*.3048,period:c.wave_peak_period??c.period,meanPeriod:c.period,direction:c.direction,source:MARINE_SOURCE}];
 return trains;
}
export function regionalAdjustment(observations,t,now=Date.now()){
 if(!observations?.length||Math.abs(t-now)>2*3600000)return {factor:1,stations:[]};
 let residual=0,weight=0;const stations=[];
 for(const o of observations){const age=now-o.time;if(age< -300000||age>3*3600000||!finite(o.height)||!finite(o.modelHeight)||o.modelHeight<.15||o.height<0||Math.abs(o.modelTime-o.time)>3600000)continue;
  const w=Math.exp(-o.distanceKm/180)*Math.max(0,1-age/(3*3600000));if(!finite(w)||w<=0)continue;
  residual+=clampMarine(o.height/o.modelHeight-1,-.6,.6)*w;weight+=w;stations.push(o.id);
 }
 const window=Math.pow(Math.cos(Math.abs(t-now)/7200000*Math.PI/2),2);
 return {factor:weight?1+clampMarine(residual/weight*.25,-.15,.15)*window:1,stations};
}
export function parseNDBC(text,id,now=Date.now()){
 const lines=String(text).trim().split(/\r?\n/),header=lines.find(l=>/^#YY\s/.test(l));if(!header)return null;
 const keys=header.slice(1).trim().split(/\s+/),rows=[];
 for(const line of lines){if(line.startsWith('#'))continue;const v=line.trim().split(/\s+/);if(v.length<keys.length)continue;const values=Object.fromEntries(keys.map((k,i)=>[k,v[i]]));
  const time=Date.UTC(+v[0],+v[1]-1,+v[2],+v[3],+v[4]);if(!finite(time)||time>now+300000||now-time>3*3600000)continue;
  const n=k=>values[k]&&!/^(MM|99+\.?0*)$/.test(values[k])&&finite(Number(values[k]))?Number(values[k]):null;
  const height=n('WVHT');if(height===null||height<0||height>30)continue;
  rows.push({id,time,height,dominantPeriod:n('DPD'),averagePeriod:n('APD'),direction:n('MWD'),wind:n('WSPD'),windDirection:n('WDIR'),gust:n('GST'),source:'NOAA NDBC '+id});
 }return rows.sort((a,b)=>b.time-a.time)[0]??null;
}
export function surfHeightRange(text){
 const line=String(text).match(/Surf height\s*[.:]*\s*([^\n]+)/i)?.[1];if(!line)return null;
 const range=line.match(/(\d+(?:\.\d+)?)\s*(?:to|-)\s*(\d+(?:\.\d+)?)\s*(?:feet|foot|ft)/i),single=line.match(/(\d+(?:\.\d+)?)\s*(?:feet|foot|ft)/i);
 if(range)return {low:+range[1],high:+range[2],unit:'ft',source:'NWS Surf Zone Forecast · FLZ108'};
 if(single)return {low:/less than|or less|up to/i.test(line)?0:+single[1],high:+single[1],unit:'ft',source:'NWS Surf Zone Forecast · FLZ108'};
 return /1 foot or less|one foot or less/i.test(line)?{low:0,high:1,unit:'ft',source:'NWS Surf Zone Forecast · FLZ108'}:null;
}
