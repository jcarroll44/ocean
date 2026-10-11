import assert from 'node:assert/strict';import fs from 'node:fs';
import {weatherURL,WEATHER_FIELDS,offshorePoints,parseWeatherField,sampleWeather,sampledOffshore,thunderPotential,integrateCloudWind} from '../src/weather-model.js';
import {fixtureData,WEATHER_FIXTURES,HEAVIEST_FIXTURE} from '../ocean-proof/proof/weather-fixtures.js';
const site={lat:30.28,lon:-86,facing:201},url=new URL(weatherURL(site)),points=offshorePoints(site),H=3600000;
assert.equal(points.length,21);assert.deepEqual([...new Set(points.map(p=>p.miles))],[5,20,40]);assert.equal(url.searchParams.get('latitude').split(',').length,22);assert.equal(url.searchParams.get('cell_selection'),'sea');
const haversine=(a,b)=>{const R=Math.PI/180,dlat=(b.lat-a.lat)*R,dlon=(b.lon-a.lon)*R;return 6371000*2*Math.asin(Math.sqrt(Math.sin(dlat/2)**2+Math.cos(a.lat*R)*Math.cos(b.lat*R)*Math.sin(dlon/2)**2));};
for(const p of points)assert(Math.abs(haversine(site,p)/1609.344-p.miles)<1e-8);
const rows=[{time:0,wind:10,windDirection:350,rain:0,cape:null,lightningPotential:null,cloud:34,lowWind:10,lowDirection:350},{time:H,wind:20,windDirection:10,rain:2,cape:1200,lightningPotential:null,cloud:80,lowWind:10,lowDirection:10},{time:2*H,wind:null,windDirection:null,rain:null,cape:null,lowWind:10,lowDirection:10}];
assert.equal(sampleWeather(rows,H/2).wind,15);assert.equal(sampleWeather(rows,H/2).windDirection,0);assert.equal(sampleWeather(rows,H/2).cape,null);assert.equal(sampleWeather(rows,1.5*H).wind,null);assert.equal(sampleWeather(rows,-1),null);assert.equal(sampleWeather(rows,2*H+1),null);assert.equal(sampleWeather(rows,0).cloud,34);
assert.equal(thunderPotential({}),null);assert.equal(thunderPotential({cape:3000,rain:0}).value,0);assert.equal(thunderPotential({cape:3000,rain:4}).value,1);assert.equal(thunderPotential({weatherCode:95}).value,1);
assert.deepEqual(integrateCloudWind(rows,H,'low'),integrateCloudWind(rows,H,'low'));assert(integrateCloudWind(rows,H,'low').every(Number.isFinite));
const now=Date.now(),fixture=fixtureData(HEAVIEST_FIXTURE,now);assert.equal(fixture.source,'fixture');assert.equal(sampledOffshore(fixture.weatherField,fixture.time,now).length,21);assert.equal(sampledOffshore({...fixture.weatherField,retrievedAt:now-25*H},fixture.time,now).length,0);
const units={time:'unixtime',wind_speed_10m:'kn',precipitation:'mm',visibility:'m',temperature_2m:'°F',shortwave_radiation_instant:'W/m²',direct_radiation_instant:'W/m²'};for(const k of ['cloud_cover','cloud_cover_low','cloud_cover_mid','cloud_cover_high','relative_humidity_2m'])units[k]='%';
for(const k of ['wind_gusts_10m','wind_speed_850hPa','wind_speed_500hPa','wind_speed_250hPa'])units[k]='kn';
for(const k of ['wind_direction_10m','wind_direction_850hPa','wind_direction_500hPa','wind_direction_250hPa'])units[k]='°';
const payload=fixture.weatherField.series.map(s=>({latitude:s.lat,longitude:s.lon,hourly_units:units,hourly:{time:s.rows.map(r=>r.time/1000),...Object.fromEntries(Object.entries(WEATHER_FIELDS).map(([k,v])=>[v,s.rows.map(r=>r[k]??null)]))}}));
assert.equal(parseWeatherField(payload,site,now).series.length,22);assert.throws(()=>parseWeatherField(payload.slice(1),site));assert.throws(()=>parseWeatherField(payload.map((p,i)=>i?p:{...p,hourly_units:{...units,temperature_2m:'°C'}}),site));
for(const f of WEATHER_FIXTURES){const data=fixtureData(f.id);assert.equal(data.rows.length,193);for(const r of data.rows)assert(r.cloud>=Math.max(r.cloudLow,r.cloudMid,r.cloudHigh));assert.equal(data.weatherField.series.length,22);}
assert.equal(WEATHER_FIXTURES.length,10);assert.equal(HEAVIEST_FIXTURE,'night-storm');
const motion=fixtureData('squall-approaching',now).weatherField;
for(const p of motion.series)p.rows[37].rain*=.5;
const exact=sampledOffshore(motion,FIXED_TIME(),now);
function FIXED_TIME(){return motion.series[0].rows[36].time;}
for(const [i,p] of exact.entries())assert.equal(p.conditions.rain,motion.series[i+1].rows[36].rain,'Hourly knot must remain exact');
const midway=sampledOffshore(motion,FIXED_TIME()+H/2,now);assert(midway.every(p=>Number.isFinite(p.conditions.rain)));
for(const p of motion.series)for(const r of p.rows)r.windDirection=(r.windDirection+180)%360;
const reverse=sampledOffshore(motion,FIXED_TIME()+H/2,now);assert(midway.some((p,i)=>Math.abs(p.conditions.rain-reverse[i].conditions.rain)>.01),'Forecast wind direction must affect sub-hour movement');
assert.deepEqual(reverse,sampledOffshore(motion,FIXED_TIME()+H/2,now),'Reverse scrub must be deterministic');
const result={checks:['21 samples at 5/20/40 miles','22-location request and validated units','bounded time interpolation, no extrapolation or borrowed nulls','circular wind interpolation','potential requires forecast support','24-hour cache expiry','ten labelled synthetic fixtures'],phoneFPS:null,renderedScreenshots:null};fs.writeFileSync('night-report/weather-data-checks.json',JSON.stringify(result,null,2));console.log('PASS: '+result.checks.join('; '));
