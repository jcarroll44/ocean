import {UniformBlock,ShaderModule} from '../vendor/tidewater/src/engine/gpu/Shader.js';
const smooth=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
// Display adaptation only: never alter forecast H/2, period, direction or FFT.
export function smallSurfStrength(amplitude,period){return smooth(.03,.14,amplitude)*(1-smooth(.36,.7,amplitude))*(1-smooth(6,9,period));}
export function smallSurfSpan(amplitude,period){return .13+.09*smallSurfStrength(amplitude,period);}
export function installSmallSurf(shore){
 const needle='mix( 0.3, 1.0, wwPatch )',count=shore.module.code.split(needle).length-1;
 if(count!==3)throw Error('Pinned shore foam hooks changed: '+count);
 const uniforms=new UniformBlock('NativeSurf',{foamFloor:['f32',.3]});
 shore.module.deps??=[];shore.module.deps.push(new ShaderModule({name:'nativeSurf',uniforms,uniformName:'nativeSurf',code:''}));
 shore.module.code=shore.module.code.replaceAll(needle,'mix( nativeSurf.foamFloor, 1.0, wwPatch )');
 shore.updateNativeSurf=()=>{uniforms.fields.foamFloor.value=.3+.25*smallSurfStrength(shore.amplitude.value,shore.period.value);};
 shore.nativeSurf=uniforms;
 if(shore.amplitude&&shore.period)shore.updateNativeSurf();
}
export function daylightMoonColour(sky,lit,day,edge=1){
 return sky.map((v,i)=>{const moon=[.59,.64,.72][i];return v+edge*((moon*(.025+lit*1.8)-v)*(1-day)+moon*lit*.24*day);});
}
export const DAYLIGHT_MOON_WGSL=`
  // Atmospheric foreground remains visible through the unlit daytime limb.
  // Retain the true spherical phase and opaque night limb, not a black day disc.
  let moonSurface=vec3f(0.59,0.64,0.72)*(0.025+lit*1.8);
  let daytimeMoon=col+vec3f(0.59,0.64,0.72)*lit*0.24;
  col=mix(col,mix(moonSurface,daytimeMoon,day),edge*smoothstep(-0.02,0.01,moon.y));`;
