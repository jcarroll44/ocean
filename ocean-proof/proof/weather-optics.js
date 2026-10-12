// Presentation derived from the selected forecast. No replacement observations.
const smooth=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
export function forecastOptics(f={}){
 const cover=Math.max(0,Math.min(1,(Number.isFinite(f.cloud)?f.cloud:Math.max(f.cloudLow||0,f.cloudMid||0,f.cloudHigh||0))/100));
 const fog=Number.isFinite(f.visibility)?1-smooth(400,1200,f.visibility):0;
 const rain=Number.isFinite(f.rain)?Math.max(0,f.rain):0;
 const disc=(1-smooth(.7,.94,cover))*(1-fog)*(1-smooth(.03,.25,rain));
 return {cover,fog,closed:smooth(.94,1,cover),disc,glow:disc*(1-.55*cover)};
}
export function nightStars(sunY,moonlight,f={}){
 return smooth(-.10,-.28,sunY)*(1-.45*Math.max(0,Math.min(1,moonlight)))*forecastOptics(f).disc;
}
export function moonKeyStrength(moonY,moonlight,cover){
 if(moonY<=0)return 0;
 return (.12+.08*(1-smooth(.4,.85,cover)))*moonlight*(1-cover*.9);
}
export function offshoreShelf(points=[],localRain=0){
 let chosen=null,best=0;
 for(const p of points){
  const c=p.conditions;if(!Number.isFinite(p.bearing)||!Number.isFinite(p.miles)||p.miles<5||!Number.isFinite(c?.rain)||!Number.isFinite(c?.cloud))continue;
  const strength=smooth(.5,8,c.rain)*smooth(65,95,c.cloud)*(1-smooth(.2,3,localRain));
  const score=strength/(1+p.miles/100);
  // Equal observations prefer the centre sample, without steering to the camera.
  if(score>best+1e-6||(Math.abs(score-best)<1e-6&&score>0&&Math.abs(p.bearing-201)<Math.abs(chosen?.bearing-201))){chosen={...p,strength};best=score;}
 }
 if(!chosen)return [0,0,0,0];
 const neighbours=points.filter(p=>p.miles===chosen.miles&&p.conditions?.rain>.5&&p.conditions?.cloud>65);
 const extent=Math.min(60,15+Math.max(0,...neighbours.map(p=>Math.abs(((p.bearing-chosen.bearing+540)%360)-180))));
 return [((chosen.bearing-201+540)%360-180)*Math.PI/180,chosen.miles*1609.344,chosen.strength,extent*Math.PI/180];
}
export const OPTICS_WGSL=`
fn nativeHorizonBlend(dir:vec3f)->f32 {
 let weather=max(1.0-exp(-nativeWeather.extinction*60000.0),max(nativeWeather.closed,max(nativeWeather.fog,nativeWeather.storm)));
 return weather*(1.0-smoothstep(0.0,.014,abs(dir.y)));
}
fn nativeSandLight(col:vec3f,P:vec3f)->vec3f {
 // Quartz sand retains a warm neutral diffuse response under a cloud deck.
 // Preserve luminance and the wet reflection band, including lightning.
 let weight=nativeWeather.daylight*smoothstep(.4,.85,nativeWeather.cover)*smoothstep(.25,1.2,P.y-frame.seaLevel);
 let luminance=dot(col,vec3f(.2126,.7152,.0722));
 return mix(col,luminance*vec3f(1.035,1.0,.93)/1.002387,weight);
}
`;
