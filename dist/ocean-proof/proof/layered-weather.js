import {Vector3,Vector4} from '../vendor/tidewater/src/engine/index.js';
import {cloudThreshold} from './partial-clouds.js';
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
export const layeredFields=()=>({covers:['vec3f',new Vector3()],thresholds:['vec3f',new Vector3(1,1,1)],drift:['vec4f[3]',Array.from({length:3},()=>new Vector4())],offshore:['vec4f[21]',Array.from({length:21},()=>new Vector4())],rain:['f32',0],extinction:['f32',0],haze:['f32',0],heat:['f32',0],direct:['f32',1],energy:['f32',1],gustExtra:['f32',0],thunder:['f32',0],flashes:['f32',1],weatherTime:['f32',0],strike:['vec4f',new Vector4(0,.55,0,0)]});
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
 }
 if(U._selectedTime!==f.forecastTime){U._selectedTime=f.forecastTime;U._selectedAt=now;}
 fields.weatherTime.value=Math.max(0,(now-U._selectedAt)/1000);fields.flashes.value=f.reducedMotion?0:1;
 return {layers:covers,layerDataAvailable:['cloudLow','cloudMid','cloudHigh'].map(key=>Number.isFinite(f[key])),visibility:f.visibility??null,humidity:f.humidity??null,rain:f.rain??null,radiation:radiation,thunder:f.thunder??null,offshoreSamples:f.offshore?.filter(p=>p.conditions).length??0,estimateSource:'Weather appearance est. · Open-Meteo'};
}
export const LAYERED_WEATHER_WGSL=`
fn nativeNightStorm()->f32{return nativeWeather.storm*(1.0-nativeWeather.daylight);}
fn nativeStormFoam()->vec3f{
 return vec3f(0.105,0.125,0.15)*nativeNightStorm()+vec3f(0.30,0.34,0.40)*nativeWeather.flash;
}
fn nativeStormGlow(dir:vec3f)->f32 {
 if(nativeWeather.flash<0.003){return 0.0;}
 let angle=atan2(-dir.x,dir.z);let d=angle-nativeWeather.strike.x;
 return nativeWeather.flash*(0.25+0.75*exp(-d*d*5.0));
}
fn nativeStormBolt(dir:vec3f)->vec3f {
 // No mesh spawn, texture, extra pass or per-event compilation. The thin bolt
 // is evaluated only during a flash and inside its small angular bounding box.
 if(nativeWeather.flash<0.003||dir.y<0.008||dir.y>nativeWeather.strike.y){return vec3f(0.0);}
 let x=atan2(-dir.x,dir.z)-nativeWeather.strike.x;if(abs(x)>0.19){return vec3f(0.0);}
 let y=dir.y/nativeWeather.strike.y;let segment=y*8.0;let a=floor(segment);
 let seed=nativeWeather.strike.z;
 let p0=(nativeCloudHash(vec2f(a,seed))-.5)*.11;
 let p1=(nativeCloudHash(vec2f(a+1.0,seed))-.5)*.11;
 let line=mix(p0,p1,fract(segment));let d=abs(x-line);
 let core=1.0-smoothstep(.0012,.0032,d);let halo=1.0-smoothstep(.003,.018,d);
 let branchY=clamp((y-.40)/.25,0.0,1.0);
 let fork=abs(x-(line+.10*(1.0-branchY)));
 let branch=(1.0-smoothstep(.001,.0028,fork))*step(.40,y)*step(y,.65);
 return vec3f(.78,.88,1.0)*(core*3.8+halo*.25+branch*1.6)*nativeWeather.flash;
}
fn nativeLayerMask(p:vec2f,layer:i32)->f32 {
 let cover=nativeWeather.covers[layer];
 if(cover<=0.001){return 0.0;}if(cover>=0.999){return 1.0;}
 let n=nativeCloudNoise(p)*0.7+nativeCloudNoise(p*2.13+vec2f(7.1,-3.7))*0.3;
 let threshold=nativeWeather.thresholds[layer];
 return smoothstep(threshold-0.035,threshold+0.035,n);
}
fn nativeLayerPoint(dir:vec3f,layer:i32)->vec2f {
 let scale=array<f32,3>(2.4,1.5,0.9)[layer];
 let drift=nativeWeather.drift[layer];
 var p=(dir.xz/max(dir.y,0.18)+drift.xy+drift.zw*nativeWeather.weatherTime)*scale;
 // High ice cloud: elongated filaments. Lower two layers are separate fields.
 if(layer==2){p*=vec2f(0.38,3.6);}return p+vec2f(f32(layer)*17.3,f32(layer)*-9.1);
}
fn nativePartialCloud(dir:vec3f,clear:vec3f)->vec3f {
 if(dir.y<0.002){return clear;}
 var col=clear;let horizonFade=smoothstep(0.002,0.06,dir.y);
 let sun=normalize(nativeWeather.sun);
 let warm=(1.0-smoothstep(0.10,0.56,sun.y))*smoothstep(-0.16,0.035,sun.y)*mix(0.62,1.0,nativeWeather.afternoon);
 let facing=smoothstep(-0.85,0.95,dot(normalize(dir.xz+0.00001),normalize(sun.xz+0.00001)));
 let sunColour=mix(vec3f(1.0,0.46,0.19),vec3f(1.0,0.92,0.73),smoothstep(0.0,0.4,sun.y));
 let flash=nativeStormGlow(dir);
 for(var j=0;j<3;j++){
  let layer=2-j;if(nativeWeather.covers[layer]<0.001){continue;}
  let p=nativeLayerPoint(dir,layer);let mask=nativeLayerMask(p,layer)*horizonFade;
  let shade=select(0.80+0.20*nativeCloudNoise(p*0.65),0.97,layer==2);
  var cloud=mix(vec3f(0.012,0.024,0.045),mix(vec3f(0.74,0.79,0.80),vec3f(0.08,0.105,0.14),nativeWeather.storm),nativeWeather.daylight)*shade;
  cloud+=vec3f(.038,.043,.049)*nativeNightStorm();
  cloud=mix(cloud,sunColour*0.65,warm*facing*0.65)+flash*vec3f(.40,.46,.56);
  col=mix(col,cloud,mask*select(1.0,0.6,layer==2));
 }return col;
}
fn nativeCloudShadow(P:vec3f)->f32 {
 if(nativeWeather.covers.x<0.001||nativeWeather.sun.y<=0.02){return 1.0;}
 let sun=normalize(nativeWeather.sun);let sample=vec3f(P.x/1600.0+sun.x/max(sun.y,0.15),1.0,P.z/1600.0+sun.z/max(sun.y,0.15));
 return 1.0-nativeLayerMask(nativeLayerPoint(sample,0),0)*0.72*nativeWeather.direct;
}
fn nativeOffshoreSky(dir:vec3f,clear:vec3f)->vec3f {
 if(dir.y<0.0||dir.y>0.72){return clear;}
 // Seven bearings, three distance bands. Index two angular neighbours; work
 // is bounded at three rings, never a ray march or loop over every grid cell.
 let angle=atan2(-dir.x,dir.z);if(abs(angle)>1.570797){return clear;}
 let sector=clamp((angle+1.5707963)/0.5235988,0.0,5.9999);let a=i32(floor(sector));let t=fract(sector);var col=clear;
 let flash=nativeStormGlow(dir);
 for(var r=2;r>=0;r--){
  let w=mix(nativeWeather.offshore[r*7+a],nativeWeather.offshore[r*7+a+1],t);
  if(w.x<0.001&&w.y<0.001&&w.z<0.001){continue;}
  let km=array<f32,3>(8.047,32.187,64.374)[r];
  let height=atan2(1.6+w.z*7.0,km);let base=atan2(0.7,km);
  let scallop=0.90+0.10*sin(angle*41.0+frame.time*w.w*0.0005);
  let tower=smoothstep(base*0.65,base,dir.y)*(1.0-smoothstep(height*0.78,height*scallop,dir.y))*(0.25+0.75*max(w.y,w.z))*w.x;
  let curtain=(1.0-smoothstep(base*0.8,base*1.5,dir.y))*w.y*0.65;
  let light=mix(vec3f(0.011,0.02,0.035),vec3f(0.22,0.25,0.27),nativeWeather.daylight)+vec3f(.022,.028,.037)*nativeNightStorm();
  // Same pulse as the visible bolt and surface illumination, not independent
  // flickering cloud timers. Radial tower shape stays forecast-driven.
  let pulse=flash*w.z;
  let relief=.65+.35*smoothstep(base,height,dir.y);
  col=mix(col,light+vec3f(.65,.74,.90)*pulse*relief,clamp(tower+curtain,0.0,0.9));
 }return col;
}
fn nativeFogColour()->vec3f{return mix(vec3f(0.012,0.020,0.034),vec3f(0.61,0.65,0.66),nativeWeather.daylight)+vec3f(.022,.025,.029)*nativeNightStorm()+vec3f(.18,.21,.26)*nativeWeather.flash;}
fn nativeWeatherFog(col:vec3f,P:vec3f)->vec3f {
 let d=distance(P,frame.cameraPos);let h=max(0.0,(P.y+frame.cameraPos.y)*0.5);
 let density=nativeWeather.extinction*exp(-h/mix(1600.0,500.0,nativeWeather.haze));
 return mix(col,nativeFogColour(),1.0-exp(-d*density));
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
