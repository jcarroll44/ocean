import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';
import {forecastOptics,offshoreShelf,nightStars,moonKeyStrength,OPTICS_WGSL} from '../ocean-proof/proof/weather-optics.js';
import {fixtureData,WEATHER_FIXTURES} from '../ocean-proof/proof/weather-fixtures.js';
import {sampledOffshore} from '../src/weather-model.js';
const read=p=>fs.readFileSync(p,'utf8'),now=Date.now();
for(const id of ['overcast','fog','light-rain','thunderstorm','night-storm'])assert.equal(forecastOptics(fixtureData(id).rows[0]).disc,0,id+' must hide the sun');
for(let cloud=85;cloud<=100;cloud++)assert.equal(forecastOptics({cloud}).closed,1,'No blue gaps at '+cloud+'%');
assert.equal(forecastOptics({cloud:100}).closed,1);assert.equal(forecastOptics({visibility:350}).fog,1);
assert.equal(forecastOptics(fixtureData('night-storm').rows[0]).fog,0,'Rain haze must retain approved cloud relief overhead');
assert.equal(forecastOptics({cloud:0,rain:0,visibility:28000}).disc,1);
const thin=forecastOptics({cloud:34,rain:0,visibility:28000});assert(thin.glow>0&&thin.glow<1);
let previous=1;for(let cloud=0;cloud<=100;cloud++){const o=forecastOptics({cloud});assert(o.disc<=previous);previous=o.disc;}
assert.equal(forecastOptics({}).fog,0,'Missing visibility cannot invent dense fog');
assert.equal(nightStars(.1,0,{}),0);assert(nightStars(-.3,.45,{cloud:0})>.5);
assert.equal(nightStars(-.3,.45,{cloud:94,rain:12}),0,'No star work behind the gate storm');
assert.equal(moonKeyStrength(-.1,1,0),0);assert.equal(moonKeyStrength(.2,0,0),0);
assert(moonKeyStrength(.2,1,0)>moonKeyStrength(.2,.25,0));
assert.equal(moonKeyStrength(.2,1,.94),.12*(1-.94*.9),'Keep approved heavy-storm key light');
const approaching=fixtureData('squall-approaching',now),points=sampledOffshore(approaching.weatherField,approaching.time,now),shelf=offshoreShelf(points);
assert.equal(shelf[0],0);assert.equal(shelf[1],20*1609.344);assert.equal(shelf[2],1);assert.equal(shelf[3],Math.PI/4);
for(const bearing of [141,171,201,231,261]){
 const p=[{bearing,miles:20,conditions:{cloud:100,rain:8}}];assert.equal(offshoreShelf(p)[0],(bearing-201)*Math.PI/180);
}
assert.deepEqual(offshoreShelf([]),[0,0,0,0]);assert.deepEqual(offshoreShelf([{bearing:201,miles:20,conditions:{cloud:100,rain:null}}]),[0,0,0,0]);assert.deepEqual(offshoreShelf(points,12),[0,0,0,0],'No extra shelf work in local heavy rain');
assert(OPTICS_WGSL.includes('nativeWeather.extinction*60000.0'));assert(OPTICS_WGSL.includes('smoothstep(.25,1.2,P.y-frame.seaLevel)'),'Keep the wet-sand reflection band');
const weather=read('ocean-proof/proof/native-weather.js'),beach=read('ocean-proof/proof/NativeBeachScene.js'),surfaces=read('ocean-proof/proof/weather-surfaces.js');
assert(weather.includes('max(nativeWeather.fog,max(haze,nativeHorizonBlend(dir)))'),'Fog closes all sky elevations');
assert(weather.includes('mix(clearBackground,overcastBackground,nativeWeather.closed)'),'No blue background at 100%');
assert(beach.includes('pow(1.0-cachedCloud(sun).a,3.0)'),'Cloud in solar direction softens the disc');
assert(beach.includes('col+=skyStars(rd)'));assert(surfaces.includes('nativeSandLight(r.color.rgb,in.P)'));
const c=vm.createContext({console,URLSearchParams,TextDecoder});vm.runInContext(read('src/scene-data.js'),c);
const a=c.__mods['astro.js'],f=fixtureData('night-clear'),moon=a.moonPosition(f.time),sun=a.sunPosition(f.time),phase=a.moonPhase(f.time);
assert(sun.altitude<-15&&moon.altitude>5&&moon.altitude<12);assert(moon.azimuth>201&&moon.azimuth<260);assert(phase.fraction>.44&&phase.fraction<.46);assert.equal(f.reviewView,'moon-facing');
assert(f.time>=f.rows[0].time&&f.time<=f.rows.at(-1).time);
assert.equal(WEATHER_FIXTURES.length,10);assert(WEATHER_FIXTURES.filter(f=>f.reviewView).length===1);
// Freeze the approved clear-night sky, lunar key, stars, water and lighting.
const frozen=p=>execFileSync('git',['show','b28526883c84d2ab388e6ac0776dd1200a0675ad:'+p],{encoding:'utf8'});
const accepted=p=>execFileSync('git',['show','831258709f7ca9b781e3e9e9c41133b87279e42e:'+p],{encoding:'utf8'});
// Explicit Oct 11 exception: scrub-only horizon correction; the original
// water, sand, moon path, thin rain and lightning code remain byte-identical.
const surfaceStart=surfaces.indexOf(' // The atmosphere CPU readback');
const surfaceEnd=surfaces.indexOf(" water.output=replace(water.output,'let Nup",surfaceStart);
assert(surfaceStart>0&&surfaceEnd>surfaceStart);
assert.equal(surfaces.slice(0,surfaceStart)+surfaces.slice(surfaceEnd),accepted('ocean-proof/proof/weather-surfaces.js'),'Outside the authorized dawn hooks, preserve the water/rain/sand adapter');
assert(surfaces.includes('nativeDawnReflection(mix(transmitted,reflCol,F)+sunSpec+skyRefl*(.22*rim))'),'Dawn correction covers the actual reflected water, not only hidden swash');
assert(surfaces.includes('max(nativeWeather.transition,dawn)'));assert(surfaces.includes('smoothstep(-.02,.06,nativeWeather.sun.y)'),'Dawn correction stays zero on clear nights');
const production=read('production/native-scene.js').replace(/^import \{(?:installSkyOrb|transitionLight)\}[^\n]*\n/gm,'').replace('const smoothLight=transitionLight();\n','').replace('if(app.nativeWeather&&!app.nativeWeather.cheap)app.skyOrb=installSkyOrb(app,beach,{publish:data=>parent.__daybuoySkyOrb?.(data)});','').replace('smoothLight(G,app.nativeWeather?.uniforms.fields.transition.value>.01);','').replace('if(app.nativeWeather?.uniforms.fields.transition.value>.01)app.atmosphere._irrTimer=Math.min(app.atmosphere._irrTimer,.05);','');
assert(production.includes('installForecastSurf(app.shore)'));assert(!production.includes('installSkyOrb'),'Requested icon replaces the GPU readback');
assert.equal(WEATHER_FIXTURES.find(f=>f.id==='night-clear').time,Date.parse('2026-10-18T03:30:00Z'));
const early="${app.nativeWeather&&!app.nativeWeather.cheap?'if(nativeWeather.closed>=.999||nativeWeather.fog>=.999){return nativeWeatherSky(rd,vec3f(0.0));}':''}";
assert.equal(beach.replace(' '+early+'\n',''),frozen('ocean-proof/proof/NativeBeachScene.js'),'Only the opaque-weather early exit may alter the approved sky code');
for(const fn of ['nightStars','moonKeyStrength'])assert.equal(read('ocean-proof/proof/weather-optics.js').split('export function '+fn)[1].split('\nexport ')[0],frozen('ocean-proof/proof/weather-optics.js').split('export function '+fn)[1].split('\nexport ')[0]);
assert(!OPTICS_WGSL.includes('let cloud=cachedCloud(ray)'),'Horizon must not stretch one noisy cloud row into comb stripes');assert(weather.includes('nativeHorizonColour(dir)'));assert(read('ocean-proof/proof/layered-weather.js').includes('horizonColour=mix(horizonColour,nativeHorizonColour(ray)'));
const report={revision:'2026-10-12-natural-surf-v7',checks:['weather-driven disc/glow','85%+ opaque background','top-to-bottom dense fog','shared horizon cloud/rain colour','warm neutral sand above wet band','offshore bearing/range and unavailable inputs','stars skip opaque weather','phase-dependent physical moon key','real lunar fixture geometry','approved clear-night code identity'],lunarFixture:{time:new Date(f.time).toISOString(),bearing:moon.azimuth,elevation:moon.altitude,fraction:phase.fraction,view:f.reviewView},renderedPixels:false,physicalIPhoneFPS:null};
fs.writeFileSync('night-report/weather-optics-checks.json',JSON.stringify(report,null,2));
console.log('PASS: weather optics, offshore bearing/range, real lunar geometry and bounded night work. CPU/source checks; pixels and iPhone FPS pending.');
