// Real WGSL/pipeline checks via Dawn null. No pixels / no FPS claim.
import fs from 'node:fs';
const {create,globals}=await import(process.env.DAYBUOY_WEBGPU_MODULE||'webgpu');Object.assign(globalThis,globals);
Object.defineProperty(globalThis,'navigator',{value:{gpu:create(['backend=null']),userAgent:'validation',maxTouchPoints:0},configurable:true});
globalThis.location={search:'?noClouds=1'};globalThis.window=globalThis;globalThis.innerWidth=390;globalThis.innerHeight=844;globalThis.devicePixelRatio=1;globalThis.document={getElementById:()=>null};
globalThis.fetch=async url=>new Response(fs.readFileSync('public/'+String(url).replace(/^\//,'')));
const {GPU}=await import('../vendor/tidewater/src/engine/gpu/GPU.js');
const {Engine}=await import('../vendor/tidewater/src/engine/Engine.js');
const {MeshRenderer}=await import('../vendor/tidewater/src/engine/render/MeshRenderer.js');
const {PerspectiveCamera,Scene}=await import('../vendor/tidewater/src/engine/index.js');
const {Texture}=await import('../vendor/tidewater/src/engine/gpu/Texture.js');
const {FrameUniforms}=await import('../vendor/tidewater/src/engine/render/Frame.js');
Engine.prototype.init=async function(){await GPU.init({headless:true});this.canvas=this.domElement={width:390,height:844,style:{}};this.meshRenderer=new MeshRenderer();this.meshRenderer.syncPipelines=false;this.camera=new PerspectiveCamera(62,390/844,.3,2500);this.scene=new Scene();FrameUniforms.fields.outputResolution.value.set(390,844);};
const {BeachApp}=await import('../proof/BeachApp.js');const {OceanComposite}=await import('../proof/OceanComposite.js');
const app=new BeachApp(),precompile=app.precompile.bind(app);let composite,target;
app.precompile=async()=>{composite=new OceanComposite(app);composite.resize();target=new Texture({label:'validation target',width:390,height:844,format:GPU.format,usage:['render','sample']});await precompile();};
const errors=[];const log=console.error;console.error=(...args)=>{errors.push(args.join(' '));log(...args);};
try{
 await app.init((p,label)=>console.log(Math.round(p*100)+'% '+label));
 for(const height of [1,3,5,8]){app.setTestHeight(height);app.frame(1/30);composite.final.render({colorViews:[target],clear:[0,0,0,1]});GPU.submit();await GPU.queue.onSubmittedWorkDone();}
 if(errors.length)throw Error(errors.join('\n'));
 const result={backend:'Dawn null',heights:[1,3,5,8],compositor:'native water + original scene + original overlay',errors:[],pixelsRendered:false,phoneTested:false};
 fs.writeFileSync('../night-report/ocean-composite-validation.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));process.exit(0);
}catch(e){console.error(e);process.exit(1);}
