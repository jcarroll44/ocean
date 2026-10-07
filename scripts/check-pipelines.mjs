// Dawn's null backend validates real WGSL/pipelines. It draws NO pixels.
import fs from 'node:fs';
const {create,globals}=await import(process.env.DAYBUOY_WEBGPU_MODULE||'webgpu');
Object.assign(globalThis,globals);
Object.defineProperty(globalThis,'navigator',{value:{gpu:create(['backend=null'])},configurable:true});
globalThis.location={search:'?height=3'};globalThis.window=globalThis;globalThis.innerWidth=390;globalThis.innerHeight=844;globalThis.devicePixelRatio=1;
globalThis.document={getElementById:()=>null};
globalThis.fetch=async url=>new Response(fs.readFileSync('public/'+String(url).replace(/^\//,'')));
const {GPU}=await import('../vendor/tidewater/src/engine/gpu/GPU.js');
const {Engine}=await import('../vendor/tidewater/src/engine/Engine.js');
const {MeshRenderer}=await import('../vendor/tidewater/src/engine/render/MeshRenderer.js');
const {PerspectiveCamera,Scene}=await import('../vendor/tidewater/src/engine/index.js');
const {Texture}=await import('../vendor/tidewater/src/engine/gpu/Texture.js');
const {FrameUniforms}=await import('../vendor/tidewater/src/engine/render/Frame.js');
Engine.prototype.init=async function(){
 await GPU.init({headless:true});this.canvas=this.domElement={width:390,height:844,style:{}};
 this.meshRenderer=new MeshRenderer();this.meshRenderer.syncPipelines=false;
 this.camera=new PerspectiveCamera(62,390/844,.3,60000);this.scene=new Scene();FrameUniforms.fields.outputResolution.value.set(390,844);
};
const {BeachApp}=await import('../proof/BeachApp.js');
const app=new BeachApp(),precompile=app.precompile.bind(app);
app.precompile=async()=>{app.post.outputTexture=new Texture({label:'validation only',width:390,height:844,format:'rgba8unorm',usage:['render','copySrc','sample']});app.post.outputSize={width:390,height:844};await precompile();};
const errors=[],error=console.error;console.error=(...args)=>{errors.push(args.join(' '));error(...args);};
try{
 await app.init((p,label)=>console.log(Math.round(p*100)+'% '+label));
 for(const h of [1,3,5]){app.setTestHeight(h);app.frame(1/60);await GPU.queue.onSubmittedWorkDone();}
 if(errors.length)throw Error(errors.join('\n'));
 const result={backend:'Dawn null (validation only)',viewport:[390,844],heightsFeet:[1,3,5],pipelines:app.engine.meshRenderer.stats.pipelines,errors:[],pixelsRendered:false,phoneTested:false};
 fs.writeFileSync('validation.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));process.exit(0);
}catch(e){console.error(e);process.exit(1);}
