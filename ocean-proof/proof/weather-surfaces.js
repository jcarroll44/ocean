import {InstancedBufferGeometry,BufferAttribute,Mesh} from '../vendor/tidewater/src/engine/index.js';
import {Material} from '../vendor/tidewater/src/engine/render/Material.js';
import {LAYERS} from '../vendor/tidewater/src/core/SceneRenderer.js';
import {ShadowUniforms} from '../vendor/tidewater/src/engine/render/wgsl/lighting.js';
const replace=(s,a,b)=>{if(!s.includes(a))throw Error('Weather material hook changed: '+a);return s.replace(a,b);};
export function installWeatherSurfaces(app,beach){
 const weather=app.nativeWeather;if(!weather||weather.cheap)return null;const module=weather.module;
 // Material adapters leave the vendored Tidewater tree and all FFT inputs exact.
 // Build lazily composed materials now, before the production precompile round.
 const water=app.waterMaterial;if(!water._built)water._build();
 water.modules.push(module);
 water.output=replace(water.output,'let Nup = normalize( mix( surf.normal,','let Nup = normalize( mix( normalize(surf.normal + nativeRainNormal(pos)),');
 water.output=replace(water.output,'var sunLight = frame.sunColor * sunShadowPCF','var sunLight = frame.sunColor * nativeCloudShadow(pos) * sunShadowPCF');
 water.output=replace(water.output,'let foamCol = foamLit * mat.foamIntensity;','let foamCol = (foamLit + nativeStormFoam()) * mat.foamIntensity;');
 water.output=replace(water.output,'r.color = vec4f( res, 1.0 );','r.color = vec4f( nativeWeatherFog(res,pos), 1.0 );');water.needsUpdate=true;
 const lip=app.breakers.mesh.material;
 lip.modules.push(module);lip.output=replace(lip.output,'let col = foamLit * mix(','let col = (foamLit + nativeStormFoam()) * mix(');lip.needsUpdate=true;
 const terrain=app.terrain.material;
 terrain.modules.push(module);
 terrain.surface=replace(terrain.surface,'let wet = sat( wetFoam.x )','let wet = max(sat( wetFoam.x ), min(nativeWeather.rain * 0.22, 0.95))');
 terrain.output+='\nr.color = vec4f(nativeWeatherFog(r.color.rgb,in.P),r.color.a);';terrain.needsUpdate=true;
 const stand=beach.stand.material;stand.modules.push(module);stand.output+='\nr.color = vec4f(nativeWeatherFog(r.color.rgb,in.P),r.color.a);';stand.needsUpdate=true;
 const direct=app.underwaterLighting?.direct;
 if(direct){direct.deps.push(module);direct.code=replace(direct.code,'var result = vec3f( 1.0 );','var result = vec3f( nativeCloudShadow(P) );');}
 // Gusts affect existing breaker spray, not additional emitters or allocations.
 app.spray.module.deps.push(module);
 app.spray.module.code=replace(app.spray.module.code,'sprayVel[ slot ] = vec4f( v, size );','sprayVel[ slot ] = vec4f(v + vec3f(frame.windDir.x,0.18,frame.windDir.y) * nativeWeather.gustExtra * 0.35, size);');
 // Breakers compose their emitter in the constructor. Recompose once during
 // loading so the gust hook is in the real compute kernel before prewarming.
 app.breakers._buildKernel();
 const geometry=new InstancedBufferGeometry();geometry.setAttribute('position',new BufferAttribute(new Float32Array([-1,-1,0,1,-1,0,1,1,0,-1,1,0]),3));geometry.setIndex([0,1,2,0,2,3]);geometry.instanceCount=384;
 const material=new Material({name:'Forecast rain streaks and sheets',modules:[module],lit:false,lightingHooks:false,transparent:true,depthWrite:false,side:'double',varyings:{rainSeed:'f32',rainUV:'vec2f',rainSheet:'f32'},vertex:`
 let seed=f32(v.instance);let rx=nativeCloudHash(vec2f(seed,2.0));let rz=nativeCloudHash(vec2f(seed,7.0));let ry=nativeCloudHash(vec2f(seed,13.0));
 let fall=fract(ry-frame.time*0.63);let wind=frame.windDir*frame.windSpeed;
 var center=frame.cameraPos+vec3f((rx-0.5)*36.0,fall*22.0-11.0,(rz-0.5)*36.0);
 let right=normalize(vec3f(frame.view[0][0],frame.view[1][0],frame.view[2][0]));
 var slant=vec3f(wind.x*0.013,-0.42,wind.y*0.013);var width=.014;
 let sheet=v.instance<8u;
 if(sheet){
  // Reuse 8 of the 384 preallocated quads. Two staggered depth rows of 4
  // curtains, not hundreds of large overlapping translucent billboards.
  let forward=-normalize(vec3f(frame.view[0][2],frame.view[1][2],frame.view[2][2]));
  let depth=select(42.0,75.0,v.instance>=4u);
  center=frame.cameraPos+forward*depth+right*((f32(v.instance%4u)-1.5)*18.0+sin(frame.time*.17+seed)*4.0);
  center.y=frame.cameraPos.y-2.0;width=7.5;slant=vec3f(wind.x*.14,-19.0,wind.y*.14);
 }
 v.useWorld=true;v.worldPos=select(vec3f(0.0,-10000.0,0.0),center+right*v.position.x*width+slant*v.position.y,nativeWeather.rain>.001);v.worldNormal=vec3f(0.0,1.0,0.0);o.rainSeed=rx;o.rainUV=v.position.xy;o.rainSheet=select(0.0,1.0,sheet);
 `,surface:`
 let rainOn=1.0-smoothstep(min(nativeWeather.rain/8.0,1.0),min(nativeWeather.rain/8.0,1.0)+0.01,in.vs.rainSeed);
 s.albedo=mix(vec3f(0.20,0.25,0.32),vec3f(0.56,0.64,0.67),nativeWeather.daylight)+vec3f(.45,.51,.62)*nativeWeather.flash;
 s.alpha=rainOn*min(nativeWeather.rain*0.18,0.36)*(1.0-abs(in.vs.rainUV.y))*(1.0-abs(in.vs.rainUV.x));
 if(in.vs.rainSheet>.5){
  let uv=in.vs.rainUV;
  let drift=uv.x*2.8+uv.y*.22+frame.time*.12+in.vs.rainSeed*7.0;
  let folds=.40+.60*nativeCloudNoise(vec2f(drift,uv.y*.6-frame.time*.37));
  let threads=.65+.35*sin(drift*72.0+uv.y*2.0-frame.time*18.0);
  let feather=(1.0-smoothstep(.45,1.0,abs(uv.x)))*(1.0-smoothstep(.65,1.0,abs(uv.y)));
  s.alpha=min(nativeWeather.rain/12.0,.48)*folds*threads*feather;
 }
 `});
 const rain=new Mesh(geometry,material);rain.count=384;rain.frustumCulled=false;rain.layers.set(LAYERS.TRANSPARENT);app.scene.add(rain);
 // Remains present at zero alpha during loading so every weather path compiles.
 return {rain,update(){const f=weather.uniforms.fields;ShadowUniforms.fields.sunAngularDiameter.value=.00925*(1+3*(1-f.direct.value));}};
}
