const fract=x=>x-Math.floor(x),mix=(a,b,t)=>a+(b-a)*t;
export function cloudHash(x,y){let a=fract(x*.1031),b=fract(y*.1031),c=a;const d=a*(b+33.33)+b*(c+33.33)+c*(a+33.33);a+=d;b+=d;c+=d;return fract((a+b)*c);}
export function cloudNoise(x,y){const i=Math.floor(x),j=Math.floor(y),fx=fract(x),fy=fract(y),u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy);return mix(mix(cloudHash(i,j),cloudHash(i+1,j),u),mix(cloudHash(i,j+1),cloudHash(i+1,j+1),u),v);}
export const cloudField=(x,y)=>cloudNoise(x,y)*.7+cloudNoise(x*2.13+7.1,y*2.13-3.7)*.3;
// Approximate quantiles of this two-octave field. Percent is area coverage,
// not opacity or a raw threshold on the strongly centre-weighted noise.
const QUANTILES=[0,.283,.351,.404,.454,.500,.545,.594,.648,.717,1];
export function cloudThreshold(cover){const x=(1-Math.max(0,Math.min(1,cover)))*10,i=Math.min(9,Math.floor(x));return mix(QUANTILES[i],QUANTILES[i+1],x-i);}
export const PARTIAL_CLOUD_WGSL=`
fn nativeCloudHash(p:vec2f)->f32 {
 var q=fract(vec3f(p.x,p.y,p.x)*0.1031);q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);
}
fn nativeCloudNoise(p:vec2f)->f32 {
 let i=floor(p);let f=fract(p);let u=f*f*(3.0-2.0*f);
 return mix(mix(nativeCloudHash(i),nativeCloudHash(i+vec2f(1.0,0.0)),u.x),mix(nativeCloudHash(i+vec2f(0.0,1.0)),nativeCloudHash(i+1.0),u.x),u.y);
}
fn nativePartialCloud(dir:vec3f,clear:vec3f)->vec3f {
 if(nativeWeather.cover<0.005 || dir.y<0.002){return clear;}
 // Two 2D octaves, no ray march, new texture, extra draw or unbounded horizon divide.
 let p=dir.xz/max(dir.y,0.18)*2.4+frame.windDir*frame.time*0.007;
 let n=nativeCloudNoise(p)*0.7+nativeCloudNoise(p*2.13+vec2f(7.1,-3.7))*0.3;
 let mask=smoothstep(nativeWeather.threshold-0.035,nativeWeather.threshold+0.035,n)*smoothstep(0.002,0.06,dir.y);
 let shade=0.82+0.18*smoothstep(nativeWeather.threshold,1.0,n);
 // Keep DayBuoy's original sunset/storm/night cloud lighting, shared by reflections.
 let sun=normalize(nativeWeather.sun);
 let warm=(1.0-smoothstep(0.10,0.56,sun.y))*smoothstep(-0.16,0.035,sun.y)*mix(0.62,1.0,nativeWeather.afternoon);
 let facing=smoothstep(-0.85,0.95,dot(normalize(dir.xz+0.00001),normalize(sun.xz+0.00001)));
 let sunColour=mix(vec3f(1.0,0.46,0.19),vec3f(1.0,0.92,0.73),smoothstep(0.0,0.4,sun.y));
 var colour=mix(vec3f(0.012,0.024,0.064),mix(vec3f(0.74,0.79,0.80),vec3f(0.08,0.105,0.14),nativeWeather.storm),nativeWeather.daylight)*shade;
 colour=mix(colour,sunColour*0.65,warm*facing*0.65)+nativeWeather.flash*vec3f(0.11,0.14,0.20);
 return mix(clear,colour,mask);
}`;
