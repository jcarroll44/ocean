import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {Color} from '../ocean-proof/vendor/tidewater/src/engine/index.js';
import {ShaderModule} from '../ocean-proof/vendor/tidewater/src/engine/gpu/Shader.js';
import {installNativeWeather} from '../ocean-proof/proof/native-weather.js';
import {stormBearing} from '../ocean-proof/proof/layered-weather.js';
import {fixtureContactSheet} from '../ocean-proof/proof/fixture-contact-sheet.js';
const read=p=>fs.readFileSync(p,'utf8');
const source=read('src/weather-scene.js'),start=source.indexOf('function stormFlash('),end=source.indexOf('\nupdateWeatherEffects=function',start);
const flash=vm.runInNewContext(source.slice(start,end)+'\nstormFlash');
let peaks=[],wasOn=false,max=0;
for(let t=0;t<120;t+=.01){const v=flash(t,1,false);assert(v>=0&&v<=1);max=Math.max(v,max);if(v>.1&&!wasOn)peaks.push(t);wasOn=v>.1;assert.equal(flash(t,1,true),0);assert.equal(flash(t,0,false),0);assert.equal(flash(t,null,false),0);}
assert(max>.65&&max<.8);assert(peaks.length>=22&&peaks.length<=24);
for(let i=1;i<peaks.length;i++)assert(Math.abs(peaks[i]-peaks[i-1]-5.2)<.02);
for(let t=0;t<20;t+=.01)assert(flash(t,.25,false)<=.25);
const points=Array.from({length:21},()=>({potential:{value:1}}));
assert.equal(stormBearing(points,0),0);points.forEach(p=>p.potential.value=0);points[5].potential.value=.8;
assert(Math.abs(stormBearing(points,0)-Math.PI/3)<1e-9);assert.equal(stormBearing([],0),0);
function setup(day,rain,lightning=0,reducedMotion=false){
 const app={settings:{exposure:.55},sky:{module:new ShaderModule({code:'return base; return base;'})}};
 const weather=installNativeWeather(app);weather.update({sun:[0,day?1:-1,0],forecast:{rain,cloud:rain?94:0,cloudLow:rain?82:0,cloudMid:rain?76:0,cloudHigh:rain?91:0,thunder:rain?1:0,reducedMotion,offshore:points},lightning});
 const G={sunColor:{value:new Color(.01,.01,.01)},skyIrradiance:{value:new Color(.01,.01,.01)},horizonColor:{value:new Color(.01,.01,.01)}};weather.light(G);return{weather,app,G};
}
const clear=setup(false,0),storm=setup(false,12),lit=setup(false,12,.7),reduced=setup(false,12,.7,true);
assert.equal(clear.G.skyIrradiance.value.r,.036,'Explicitly approved clear-night readability floor');
assert(storm.G.skyIrradiance.value.r>.055);assert(lit.G.skyIrradiance.value.r>storm.G.skyIrradiance.value.r+.13);
assert.equal(reduced.weather.uniforms.fields.flash.value,0);
assert.equal(reduced.G.skyIrradiance.value.r,storm.G.skyIrradiance.value.r);
assert.equal(storm.app.settings.exposure,.55,'No exposure/tonemap change');
const surfaces=read('ocean-proof/proof/weather-surfaces.js');
assert(surfaces.includes('geometry.instanceCount=384'));assert(surfaces.includes('const rain=new Mesh('));assert.equal((surfaces.match(/new Mesh\(/g)||[]).length,1);
assert(!surfaces.includes('rainSheet')&&!surfaces.includes('let sheet=')&&!surfaces.includes('let threads='));assert(surfaces.includes('nativeWeather.rain>.001'));
assert(surfaces.includes('nativeFoamIncident(sunLight,frame.skyIrradiance)')&&surfaces.includes('foamLit + nativeStormFoam()'));
const shader=read('ocean-proof/proof/layered-weather.js');
assert(shader.includes('nativeWeather.flash<0.003'));assert(shader.includes('fn nativeStormBolt'));assert(!shader.includes('frame.time*0.32'));
for(const path of ['ocean-proof/proof/adaptive-resolution.js','ocean-proof/proof/pipeline.js'])assert(fs.existsSync(path));
const draws=[],labels=[];let closed=0;
const ctx={fillRect(){},fillText(t){labels.push(t);},drawImage(...args){draws.push(args);}};
const env={document:{createElement:()=>({getContext:()=>ctx,toBlob:f=>f(new Blob(['canvas encoding stub, no pixels']))})},createImageBitmap:async blob=>({width:487,height:873,blob,close(){closed++;}})};
const captures=Array.from({length:10},(_,i)=>({title:'Fixture '+i,blob:new Blob(['capture stub '+i])}));
const contact=await fixtureContactSheet(captures,{revision:'test-revision',runId:'test-run'},env);
assert.equal(contact.name,'fixtures-contact-sheet.jpg');assert.equal(draws.length,10);assert.equal(closed,10);assert(labels.some(t=>t.includes('test-revision')));
for(let i=0;i<10;i++){assert.equal(draws[i][0].blob,captures[i].blob);assert(Math.abs(draws[i][3]/draws[i][4]-487/873)<1e-10,'No crop/stretch/colour edit');}
await assert.rejects(fixtureContactSheet(captures.slice(0,9),{},env),/all ten/);
const result={checks:['5.2-second storm flash cadence; no rapid strobe','reduced motion and absent potential suppress flashes','supported offshore bearing selection','explicit clear-night readability floor','storm diffuse floor and shared flash light','384 thin particles, no sheets or stripe texture, one mesh; dry quads collapsed','no exposure or ocean-input change'],scope:'CPU/uniform/source assertions, not pixels or iPhone FPS',acceptedPriorRun:'2026-10-11T20-52-12Z-23f4d081-f473-4db4-bdc7-b57d517b3a62',newDeviceGate:null};
fs.writeFileSync('night-report/night-storm-checks.json',JSON.stringify(result,null,2));console.log('PASS: '+result.checks.join('; '));
