// Numerical surface/source checks. Not a rendered or phone performance test.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {waveSource} from './wave-source.mjs';
const read=p=>fs.readFileSync(p,'utf8');
const original=read('src/scene-data.js');
function load(source,search=''){
 const c={URLSearchParams,TextDecoder,Math,Map,Date,location:{search}};vm.createContext(c);
 source=source.replace("__e['createOcean'] = createOcean;","__e['createOcean'] = createOcean; __e.shaders={oceanVertex,oceanFragment,foamFragment,backgroundFragment,quadVertex,sprayVertex,sprayFragment,rainFragment};");
 vm.runInContext(source,c);return c.__mods;
}
const baseline=load(original),off=load(waveSource(original)),on=load(waveSource(original),'?breakers=tidewater');
assert.equal(off['breaker-pass.js'].enabled,false);assert.equal(on['breaker-pass.js'].enabled,true);
assert.deepEqual(JSON.parse(JSON.stringify(off['ocean-engine.js'].shaders)),JSON.parse(JSON.stringify(baseline['ocean-engine.js'].shaders)),'Default must retain every shader byte');
for(const name of ['backgroundFragment','sprayVertex','sprayFragment','rainFragment','quadVertex'])assert.equal(on['ocean-engine.js'].shaders[name],baseline['ocean-engine.js'].shaders[name],name+' changed');
const before=baseline['breaker-surface.js'],after=on['breaker-surface.js'],pass=on['breaker-pass.js'];
const metrics=[];
for(const feet of [1,2.5,3,5,8]){
 const h=feet*.3048;
 for(const tide of [-.4,0,.8])for(const crestRatio of [-.1,.4,.8])for(const age of [0,.3,.7,1,1.6,2.05,2.3,3,3.5,6,14.9]){
  let overturn=0,maxJump=0;
  for(let s=-3;s<=3;s+=.006){
   const a=pass.sectionCurve(s,h,tide+h*crestRatio,tide,age),b=pass.sectionCurve(s+.006,h,tide+h*crestRatio,tide,age);
   assert(a.every(Number.isFinite)&&b.every(Number.isFinite));
   maxJump=Math.max(maxJump,Math.hypot((b[0]-a[0])*Math.max(.85,h),b[1]-a[1]));if(b[0]<a[0])overturn++;
   assert(Math.abs(a[0]-s)*Math.max(.85,h)<h*4+2,'unbounded throw');
  }
  assert(maxJump<.09,'surface discontinuity');
  if(feet>=3&&age===1.6)assert(overturn>0,'lip must pitch forward');
  if(age>=3.5)assert.equal(overturn,0,'collapsed bore must stop folding');
  const e={x:0,z:-10,width:16,height:h,y:tide+h*crestRatio,age,slope:.06};
  for(const x of [-9,-5,0,5,9])for(let z=-13;z<=-7;z+=.1){
   const base=[x,tide,z],a=after.deformSurfacePoint([x,z],base,[e],tide,h),b=before.deformSurfacePoint([x,z],base,[e],tide,h);
   assert(a.every(Number.isFinite));
   if(feet<=2.5)assert.deepEqual([...a],[...b],'calm water changed');
  }
 }
 if(feet>=3){
  const crest=h*.4,scale=Math.max(.85,h),root=crest+h*.8,drop=root+h*.14,contact=Math.sqrt(root/drop),age=.65+1.45*contact;
  const tip=pass.plungeCurve(0,h,crest,0,age);assert(Math.abs(tip[1])<1e-10,'tip must contact mean water at foam trigger');
  for(let dz=-4;dz<7;dz+=.01)assert.equal(pass.impactMask(dz,h,crest,0,age-.001,scale),0,'whitewater before impact');
  const landing=drop*.8*contact;assert(pass.impactMask(landing,h,crest,0,age+.2,scale)>.6,'impact foam absent at landing');
  metrics.push({testWaveHeightFeet:feet,impactSeconds:+age.toFixed(3),forwardImpactMetres:+landing.toFixed(3)});
 }
}
// Validate all material edits are explicitly restricted to displacement and foam.
const oceanBefore=baseline['ocean-engine.js'].shaders.oceanFragment,oceanAfter=on['ocean-engine.js'].shaders.oceanFragment;
assert.equal(oceanAfter,oceanBefore.replace('sharedFoam*(.55+.45*lace)','sharedFoam*(.08+.12*lace)'));
const shader=on['ocean-engine.js'].shaders.oceanVertex;
assert(!/Math\.|\bconst\s+scale|return \[/.test(shader));assert(shader.includes('vec2 twPlunge'));
for(const file of ['src/camera.js','src/interaction.js','src/story.js','src/scene-data.js','src/lighting.js','src/weather-effects.js','src/celestial.js','src/explore.js','src/style.css','src/home.css','src/presentation.css'])assert.equal(read(file),execFileSync('git',['show','d63b1e13622934c472f56c706de39c23706f2846:'+file],{encoding:'utf8',maxBuffer:16*1024*1024}),file+' changed outside wave scope');
assert.match(read('assets/licenses/tidewater.txt'),/Copyright \(c\) 2026 DRG Software Solutions LLC/);
assert.match(read('src/presentation.js'),/assets\/licenses\/index.html/);
if(process.argv.includes('--export-shaders')){
 const dir=process.argv[process.argv.indexOf('--export-shaders')+1]||'/tmp/daybuoy-breaker-shaders';fs.mkdirSync(dir,{recursive:true});
 for(const [name,source] of Object.entries(on['ocean-engine.js'].shaders))fs.writeFileSync(dir+'/'+name+'.glsl',source);
}
console.log('PASS: default shader bytes unchanged; calm ≤2.5 ft unchanged; 3/5/8 ft continuous finite folds, airborne lip before contact, landing-centred foam, unfolded bore; camera/sky/light/UI quality files unchanged.');
console.log(JSON.stringify(metrics));
