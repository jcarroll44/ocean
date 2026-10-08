import assert from 'node:assert/strict';
import fs from 'node:fs';
import {create,globals} from 'webgpu';Object.assign(globalThis,globals);
Object.defineProperty(globalThis,'navigator',{value:{gpu:create(['backend=null'])},configurable:true});globalThis.innerHeight=689;
const {GPU}=await import('../vendor/tidewater/src/engine/gpu/GPU.js');
const {SunShadows}=await import('../vendor/tidewater/src/engine/render/Shadows.js');
const {SceneRenderer}=await import('../vendor/tidewater/src/engine/render/SceneRenderer.js');
const {MeshRenderer}=await import('../vendor/tidewater/src/engine/render/MeshRenderer.js');
const {Scene,PerspectiveCamera}=await import('../vendor/tidewater/src/engine/index.js');
const {setFrameCamera}=await import('../vendor/tidewater/src/engine/render/Frame.js');
const {installNativeBeach}=await import('../proof/NativeBeachScene.js');
const {Atmosphere}=await import('../vendor/tidewater/src/sky/Atmosphere.js');
const {Sky}=await import('../vendor/tidewater/src/sky/Sky.js');
const {ComputeKernel}=await import('../vendor/tidewater/src/engine/gpu/Compute.js');
const {StorageBuffer}=await import('../vendor/tidewater/src/engine/gpu/Texture.js');
const {installNativeWeather,guardNativeBreakerLip}=await import('../proof/native-weather.js');
const {Breakers}=await import('../vendor/tidewater/src/ocean/Breakers.js');
const {NativeOverlays}=await import('../proof/NativeOverlays.js');
const {BoxGeometry,Mesh}=await import('../vendor/tidewater/src/engine/index.js');
const {Material}=await import('../vendor/tidewater/src/engine/render/Material.js');
await GPU.init({headless:true});GPU.device.pushErrorScope('validation');new SunShadows();
const camera=new PerspectiveCamera(61,390/689,.3,2500);camera.position.set(0,10,-28);camera.lookAt(0,4,20);camera.updateMatrixWorld();
const scene=new Scene(),renderer=new MeshRenderer();const sceneRenderer=new SceneRenderer(renderer,scene,camera);sceneRenderer.setSize(780,1378);
const app={camera,scene,sceneRenderer,settings:{exposure:.55},atmosphere:new Atmosphere(),terrainData:{heightAt:()=>2}};
const cheap=process.argv.includes('--cheap-overcast');
app.sky=new Sky(app.atmosphere);app.nativeWeather=installNativeWeather(app,{cheap});
// Validate the exact sky module consumed by environment faces. Full upstream SH
// filtering exceeds this container's 16 KB workgroup-storage limit (18 KB needed).
const skySamples=new StorageBuffer({label:'native sky validation',count:2,type:'vec4f'});
const environmentInput=new ComputeKernel({label:'native environment/reflection sky input',modules:[app.sky.module],bindings:{samples:{storage:skySamples,access:'read_write'}},workgroupSize:[1,1,1],code:`@compute @workgroup_size(1) fn main(){samples[0]=vec4f(skyRadianceWithClouds(vec3f(0.0,1.0,0.0),false),1.0);samples[1]=vec4f(skyReflectionRadiance(vec3f(0.0,0.0,1.0)),1.0);}`});
const beach=installNativeBeach(app);
// Build the real upstream lip mesh/shader against a tiny crest buffer; no FFT
// resource-limit workaround and no simulated performance or rendered claim.
const breakers=Object.assign(Object.create(Breakers.prototype),{NS:2,spacing:.6,sky:app.sky,clouds:null,params:{},crest:new StorageBuffer({label:'test lip crests',count:12,type:'vec4f'})});
breakers._buildMesh();guardNativeBreakerLip(breakers);scene.add(breakers.mesh);
beach.stand.frustumCulled=false;
const packet={sun:[-.3,.8,-.5],moon:[.2,-.3,-.5],moonInfo:[.5,.004,0,0],forecast:{cloud:100,rain:.2}};
app.nativeWeather.update(packet);beach.update(packet);
const overlay=new NativeOverlays(scene),source=new Mesh(new BoxGeometry(1,1,1),new Material({color:'#ffffff',transparent:true,opacity:.5}));source.material.color=source.material.uniforms.color.value;source.position.set(0,10,0);overlay.update([source]);
GPU.beginFrame();setFrameCamera(camera,780,1378);environmentInput.dispatch(1);sceneRenderer.render();GPU.submit();await GPU.queue.onSubmittedWorkDone();
const error=await GPU.device.popErrorScope();assert(!error,error?.message);
overlay.update([]);assert.equal(overlay.objects.size,0);assert.equal(scene.children.length,3);assert.equal(beach.stand.name,'DayBuoy empty lifeguard stand');
const result={backend:'Dawn null (no pixels)',cheapOvercast:cheap,nativeSkyCelestialStandAndOverlayPipelines:'PASS',guardedNativeLipPipeline:'PASS',sharedEnvironmentAndReflectionSkyInput:'PASS',fullEnvironmentFiltering:'Not tested: 18 KB workgroup storage exceeds container 16 KB limit',phoneFPS:null,screenshotPair:null,visualAcceptance:false};
fs.writeFileSync('../night-report/'+(cheap?'cheap-overcast-validation':'native-scene-validation')+'.json',JSON.stringify(result,null,2));console.log(result);process.exit(0);
