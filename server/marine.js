import {parseNDBC,marineURL,parseMarine,sampleMarine} from '../src/marine-model.js';
// Server proxy is necessary: NDBC text products do not provide browser CORS.
// Fixed upstream URLs only. No credentials, user URL, or location history.
const STATIONS=[{id:'42012',lat:30.060,lon:-87.548},{id:'42039',lat:28.787,lon:-86.006},{id:'42036',lat:28.501,lon:-84.508}];
const distance=p=>{const r=Math.PI/180,a=(p.lat-30.28)*r,b=(p.lon+86)*r;return 12742*Math.asin(Math.sqrt(Math.sin(a/2)**2+Math.cos(30.28*r)*Math.cos(p.lat*r)*Math.sin(b/2)**2));};
let cached=null,pending=null;
export async function loadMarineObservations(fetcher=fetch,now=Date.now()){
 const results=await Promise.allSettled(STATIONS.map(async station=>{
  const url=`https://www.ndbc.noaa.gov/data/realtime2/${station.id}.txt`,response=await fetcher(url,{signal:AbortSignal.timeout(11000),headers:{'User-Agent':'DayBuoy marine forecast (daybuoy-night-pass.jacobcarroll51.chatgpt.site)'}});if(!response.ok)throw Error('NDBC unavailable');
  const observation=parseNDBC(await response.text(),station.id,now);if(!observation)return null;
  const modelResponse=await fetcher(marineURL(station,['wave_height','wave_period','wave_direction'],'ncep_gfswave025'),{signal:AbortSignal.timeout(11000)});
  const model=modelResponse.ok?sampleMarine(parseMarine(await modelResponse.json()),observation.time):null;
  return {...observation,latitude:station.lat,longitude:station.lon,distanceKm:distance(station),modelHeight:model?.wave_height??null,modelTime:model?.time??null,url};
 }));
 return {source:'NOAA NDBC regional observations',retrievedAt:now,observations:results.flatMap(r=>r.status==='fulfilled'&&r.value?[r.value]:[]),stations:STATIONS.map((s,i)=>({id:s.id,status:results[i].status==='fulfilled'&&results[i].value?'available':'unavailable'})),method:'Regional height calibration est.: compare observed Hs with model at buoy and observation time; 25% of weighted residual, capped ±15%, fading to zero within two hours. Buoys are offshore, not Inlet Beach surf measurements.'};
}
export async function handleMarine(request){
 if(new URL(request.url).pathname!=='/api/marine-observations')return null;
 if(request.method!=='GET')return new Response('Method not allowed',{status:405});
 if(!cached||Date.now()-cached.retrievedAt>600000){pending??=loadMarineObservations().then(v=>cached=v).finally(()=>pending=null);await pending;}
 return Response.json(cached,{headers:{'Cache-Control':'private, max-age=300','X-Content-Type-Options':'nosniff'}});
}
