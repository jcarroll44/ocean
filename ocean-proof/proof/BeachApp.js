// Minimal host for Tidewater's ORIGINAL wave/render systems. No island/game
// constructors execute. App's simulation/render loop is inherited unchanged.
import {App} from '../vendor/tidewater/src/App.js';
import {Engine} from '../vendor/tidewater/src/core/Engine.js';
import {GPU} from '../vendor/tidewater/src/engine/gpu/GPU.js';
import {Vector2,Vector3,Mesh,Group,BufferGeometry,Float32BufferAttribute} from '../vendor/tidewater/src/engine/index.js';
import {SunShadows} from '../vendor/tidewater/src/engine/render/Shadows.js';
import {SceneRenderer,LAYERS} from '../vendor/tidewater/src/core/SceneRenderer.js';
import {CDLOD} from '../vendor/tidewater/src/core/CDLOD.js';
import {Atmosphere} from '../vendor/tidewater/src/sky/Atmosphere.js';
import {Sky} from '../vendor/tidewater/src/sky/Sky.js';
import {SkyProClouds} from '../vendor/tidewater/src/sky/SkyProClouds.js';
import {Environment} from '../vendor/tidewater/src/sky/Environment.js';
import {TerrainGPU} from '../vendor/tidewater/src/world/TerrainGPU.js';
import {Terrain} from '../vendor/tidewater/src/world/Terrain.js';
import {computeShoreField} from '../vendor/tidewater/src/world/ShoreField.js';
import {OceanFFT} from '../vendor/tidewater/src/ocean/OceanFFT.js';
import {WaterSurface} from '../vendor/tidewater/src/ocean/WaterSurface.js';
import {WaterMaterial} from '../vendor/tidewater/src/ocean/WaterMaterial.js';
import {createFoamTexture} from '../vendor/tidewater/src/ocean/FoamTexture.js';
import {ShoreWaves} from '../vendor/tidewater/src/ocean/ShoreWaves.js';
import {ShoreSim} from '../vendor/tidewater/src/ocean/ShoreSim.js';
import {SurfFoam} from '../vendor/tidewater/src/ocean/SurfFoam.js';
import {Caustics} from '../vendor/tidewater/src/ocean/Caustics.js';
import {SeaDetail} from '../vendor/tidewater/src/ocean/SeaDetail.js';
import {WaterQuery} from '../vendor/tidewater/src/ocean/WaterQuery.js';
import {Breakers} from '../vendor/tidewater/src/ocean/Breakers.js';
import {TunedSpray as Spray} from './TunedSpray.js';
import {initialQuality,applyQuality,PRESETS,phoneDevice} from './quality.js';
import {installUnderwaterLighting} from '../vendor/tidewater/src/ocean/UnderwaterLighting.js';
import {RefractionPass} from '../vendor/tidewater/src/ocean/RefractionPass.js';
import {installGroundBounce} from '../vendor/tidewater/src/materials/GroundBounce.js';
import {LocalLights} from '../vendor/tidewater/src/materials/LocalLights.js';
import {standard} from '../vendor/tidewater/src/materials/Materials.js';
import {Underwater} from '../vendor/tidewater/src/post/Underwater.js';
import {PostFX} from '../vendor/tidewater/src/post/PostFX.js';
import {G} from '../vendor/tidewater/src/core/Globals.js';
import {createBeachTerrain} from './beach-land.js';
import {createLandward} from './landward.js';
import {sugarWhite} from './white-sand.js';
import {applyMarine} from './forecast.js';
import {CAMERA,TEST} from './inputs.js';
import {profileConfig,installShaderAblation,breakersForProfile} from './profile.js';
const noop=()=>{};

export class BeachApp extends App{
 async init(onProgress=noop){
  // Phone quality changes sample density and budgets, never wave period or amplitude.
  this.profileConfig=profileConfig(location.search);
  this.initialQuality=this.profileConfig?{mode:'manual',level:0}:initialQuality();
  const stage=async(p,label)=>{onProgress(p,label);await new Promise(r=>setTimeout(r,0));};
  await stage(.02,'Opening the beach');
  this.engine=new Engine(document.getElementById('app'));await this.engine.init();
  GPU.device.pushErrorScope('validation');
  const engine=this.engine,scene=this.scene=engine.scene,camera=this.camera=engine.camera;this.renderer=engine;
  camera.near=.3;camera.fov=CAMERA.fov;camera.position.set(-CAMERA.x,CAMERA.y,-CAMERA.z);camera.lookAt(-CAMERA.x,CAMERA.y+Math.sin(CAMERA.pitch),-CAMERA.z+Math.cos(CAMERA.pitch));
  const project=camera.updateProjectionMatrix.bind(camera);camera.updateProjectionMatrix=()=>{project();camera.projectionMatrix.elements[9]=-CAMERA.shear/.59;camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();};camera.updateProjectionMatrix();
  const view=this.qs.get('view');if(view){const angle=({left:90,right:-90,back:180})[view]*Math.PI/180;if(Number.isFinite(angle))camera.lookAt(camera.position.x+Math.sin(angle)*10,camera.position.y-2,camera.position.z+Math.cos(angle)*10);}
  engine.setRenderScale(Math.min(devicePixelRatio||1,PRESETS[this.initialQuality.level].dpr));
  // The original loop can keep its update ordering with zero-cost inactive
  // slots. There are no boat/game/wildlife assets or GPU buffers behind them.
  for(const key of ['boatCtl','boatSpray','wake','fly','player','game','village','boat','wildlife','rocks','debris','reef','marineSnow','airMotes','profiler'])this[key]={update:noop,queueQueries:noop};
  this.input={hit:()=>false,endFrame:noop};this.freeCam=true;this.audio=null;
  await stage(.10,'Preparing the sky');
  this.atmosphere=new Atmosphere(engine);this.sky=new Sky(this.atmosphere);
  this.clouds=this.qs.has('noClouds')?null:new SkyProClouds(engine,this.atmosphere);
  if(this.clouds){await this.clouds.ready;this.sky.clouds=this.clouds;}
  this.shadows=this.csm=new SunShadows({size:2048,splits:[10,60,400],lightMargin:200,normalBias:[.015,.06,.3],bias:.00002});
  this.shadows.layerMask=(1<<LAYERS.OPAQUE)|(1<<LAYERS.TRANSPARENT);
  this.environment=new Environment(engine,scene,this.sky,phoneDevice()?64:128);
  await stage(.20,'Preparing white sand');
  this.terrainData=createBeachTerrain();this.daybuoyBeach={x:0,z:3.5};
  this.shoreField=computeShoreField(this.terrainData,{res:512,swellDir:[0,-1]});
  this.terrainGPU=new TerrainGPU(this.terrainData,this.shoreField);this.terrainGPU.shoreField=this.shoreField;
  this.terrain=new Terrain({scene,terrainData:this.terrainData,terrainGPU:this.terrainGPU,gridSize:40,renderer:engine});
  this.terrain.mesh.material.appliesHillShadow=true;
  await stage(.34,'Preparing the waves');
  this.fft=new OceanFFT(engine);this.foamTexture=createFoamTexture(engine);
  this.oceanLOD=new CDLOD({gridSize:32,leafSize:8,levels:12,minY:-25,maxY:25});
  this.surface=new WaterSurface({fft:this.fft,cdlod:this.oceanLOD,foamTexture:this.foamTexture});this.surface.terrain=this.terrainGPU;
  this.seaDetail=new SeaDetail();this.surface.detail=this.seaDetail;
  this.shore=new ShoreWaves(this.terrainGPU);this.surface.shore=this.shore;
  installShaderAblation(this,this.profileConfig,'shore');
  this.caustics=new Caustics(engine,this.fft);if(this.caustics)this.caustics.detail=this.seaDetail;
  this.shoreSim=new ShoreSim(engine,{terrainGPU:this.terrainGPU,shore:this.shore,center:new Vector2(0,20),size:380,res:768});
  this.surface.shoreSim=this.shoreSim;
  this.terrain.wetness={modules:[this.shoreSim.module],code:`fn terrainWetness(xz:vec2f,h:f32)->vec2f{let s=shoreSimSample(xz);let inside=shoreSimInside(shoreSimUvOf(xz));let band=smoothstep(0.45,0.0,h);return vec2f(max(s.y,band*(1.0-inside)),shoreSimSandFoam(xz,s,h));}`};
  this.terrain.finalizeMaterial();sugarWhite(this.terrain);
  if(this.qs.get('land')==='1')this.landward=createLandward(this);
  this.surfFoam=new SurfFoam({shoreSim:this.shoreSim});this.surface.foamShading=args=>this.surfFoam.shading(args);
  installShaderAblation(this,this.profileConfig,'foam');
  this.underwaterLighting=installUnderwaterLighting({fft:this.fft,caustics:this.caustics,clouds:this.clouds,terrain:this.terrainGPU,shore:this.shore,surface:this.surface,shoreSim:this.shoreSim});
  installGroundBounce({terrain:this.terrainGPU,clouds:this.clouds});
  this.sceneRenderer=new SceneRenderer(engine.meshRenderer,scene,camera);
  this.refraction=new RefractionPass({meshRenderer:engine.meshRenderer,scene,camera,sceneRenderer:this.sceneRenderer,scale:.5});this.sceneRenderer.onBeforeWater=()=>this.refraction.render(G.seaLevel.value);
  this.sceneRenderer.background=this.sky.background;this.localLights=new LocalLights();
  this.waterMaterial=new WaterMaterial({surface:this.surface,sky:this.sky,sceneCopy:this.sceneRenderer.opaqueCopy,sceneDepthHalf:this.sceneRenderer.opaqueDepthHalf.texture,refraction:this.refraction,hullMask:this.sceneRenderer.hullMaskRT.texture,hullMaskActive:this.sceneRenderer.hullMaskActive});
  installShaderAblation(this,this.profileConfig,'reflections');
  this.waterMaterial.clouds=this.clouds;
  this.ocean=new Mesh(this.oceanLOD.geometry,this.waterMaterial);this.ocean.frustumCulled=false;this.ocean.receiveShadow=true;this.ocean.staticVelocity=true;this.ocean.layers.set(LAYERS.WATER);scene.add(this.ocean);
  this.query=new WaterQuery(engine,this.surface);
  this.spray=new Spray(engine,{query:this.query,terrain:this.terrainGPU,sceneCopy:this.sceneRenderer.opaqueCopy,clouds:this.clouds});scene.add(this.spray.mesh);
  const ActiveBreakers=breakersForProfile(Breakers,this.profileConfig);
  this.breakers=new ActiveBreakers(engine,{surface:this.surface,shore:this.shore,terrainData:this.terrainData,sky:this.sky,spray:this.spray,clouds:this.clouds});scene.add(this.breakers.mesh);
  await stage(.50,'Preparing light and reflections');
  this.underwater=new Underwater({depthTexture:this.sceneRenderer.sceneRT.depthTexture,maskTexture:this.sceneRenderer.waterMaskTexture,query:this.query,caustics:this.caustics,fft:this.fft});
  this.waterMaterial.cameraWaterHeightNode=this.query.cameraState().x;
  this.post=new PostFX(engine,{sceneRenderer:this.sceneRenderer,camera,underwater:this.underwater,clouds:this.clouds,sunDir:this.atmosphere.sunDir,haze:null});
  this.setRenderScale(1);
  this.setTestHeight(TEST.feet);
  applyQuality(this,this.initialQuality.level);
  this.updateSun();this.gpu=GPU;window.__app=this;
  if(this.profileConfig){
   this.setForecast({swell:3,period:8,direction:201,wind:8,windDirection:201,tide:0,cloud:0});
   this.engine.setRenderScale(this.profileConfig.dpr);
   this.activeQuality={...this.activeQuality,dpr:this.profileConfig.dpr};
  }
  await stage(.65,'Finishing the waves');await this.precompile();
  await stage(.95,'Opening your view');this.frame(1/60);await GPU.queue.onSubmittedWorkDone();
  const validation=await GPU.device.popErrorScope();if(validation)throw Error('The wave renderer could not start on this device: '+validation.message);
 }
 setForecast(c){return applyMarine(this,G,c);}
 setTestHeight(feet){
  this.testHeight=feet;
  this.shore.amplitude.value=feet*.3048/2;
  this.shore.period.value=TEST.period;
  // Spectrum energy scales with height squared. Preserve the two native
  // spectrum shapes; this is relative scaling, not a calibrated Hs estimator.
  const gain=Math.pow(feet*.3048/.68,2);
  this.fft.local.scale=gain;this.fft.swell.scale=.48*gain;
  this.fft.local.windSpeed=TEST.windKnots*.514444;
  this.fft.local.windDirection=-90;this.fft.swell.windDirection=-90;
  this.fft.updateSpectrumUniforms();
  G.seaLevel.value=TEST.tide;
 }
}
