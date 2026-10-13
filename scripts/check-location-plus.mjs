import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {profileScene,profileApp} from './profile-adapter.mjs';
import {DatabaseSync} from 'node:sqlite';
import {INLET_PROFILE,BEACH_PROFILES,validateProfile} from '../src/beach-profiles.js';
import {coastlineNormal,nearestStations} from '../server/profile-generator.js';
import {parseWeatherKit,parseNWS,weatherKitToken} from '../server/weather-providers.js';
import {sharedForecast,packCache,unpackCache,surfHasZone,commercialMarineURL,handleForecast} from '../server/forecast.js';
import {entitlementState,offeringPlans,PLUS_PRODUCTS} from '../src/plus-model.js';
const H=3600000,now=Date.UTC(2026,9,12,12),p=INLET_PROFILE;
// Exercise the shipped profile-adapted camera, including an inland solar bearing.
for(const profile of Object.values(BEACH_PROFILES)){
 const c={console,TextDecoder,URLSearchParams,location:{search:'?beach='+profile.id}};vm.createContext(c);
 vm.runInContext(profileScene(fs.readFileSync('src/scene-data.js','utf8')),c);
 assert.equal(c.__daybuoyProfile.id,profile.id);
 Object.assign(c,{THREE:c.__mods['three.module.js'],SITE:c.__mods['config.js'].SITE,RAD:Math.PI/180});
 const camera=profileApp(fs.readFileSync('src/camera.js','utf8')).split('function approvedBeachTarget')[0];vm.runInContext(camera,c);
 for(const elevation of [-15,0,10,30,60])for(const bearing of [-180,-110,-90,-60,0,60,90,110,180]){
  const pose=vm.runInContext(`sunEl=${elevation};sunRel=${bearing};beachPose()`,c),d=pose.tgt.clone().sub(pose.pos),yaw=Math.atan2(d.x,-d.z)*180/Math.PI;
  assert(pose.pos.z>0&&d.z<0,'Automatic camera must stay on land and face water');
  assert(Math.abs(yaw)+pose.fov/2<90,'Entire horizon must remain in the seaward hemisphere');
 }
}
for(const profile of Object.values(BEACH_PROFILES))assert.equal(validateProfile(profile),profile);
assert.equal(Object.values(BEACH_PROFILES).filter(p=>p.visible).length,1);
assert.deepEqual(p.water,{absorption:[.42,.075,.035],scattering:[.012,.018,.024]});assert.equal(p.facing,201);assert.equal(p.camera.restRadius,28.52);assert.equal(p.camera.horizon,.23);
const normal=g=>coastlineNormal({lat:0,lon:0},[{id:1,geometry:g.map(([lon,lat])=>({lat,lon}))}]).facing;
assert.equal(normal([[-.01,0],[.01,0]]),180);assert.equal(normal([[0,-.01],[0,.01]]),90);assert.equal(normal([[0,.01],[0,-.01]]),270);
assert.equal(nearestStations({lat:0,lon:0},[{id:'a',lat:0,lon:1},{id:'b',lat:0,lon:.01}],{count:1})[0].id,'b');
assert(surfHasZone('FLZ141-154-159-164-247-347-447-547-647-747-131015-', 'FLZ747'));assert(surfHasZone('FLZ101>110-131015-', 'FLZ108'));assert(!surfHasZone('FLZ101>107-131015-', 'FLZ108'));
const hours=Array.from({length:8},(_,i)=>({forecastStart:new Date(now+i*H).toISOString(),temperature:25,temperatureApparent:26,cloudCover:.6,humidity:.8,windSpeed:18.52,windGust:37.04,windDirection:90,conditionCode:'HeavyRain',precipitationAmount:3,uvIndex:i}));
const wk=parseWeatherKit({forecastHourly:{hours}});assert.equal(wk[0].temperature,77);assert(Math.abs(wk[0].wind-10)<1e-12);assert(Math.abs(wk[0].gust-20)<1e-12);assert.equal(wk[0].cloud,60);assert.equal(wk[0].weatherCode,65);assert.equal(wk[0].radiation,null);
const field=(value,uom)=>({uom,values:[{validTime:new Date(now-6*H).toISOString()+'/PT24H',value}]});
const nws=parseNWS({properties:{temperature:field(25),skyCover:field(70),windSpeed:field(18.52,'wmoUnit:km_h-1'),weather:field([]),quantitativePrecipitation:field(24)}},now);assert.equal(nws[0].time,now-6*H);assert.equal(nws[0].rain,1);assert.equal(nws[0].uv,null);
// Ephemeral cryptographic material only, never persisted or printed.
const keys=await crypto.subtle.generateKey({name:'ECDSA',namedCurve:'P-256'},true,['sign','verify']),pem=Buffer.from(await crypto.subtle.exportKey('pkcs8',keys.privateKey)).toString('base64');
const token=await weatherKitToken({WEATHERKIT_PRIVATE_KEY:pem,WEATHERKIT_TEAM_ID:'TESTTEAM',WEATHERKIT_KEY_ID:'TESTKEY',WEATHERKIT_SERVICE_ID:'test.weather'},now),parts=token.split('.');
assert.equal(JSON.parse(Buffer.from(parts[1],'base64url')).exp,now/1000+1800);assert(await crypto.subtle.verify({name:'ECDSA',hash:'SHA-256'},keys.publicKey,Buffer.from(parts[2],'base64url'),new TextEncoder().encode(parts[0]+'.'+parts[1])));
const db=new DatabaseSync(':memory:');db.exec(fs.readFileSync('hosting/drizzle/0000_heavy_doctor_doom.sql','utf8'));
const DB={prepare(sql){return {bind(...args){return {
 async run(){const r=db.prepare(sql).run(...args);return {meta:{changes:Number(r.changes)}};},
 async first(){return db.prepare(sql).get(...args)||null;}
 };}};}};
let calls=0;const loader=async(profile,env,fetcher,time)=>{calls++;return {schema:3,profileId:profile.id,retrievedAt:time,rows:wk};};
const first=await sharedForecast(p,{DB},{now,loader});assert.equal(first.source,'live');
await Promise.all(Array.from({length:100},()=>sharedForecast(p,{DB},{now:now+10,loader})));assert.equal(calls,1,'One shared provider batch per beach/hour');
await sharedForecast(BEACH_PROFILES['cocoa-beach'],{DB},{now,loader});assert.equal(calls,2);
await sharedForecast(p,{DB},{now:now+H,loader});assert.equal(calls,3);
const stale=await sharedForecast(p,{DB},{now:now+2*H,loader:async()=>{calls++;throw Error('provider failure');}});assert.equal(stale.source,'saved');assert(stale.cache.stale);
await sharedForecast(p,{DB},{now:now+2*H+1000,loader});assert.equal(calls,4,'Failure cannot stampede providers');
await assert.rejects(sharedForecast(p,{DB},{now:now+26*H,loader:async()=>{throw Error('still offline');}}));
const compressed=await packCache(first);assert.deepEqual(await unpackCache(compressed),first);
assert.equal(new URL(commercialMarineURL('https://marine-api.open-meteo.com/v1/marine',{})).hostname,'marine-api.open-meteo.com');
assert.equal(new URL(commercialMarineURL('https://marine-api.open-meteo.com/v1/marine',{OPEN_METEO_API_KEY:'unit-test-only'})).hostname,'customer-marine-api.open-meteo.com');
assert.equal((await handleForecast(new Request('https://test/api/profile',{method:'PUT',body:'{}'}),{DB})).status,401);
assert.equal(entitlementState(null,now).active,false);assert.equal(entitlementState({entitlements:{active:{daybuoy_plus:{isActive:true,expirationDate:new Date(now+H).toISOString()}}}},now).active,true);
assert.equal(entitlementState({entitlements:{active:{daybuoy_plus:{isActive:true,expirationDate:new Date(now-H).toISOString()}}}},now).active,false);
const offering={current:{availablePackages:[{product:{identifier:PLUS_PRODUCTS.annual,priceString:'€19,99',introPrice:{price:0,periodUnit:'DAY',periodNumberOfUnits:7}}}]}};
assert.equal(offeringPlans(offering)[1].trial,false);const plans=offeringPlans(offering,{[PLUS_PRODUCTS.annual]:{status:2}});assert.equal(plans[1].trial,true);assert.equal(plans[1].price,'€19,99');assert(!plans[0].available);
console.log('PASS: coastline normals/hidden profiles/v7 camera+materials; provider units/nulls/history/JWT; real SQLite shared hourly claim, stale/expiry and compressed cache; profile auth; RevenueCat expiry, pricing and trial eligibility. CPU/server checks, not device evidence.');
