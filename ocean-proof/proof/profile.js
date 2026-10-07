// Diagnostic ablations only. The ordinary app never enables these hooks.
import {LOOP_PASSES,loopMode} from './loop-profile.js';
import {PIPE_PASSES,pipelineSettings} from './pipeline-profile.js';
export {LOOP_PASSES};
export {PIPE_PASSES};
export {comboQuery,chooseCombo,chooseSustained} from './pipeline-profile.js';
export const NATIVE_PASSES=['native','native175','native15','native-fxaa','native-flare'];
export const PASSES = [
 ['native-pipe','Pipelined · DPR 2','Production loop: max 2 outstanding frames, asynchronous GPU-completed counter, water CPU readback at most every fourth submitted frame and atmosphere at most 4 Hz. Full High waves, TAA and lens flare at DPR 2.'],
 ['native-pipe175','Pipelined · DPR 1.75','Same production pipeline and readbacks; only DPR changes to 1.75.'],
 ['native-pipe15','Pipelined · DPR 1.5','Same production pipeline and readbacks; only DPR changes to 1.5.'],
 ['native-pipe-fxaa','Pipelined · FXAA','Same production pipeline at DPR 2; only upstream FXAA replaces TAA.'],
 ['native-pipe-flare','Pipelined · flare off','Same production pipeline at DPR 2 with TAA; only lens flare is removed.'],
 ['native-pipe-combo','Pipelined · candidate combination','DPR/AA/flare combination selected from this device’s current single-setting results, then measured separately. Actual settings are recorded; no visual acceptance or additive gain is assumed.'],
 ['native-empty','Clear only · GPU wait','Same native canvas, initialized device, parent scene/UI CPU loop and DPR 2. Submit only a clear-color pass; retain the original per-frame completion gate. No native scene draws or simulation dispatches. Initialized scene resources stay allocated.'],
 ['native-empty-raf','Clear only · rAF','Same clear-only case; remove the per-frame completion gate. Count rAF submissions and drain the queue once at the end.'],
 ['native-readback','Native · no CPU readbacks / wait','Full native scene at DPR 2. After 3 s of warm-up suppress WaterQuery and Atmosphere CPU staging copies/mapAsync; preserve GPU queries and cached fixed-scene lighting. No per-frame completion wait; rAF submission metric. One final queue drain.'],
 ['native-raf','Native · no completion wait','Full native scene at DPR 2 with normal CPU readbacks. Remove only the per-frame GPU-completion gate and count rAF submissions; one final queue drain reports backlog.'],
 ['native','Native scene · DPR 2','Single native WebGPU scene: DayBuoy sky, native sand and empty stand, full High Tidewater ocean, TAA and lens flare. No WebGL context or host image copies. Fixed resting proof camera.'],
 ['native175','Native scene · DPR 1.75','Only native output DPR changes to 1.75. TAA, lens flare, waves and scene remain unchanged.'],
 ['native15','Native scene · DPR 1.5','Only native output DPR changes to 1.5. TAA, lens flare, waves and scene remain unchanged.'],
 ['native-fxaa','Native scene · FXAA','Native scene at DPR 2; upstream FXAA replaces upstream TAA. All other scene, ocean and post settings retained.'],
 ['native-flare','Native scene · flare off','Native scene at DPR 2 and TAA; remove lens flare visibility compute and shader contribution only. Sun, bloom, waves and other post remain.'],
 ['baseline','All on','Unchanged High ocean settings, locked DPR 2.'],
 ['fft','FFT updates off','Freeze FFT textures after initialization; vertex sampling and shore math remain.'],
 ['shore','Shore wave evaluation off','Remove shoreEvaluate variants in all shaders; retain FFT, swash dispatch and lip draw. Coupled diagnostic, not an isolated timer.'],
 ['foam','Surface foam shading off','Remove surface foam patterns and lighting; retain foam transport, spray and breaker material.'],
 ['spray','Spray off','Skip spray emission/update and particle draw; retain curling lip mesh.'],
 ['swash','Swash updates off','Freeze ShoreSim textures after initialization; retain shader sampling.'],
 ['refraction','Refraction pass off','Freeze underwater colour/depth render after initialization; retain water optical shader.'],
 ['transparency','Transparent surf draw off','Hide lip and spray meshes; keep their simulation work.'],
 ['reflections','Reflections off','Remove above-water reflection shader block and cubemap refresh; retain sun glitter and crest transmission.'],
 ['composition','Scene copy updates off','Reuse the two initialized imported images; retain both original scene renders and final compositor.'],
 ['atlas','One-transfer candidate','Batch both unchanged full-resolution scene layers into one canvas transfer. Both layer draws remain; all ocean detail and DPR 2 retained.'],
 ['dpr1','DPR 1.0','Original two-copy path; only source, ocean and output DPR reduced to 1.0.'],
 ['dpr15','DPR 1.5','Original two-copy path; only source, ocean and output DPR reduced to 1.5.'],
 ['all-off','All ocean passes off','Hide ocean/lip/spray; freeze FFT, detail, queries, caustics, swash, underwater-light maps, crest/emission, refraction and environment after initialization. Remove shore/foam/reflection shader blocks. Retain legacy layer draws/copies, terrain, atmosphere, shadows and post/composition; not an empty-frame floor.'],
 ['grid128','3 × 128 FFT','Original two-copy path and High settings; only FFT grid/cascades and dependent sampling footprints change. Diagnostic, not appearance-approved.'],
 ['lod','Mesh LOD one step lower','Original two-copy path; only CDLOD range factor 2.5 → 2.0. Keep 32-cell tiles, spray, refraction and DPR 2.'],
 ['proof-alone','Tidewater proof alone','Embedded native proof directly, without the DayBuoy document, WebGL renderer, layer copies or OceanComposite. Same sunny fixture, camera, High waves and DPR 2; retains native sky/terrain and proof post defaults (AA/flare reported). Frozen external proof is unchanged.'],
 ['host-single','Second legacy layer removed','Skip the foreground WebGL render and overlay copy. Transparent overlay stays empty. One base-layer render/copy, full native ocean, native post and final mask composition remain at DPR 2.'],
 ['host-shadows','Shadow maps off','Disable native SunShadows (cascade draws and shadow sampling via its enabled uniform) and WebGL shadowMap. Analytic shading baked into legacy background remains; all waves, both copies and post stay on at DPR 2.'],
 ['host-sky','Background baked / atmosphere frozen','Bake the original legacy fullscreen background once at DPR 2, then sample it cheaply. This background includes sky, sand AND old-water shading. Freeze native atmosphere LUT/irradiance updates after the first fixed-scene frame. Keep both layer draws/copies, foreground, reflections, waves and post.'],
 ['host-post','Post / final composition bypass','Keep host layer draws/copies and native ocean scene rendering. Replace native AO, medium/underwater beauty, AA, bloom, lens, grading/exposure chain and final mask/overlay compositor with one direct HDR-to-display tone-map pass. Refraction and imported background remain. Diagnostic appearance differs.'],
 ['host-all','All four host cuts','Combine second-layer removal, shadow maps off, baked legacy background/frozen native atmosphere and post/final-compositor bypass. Full ocean simulation, materials, refraction, spray and DPR 2 remain. Diagnostic appearance differs.']
];
export const PROFILE_REVISION='2026-10-07-pipeline-1';
export const HOST_PASSES=['proof-alone','host-single','host-shadows','host-sky','host-post','host-all'];
export function hostCuts(config){
 const pass=config?.pass,all=pass==='host-all';
 return {single:all||pass==='host-single',shadows:all||pass==='host-shadows',sky:all||pass==='host-sky',post:all||pass==='host-post'};
}
export function installHostRuntime(app,config){
 const cuts=hostCuts(config);
 if(cuts.shadows)app.shadows.enabled=false;
 if(cuts.sky){
  const update=app.atmosphere.update.bind(app.atmosphere);let primed=false;
  app.atmosphere.update=(...args)=>{if(!primed){primed=true;return update(...args);}};
 }
}
export function profileMetadata(app,config,G,GPU,output,transport){
 const info=GPU.adapter.info;
 return {pin:'4811ba48d795197de5621985f404e765c0b7c0ef',config,
  scope:PASSES.find(p=>p[0]===config.pass)[2],resolution:[app.engine.width,app.engine.height],output,
  quality:app.activeQuality,transport,resolutionVerifiedEveryFrame:true,
  nativePost:{aa:app.post.aaMode,lensFlare:!!app.post.flare,bypassed:hostCuts(config).post},
  oceanVisible:app.ocean.visible,sprayVisible:app.spray.mesh.visible,breakerVisible:app.breakers.mesh.visible,
  rendererCount:config.pass.startsWith('native')?1:undefined,externalImageCopies:config.pass.startsWith('native')?0:undefined,hostCuts:hostCuts(config),waveSeconds:G.time.value,
  userAgent:navigator.userAgent,deviceDPR:devicePixelRatio,
  adapter:info?{vendor:info.vendor,architecture:info.architecture,device:info.device}:null,
  scene:{heightFt:3,period:8,tideM:0,windKnots:8,direction:201,sunny:true}};
}
export function profileConfig(search){
 const q=new URLSearchParams(search);
 if(q.get('ocean-profile')!=='1')return null;
 const pass=q.get('profile-pass')||'baseline';
 if(!PASSES.some(p=>p[0]===pass))throw Error('Unknown profiling pass: '+pass);
 return {pass,seconds:q.get('profile-seconds')==='120'?120:20,warmup:15,dpr:pass==='dpr1'?1:pass==='native175'?1.75:['dpr15','native15'].includes(pass)?1.5:2,revision:PROFILE_REVISION,...pipelineSettings(pass,q)};
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
 if(stage&&stage!==pass&&pass!=='all-off')return;
 if(pass==='shore'||pass==='all-off'&&(!stage||stage==='shore')){
  const module=app.shore.module;
  for(const name of ['shoreEvaluate','shoreEvaluateNoNormal','shoreEvaluateWorld'])module.code=replaceFunction(module.code,name,
   'var o: ShoreSample; o.nShore=vec3f(0.0,1.0,0.0); o.dir=vec2f(0.0,-1.0); return o;');
 }
 if(pass==='foam'||pass==='all-off'&&(!stage||stage==='foam')){
  // Keep the exact struct/interface; constant results let the compiler drop
  // foam texture lookups and relief/lighting math, not merely hide the colour.
  const module=app.surface.module;
  module.code=replaceRegion(module.code,'\t// whitecaps:','\to.normal = normal;',
   '\tvar o: WaterSurfaceFrag; var foam = 0.0; let coverage = 0.0;');
  app.surfFoam.module.code=replaceFunction(app.surfFoam.module.code,'surfFoamLight','return vec3f(0.0);');
 }
 if(pass==='reflections'||pass==='all-off'&&(!stage||stage==='reflections')){
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
 if(pass==='all-off'){
  for(const name of ['fft','seaDetail','query','caustics','shoreSim','underwaterLighting','breakers','spray','environment','oceanLOD'])if(app[name])app[name].update=noop;
  app.refraction.render=noop;
  app.ocean.visible=app.breakers.mesh.visible=app.spray.mesh.visible=false;
 }
 if(pass==='composition')for(const name of ['copyBase','copyOverlay']){
  const original=composite[name].bind(composite);let initialized=false;
  composite[name]=canvas=>{if(!initialized){original(canvas);initialized=true;}};
 }
}
export function breakersForProfile(Base,config){
 if(!['spray','all-off'].includes(config?.pass))return Base;
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
  const completion=loopMode(this.config.pass).wait;
  return {pass:this.config.pass,duration,frames:this.times.length,fps:this.times.length/duration,
   minOneSecondFPS:Math.min(...bins),p95FrameMs:quantile(.95),p99FrameMs:quantile(.99),maxFrameMs:sorted.at(-1),
   metric:completion?'gpu-completed':'raf-submitted',
   measurement:completion?'GPU-completed frame cadence, including app rendering and queue wait; not display scanout or isolated GPU timings':'Submitted frames counted with parent rAF timestamps; NOT GPU-completed cadence or display scanout. Inspect final queue drain for backlog.',
   meetsCadenceTarget:completion&&!loopMode(this.config.pass).empty&&this.config.seconds===120&&Math.min(...bins)>=30&&sorted.at(-1)<=1000/30+1};
 }
}
