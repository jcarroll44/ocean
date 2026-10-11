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
 water.output=replace(water.output,'r.color = vec4f( res, 1.0 );','r.color = vec4f( nativeWeatherFog(res,pos), 1.0 );');water.needsUpdate=true;
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
 const material=new Material({name:'Forecast rain streaks',modules:[module],lit:false,lightingHooks:false,transparent:true,depthWrite:false,side:'double',varyings:{rainSeed:'f32',rainUV:'vec2f'},vertex:`
 let seed=f32(v.instance);let rx=nativeCloudHash(vec2f(seed,2.0));let rz=nativeCloudHash(vec2f(seed,7.0));let ry=nativeCloudHash(vec2f(seed,13.0));
 let fall=fract(ry-frame.time*0.63);let wind=frame.windDir*frame.windSpeed;
 let center=frame.cameraPos+vec3f((rx-0.5)*36.0,fall*22.0-11.0,(rz-0.5)*36.0);
 let right=normalize(vec3f(frame.view[0][0],frame.view[1][0],frame.view[2][0]));
 let slant=vec3f(wind.x*0.013,-0.42,wind.y*0.013);
 v.useWorld=true;v.worldPos=center+right*v.position.x*0.009+slant*v.position.y;v.worldNormal=vec3f(0.0,1.0,0.0);o.rainSeed=rx;o.rainUV=v.position.xy;
 `,surface:`
 let rainOn=1.0-smoothstep(min(nativeWeather.rain/8.0,1.0),min(nativeWeather.rain/8.0,1.0)+0.01,in.vs.rainSeed);
 s.albedo=mix(vec3f(0.045,0.06,0.085),vec3f(0.56,0.64,0.67),nativeWeather.daylight);
 s.alpha=rainOn*min(nativeWeather.rain*0.18,0.36)*(1.0-abs(in.vs.rainUV.y))*(1.0-abs(in.vs.rainUV.x));
 `});
 const rain=new Mesh(geometry,material);rain.count=384;rain.frustumCulled=false;rain.layers.set(LAYERS.TRANSPARENT);app.scene.add(rain);
 // Remains present at zero alpha during loading so every weather path compiles.
 return {rain,update(){const f=weather.uniforms.fields;ShadowUniforms.fields.sunAngularDiameter.value=.00925*(1+3*(1-f.direct.value));}};
}
