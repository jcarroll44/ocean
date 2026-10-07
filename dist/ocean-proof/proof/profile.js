// Diagnostic ablations only. The ordinary app never enables these hooks.
export const PASSES = [
 ['baseline','All on','Unchanged High ocean settings, locked DPR 2.'],
 ['fft','FFT updates off','Freeze FFT textures after initialization; vertex sampling and shore math remain.'],
 ['shore','Shore wave evaluation off','Remove shoreEvaluate variants in all shaders; retain FFT, swash dispatch and lip draw. Coupled diagnostic, not an isolated timer.'],
 ['foam','Surface foam shading off','Remove surface foam patterns and lighting; retain foam transport, spray and breaker material.'],
 ['spray','Spray off','Skip spray emission/update and particle draw; retain curling lip mesh.'],
 ['swash','Swash updates off','Freeze ShoreSim textures after initialization; retain shader sampling.'],
 ['refraction','Refraction pass off','Freeze underwater colour/depth render after initialization; retain water optical shader.'],
 ['transparency','Transparent surf draw off','Hide lip and spray meshes; keep their simulation work.'],
 ['reflections','Reflections off','Remove above-water reflection shader block and cubemap refresh; retain sun glitter and crest transmission.'],
 ['composition','Scene copy updates off','Reuse the two initialized imported images; retain both original scene renders and final compositor.']
];
export function profileConfig(search){
 const q=new URLSearchParams(search);
 if(q.get('ocean-profile')!=='1')return null;
 const pass=q.get('profile-pass')||'baseline';
 if(!PASSES.some(p=>p[0]===pass))throw Error('Unknown profiling pass: '+pass);
 return {pass,seconds:q.get('profile-seconds')==='120'?120:20,warmup:15,dpr:2};
}
export function replaceRegion(code,start,end,replacement){
 const a=code.indexOf(start),b=code.indexOf(end,a+start.length);
 if(a<0||b<a)throw Error('Profiling shader anchor changed: '+start);
 return code.slice(0,a)+replacement+'\n'+code.slice(b);
}
export function replaceFunction(code,name,body){
 const a=code.indexOf('fn '+name+'(');
 if(a<0)throw Error('Profiling function missing: '+name);
 const open=code.indexOf('{',a);let depth=1,end=open+1;
 for(;end<code.length&&depth;end++){if(code[end]==='{')depth++;if(code[end]==='}')depth--;}
 if(depth)throw Error('Unbalanced profiling function: '+name);
 return code.slice(0,open+1)+'\n'+body+'\n'+code.slice(end-1);
}
export function installShaderAblation(app,config,stage){
 if(!config)return;
 const {pass}=config;
 if(stage&&stage!==pass)return;
 if(pass==='shore'){
  const module=app.shore.module;
  for(const name of ['shoreEvaluate','shoreEvaluateNoNormal','shoreEvaluateWorld'])module.code=replaceFunction(module.code,name,
   'var o: ShoreSample; o.nShore=vec3f(0.0,1.0,0.0); o.dir=vec2f(0.0,-1.0); return o;');
 }
 if(pass==='foam'){
  // Keep the exact struct/interface; constant results let the compiler drop
  // foam texture lookups and relief/lighting math, not merely hide the colour.
  const module=app.surface.module;
  module.code=replaceRegion(module.code,'\t// whitecaps:','\to.normal = normal;',
   '\tvar o: WaterSurfaceFrag; var foam = 0.0; let coverage = 0.0;');
  app.surfFoam.module.code=replaceFunction(app.surfFoam.module.code,'surfFoamLight','return vec3f(0.0);');
 }
 if(pass==='reflections'){
  const original=app.waterMaterial._shadeWGSL.bind(app.waterMaterial);
  app.waterMaterial._shadeWGSL=opts=>replaceRegion(original(opts),'\t\t// ---- reflection','\t\t// ---- sun specular',
   '\t\tlet skyRefl=vec3f(0.0); let reflCol=vec3f(0.0);');
 }
}
export function installRuntimeAblation(app,config,composite){
 if(!config)return;
 const noop=()=>{},pass=config.pass;
 // Initialization has rendered once, so frozen textures/buffers contain data.
 if(pass==='fft')app.fft.update=noop;
 if(pass==='spray'){
  app.spray.update=noop;app.spray.mesh.visible=false;
  // The shared breaker kernel also updates the lip's crest buffer. Keep it.
  app.breakers._budget=noop;
 }
 if(pass==='swash')app.shoreSim.update=noop;
 if(pass==='refraction')app.refraction.render=noop;
 if(pass==='transparency'){app.breakers.mesh.visible=false;app.spray.mesh.visible=false;}
 if(pass==='reflections')app.environment.update=noop;
 if(pass==='composition')for(const name of ['copyBase','copyOverlay']){
  const original=composite[name].bind(composite);let initialized=false;
  composite[name]=canvas=>{if(!initialized){original(canvas);initialized=true;}};
 }
}
export function breakersForProfile(Base,config){
 if(config?.pass!=='spray')return Base;
 return class extends Base{
  _emitCode(){return replaceFunction(super._emitCode(),'breakersEmit','return;');}
 };
}
export class ProfileRun{
 constructor(config){this.config=config;this.origin=null;this.start=null;this.last=null;this.intervals=[];this.times=[];this.done=false;}
 observe(now){
  if(this.done)return null;
  if(this.origin===null)this.origin=now;
  if(now-this.origin<this.config.warmup*1000)return null;
  if(this.start===null){this.start=this.last=now;return null;}
  this.intervals.push(now-this.last);this.times.push(now);this.last=now;
  if(now-this.start<this.config.seconds*1000)return null;
  this.done=true;
  const duration=(now-this.start)/1000,sorted=[...this.intervals].sort((a,b)=>a-b);
  const quantile=p=>sorted[Math.min(sorted.length-1,Math.ceil(sorted.length*p)-1)];
  // Whole one-second bins only; an incomplete tail never lowers the minimum.
  const bins=Array.from({length:Math.floor(duration)},()=>0);
  for(const t of this.times){const i=Math.floor((t-this.start)/1000);if(i<bins.length)bins[i]++;}
  return {pass:this.config.pass,duration,frames:this.times.length,fps:this.times.length/duration,
   minOneSecondFPS:Math.min(...bins),p95FrameMs:quantile(.95),p99FrameMs:quantile(.99),maxFrameMs:sorted.at(-1),
   measurement:'GPU-completed frame cadence, including app rendering and queue wait; not display scanout or isolated GPU timings',
   meetsCadenceTarget:this.config.seconds===120&&Math.min(...bins)>=30&&sorted.at(-1)<=1000/30+1};
 }
}
