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
 {id:'thunderstorm',title:'Thunderstorm · heaviest fixture',offshore:true,values:{cloud:94,cloudLow:82,cloudMid:76,cloudHigh:91,rain:12,rainProbability:95,weatherCode:95,visibility:1600,humidity:97,cape:2400,lightningPotential:12,wind:26,gust:42,swell:6,period:7,tide:.35,radiation:85,directRadiation:8,lowWind:32,midWind:40,highWind:60}},
 {id:'clearing',title:'Clearing',values:{cloud:46,cloudLow:18,cloudMid:28,cloudHigh:42,visibility:22000,humidity:76,wind:12,gust:18,radiation:480,directRadiation:320}},
 {id:'night-clear',title:'Night clear',night:true,values:{temperature:72,apparent:72,humidity:78,uv:0,uvClear:0,radiation:0,directRadiation:0}},
 {id:'night-storm',title:'Night storm',night:true,offshore:true,values:{cloud:94,cloudLow:82,cloudMid:76,cloudHigh:91,rain:12,rainProbability:95,weatherCode:95,visibility:1600,humidity:97,cape:2400,lightningPotential:12,wind:26,gust:42,swell:6,period:7,tide:.35,uv:0,uvClear:0,radiation:0,directRadiation:0}}
]);
export const HEAVIEST_FIXTURE='night-storm'; // all layers, all rain/surf, 21 storm samples; no daytime deck shortcut
export function fixtureData(id,now=Date.now()){
 const fixture=WEATHER_FIXTURES.find(f=>f.id===id);if(!fixture)throw Error('Unknown weather fixture');
 const time=FIXTURE_DATE+(fixture.night?10:0)*3600000,start=FIXTURE_DATE-36*3600000,site={lat:30.28,lon:-86,facing:201};
 const rows=Array.from({length:193},(_,i)=>({time:start+i*3600000,...base,...fixture.values,gate:{low:0,mid:0,high:0,rain:0}}));
 const series=[{...site,miles:0,sector:-1,bearing:201},...offshorePoints(site)].map((point,i)=>({...point,grid:{lat:point.lat,lon:point.lon},rows:rows.map(row=>{
  const p={...row};if(i&&fixture.offshore){const near=point.miles===5,approach=id==='squall-approaching',active=!approach||!near;
   Object.assign(p,{cloud:active?96:35,rain:active?12:0,weatherCode:active?95:2,cape:active?2400:0,lightningPotential:active?12:0});
  }return p;
 })}));
 return {id,title:fixture.title,time,source:'fixture',retrievedAt:now,rows,weatherField:{schema:1,source:'Synthetic test fixture',retrievedAt:now,series},feedStatus:{weather:'fixture',marine:'fixture',tide:'fixture',offshore:'fixture'},fixture:true};
}
