import {BEACH_PROFILES,validateProfile} from '../src/beach-profiles.js';
import {MARINE_FIELDS,marineURL,parseMarine,sampleMarine,parseNDBC} from '../src/marine-model.js';
import {loadWeather,providerJSON} from './weather-providers.js';
import {distanceKm} from './profile-generator.js';
const HOUR=3600000,finite=Number.isFinite;
export async function resolveProfile(id,env={}){
 if(!/^[-a-z0-9]{1,64}$/.test(id))return null;
 const stored=env.DB?await env.DB.prepare('SELECT body FROM beach_profiles WHERE id=?').bind(id).first():null;
 return stored?validateProfile(JSON.parse(stored.body)):BEACH_PROFILES[id]||null;
}
export function commercialMarineURL(url,env){
 const u=new URL(url);if(env.OPEN_METEO_API_KEY){u.hostname='customer-marine-api.open-meteo.com';u.searchParams.set('apikey',env.OPEN_METEO_API_KEY);}return u.href;
}
export async function loadMarine(profile,env={},fetcher=fetch,now=Date.now()){
 const get=url=>providerJSON(commercialMarineURL(url,env),fetcher),fields=[...MARINE_FIELDS,'sea_surface_temperature'],waves=MARINE_FIELDS.filter(k=>k.includes('wave'));
 const [base,gfs]=await Promise.allSettled([get(marineURL(profile.marine,fields)),get(marineURL(profile.marine,waves,'ncep_gfswave025'))]);
 if(base.status!=='fulfilled'&&gfs.status!=='fulfilled')throw Error('Marine forecast unavailable');
 const raw=base.status==='fulfilled'?base.value:gfs.value,rows=parseMarine(raw),gfsRows=gfs.status==='fulfilled'?parseMarine(gfs.value):null;
 const coherent=gfsRows?.length&&rows.every(r=>gfsRows.some(p=>p.time===r.time&&finite(p.wave_height)&&finite(p.wave_period)));
 const gmap=new Map(gfsRows?.map(r=>[r.time,r])||[]);
 for(let i=0;i<rows.length;i++){if(coherent)for(const k of waves)rows[i][k]=gmap.get(rows[i].time)[k];rows[i].sst=raw.hourly_units?.sea_surface_temperature==='°C'&&finite(raw.hourly?.sea_surface_temperature?.[i])?raw.hourly.sea_surface_temperature[i]:null;}
 const observations=await Promise.allSettled((profile.buoys||[]).slice(0,3).filter(s=>/^[a-z0-9]{4,7}$/.test(s.id)).map(async station=>{
  const r=await fetcher(`https://www.ndbc.noaa.gov/data/realtime2/${station.id}.txt`,{signal:AbortSignal.timeout(10000)});if(!r.ok)return null;const o=parseNDBC(await r.text(),station.id,now);if(!o)return null;
  const model=await get(marineURL(station,['wave_height','wave_period','wave_direction'],'ncep_gfswave025')).then(j=>sampleMarine(parseMarine(j),o.time)).catch(()=>null);
  return {...o,distanceKm:distanceKm(profile,station),modelHeight:model?.wave_height??null,modelTime:model?.time??null};
 }));
 return {schema:2,retrievedAt:now,source:'est. · Open-Meteo Marine',waveModel:coherent?'GFS Wave 0.25°':'Best match',rows,observations:observations.flatMap(r=>r.status==='fulfilled'&&r.value?[r.value]:[]),availableFields:MARINE_FIELDS.filter(k=>rows.some(r=>finite(r[k])))};
}
async function loadTide(p,fetcher,now){
 if(!/^\d{7}$/.test(p.tideStation||''))return {predictions:[],events:[],source:null};
 const query=interval=>{const u=new URL('https://api.tidesandcurrents.noaa.gov/api/prod/datagetter');u.search=new URLSearchParams({product:'predictions',application:'DayBuoy',begin_date:new Date(now-24*HOUR).toISOString().slice(0,10).replaceAll('-',''),range:'216',datum:'MSL',station:p.tideStation,time_zone:'gmt',units:'metric',interval,format:'json'});return providerJSON(u.href,fetcher);};
 const [hours,hilo]=await Promise.allSettled([query('h'),query('hilo')]),parse=(j)=>(j?.predictions||[]).map(v=>({time:Date.parse(v.t.replace(' ','T')+'Z'),level:Number(v.v),type:v.type})).filter(v=>finite(v.time)&&finite(v.level));
 return {predictions:parse(hours.value),events:parse(hilo.value),source:hours.status==='fulfilled'?'est. · NOAA CO-OPS '+p.tideStation:null};
}
export function surfHasZone(text,zone){
 if(!/^[A-Z]{2}Z\d{3}$/.test(zone||''))return false;
 const prefix=zone.slice(0,3),n=Number(zone.slice(3));let current='';
 for(const token of text.split(/\n/).filter(l=>/^[A-Z]{2}Z\d|^\d{3}[- >]/.test(l)).join('').split('-')){if(/^[A-Z]{2}Z/.test(token))current=token.slice(0,3);const v=token.replace(/^[A-Z]{2}Z/,'');if(!/^\d{3}(>\d{3})?$/.test(v))continue;const [lo,hi]=v.split('>').map(Number);if(current===prefix&&n>=lo&&n<=(hi??lo))return true;}return false;
}
async function loadSurf(p,fetcher){
 if(!p.surfZone||!/^[A-Z]{3}$/.test(p.surfOffice||''))return null;
 const list=await providerJSON('https://api.weather.gov/products/types/SRF/locations/'+p.surfOffice,fetcher);
 const items=(list['@graph']||[]).filter(v=>v.productCode==='SRF'&&/^https:\/\/api\.weather\.gov\/products\/[a-f0-9-]+$/.test(v['@id'])).sort((a,b)=>Date.parse(b.issuanceTime)-Date.parse(a.issuanceTime)).slice(0,3);
 for(const i of items){const product=await providerJSON(i['@id'],fetcher);if(surfHasZone(product.productText||'',p.surfZone))return product;}
 return null;
}
export async function fetchForecast(profile,env={},fetcher=fetch,now=Date.now()){
 const [weather,marine,tide,surf]=await Promise.allSettled([loadWeather(profile,env,fetcher,now),loadMarine(profile,env,fetcher,now),loadTide(profile,fetcher,now),loadSurf(profile,fetcher)]);
 if(weather.status!=='fulfilled')throw Error('Weather unavailable');
 const w=weather.value,m=marine.value,tidal=tide.value||{predictions:[],events:[]},tm=new Map(tidal.predictions.map(p=>[p.time,p.level]));
 const rows=w.rows.map(r=>{const v=m?.rows.find(v=>v.time===r.time),msl=v?.sea_level_height_msl,level=tm.get(r.time);return {...r,...v,time:r.time,swell:finite(v?.wave_height)?v.wave_height/.3048:null,period:v?.wave_period??null,direction:v?.wave_direction??null,windDirection:finite(r.windDirection)?r.windDirection:r.wind===0?profile.facing:null,sst:v?.sst??null,tide:finite(level)?level:finite(msl)?msl:null,marineTide:!finite(level)&&finite(msl),marineModel:m?.waveModel||null,gate:null};});
 return {schema:3,profileId:profile.id,profile,source:'live',retrievedAt:now,rows,tideEvents:tidal.events,marineField:m??null,weatherField:w.weatherField,surfProduct:surf.value||null,weatherSource:w.source,attribution:w.attribution,feedStatus:{...w.status,marine:marine.status,marinePartitions:marine.status,tide:tidal.predictions.length?'fulfilled':'rejected',tideHiLo:tidal.events.length?'fulfilled':'rejected',surf:surf.value?'fulfilled':'rejected'},sources:{weather:w.source,waves:'est. · Open-Meteo Marine',tide:tidal.source||'est. · Open-Meteo Marine sea level (MSL)',appearance:'est. · '+w.source+'; derived cloud layers / surface-wind advection',buoys:m?.observations.length?'NOAA NDBC':'Unavailable',surf:surf.value?'NWS '+profile.surfZone:'Unavailable'}};
}
export async function packCache(value){const bytes=new TextEncoder().encode(JSON.stringify(value)),compressed=await new Response(new Blob([bytes]).stream().pipeThrough(new CompressionStream('gzip'))).arrayBuffer();let s='';const a=new Uint8Array(compressed);for(let i=0;i<a.length;i+=8192)s+=String.fromCharCode(...a.subarray(i,i+8192));return 'gz:'+btoa(s);}
export async function unpackCache(body){if(!body.startsWith('gz:'))return JSON.parse(body);const bytes=Uint8Array.from(atob(body.slice(3)),c=>c.charCodeAt(0));return new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).json();}
// One atomic claim for each beach/hour across all users and all Worker isolates.
// A failed provider batch retains last-known data and cannot stampede upstream.
export async function sharedForecast(profile,env,{now=Date.now(),loader=fetchForecast}={}){
 if(!env.DB)throw Error('Shared forecast cache unavailable');
 const hour=Math.floor(now/HOUR),claim=await env.DB.prepare("INSERT INTO forecast_cache(beach,attempt_hour,status) VALUES(?,?,'pending') ON CONFLICT(beach) DO UPDATE SET attempt_hour=excluded.attempt_hour,status='pending' WHERE forecast_cache.attempt_hour<excluded.attempt_hour").bind(profile.id,hour).run();
 if(claim.meta.changes){
  try{const result=await loader(profile,env,fetch,now),body=await packCache(result);await env.DB.prepare("UPDATE forecast_cache SET body=?,fetched_at=?,status='ready' WHERE beach=? AND attempt_hour=?").bind(body,now,profile.id,hour).run();}
  catch{await env.DB.prepare("UPDATE forecast_cache SET status='failed' WHERE beach=? AND attempt_hour=?").bind(profile.id,hour).run();}
 }
 const cached=await env.DB.prepare('SELECT body,fetched_at,status,attempt_hour FROM forecast_cache WHERE beach=?').bind(profile.id).first();
 if(!cached?.body||now-cached.fetched_at>24*HOUR)throw Error('Forecast temporarily unavailable');
 const data=await unpackCache(cached.body),stale=Math.floor(cached.fetched_at/HOUR)<hour;
 return {...data,source:stale?'saved':'live',cache:{shared:true,hour:cached.attempt_hour,stale,status:cached.status},retrievedAt:cached.fetched_at};
}
export async function handleForecast(request,env){
 const url=new URL(request.url);if(!['/api/forecast','/api/profile','/api/marine-observations'].includes(url.pathname))return null;
 const cors=request.headers.get('origin')==='capacitor://localhost'?{'Access-Control-Allow-Origin':'capacitor://localhost','Vary':'Origin'}:{};
 if(request.method==='OPTIONS')return new Response(null,{status:204,headers:{...cors,'Access-Control-Allow-Methods':'GET'}});
 if(url.pathname==='/api/profile'&&request.method==='PUT'){
  if(!env.PROFILE_ADMIN_KEY||request.headers.get('authorization')!=='Bearer '+env.PROFILE_ADMIN_KEY)return new Response('Unauthorized',{status:401});
  if(!env.DB)return new Response('Registry unavailable',{status:503});
  try{const body=await request.text();if(body.length>16384)return new Response('Profile too large',{status:413});const profile=validateProfile(JSON.parse(body));
   if(profile.id==='inlet-beach')return new Response('Approved Inlet baseline cannot be overwritten through profile import',{status:409});
   profile.visible=false;await env.DB.prepare('INSERT INTO beach_profiles(id,body,updated_at) VALUES(?,?,?) ON CONFLICT(id) DO UPDATE SET body=excluded.body,updated_at=excluded.updated_at').bind(profile.id,JSON.stringify(profile),Date.now()).run();return Response.json({id:profile.id,visible:false});
  }catch{return new Response('Invalid beach profile',{status:400});}
 }
 if(request.method!=='GET')return new Response('Method not allowed',{status:405});
 const profile=await resolveProfile(url.searchParams.get('beach')||'inlet-beach',env);if(!profile)return new Response('Beach unavailable',{status:404});
 try{
  const data=url.pathname==='/api/profile'?{profile}:await sharedForecast(profile,env),body=url.pathname==='/api/marine-observations'?data.marineField||{observations:[]}:data;
  return Response.json(body,{headers:{...cors,'Cache-Control':'private, max-age=60','X-Content-Type-Options':'nosniff'}});
 }catch{return Response.json({error:'Forecast temporarily unavailable. Last-known data may remain on this device.'},{status:503,headers:{...cors,'Retry-After':'3','Cache-Control':'no-store'}});}
}
