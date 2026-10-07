// Execute the NEW compositing passes on Dawn null. Native ocean validation is
// a separate check and is blocked here by this adapter's 16 KB/16 texture limit.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {create,globals} from 'webgpu';Object.assign(globalThis,globals);
Object.defineProperty(globalThis,'navigator',{value:{gpu:create(['backend=null'])},configurable:true});
const {GPU}=await import('../vendor/tidewater/src/engine/gpu/GPU.js');
const {Texture}=await import('../vendor/tidewater/src/engine/gpu/Texture.js');
const {SceneRenderer}=await import('../vendor/tidewater/src/engine/render/SceneRenderer.js');
const {MeshRenderer}=await import('../vendor/tidewater/src/engine/render/MeshRenderer.js');
const {Material}=await import('../vendor/tidewater/src/engine/render/Material.js');
const {Scene,PerspectiveCamera}=await import('../vendor/tidewater/src/engine/index.js');
const {FrameUniforms,setFrameCamera}=await import('../vendor/tidewater/src/engine/render/Frame.js');
const {OceanComposite}=await import('../proof/OceanComposite.js');
const {installPostBypass}=await import('../proof/profile-present.js');
await GPU.init({headless:true});GPU.device.pushErrorScope('validation');
const camera=new PerspectiveCamera(60,390/844,.1,2500);camera.position.set(0,10,-28);camera.lookAt(0,4,20);camera.updateMatrixWorld();
const sceneRenderer=new SceneRenderer(new MeshRenderer(),new Scene(),camera);sceneRenderer.setSize(390,844);
const dst=new Texture({width:390,height:844,format:GPU.format,usage:['render','copySrc']});
for(const pass of ['baseline','atlas','host-single','host-post','host-all']){
const app={profileConfig:{pass},engine:{width:390,height:844},sceneRenderer,post:{render(){}},breakers:{material:new Material()},spray:{material:new Material()}};
const composite=new OceanComposite(app);composite.resize();composite.base.resize(pass==='atlas'?780:390,844);if(pass!=='atlas')composite.overlay.resize(390,844);
if(['host-post','host-all'].includes(pass)){
 app.post.render=()=>{throw Error('Full post chain ran in bypass case');};
 composite.final.render=()=>{throw Error('Final composition ran in bypass case');};
 installPostBypass(app,composite);
}
GPU.beginFrame();setFrameCamera(camera,390,844);FrameUniforms.fields.outputResolution.value.set(390,844);
sceneRenderer.render();
if(['host-post','host-all'].includes(pass))app.post.render();else composite.final.render({colorViews:[dst],clear:[0,0,0,1]});
GPU.submit();await GPU.queue.onSubmittedWorkDone();
}
const error=await GPU.device.popErrorScope();assert(!error,error?.message);
const result={backend:'Dawn null (no pixels)',newBackgroundAndFinalPasses:'PASS: baseline, atlas, single-layer and host post/all bypass',foregroundAlpha:'source checked; browser copy and WebGL background bake unverified',nativeOceanFullValidation:'BLOCKED: container adapter has 16 KB workgroup storage and 16 sampled textures; Tidewater requires more',phoneTested:false,visualAcceptance:false};
fs.writeFileSync('../night-report/ocean-composite-validation.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));process.exit(0);
