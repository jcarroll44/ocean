import {offshorePoints,thunderPotential} from '../src/weather-model.js';
const HOUR=3600000,finite=Number.isFinite;
const number=v=>finite(v)?v:null,scale=(v,k,b=0)=>finite(v)?v*k+b:null;
export async function providerJSON(url,fetcher=fetch,headers={}){
 const response=await fetcher(url,{headers:{'User-Agent':'DayBuoy forecast service (daybuoy-night-pass.jacobcarroll51.chatgpt.site)',Accept:'application/json',...headers},signal:AbortSignal.timeout(15000)});
 if(!response.ok)throw Error('Weather provider HTTP '+response.status);
 const body=await response.json();if(body?.error)throw Error('Weather provider unavailable');return body;
}
const base64url=bytes=>btoa(typeof bytes==='string'?bytes:String.fromCharCode(...new Uint8Array(bytes))).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'');
let jwtCache;
export async function weatherKitToken(env,now=Date.now()){
 if(!env.WEATHERKIT_PRIVATE_KEY||!env.WEATHERKIT_KEY_ID||!env.WEATHERKIT_TEAM_ID||!env.WEATHERKIT_SERVICE_ID)throw Error('WeatherKit not configured');
 const identity=[env.WEATHERKIT_KEY_ID,env.WEATHERKIT_TEAM_ID,env.WEATHERKIT_SERVICE_ID].join('.');
 if(jwtCache?.id===identity&&jwtCache.expires>now+60000)return jwtCache.token;
 const iat=Math.floor(now/1000),header={alg:'ES256',kid:env.WEATHERKIT_KEY_ID,id:env.WEATHERKIT_TEAM_ID+'.'+env.WEATHERKIT_SERVICE_ID},payload={iss:env.WEATHERKIT_TEAM_ID,sub:env.WEATHERKIT_SERVICE_ID,iat,exp:iat+1800};
 const pem=env.WEATHERKIT_PRIVATE_KEY.replaceAll('\\n','\n').replace(/-----[^-]+-----|\s/g,''),key=await crypto.subtle.importKey('pkcs8',Uint8Array.from(atob(pem),c=>c.charCodeAt(0)),{name:'ECDSA',namedCurve:'P-256'},false,['sign']);
 const input=base64url(JSON.stringify(header))+'.'+base64url(JSON.stringify(payload)),sig=await crypto.subtle.sign({name:'ECDSA',hash:'SHA-256'},key,new TextEncoder().encode(input));
 const token=input+'.'+base64url(sig);jwtCache={id:identity,expires:(iat+1800)*1000,token};return token;
}
export function weatherCode(code){
 if(/Thunderstorms|Thunderstorm|IsolatedThunderstorms|ScatteredThunderstorms/i.test(code))return 95;
 if(/Fog|Haze|Smok/i.test(code))return 45;
 if(/HeavyRain/i.test(code))return 65;if(/Rain|Showers/i.test(code))return 61;if(/Drizzle/i.test(code))return 51;
 if(/Snow|Flurries|Blizzard/i.test(code))return 71;if(/MostlyCloudy/i.test(code))return 3;if(/PartlyCloudy/i.test(code))return 2;if(/Cloudy/i.test(code))return 3;return 0;
}
// Hourly cloud layers/upper-air winds are not in the published WeatherKit REST
// hourly schema. Preserve total cover; derived visual layers are labelled est.
export function completeAppearance(row){
 const r={...row},c=r.cloud;
 for(const [key,k] of [['cloudLow',.8],['cloudMid',.65],['cloudHigh',.5]])if(!finite(r[key]))r[key]=scale(c,k);
 for(const layer of ['low','mid','high']){r[layer+'Wind']??=r.wind;r[layer+'Direction']??=r.windDirection;}
 r.thunder=thunderPotential(r)?.value??0;
 r.appearanceSource='est. · '+r.weatherSource+'; cloud layers and advection from total cloud and surface wind';
 return r;
}
export function parseWeatherKit(data){
 const rows=(data?.forecastHourly?.hours||[]).map(h=>completeAppearance({time:Date.parse(h.forecastStart),temperature:scale(h.temperature,1.8,32),apparent:scale(h.temperatureApparent,1.8,32),cloud:scale(h.cloudCover,100),humidity:scale(h.humidity,100),rainProbability:scale(h.precipitationChance,100),rain:number(h.precipitationAmount),wind:scale(h.windSpeed,1/1.852),windDirection:number(h.windDirection),gust:scale(h.windGust,1/1.852),visibility:number(h.visibility),uv:number(h.uvIndex),uvClear:null,weatherCode:weatherCode(h.conditionCode),weatherSource:'Apple Weather',radiation:null,directRadiation:null,cape:null,lightningPotential:null,aod:null,aqi:null})).filter(r=>finite(r.time));
 if(rows.length<6)throw Error('WeatherKit hours unavailable');return rows;
}
function durationMs(s){const m=s.match(/^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?)?$/);return m?((+m[1]||0)*86400+(+m[2]||0)*3600+(+m[3]||0)*60+(+m[4]||0))*1000:0;}
export function gridValue(field,time){for(const v of field?.values||[]){const [start,span]=v.validTime.split('/'),a=Date.parse(start),d=durationMs(span||'');if(time>=a&&time<a+d)return {value:v.value,duration:d,unit:field.uom};}return {value:null,duration:0,unit:field?.uom};}
export function parseNWS(grid,now=Date.now()){
 const p=grid?.properties;if(!p?.temperature?.values?.length)throw Error('NWS grid unavailable');
 const begin=Math.floor(Math.max(now-24*HOUR,Math.min(...p.temperature.values.map(v=>Date.parse(v.validTime.split('/')[0]))))/HOUR)*HOUR,ends=p.temperature.values.map(v=>{const [a,d]=v.validTime.split('/');return Date.parse(a)+durationMs(d||'');}),end=Math.min(begin+8*24*HOUR,Math.max(...ends)),rows=[];
 for(let time=begin;time<end;time+=HOUR){
  const v=k=>gridValue(p[k],time),n=k=>number(v(k).value),temp=n('temperature'),heat=n('heatIndex'),chill=n('windChill'),wind=v('windSpeed'),gust=v('windGust'),rain=v('quantitativePrecipitation'),sky=n('skyCover');
  const kn=x=>!finite(x.value)?null:/km_h-1/.test(x.unit)?x.value/1.852:/m_s-1/.test(x.unit)?x.value/.514444:/mi_h-1/.test(x.unit)?x.value*.868976:/kn/.test(x.unit)?x.value:null;
  const weather=v('weather').value||[],names=weather.map(x=>x.weather||'').join(' '),prob=n('probabilityOfPrecipitation'),visibility=n('visibility');
  rows.push(completeAppearance({time,temperature:scale(temp,1.8,32),apparent:scale(heat??chill??temp,1.8,32),apparentEstimated:heat===null&&chill===null,cloud:sky,humidity:n('relativeHumidity'),rain:finite(rain.value)&&rain.duration>0?rain.value/(rain.duration/HOUR):null,rainProbability:prob,wind:kn(wind),gust:kn(gust),windDirection:n('windDirection'),visibility,weatherCode:/thunderstorms/i.test(names)?95:/fog/i.test(names)?45:/rain|showers/i.test(names)?61:sky>=85?3:sky>=25?2:0,uv:null,uvClear:null,weatherSource:'NOAA NWS',rainEstimated:rain.duration>HOUR,radiation:null,directRadiation:null,cape:null,lightningPotential:null,aod:null,aqi:null}));
 }
 if(rows.length<6)throw Error('NWS hours unavailable');return rows;
}
async function pool(items,fn,count=4){const out=Array(items.length);let i=0;await Promise.all(Array.from({length:count},async()=>{while(i<items.length){const n=i++;try{out[n]={status:'fulfilled',value:await fn(items[n],n)};}catch{out[n]={status:'rejected'};}}}));return out;}
async function nwsPoint(point,env,fetcher,now){
 const id='nws:'+point.lat.toFixed(4)+','+point.lon.toFixed(4);let cached;
 if(env.DB)cached=await env.DB.prepare('SELECT body,fetched_at FROM provider_metadata WHERE id=?').bind(id).first();
 let metadata=cached&&now-cached.fetched_at<7*86400000?JSON.parse(cached.body):null;
 if(!metadata){metadata=await providerJSON('https://api.weather.gov/points/'+point.lat.toFixed(4)+','+point.lon.toFixed(4),fetcher);if(env.DB)await env.DB.prepare('INSERT INTO provider_metadata(id,body,fetched_at) VALUES(?,?,?) ON CONFLICT(id) DO UPDATE SET body=excluded.body,fetched_at=excluded.fetched_at').bind(id,JSON.stringify(metadata),now).run();}
 const url=metadata.properties?.forecastGridData;if(!/^https:\/\/api\.weather\.gov\/gridpoints\//.test(url||''))throw Error('NWS grid unavailable');
 return parseNWS(await providerJSON(url,fetcher),now);
}
export async function loadWeather(profile,env={},fetcher=fetch,now=Date.now()){
 const points=[{...profile,miles:0,bearing:profile.facing,sector:-1},...offshorePoints(profile)];let token;
 try{token=await weatherKitToken(env,now);}catch{}
 const results=await pool(points,async p=>{
  if(token){try{const url=new URL(`https://weatherkit.apple.com/api/v1/weather/en/${p.lat.toFixed(4)}/${p.lon.toFixed(4)}`);url.searchParams.set('dataSets','forecastHourly');url.searchParams.set('timezone',profile.zone);url.searchParams.set('hourlyStart',new Date(now-24*HOUR).toISOString());url.searchParams.set('hourlyEnd',new Date(now+8*24*HOUR).toISOString());return {rows:parseWeatherKit(await providerJSON(url,fetcher,{Authorization:'Bearer '+token})),source:'Apple Weather'};}catch{}}
  return {rows:await nwsPoint(p,env,fetcher,now),source:'NOAA NWS'};
 });
 if(results[0].status!=='fulfilled')throw Error('General weather unavailable');
 const primary=results[0].value,series=points.map((p,i)=>({...p,grid:{lat:p.lat,lon:p.lon},rows:results[i].status==='fulfilled'?results[i].value.rows:[],source:results[i].value?.source||'unavailable'}));
 return {rows:primary.rows,source:primary.source,weatherField:{schema:1,source:primary.source,retrievedAt:now,series},status:{weather:'fulfilled',offshore:results.slice(1).some(r=>r.status==='fulfilled')?'fulfilled':'rejected',weatherKit:token?(primary.source==='Apple Weather'?'active':'provider-unavailable'):'not-configured'},attribution:primary.source==='Apple Weather'?{name:'Apple Weather',legalURL:'https://weatherkit.apple.com/legal-attribution.html'}:null};
}
