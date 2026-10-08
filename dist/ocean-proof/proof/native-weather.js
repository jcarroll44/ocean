import {UniformBlock,ShaderModule} from '../vendor/tidewater/src/engine/gpu/Shader.js';
const smooth=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
export function overcastState(sunY,cloud,rain=0){
 const cover=Math.max(0,Math.min(1,cloud)),deck=smooth(.7,.98,cover);
 const daylight=smooth(.02,.25,sunY),wet=1-.15*smooth(.5,6,rain);
 return {deck,daylight,weight:deck*daylight,radiance:(.018+daylight*.722)*wet,exposure:1+.12*deck*daylight};
}
export function installNativeWeather(app){
 const uniforms=new UniformBlock('NativeWeather',{deck:['f32',0],radiance:['f32',.74]});
 const module=new ShaderModule({name:'nativeOvercast',uniforms,uniformName:'nativeWeather',code:`
fn nativeCloudDeck(dir:vec3f)->vec3f {
 // Bounded direction coordinates: no horizon division, narrow columns or binary cloud masks.
 let detail=sin(dir.x*5.0+dir.z*3.0+frame.time*0.003)*sin(dir.z*4.0-dir.y*2.0)*0.018;
 let gradient=1.0+0.12*pow(1.0-clamp(dir.y,0.0,1.0),2.0);
 return vec3f(1.0,1.005,1.01)*nativeWeather.radiance*(gradient+detail);
}
fn nativeWeatherSky(dir:vec3f,clear:vec3f)->vec3f {
 return mix(clear,nativeCloudDeck(dir),nativeWeather.deck);
}`});
 // The same deck must light the sand, stand and reflected ocean, not just the backdrop.
 const sky=app.sky.module;
 sky.deps.push(module);
 const count=(sky.code.match(/return base;/g)||[]).length;
 if(count!==2)throw Error('Native weather expects the noClouds proof sky');
 sky.code=sky.code.replaceAll('return base;','return nativeWeatherSky(dir,base);');
 const baseExposure=app.settings.exposure;
 return {module,uniforms,state:overcastState(0,0),update(packet){
  const f=packet.forecast||{},cover=Math.max(f.cloud||0,f.cloudLow||0,f.cloudMid||0,f.cloudHigh||0)/100;
  this.state=overcastState(packet.sun[1],cover,f.rain||0);
  uniforms.fields.deck.value=this.state.weight;uniforms.fields.radiance.value=this.state.radiance;
  app.settings.exposure=baseExposure*this.state.exposure;
 },light(G){
  const {weight,radiance}=this.state;
  G.sunColor.value.multiplyScalar(1-weight);
  for(const key of ['skyIrradiance','horizonColor']){
   const c=G[key].value,target=radiance*(key==='horizonColor'?1.12:1.04);
   c.r+=(target-c.r)*weight;c.g+=(target*1.005-c.g)*weight;c.b+=(target*1.01-c.b)*weight;
  }
 }};
}

// Guard whole lip segments symmetrically: stale/mismatched endpoints must never
// connect a live crest to a distant sentinel and draw a vertical screen-spanning sliver.
export function guardNativeBreakerLip(breakers){
 const mat=breakers.mesh.material,needle='let valid = c2.w > 0.5 && abs( mOther - c2.w ) < 0.5 && c0.w < 1.25 && bOther < 1.25;';
 if(!mat.vertex.includes(needle))throw Error('Pinned breaker validity hook changed');
 mat.vertex=mat.vertex.replace(needle,`let otherRoot = breakersCrest[ eo ].xyz;
 let rootsBounded = all(abs(c0.xyz) < vec3f(10000.0,64.0,10000.0)) && all(abs(otherRoot) < vec3f(10000.0,64.0,10000.0));
 let connected = distance(c0.xyz,otherRoot) < max(4.0,2.0*(abs(c1.w)+abs(breakersCrest[eo+1u].w)));
 let valid = c2.w > 0.5 && mOther > 0.5 && abs(mOther-c2.w) < 0.5 && c0.w < 1.25 && bOther < 1.25 && rootsBounded && connected;`);
 mat.vertex=mat.vertex.replace('v.worldPos = select( vec3f( 0.0, -1e5, 0.0 ), P, valid );','v.worldPos = select( vec3f( 0.0, -100.0, 0.0 ), P, valid );');
 mat.needsUpdate=true;
}
