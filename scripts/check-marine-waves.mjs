import assert from 'node:assert/strict';
import fs from 'node:fs';import vm from 'node:vm';
import {MARINE_FIELDS,marineURL,parseMarine,sampleMarine,waveTrains,regionalAdjustment,parseNDBC,surfHeightRange} from '../src/marine-model.js';
import {describeWaves,wavelength,spectrumScale,applyWaveSpectrum} from '../ocean-proof/proof/forecast-waves.js';
import {Vector4} from '../ocean-proof/vendor/tidewater/src/engine/index.js';
import {barredHeight} from '../ocean-proof/proof/beach-land.js';
import {fixtureData,WAVE_FIXTURES} from '../ocean-proof/proof/weather-fixtures.js';
const H=3600000,now=Date.parse('2026-10-12T12:00:00Z'),url=new URL(marineURL({lat:30.28,lon:-86}));
assert.equal(url.searchParams.get('wind_speed_unit'),'ms');assert.equal(url.searchParams.get('hourly').split(',').length,21);
const payload=(height=1)=>({hourly_units:{time:'unixtime',wave_height:'m',wave_period:'s',wave_direction:'°',ocean_current_velocity:'km/h',sea_level_height_msl:'m'},hourly:{time:[now/H*3600,now/H*3600+3600],wave_height:[height,height+1],wave_period:[7,0],wave_direction:[350,10],ocean_current_velocity:[3.6,null],sea_level_height_msl:[-.2,.2]}});
const rows=parseMarine(payload());assert.equal(rows[0].ocean_current_velocity,1);assert.equal(rows[0].sea_level_height_msl,-.2);assert.equal(rows[1].wave_period,null);assert.equal(rows[0].tertiary_swell_wave_height,null);
assert.equal(sampleMarine(rows,now+H/2).wave_direction,0);assert.equal(sampleMarine(rows,now+H/2).wave_period,null);assert.equal(sampleMarine(rows,now-1),null);assert.equal(sampleMarine(rows,now+H+1),null);assert.equal(sampleMarine(rows,now).wave_height,1);
const txt='#YY MM DD hh mm WDIR WSPD GST WVHT DPD APD MWD\n#yr mo dy hr mn deg m/s m/s m sec sec deg\n2026 10 12 12 00 180 5 8 1.2 MM 4.1 210\n2026 10 12 11 30 180 5 8 1.0 7 4 200';
const buoy=parseNDBC(txt,'42012',now);assert.equal(buoy.height,1.2);assert.equal(buoy.dominantPeriod,null);assert.equal(parseNDBC(txt,'42012',now+4*H),null);
const obs=[{...buoy,modelHeight:.5,modelTime:now,distanceKm:150}];assert(Math.abs(regionalAdjustment(obs,now,now).factor-1.15)<1e-10);assert.equal(regionalAdjustment(obs,now+3*H,now).factor,1);assert.equal(regionalAdjustment([{...obs[0],time:now-4*H}],now,now).factor,1);
assert.deepEqual(surfHeightRange('Surf height...........1 foot or less.'),{low:0,high:1,unit:'ft',source:'NWS Surf Zone Forecast · FLZ108'});assert.equal(surfHeightRange('Surf Height: 2 to 4 feet').high,4);assert.equal(surfHeightRange('Surf height around 2 feet').low,2);assert.equal(surfHeightRange('Surf height unavailable'),null);
assert(Math.abs(wavelength(11)-188.918)<.01);assert(Math.abs(wavelength(7)-76.504)<.01);assert.equal(spectrumScale(2,7,3.3)/spectrumScale(1,7,3.3),4);
for(const fixture of WAVE_FIXTURES){const c=fixtureData(fixture.id,now).rows[0],model=describeWaves(c);assert(model.components.every(t=>Number.isFinite(t.height)&&t.wavelength>0));const energy=model.components.reduce((n,t)=>n+t.height*t.height,0);assert(Math.abs(energy-model.height**2)<1e-9);assert(model.components.some(t=>t.direction!==model.components[0].direction));}
assert.equal(waveTrains({swell:1,period:5,direction:201}).length,1);assert.equal(waveTrains({}).length,0);
const clean=describeWaves(fixtureData('wave-offshore').rows[0]),blown=describeWaves(fixtureData('wave-onshore').rows[0]);assert(clean.curl>blown.curl);assert(clean.offshore>0&&blown.onshore>0);
const fields={sysA:{value:Array.from({length:4},()=>new Vector4())},sysB:{value:Array.from({length:4},()=>new Vector4())},current:{value:new Vector4()}},app={fft:{params:{fields,set(){}}},shore:Object.fromEntries(['amplitude','period','curl','gamma'].map(k=>[k,{value:0}]))};
const sea=fixtureData('wave-groundswell').rows[0];applyWaveSpectrum(app,{},sea);
assert(fields.sysA.value.every(v=>v.x>0),'All four data components reach the live FFT');
const from=sea.swell_wave_direction*Math.PI/180-201*Math.PI/180,k=fields.sysA.value[1].y;
assert(Math.abs(-Math.cos(k)-Math.sin(from))<1e-9&&Math.abs(-Math.sin(k)+Math.cos(from))<1e-9,'IFFT phase velocity follows incoming bearing toward shore');
applyWaveSpectrum(app,{}, {...sea,ocean_current_velocity:1,ocean_current_direction:201});assert.equal(fields.current.value.y,1,'Current TO 201 travels seaward');
applyWaveSpectrum(app,{}, {...sea,ocean_current_velocity:1,ocean_current_direction:null});assert.equal(fields.current.value.length(),0,'Missing current direction cannot invent motion');
const depth=d=>-barredHeight(0,-d-3.5),breakDepth=feet=>(feet*.3048/2*3.556/.78)**.8;
assert(depth(45)<depth(75));assert(depth(125)<depth(95));assert(breakDepth(1)<depth(45));assert(breakDepth(3)>depth(45)&&breakDepth(3)<depth(125));assert(breakDepth(6)>depth(125));
const shoreCrossing=tide=>{for(let d=1;d<30;d+=.1)if(depth(d)+tide>=breakDepth(1))return d;};assert(shoreCrossing(.3)<shoreCrossing(-.1),'Rising water shifts the shore break landward');
// Run the actual adapter against provider-shaped payloads. NOAA tide remains
// the selected level; optional model sea level is only a fallback.
const data={rows:[{time:now,swell:2,period:4,direction:201,tide:.37},{time:now+H,swell:2,period:4,direction:201,tide:null}]};
const mods={'config.js':{SITE:{marine:{lat:30.28,lon:-86}}},'forecast.js':{loadForecast:async()=>data,savedForecast:()=>data},'conditions.js':{sampleAt:(rs,t)=>({...rs.find(r=>r.time===t)})}};
const c={__mods:mods,URL,URLSearchParams,AbortSignal,localStorage:{getItem:()=>null,setItem(){}},Date,fetch:async address=>({ok:true,json:async()=>String(address).startsWith('/api/')?{observations:[]}:(()=>{const p=payload(String(address).includes('models=')?2:1);p.hourly.wave_period=[7,7];return p;})()})};
vm.createContext(c);vm.runInContext(fs.readFileSync('src/marine-data.js','utf8').replace('/* MARINE_MODEL */',fs.readFileSync('src/marine-model.js','utf8').replaceAll('export ','')),c);
const result=await mods['forecast.js'].loadForecast();assert.equal(result.rows[0].wave_height,2);assert.equal(result.rows[0].tide,.37);assert.equal(result.rows[1].tide,.2);assert.equal(result.rows[1].marineTide,true);assert.equal(result.rows[0].marineTide,false);
console.log('PASS: marine units/nulls/circular sampling, buoy freshness and bounded residual, NWS heights, coherent partitions/energy, period spacing, two-bar thresholds, wind response and tide fallback. No rendered pixels or FPS claim.');
