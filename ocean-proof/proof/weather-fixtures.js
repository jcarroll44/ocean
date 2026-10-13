import {offshorePoints} from '../../src/weather-model.js';
export const FIXTURE_DATE=Date.parse('2026-10-26T17:00:00Z');
const base={swell:2,period:5,direction:201,wind:7,windDirection:220,gust:10,tide:.12,sst:27,temperature:80,apparent:83,humidity:62,visibility:28000,cloud:0,cloudLow:0,cloudMid:0,cloudHigh:0,rain:0,rainProbability:0,weatherCode:0,uv:6,uvClear:6,aod:.08,aqi:30,cape:0,lightningPotential:null,radiation:760,directRadiation:620,lowWind:12,lowDirection:220,midWind:22,midDirection:250,highWind:40,highDirection:270};
export const WEATHER_FIXTURES=Object.freeze([
 {id:'clear',title:'Clear',values:{}},
 {id:'partly-cloudy',title:'Partly cloudy',values:{cloud:34,cloudLow:24,cloudMid:10,cloudHigh:18,radiation:570,directRadiation:340}},
 {id:'overcast',title:'Overcast',values:{cloud:100,cloudLow:100,cloudMid:75,cloudHigh:40,radiation:120,directRadiation:0,humidity:84}},
 {id:'fog',title:'Fog',values:{cloud:100,cloudLow:100,cloudMid:0,cloudHigh:0,visibility:350,humidity:99,weatherCode:45,wind:3,gust:5,radiation:70,directRadiation:0}},
 {id:'light-rain',title:'Light rain',values:{cloud:90,cloudLow:85,cloudMid:60,cloudHigh:45,rain:1.2,rainProbability:80,weatherCode:61,visibility:7000,humidity:92,radiation:120,directRadiation:10}},
 {id:'squall-approaching',title:'Squall approaching',offshore:true,values:{cloud:50,cloudLow:38,cloudMid:45,cloudHigh:30,wind:16,gust:27,lowWind:22,lowDirection:201,radiation:350,directRadiation:160}},
 {id:'thunderstorm',title:'Thunderstorm',offshore:true,values:{cloud:94,cloudLow:82,cloudMid:76,cloudHigh:91,rain:12,rainProbability:95,weatherCode:95,visibility:1600,humidity:97,cape:2400,lightningPotential:12,wind:26,gust:42,swell:6,period:7,tide:.35,radiation:85,directRadiation:8,lowWind:32,midWind:40,highWind:60}},
 {id:'clearing',title:'Clearing',values:{cloud:46,cloudLow:18,cloudMid:28,cloudHigh:42,visibility:22000,humidity:76,wind:12,gust:18,radiation:480,directRadiation:320}},
 // Review a real first-quarter geometry over the sea using a permitted look
 // rotation; the moon is never moved into the default camera's field of view.
 {id:'night-clear',title:'Night clear',night:true,time:Date.parse('2026-10-18T03:30:00Z'),reviewView:'moon-facing',values:{temperature:72,apparent:72,humidity:78,uv:0,uvClear:0,radiation:0,directRadiation:0}},
 {id:'night-storm',title:'Night storm',night:true,offshore:true,values:{cloud:94,cloudLow:82,cloudMid:76,cloudHigh:91,rain:12,rainProbability:95,weatherCode:95,visibility:1600,humidity:97,cape:2400,lightningPotential:12,wind:26,gust:42,swell:6,period:7,tide:.35,uv:0,uvClear:0,radiation:0,directRadiation:0}}
]);
export const HEAVIEST_FIXTURE='night-storm'; // all layers, all rain/surf, 21 storm samples; no daytime deck shortcut
export const WAVE_FIXTURES=Object.freeze([
 {id:'wave-small',title:'Small · 1 ft / 3 s',values:{swell:1,period:3,wind:6,gust:8}},
 {id:'wave-medium',title:'Medium · 3 ft / 7 s',values:{swell:3,period:7,wind:8,gust:11}},
 {id:'wave-groundswell',title:'Groundswell · 6 ft / 11 s',values:{swell:6,period:11,wind:7,gust:10,windDirection:21}},
 {id:'wave-onshore',title:'Onshore · blown out',values:{swell:4,period:5,wind:24,gust:31,windDirection:201}},
 {id:'wave-offshore',title:'Offshore · clean',values:{swell:4,period:9,wind:17,gust:22,windDirection:21}}
]);
export function fixturePartitions(row){
 const height=row.swell*.3048,windFraction=row.period<=4?.88:row.wind>=20?.58:.12,secondary=.12,tertiary=row.swell>=6?.03:0,primary=1-windFraction-secondary-tertiary;
 const component=(name,energy,period,direction)=>({[name+'_height']:Math.sqrt(Math.max(0,energy))*height,[name+'_period']:period,[name+'_direction']:direction});
 return {...row,wave_height:height,wave_period:row.period,wave_peak_period:null,wave_direction:row.direction,
  ...component('wind_wave',windFraction,Math.min(row.period,4.5),row.windDirection),
  ...component('swell_wave',primary,row.period,row.direction),
  ...component('secondary_swell_wave',secondary,row.period*.84,row.direction+32),
  ...component('tertiary_swell_wave',tertiary,row.period*1.22,row.direction-28),
  ocean_current_velocity:.12,ocean_current_direction:105,sea_level_height_msl:row.tide,marineFixture:true};
}
export function fixtureData(id,now=Date.now(),siteOverride=null){
 const fixture=[...WEATHER_FIXTURES,...WAVE_FIXTURES].find(f=>f.id===id);if(!fixture)throw Error('Unknown weather fixture');
 const time=fixture.time??FIXTURE_DATE+(fixture.night?10:0)*3600000,start=(fixture.time??FIXTURE_DATE)-36*3600000,site={lat:siteOverride?.lat??30.28,lon:siteOverride?.lon??-86,facing:siteOverride?.facing??201};
 const offset=site.facing-201;
 const rows=Array.from({length:193},(_,i)=>{
  const row={time:start+i*3600000,...base,...fixture.values,marineFixture:true,gate:{low:0,mid:0,high:0,rain:0}};
  if(siteOverride){for(const key of ['direction','windDirection','lowDirection','midDirection','highDirection'])if(Number.isFinite(row[key]))row[key]=(row[key]+offset+360)%360;}
  return fixturePartitions(row);
 });
 const series=[{...site,miles:0,sector:-1,bearing:201},...offshorePoints(site)].map((point,i)=>({...point,grid:{lat:point.lat,lon:point.lon},rows:rows.map(row=>{
  const p={...row};if(i&&fixture.offshore){const near=point.miles===5,approach=id==='squall-approaching',active=!approach||(!near&&Math.abs(point.sector-3)<=1);
   Object.assign(p,{cloud:active?(approach?100:96):35,cloudLow:approach?(active?100:30):row.cloudLow,cloudMid:approach?(active?90:20):row.cloudMid,cloudHigh:approach?(active?80:15):row.cloudHigh,rain:active?12:0,weatherCode:active?95:2,cape:active?2400:0,lightningPotential:active?12:0});
  }return p;
 })}));
 return {id,title:fixture.title,time,reviewView:fixture.reviewView??'approved beach',source:'fixture',retrievedAt:now,rows,weatherField:{schema:1,source:'Synthetic test fixture',retrievedAt:now,series},feedStatus:{weather:'fixture',marine:'fixture',tide:'fixture',offshore:'fixture'},fixture:true};
}

// Private transition test, never an alternate live data source. Hourly rows are
// sampled by the SAME application interpolation as real forecast hours.
export function scrubDayData(now=Date.now()){
 const data=fixtureData('clear',now),H=3600000,start=FIXTURE_DATE-12*H;
 const values=id=>({...base,...WEATHER_FIXTURES.find(f=>f.id===id).values});
 const anchors=[[0,'clear'],[8,'clear'],[12,'thunderstorm'],[15,'thunderstorm'],[19,'clearing'],[24,'clear']].map(([h,id])=>[h,values(id)]);
 data.id='scrub-day';data.title='Day scrub · clear → storm → clearing';data.time=start;
 data.rows=data.rows.map(row=>{
  const h=((row.time-start)/H%24+24)%24;let index=1;while(anchors[index][0]<h)index++;
  const [a,av]=anchors[index-1],[b,bv]=anchors[index],f=(h-a)/(b-a),r={...row};
  for(const k of Object.keys(base))if(Number.isFinite(av[k])&&Number.isFinite(bv[k]))r[k]=av[k]+(bv[k]-av[k])*f;
  r.weatherCode=h>=11&&h<=16?95:r.rain>.05?61:r.cloud>10?2:0;
  r.temperature=72+10*Math.max(0,Math.sin((h-6)/12*Math.PI))-r.rain*.18;r.apparent=r.temperature+2;r.sst=26.5+.35*Math.sin((h-8)/12*Math.PI);
  r.tide=.35*Math.cos((h-9)*Math.PI/6.2);const daylight=Math.max(0,Math.sin((h-6)/12*Math.PI));
  for(const k of ['radiation','directRadiation','uv','uvClear'])r[k]*=daylight;
  return fixturePartitions(r);
 });
 data.weatherField.series=data.weatherField.series.map(p=>({...p,rows:data.rows.map(r=>({...r}))}));
 return data;
}
