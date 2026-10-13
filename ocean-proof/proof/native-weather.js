import {UniformBlock,ShaderModule} from '../vendor/tidewater/src/engine/gpu/Shader.js';
import {Vector3} from '../vendor/tidewater/src/engine/index.js';
import {cloudThreshold,PARTIAL_CLOUD_WGSL} from './partial-clouds.js';
import {layeredFields,updateLayeredWeather,stormBearing,LAYERED_WEATHER_WGSL} from './layered-weather.js';
import {createCloudCache} from './cloud-cache.js';
import {forecastOptics,offshoreShelf,OPTICS_WGSL} from './weather-optics.js';
const smooth=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
export function overcastState(sunY,cloud,rain=0){
 const cover=Math.max(0,Math.min(1,cloud)),deck=smooth(.7,.98,cover);
 const daylight=smooth(.02,.25,sunY),wet=1-.15*smooth(.5,6,rain);
 return {deck,daylight,weight:deck*daylight,radiance:(.018+daylight*.722)*wet,exposure:1+.12*deck*daylight};
}
export function installNativeWeather(app,{cheap=false,exposure=true}={}){
 const uniforms=new UniformBlock('NativeWeather',{transition:['f32',0],horizonWeather:['f32',0],fog:['f32',0],closed:['f32',0],sunDisc:['f32',1],sunGlow:['f32',1],deck:['f32',0],radiance:['f32',.74],cover:['f32',0],threshold:['f32',1],daylight:['f32',1],sun:['vec3f',new Vector3(0,1,0)],afternoon:['f32',0],storm:['f32',0],flash:['f32',0],...layeredFields()});
 let selectedForecast={};
 const cache=cheap?null:createCloudCache(uniforms,snapshot=>{
  snapshot._weatherAt=null;updateLayeredWeather(snapshot,selectedForecast);
  snapshot.fields.squall.value.set(...offshoreShelf(selectedForecast.offshore,selectedForecast.rain||0,selectedForecast.facing));
 });
 const module=new ShaderModule({name:'nativeOvercast',deps:cache?[cache.module]:[],uniforms,uniformName:'nativeWeather',code:`
${cheap?PARTIAL_CLOUD_WGSL:PARTIAL_CLOUD_WGSL.slice(0,PARTIAL_CLOUD_WGSL.indexOf('fn nativePartialCloud'))+LAYERED_WEATHER_WGSL+OPTICS_WGSL}
fn nativeCloudDeck(dir:vec3f)->vec3f {
 // Bounded direction coordinates: no horizon division, narrow columns or binary cloud masks.
 ${cheap?'let detail=0.0; let h=1.0-clamp(dir.y,0.0,1.0); let gradient=1.0+0.12*h*h;':`let detail=sin(dir.x*5.0+dir.z*3.0+frame.time*0.003)*sin(dir.z*4.0-dir.y*2.0)*0.018;
 let gradient=1.0+0.12*pow(1.0-clamp(dir.y,0.0,1.0),2.0);`}
 return vec3f(1.0,1.005,1.01)*nativeWeather.radiance*(gradient+detail);
}
fn nativeWeatherSky(dir:vec3f,clear:vec3f)->vec3f {
 ${cheap?'if(nativeWeather.deck>=0.999){return nativeCloudDeck(dir);} return mix(nativePartialCloud(dir,clear),nativeCloudDeck(dir),nativeWeather.deck);':`
 let night=1.0-nativeWeather.daylight;
 let moon=nativeWeather.moonlight*smoothstep(-.02,.18,nativeWeather.moon.y);
 let glow=vec3f(.019,.032,.058)*(1.0+moon*.75)*(1.0+.35*pow(1.0-clamp(dir.y,0.0,1.0),3.0));
 let clearBackground=mix(clear,max(clear,glow),night);
 // At 85%+ cover, even a low-density cloud fold sees a neutral overcast sky.
 let overcastBackground=nativeOvercastBackground();
 let background=mix(clearBackground,overcastBackground,nativeWeather.closed);
 let cloud=cachedCloud(dir);
 // Illuminate the cached volume's folds from within. This reuses its density
 // and optical-depth shading, not a new noise/raymarch pass per sky pixel.
 let cloudTone=dot(cloud.rgb,vec3f(.2126,.7152,.0722))/max(cloud.a,.01);
 let internal=cloud.a*(.16+1.55*smoothstep(.015,.14,cloudTone));
 var colour=background*(1.0-cloud.a)+cloud.rgb+vec3f(.42,.49,.62)*nativeStormGlow(dir)*internal;
 let hazeDistance=1800.0/(max(dir.y,0.05)+0.12);
 // Dense ground fog still closes the horizon; elevated rain haze need not
 // erase the entire cloud deck. Both regimes follow forecast visibility.
 let fogWeight=mix(.42,1.0,smoothstep(.003,.008,nativeWeather.extinction));
 let haze=(1.0-exp(-nativeWeather.extinction*hazeDistance))*fogWeight*(1.0-smoothstep(0.0,0.5,dir.y));
 let fog=max(nativeWeather.fog,max(haze,nativeHorizonBlend(dir)));
 var result=mix(colour,nativeFogColour(),fog*(1.0-nativeWeather.squall.z*cloud.a*.85));
 if(nativeWeather.horizonWeather>.001&&nativeWeather.fog<.999&&abs(dir.y)<.075){
  result=mix(result,nativeHorizonColour(dir),nativeWeather.horizonWeather*(1.0-smoothstep(0.0,.075,abs(dir.y))));
 }
 return result+nativeStormBolt(dir)*(1.0-nativeWeather.fog);`}
}`});
 // The same deck must light the sand, stand and reflected ocean, not just the backdrop.
 const sky=app.sky.module;
 sky.deps.push(module);
 const count=(sky.code.match(/return base;/g)||[]).length;
 if(count!==2)throw Error('Native weather expects the noClouds proof sky');
 sky.code=sky.code.replaceAll('return base;','return nativeWeatherSky(dir,base);');
 if(!cheap)sky.code=sky.code.replace('2500.0 * skyParams.sunDiskIntensity','2500.0 * skyParams.sunDiskIntensity * nativeWeather.sunDisc');
 if(!cheap){
  for(const signature of ['fn skyRadianceWithClouds( dir: vec3f, withSun: bool ) -> vec3f {','fn skyReflectionRadiance( dir: vec3f ) -> vec3f {']){
   if(!sky.code.includes(signature))continue; // minimal CPU test doubles
   sky.code=sky.code.replace(signature,signature+'\n if(nativeWeather.closed>=.999||nativeWeather.fog>=.999){return nativeWeatherSky(dir,vec3f(0.0));}');
  }
 }
 if(cheap){
  // At full overcast, do not compute the discarded clear-sky radiance first.
  // Uniform branches preserve dawn/night/partial clouds without a second renderer.
  for(const signature of ['fn skyRadianceWithClouds( dir: vec3f, withSun: bool ) -> vec3f {','fn skyReflectionRadiance( dir: vec3f ) -> vec3f {']){
   if(!sky.code.includes(signature))throw Error('Pinned sky entry point changed');
   sky.code=sky.code.replace(signature,signature+'\n if(nativeWeather.deck>=0.999){return nativeCloudDeck(dir);}');
  }
 }
 const baseExposure=app.settings.exposure;
 return {module,uniforms,cheap,cache,initialize:()=>cache?.initialize(),state:overcastState(0,0),update(packet){
  const f=packet.forecast||{},cover=Math.max(0,Math.min(1,(Number.isFinite(f.cloud)?f.cloud:Math.max(f.cloudLow||0,f.cloudMid||0,f.cloudHigh||0))/100));
  const changing=this.lastForecastTime!=null&&Number.isFinite(f.forecastTime)&&Math.abs(f.forecastTime-this.lastForecastTime)>60000;
  this.lastForecastTime=f.forecastTime;const nowAt=performance.now();if(changing||f.scrubbing)this.transitionUntil=nowAt+500;
  const transition=nowAt<(this.transitionUntil||0)?1:0;
  uniforms.fields.transition.value+=(transition-uniforms.fields.transition.value)*(transition?1:.08);
  selectedForecast=f;
  this.state={...overcastState(packet.sun[1],cover,f.rain||0),cover,...updateLayeredWeather(uniforms,f)};
  const optics=forecastOptics(f),now=performance.now(),k=this.opticsAt==null?1:1-Math.exp(-Math.min(.1,Math.max(0,(now-this.opticsAt)/1000))*10);this.opticsAt=now;
  for(const [key,target] of Object.entries({fog:optics.fog,closed:optics.closed,sunDisc:optics.disc,sunGlow:optics.glow}))uniforms.fields[key].value+=(target-uniforms.fields[key].value)*k;
  const shelf=offshoreShelf(f.offshore,f.rain||0,f.facing);
  // Only the immutable cache consumes this location; complete sky crossfades
  // carry its transitions, including a change of offshore cell or bearing.
  uniforms.fields.squall.value.set(...shelf);this.state.optics=optics;this.state.squall=shelf;
  uniforms.fields.horizonWeather.value+=(optics.closed*(1-optics.fog)-uniforms.fields.horizonWeather.value)*k;
  uniforms.fields.deck.value=this.state.weight;uniforms.fields.radiance.value=this.state.radiance;
  uniforms.fields.cover.value=cover;uniforms.fields.threshold.value=cloudThreshold(cover);uniforms.fields.daylight.value=smooth(-.16,.13,packet.sun[1]);
  uniforms.fields.sun.value.set(-packet.sun[0],packet.sun[1],-packet.sun[2]);uniforms.fields.afternoon.value=packet.afternoon||0;uniforms.fields.storm.value=smooth(.4,3,uniforms.fields.rain.value);
  const moon=packet.moon||[0,-1,0];uniforms.fields.moon.value.set(-moon[0],moon[1],-moon[2]);uniforms.fields.moonlight.value=packet.moonlight||0;
  cache?.setKey(JSON.stringify([Number.isFinite(f.forecastTime)?Math.floor(f.forecastTime/30000):null,f.weatherRetrievedAt??null,...shelf,...['cloudLow','cloudMid','cloudHigh','rain','thunder'].map(k=>Number.isFinite(f[k])?Math.round(f[k]*10)/10:null)]),f.scrubbing);
  const flash=this.lightningDisabled||f.reducedMotion?0:Math.max(0,Math.min(1,packet.lightning||0));
  if(flash>.01&&uniforms.fields.flash.value<=.01){
   this.strikeNumber=(this.strikeNumber||0)+1;
   uniforms.fields.strike.value.set(stormBearing(f.offshore,this.strikeNumber),.48+.10*Math.abs(Math.sin(this.strikeNumber)),this.strikeNumber,0);
  }
  uniforms.fields.flash.value=flash;
  const targetExposure=baseExposure*(exposure?this.state.exposure:1);
  app.settings.exposure+=(targetExposure-app.settings.exposure)*k;if(Math.abs(targetExposure-app.settings.exposure)<1e-7)app.settings.exposure=targetExposure;
 },light(G){
  const {weight,radiance}=this.state;
  G.sunColor.value.multiplyScalar(1-weight);
  for(const key of ['skyIrradiance','horizonColor']){
   const c=G[key].value,target=radiance*(key==='horizonColor'?1.12:1.04);
   c.r+=(target-c.r)*weight;c.g+=(target*1.005-c.g)*weight;c.b+=(target*1.01-c.b)*weight;
  }
  const f=uniforms.fields;
  if(f.daylight.value>.1){G.sunColor.value.multiplyScalar(f.direct.value*(.65+.35*f.energy.value));G.skyIrradiance.value.multiplyScalar(.7+.3*f.energy.value);}
  if(!cheap){
   // Bounded display adaptation for readable clear and storm nights; actual
   // moon direction/phase still controls directional moonlight separately.
   const night=1-f.daylight.value,storm=night*f.storm.value,flash=f.flash.value;
   for(const key of ['skyIrradiance','horizonColor']){
    const c=G[key].value;c.r+=night*.026+storm*.036+flash*.20;c.g+=night*.038+storm*.043+flash*.23;c.b+=night*.060+storm*.050+flash*.28;
   }
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
