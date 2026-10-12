import {Vector3,Vector4} from '../vendor/tidewater/src/engine/index.js';
import {cloudThreshold} from './partial-clouds.js';
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
export const layeredFields=()=>({squall:['vec4f',new Vector4()],covers:['vec3f',new Vector3()],thresholds:['vec3f',new Vector3(1,1,1)],drift:['vec4f[3]',Array.from({length:3},()=>new Vector4())],offshore:['vec4f[21]',Array.from({length:21},()=>new Vector4())],offshoreLayers:['vec4f[21]',Array.from({length:21},()=>new Vector4())],moon:['vec3f',new Vector3(0,-1,0)],moonlight:['f32',0],rain:['f32',0],extinction:['f32',0],haze:['f32',0],heat:['f32',0],direct:['f32',1],energy:['f32',1],gustExtra:['f32',0],thunder:['f32',0],flashes:['f32',1],weatherTime:['f32',0],strike:['vec4f',new Vector4(0,.55,0,0)]});
// Select a supported offshore bearing. Ties prefer the middle of the view;
// isolated offshore cells retain their actual sector, never follow the camera.
export function stormBearing(points,ordinal=0){
 let chosen=-1,score=0;
 for(let i=0;i<(points?.length||0);i++){
  const p=points[i]?.potential?.value;if(!Number.isFinite(p)||p<=0)continue;
  const candidate=p*(1-.025*Math.abs(i%7-3)-.008*Math.floor(i/7));
  if(candidate>score){chosen=i;score=candidate;}
 }
 const angle=chosen<0?0:((chosen%7)-3)*Math.PI/6;
 return angle+Math.sin(ordinal*2.39996)*.11;
}
export function updateLayeredWeather(U,f,now=performance.now()){
 const k=U._weatherAt==null?1:1-Math.exp(-Math.min(.1,Math.max(0,(now-U._weatherAt)/1000))*10);U._weatherAt=now;
 const fields=U.fields,approach=(key,value)=>fields[key].value+=(value-fields[key].value)*k;
 const covers=['cloudLow','cloudMid','cloudHigh'].map(key=>Number.isFinite(f[key])?clamp(f[key]/100):0);
 for(let i=0;i<3;i++){
  const axis=['x','y','z'][i],v=fields.covers.value[axis]+(covers[i]-fields.covers.value[axis])*k;fields.covers.value[axis]=v;fields.thresholds.value[axis]=cloudThreshold(v);
  const wind=f[['lowWind','midWind','highWind'][i]],direction=f[['lowDirection','midDirection','highDirection'][i]],angle=(direction-201)*Math.PI/180;
  const d=f.cloudDrift?.[i]||[0,0],height=[1600,4500,9000][i];
  // Forecast-integrated offsets are deterministic across reverse scrubs. The
  // tiny real-clock term animates a paused selected hour with the same wind.
  const x=d[0]/height,z=d[1]/height,s=Number.isFinite(wind)&&Number.isFinite(direction)?wind*.514444/height:0;
  const target=[x,z,Math.sin(angle||0)*s,-Math.cos(angle||0)*s],p=fields.drift.value[i];
  for(let j=0;j<4;j++){const axis=['x','y','z','w'][j];p[axis]+=(target[j]-p[axis])*k;}
 }
 const rain=Number.isFinite(f.rain)?Math.max(0,f.rain):0;
 approach('rain',rain);approach('thunder',Number.isFinite(f.thunder)?clamp(f.thunder):0);
 const humidity=Number.isFinite(f.humidity)?clamp((f.humidity-75)/25):0;
 // Koschmieder extinction from forecast visibility; humidity modifies only
 // the vertical haze distribution, never invents a visibility distance.
 approach('extinction',Number.isFinite(f.visibility)?3.912/Math.max(50,f.visibility):0);approach('haze',humidity);
 approach('heat',Number.isFinite(f.temperature)?clamp((f.temperature-86)/18)*(1-clamp(rain)):0);
 const radiation=Number.isFinite(f.radiation)?Math.max(0,f.radiation):null,direct=Number.isFinite(f.directRadiation)?Math.max(0,f.directRadiation):null;
 approach('energy',radiation===null?1:clamp(radiation/800,.08,1.2));approach('direct',radiation>0&&direct!==null?clamp(direct/radiation):radiation===0?0:1);
 approach('gustExtra',Number.isFinite(f.gust)&&Number.isFinite(f.wind)?clamp((f.gust-f.wind)*.514444,0,18):0);
 for(let i=0;i<21;i++){
  const point=f.offshore?.[i],c=point?.conditions,p=fields.offshore.value[i];
  const vals=[Number.isFinite(c?.cloud)?clamp(c.cloud/100):0,Number.isFinite(c?.rain)?clamp(c.rain/8):0,clamp(point?.potential?.value??0),Number.isFinite(c?.wind)?c.wind*.514444:0];
  for(let j=0;j<4;j++){const axis=['x','y','z','w'][j];p[axis]+=(vals[j]-p[axis])*k;}
  const layers=fields.offshoreLayers.value[i];
  for(let j=0;j<3;j++){const axis=['x','y','z'][j],value=Number.isFinite(c?.[['cloudLow','cloudMid','cloudHigh'][j]])?clamp(c[['cloudLow','cloudMid','cloudHigh'][j]]/100):covers[j];layers[axis]+=(value-layers[axis])*k;}
  layers.w=c?1:0;
 }
 if(U._selectedTime!==f.forecastTime){U._selectedTime=f.forecastTime;U._selectedAt=now;}
 fields.weatherTime.value=Math.max(0,(now-U._selectedAt)/1000);fields.flashes.value=f.reducedMotion?0:1;
 return {layers:covers,layerDataAvailable:['cloudLow','cloudMid','cloudHigh'].map(key=>Number.isFinite(f[key])),visibility:f.visibility??null,humidity:f.humidity??null,rain:f.rain??null,radiation:radiation,thunder:f.thunder??null,offshoreSamples:f.offshore?.filter(p=>p.conditions).length??0,estimateSource:'Weather appearance est. · Open-Meteo'};
}
export const LAYERED_WEATHER_WGSL=`
fn nativeNightStorm()->f32{return nativeWeather.storm*(1.0-nativeWeather.daylight);}
fn nativeStormFoam()->vec3f{
 return vec3f(.038,.050,.070)*(1.0-nativeWeather.daylight)+vec3f(0.105,0.125,0.15)*nativeNightStorm()+vec3f(0.30,0.34,0.40)*nativeWeather.flash;
}
fn nativeStormGlow(dir:vec3f)->f32 {
 if(nativeWeather.flash<0.003){return 0.0;}
 let angle=atan2(-dir.x,dir.z);let d=angle-nativeWeather.strike.x;
 return nativeWeather.flash*(0.25+0.75*exp(-d*d*5.0));
}
fn boltNoise(y:f32,scale:f32,seed:f32)->f32 {
 let t=y*scale;let a=floor(t);
 return mix(nativeCloudHash(vec2f(a,seed)),nativeCloudHash(vec2f(a+1.0,seed)),fract(t))-.5;
}
fn boltPath(y:f32,seed:f32)->f32 {
 // Three continuous scales: a meandering leader, irregular kinks and fine
 // branching detail. Fixed work only inside the flash's narrow bounding box.
 return boltNoise(y,7.0,seed)*.095+boltNoise(y,23.0,seed+31.0)*.030+boltNoise(y,71.0,seed+67.0)*.010;
}
fn nativeStormBolt(dir:vec3f)->vec3f {
 // No mesh spawn, texture, extra pass or per-event compilation. The thin bolt
 // is evaluated only during a flash and inside its small angular bounding box.
 if(nativeWeather.flash<0.003||dir.y<0.008||dir.y>nativeWeather.strike.y){return vec3f(0.0);}
 let x=atan2(-dir.x,dir.z)-nativeWeather.strike.x;if(abs(x)>0.21){return vec3f(0.0);}
 let y=dir.y/nativeWeather.strike.y;
 let seed=nativeWeather.strike.z;
 let d=abs(x-boltPath(y,seed));let width=.0010;
 let core=1.0-smoothstep(width,width*2.0,d);let halo=exp(-d*d/0.000045)*.30;
 var branches=0.0;
 for(var i=0;i<3;i++){
  let fi=f32(i);let joint=.37+fi*.21;let length=.17+nativeCloudHash(vec2f(seed,fi))*.11;
  let t=(joint-y)/length;
  if(t>0.0&&t<1.0){
   let direction=select(-1.0,1.0,fract(seed*.37+fi*.61)>.5);
   let root=boltPath(joint,seed);let irregular=boltNoise(t,17.0,seed+fi*11.0+100.0)*.026*sin(t*1.5708);
   let fork=root+direction*t*(.065+fi*.023)+irregular;
   let distance=abs(x-fork);let taper=1.0-smoothstep(.55,1.0,t);
   branches+=(1.0-smoothstep(width*.55,width*1.5,distance)+exp(-distance*distance/.000018)*.12)*taper*.9;
  }
 }
 return vec3f(.78,.88,1.0)*(core*3.8+halo+branches)*nativeWeather.flash;
}
fn nativeCloudShadow(P:vec3f)->f32 {
 if(nativeWeather.covers.x<0.001||nativeWeather.sun.y<=0.02){return 1.0;}
 let sun=normalize(nativeWeather.sun);let sample=normalize(vec3f(P.x/1600.0+sun.x/max(sun.y,0.15),1.0,P.z/1600.0+sun.z/max(sun.y,0.15)));
 return 1.0-cachedCloud(sample).a*0.52*nativeWeather.direct*nativeWeather.covers.x;
}
fn nativeFogColour()->vec3f{return mix(vec3f(0.012,0.020,0.034),vec3f(0.63,0.635,0.63),nativeWeather.daylight)+vec3f(.022,.025,.029)*nativeNightStorm()+vec3f(.18,.21,.26)*nativeWeather.flash;}
fn nativeWeatherFog(col:vec3f,P:vec3f)->vec3f {
 let d=distance(P,frame.cameraPos);let h=max(0.0,(P.y+frame.cameraPos.y)*0.5);
 let density=nativeWeather.extinction*exp(-h/mix(1600.0,500.0,nativeWeather.haze));
 let ray=normalize(P-frame.cameraPos);
 let haze=max(1.0-exp(-d*density),nativeHorizonBlend(ray)*smoothstep(2000.0,10000.0,d));
 return mix(col,nativeFogColour(),haze);
}
fn nativeRainNormal(P:vec3f)->vec3f {
 if(nativeWeather.rain<0.001){return vec3f(0.0);}
 let fade=1.0-smoothstep(30.0,120.0,distance(P,frame.cameraPos));
 let cell=floor(P.xz*2.0);let local=fract(P.xz*2.0)-0.5;
 let phase=fract(frame.time*1.3+nativeCloudHash(cell));let radius=length(local);
 let ring=sin((radius-phase*0.6)*65.0)*exp(-abs(radius-phase*0.6)*35.0)*(1.0-phase);
 return vec3f(local.x,0.0,local.y)*ring*min(nativeWeather.rain*0.012,0.065)*fade;
}
`;
