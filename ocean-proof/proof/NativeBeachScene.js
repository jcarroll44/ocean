import {UniformBlock} from '../vendor/tidewater/src/engine/gpu/Shader.js';
import {Vector3,Mesh,BoxGeometry,mergeGeometries} from '../vendor/tidewater/src/engine/index.js';
import {FullscreenPass} from '../vendor/tidewater/src/engine/render/FullscreenPass.js';
import {SCENE_FORMATS,DEPTH_FORMAT} from '../vendor/tidewater/src/engine/render/SceneRenderer.js';
import {standard} from '../vendor/tidewater/src/materials/Materials.js';

// Visible DayBuoy surroundings only. Tidewater water, sky-reflection lighting,
// terrain wetness, curl, spray, FFT and foam implementations are untouched.
// DayBuoy's directional sky palette is ported from sky()/installDayLighting.
export function installNativeBeach(app){
 const params=new UniformBlock('DayBuoySky',{
  sun:['vec3f',new Vector3(0,1,0)],moon:['vec3f',new Vector3(0,-1,0)],
  cloud:['vec3f',new Vector3()],rain:['f32',0],moonlight:['f32',0],afternoon:['f32',0],
  sunRadius:['f32',.008],moonRadius:['f32',.008],flash:['f32',0]
 });
 const pass=new FullscreenPass({label:'DayBuoy native sky and celestial bodies',
  bindings:{beachSky:{uniform:params}},colorFormats:SCENE_FORMATS,depthFormat:DEPTH_FORMAT,depthCompare:'equal',depthWrite:false,depth:0,
  code:`
fn beachHash(p:vec2f)->f32 {return fract(sin(dot(p,vec2f(127.1,311.7)))*43758.5453);}
fn beachNoise(p:vec2f)->f32 {let i=floor(p);let f=fract(p);let u=f*f*(3.0-2.0*f);return mix(mix(beachHash(i),beachHash(i+vec2f(1.0,0.0)),u.x),mix(beachHash(i+vec2f(0.0,1.0)),beachHash(i+1.0),u.x),u.y);}
fn beachCloud(dir:vec3f,layer:f32,cover:f32)->f32 {
 if(cover<0.001 || dir.y<0.002){return 0.0;}
 let p=dir.xz/max(dir.y,0.08)*(1.8+layer*1.4)+frame.windDir*frame.time*0.007;
 let n=beachNoise(p)*0.57+beachNoise(p*2.1)*0.28+beachNoise(p*4.3)*0.15;
 return smoothstep(1.0-cover*0.85-0.06,1.0-cover*0.85+0.06,n)*smoothstep(0.0,0.08,dir.y)*mix(0.85,0.5,layer*0.5);
}
fn beachSkyColour(rd:vec3f)->vec3f {
 let sun=normalize(beachSky.sun);let day=smoothstep(-0.16,0.13,sun.y);let night=1.0-day;
 let low=pow(1.0-clamp(rd.y,0.0,1.0),6.0);
 let warm=(1.0-smoothstep(0.10,0.56,sun.y))*smoothstep(-0.16,0.035,sun.y)*mix(0.62,1.0,beachSky.afternoon);
 let facing=smoothstep(-0.85,0.95,dot(normalize(rd.xz+0.00001),normalize(sun.xz+0.00001)));
 var zenith=mix(vec3f(0.003,0.010,0.043),vec3f(0.007,0.078,0.30),day)+vec3f(0.006,0.011,0.020)*beachSky.moonlight*night;
 var horizon=mix(vec3f(0.012,0.027,0.072),vec3f(0.23,0.44,0.62),day)+vec3f(0.009,0.014,0.022)*beachSky.moonlight*night;
 let evening=1.0-smoothstep(-0.015,0.20,sun.y);
 zenith=mix(zenith,mix(vec3f(0.10,0.16,0.30),mix(vec3f(0.055,0.13,0.29),vec3f(0.26,0.065,0.17),evening),beachSky.afternoon),warm*0.82*(0.45+0.55*facing));
 horizon=mix(horizon,mix(vec3f(0.94,0.49,0.32),mix(vec3f(1.0,0.60,0.23),vec3f(0.98,0.23,0.105),evening),beachSky.afternoon),warm*0.94*facing);
 horizon=mix(horizon,mix(horizon,vec3f(0.20,0.24,0.38),0.55),warm*(1.0-facing));
 let sd=max(dot(rd,sun),0.0);horizon+=vec3f(0.16,0.07,0.015)*pow(sd,5.0)*warm;
 var col=mix(zenith,horizon,low)*mix(1.0,mix(0.62,1.12,facing),warm);
 col=mix(col,mix(vec3f(0.012,0.019,0.027),vec3f(0.085,0.115,0.15),day),min(0.85,beachSky.rain*0.095));
 let cover=max(beachSky.cloud.x,max(beachSky.cloud.y,beachSky.cloud.z));
 col=mix(col,mix(vec3f(0.018,0.025,0.036),vec3f(0.20,0.27,0.33),day),cover*0.04);
 let visible=smoothstep(-0.06,0.015,sun.y)*exp(-beachSky.rain*0.10);
 let sunColour=mix(vec3f(1.0,0.46,0.19),vec3f(1.0,0.92,0.73),smoothstep(0.0,0.4,sun.y));
 col+=sunColour*(pow(sd,24.0)*0.055+pow(sd,200.0)*0.12)*visible;
 let angle=acos(clamp(sd,-1.0,1.0));
 col+=mix(vec3f(1.0,0.84,0.60),vec3f(1.0,0.98,0.89),smoothstep(0.0,0.4,sun.y))*smoothstep(beachSky.sunRadius,beachSky.sunRadius*0.90,angle)*3.5*visible;
 let moon=normalize(beachSky.moon);let md=dot(rd,moon);let radius=beachSky.moonRadius;
 if(md>cos(radius) && moon.y> -0.02){
  let tangent=(rd-moon*md)/max(radius,0.0001);let z=sqrt(max(0.0,1.0-dot(tangent,tangent)));
  let normal=normalize(tangent-moon*z);let lit=max(dot(normal,sun),0.0);
  let edge=smoothstep(1.0,0.93,length(tangent));
  col=mix(col,vec3f(0.59,0.64,0.72)*(0.025+lit*1.8),edge*smoothstep(-0.02,0.01,moon.y));
 }
 for(var j=0;j<3;j++){
  let layer=2-j;let alpha=beachCloud(rd,f32(layer),beachSky.cloud[layer]);
  let storm=smoothstep(0.4,3.0,beachSky.rain);
  var c=mix(vec3f(0.012,0.024,0.064),mix(vec3f(0.74,0.79,0.80),vec3f(0.08,0.105,0.14),storm),day);
  c=mix(c,sunColour*0.65,warm*facing*0.65)+beachSky.flash*vec3f(0.11,0.14,0.20);
  col=mix(col,c,alpha);
 }
 return max(col,vec3f(0.0));
}
struct BeachSkyOut {@location(0) color:vec4f,@location(1) velocity:vec4f,@location(2) mask:vec4f};
@fragment fn fs(in:FSIn)->BeachSkyOut {
 let dir=viewRay(in.pos.xy*frame.invResolution);var out:BeachSkyOut;
 out.color=vec4f(beachSkyColour(dir),1.0);
 let c=frame.viewProjNoJitter*vec4f(dir,0.0);let p=frame.prevViewProjNoJitter*vec4f(dir,0.0);
 let cur=c.xy/max(abs(c.w),0.000001)*sign(c.w);let prev=p.xy/max(abs(p.w),0.000001)*sign(p.w);
 out.velocity=vec4f(select(vec2f(0.0),(cur-prev)*vec2f(0.5,-0.5),c.w>0.000001&&p.w>0.000001),0.0,1.0);out.mask=vec4f(0.0);return out;
}`});
 app.sceneRenderer.background={pass,draw:rp=>pass.draw(rp)};
 // One native mesh for the empty stand. No flag invents a beach warning.
 const y=app.terrainData.heightAt(-13,-18),parts=[];
 const box=(x,dy,z,w,h,d)=>parts.push(new BoxGeometry(w,h,d).translate(x,y+dy,z));
 for(const x of [-14,-12])for(const z of [-19,-17]){box(x,1.4,z,.13,2.8,.13);box(x,3.4,z,.09,1.2,.09);}
 box(-13,2.8,-18,2.4,.15,2.4);box(-13,4,-18,2.7,.12,2.7);
 for(let i=0;i<6;i++)box(-13,.3+i*.43,-16.7+i*.10,1.0,.08,.28);
 const stand=new Mesh(mergeGeometries(parts),standard({color:'#e7e4dc',roughness:.9}));stand.name='DayBuoy empty lifeguard stand';stand.castShadow=true;stand.receiveShadow=true;app.scene.add(stand);
 return {pass,params,stand,update(packet){
  const f=params.fields,p=packet,s=p.sun,m=p.moon||[0,-1,0],c=p.forecast||{};
  f.sun.value.set(-s[0],s[1],-s[2]);f.moon.value.set(-m[0],m[1],-m[2]);
  f.cloud.value.set(...['cloudLow','cloudMid','cloudHigh'].map(k=>Math.max(0,Math.min(1,(c[k]??c.cloud??0)/100))));
  f.rain.value=c.rain||0;f.moonlight.value=p.moonlight||0;f.afternoon.value=p.afternoon||0;f.flash.value=p.lightning||0;
  const tan=Math.tan(app.camera.fov*Math.PI/360);f.sunRadius.value=tan*(18+6*Math.max(0,Math.min(1,s[1]/.5)))/innerHeight;
  f.moonRadius.value=Math.max((p.moonInfo?.[1]||.00454)*1.5,tan*20/innerHeight);
 }};
}
