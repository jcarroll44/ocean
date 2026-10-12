import {INLET_PROFILE,validateProfile} from '../src/beach-profiles.js';
import {weatherDestination} from '../src/weather-model.js';
export function distanceKm(a,b){const r=Math.PI/180,d=(b.lat-a.lat)*r,l=(b.lon-a.lon)*r;return 12742*Math.asin(Math.min(1,Math.sqrt(Math.sin(d/2)**2+Math.cos(a.lat*r)*Math.cos(b.lat*r)*Math.sin(l/2)**2)));}
export function coastlineNormal(point,elements){
 const cos=Math.cos(point.lat*Math.PI/180),segments=[];
 for(const way of elements||[])for(let i=1;i<(way.geometry?.length||0);i++){
  const a=way.geometry[i-1],b=way.geometry[i],ax=(a.lon-point.lon)*cos,ay=a.lat-point.lat,dx=(b.lon-a.lon)*cos,dy=b.lat-a.lat,len=Math.hypot(dx,dy);if(len<1e-7)continue;
  const t=Math.max(0,Math.min(1,-(ax*dx+ay*dy)/(len*len))),distance=Math.hypot(ax+t*dx,ay+t*dy)*111195;
  // OSM coastline ways have land on the left and sea on the right.
  segments.push({distance,east:dy/len,north:-dx/len,length:len*111195,id:way.id});
 }
 segments.sort((a,b)=>a.distance-b.distance);if(!segments.length||segments[0].distance>10000)throw Error('No nearby coastline');
 const near=segments.filter(s=>s.distance<segments[0].distance+1500),x=near.reduce((v,s)=>v+s.east*s.length/(100+s.distance)**2,0),y=near.reduce((v,s)=>v+s.north*s.length/(100+s.distance)**2,0);
 return {facing:(Math.atan2(x,y)*180/Math.PI+360)%360,distance:segments[0].distance,ways:[...new Set(near.map(s=>s.id))]};
}
export function nearestStations(point,stations,{maximum=500,count=3,seaward=false,facing=0}={}){
 return stations.map(s=>({...s,distanceKm:distanceKm(point,s)})).filter(s=>s.distanceKm<maximum&&(!seaward||((s.lon-point.lon)*Math.cos(point.lat*Math.PI/180)*Math.sin(facing*Math.PI/180)+(s.lat-point.lat)*Math.cos(facing*Math.PI/180))>-.01)).sort((a,b)=>a.distanceKm-b.distanceKm).slice(0,count);
}
export function osmElements(xml){
 const attrs=s=>Object.fromEntries([...s.matchAll(/([\w:]+)="([^"]*)"/g)].map(x=>[x[1],x[2]])),nodes=new Map();
 for(const m of xml.matchAll(/<node\s+([^>]+)>?/g)){const a=attrs(m[1]);nodes.set(a.id,{lat:+a.lat,lon:+a.lon});}
 return [...xml.matchAll(/<way\s+([^>]+)>([\s\S]*?)<\/way>/g)].filter(m=>/<tag\s+k="natural"\s+v="coastline"/.test(m[2])).map(m=>({id:+attrs(m[1]).id,geometry:[...m[2].matchAll(/<nd\s+ref="(\d+)"/g)].map(n=>nodes.get(n[1])).filter(Boolean)}));
}
export async function generateProfile(lat,lon,{fetcher=fetch,now=Date.now()}={}){
 if(!Number.isFinite(lat)||!Number.isFinite(lon)||Math.abs(lat)>85||Math.abs(lon)>180)throw Error('Coordinates out of range');
 const point={lat,lon},warnings=[],get=async url=>{const r=await fetcher(url,{signal:AbortSignal.timeout(20000),headers:{'User-Agent':'DayBuoy beach profile generator'}});if(!r.ok)throw Error('Profile source unavailable');return r;};
 const query=`[out:json][timeout:15];way[natural=coastline](around:10000,${lat},${lon});out geom;`;
 const results=await Promise.allSettled([
  get('https://overpass-api.de/api/interpreter?data='+encodeURIComponent(query)).then(r=>r.json()),
  get('https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations.json?type=tidepredictions').then(r=>r.json()),
  get('https://api.weather.gov/points/'+lat.toFixed(4)+','+lon.toFixed(4)).then(r=>r.json()),
  get('https://www.ndbc.noaa.gov/activestations.xml').then(r=>r.text())
 ]);
 const val=i=>results[i].status==='fulfilled'?results[i].value:null;
 const pacific=lon< -110&&lon> -140,atlantic=lon> -82&&lon< -60,gulf=lat>20&&lat<32&&lon>=-100&&lon<=-82;
 let normal;try{normal=coastlineNormal(point,val(0)?.elements);}catch{
  try{const xml=await get(`https://api.openstreetmap.org/api/0.6/map?bbox=${lon-.01},${lat-.01},${lon+.01},${lat+.01}`).then(r=>r.text());normal=coastlineNormal(point,osmElements(xml));}
  catch{warnings.push('Coastline unavailable: regional facing est.; verify before publishing');normal={facing:pacific?270:atlantic?90:gulf?180:0,ways:[]};}
 }
 const facing=+normal.facing.toFixed(2),tides=nearestStations(point,(val(1)?.stations||[]).filter(s=>/^\d{7}$/.test(s.id)).map(s=>({id:s.id,lat:+s.lat,lon:+s.lng,name:s.name})),{maximum:150,count:1});
 const stations=[...(val(3)||'').matchAll(/<station\s+([^>]+)\/?\s*>/g)].map(m=>Object.fromEntries([...m[1].matchAll(/([\w]+)="([^"]*)"/g)].map(x=>[x[1],x[2]]))).filter(s=>s.met==='y'&&/^(buoy|fixed)$/.test(s.type||'buoy')).map(s=>({id:s.id,lat:+s.lat,lon:+s.lon,name:s.name}));
 const buoys=nearestStations(point,stations.filter(s=>/^\d{5}$/.test(s.id)),{maximum:500,count:3,seaward:true,facing});let nws=val(2)?.properties;
 if(!nws||/\/(AM|GM|PM|PZ|AN|LM|LE|LH|LO|LS)Z\d+$/.test(nws.forecastZone||'')){
  const inland=weatherDestination(lat,lon,.6,(facing+180)%360);
  try{nws=(await get('https://api.weather.gov/points/'+inland.lat.toFixed(4)+','+inland.lon.toFixed(4)).then(r=>r.json())).properties;}catch{}
 }
 const zone=nws?.forecastZone?.split('/').at(-1)||null,office=nws?.cwa||null;
 if(!tides.length)warnings.push('NOAA tide station unavailable; Open-Meteo MSL est. fallback');if(!buoys.length)warnings.push('NDBC unavailable; model waves est. without calibration');if(!zone)warnings.push('NWS surf zone unavailable; model breakers est.');
 let tz=nws?.timeZone;
 if(!tz){const {default:tzLookup}=await import('tz-lookup');tz=tzLookup(lat,lon);}
 const region=pacific?'Pacific coast':atlantic?'Atlantic coast':gulf?'Gulf coast':'Sandy coast';
 const p={...structuredClone(INLET_PROFILE),id:'beach-'+lat.toFixed(4).replace('-','s').replace('.','-')+'-'+lon.toFixed(4).replace('-','w').replace('.','-'),name:nws?.relativeLocation?.properties?.city||'Beach',visible:false,region,lat,lon,zone:tz,facing,shoreline:(facing+90)%360,marine:weatherDestination(lat,lon,2.5,facing),tideStation:tides[0]?.id??null,surfZone:zone,surfOffice:office,surfName:nws?.relativeLocation?.properties?.city||null,buoys,
  water:pacific?{absorption:[.34,.095,.045],scattering:[.012,.021,.027]}:atlantic?{absorption:[.3,.095,.04],scattering:[.018,.035,.029]}:INLET_PROFILE.water,
  sand:pacific?[[.71,.65,.55],[.81,.76,.66],[.75,.69,.59]]:atlantic?[[.78,.73,.63],[.87,.82,.72],[.81,.76,.66]]:INLET_PROFILE.sand,
  bars:{...INLET_PROFILE.bars,source:'typical sandy coast two-bar profile est.; not surveyed'},
  camera:{...INLET_PROFILE.camera,...(pacific?{yawMin:-70,yawMax:102}:{})},
  provenance:{generatedAt:now,facing:normal.ways.length?'est. · OpenStreetMap coastline (ODbL)':'est. · regional fallback',coastlineWays:normal.ways,coastlineDistanceM:normal.distance??null,tide:'nearest NOAA prediction station by distance; est. local tide',surf:'NWS point forecast zone; availability verified on surf-product fetch',buoys:'nearest seaward NOAA NDBC active stations; wave observations may be unavailable',colors:'est. · regional defaults',warnings}};
 return validateProfile(p);
}
