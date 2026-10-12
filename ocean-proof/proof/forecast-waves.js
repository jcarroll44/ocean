import {waveTrains} from '../../src/marine-model.js';
import {UniformBlock,ShaderModule} from '../vendor/tidewater/src/engine/gpu/Shader.js';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export const wavelength=period=>9.81*period*period/(2*Math.PI);
// Normalize JONSWAP variance to Hs²/16. Values are spectra, not visible pixels.
// Integrate once per quantized period/gamma, never per vertex or display pixel.
const normalization=new Map();
export function spectrumScale(height,period,gamma){
 const key=period.toFixed(2)+':'+gamma.toFixed(2);let integral=normalization.get(key);
 if(!integral){const peak=2*Math.PI/period,step=peak*10/256;integral=0;for(let i=0;i<256;i++){const w=(i+.5)*step,sigma=w<=peak?.07:.09,r=Math.exp(-((w-peak)**2)/(2*sigma*sigma*peak*peak));integral+=9.81**2*w**-5*Math.exp(-1.25*(peak/w)**4)*gamma**r*step;}if(normalization.size>512)normalization.clear();normalization.set(key,integral);}
 return height*height/16/Math.max(integral,1e-9);
}
export function describeWaves(c){
 const trains=waveTrains(c),height=c.swell*.3048,energy=trains.reduce((n,t)=>n+t.height*t.height,0),factor=(c.waveCalibration??1)*(energy>0?height/Math.sqrt(energy):1);
 const components=trains.map(t=>({...t,height:t.height*factor,wavelength:wavelength(t.period),gamma:t.id==='wind'?1.8:3.3}));
 const dominant=components.reduce((a,b)=>!a||b.height>a.height?b:a,null)??{period:c.period,direction:c.direction};
 const period=c.wave_peak_period??c.period,steepness=height/wavelength(period),windAlignment=Math.cos((c.windDirection-201)*Math.PI/180),onshore=clamp(windAlignment*c.wind/20,0,1),offshore=clamp(-windAlignment*c.wind/20,0,1);
 const swellShare=components.filter(t=>t.id!=='wind').reduce((n,t)=>n+t.height*t.height,0)/Math.max(1e-8,height*height*(c.waveCalibration??1)**2);
 return {components,period,direction:dominant.direction,height:height*(c.waveCalibration??1),steepness,onshore,offshore,swellShare,
  curl:clamp(.55+(period-3)*.13-steepness*2-onshore*.2+offshore*.12,.18,1),groupWaves:clamp(3+period*.45+swellShare*1.5,4,10),groupiness:clamp(.28+swellShare*.26+period*.016,.3,.7),source:'Wave appearance est. · Open-Meteo Marine; typical two-bar profile'};
}
export function applyWaveSpectrum(app,G,c){
 const model=describeWaves(c);if(!model.components.length)return model;
 const A=app.fft.params.fields.sysA.value,B=app.fft.params.fields.sysB.value;if(A.length<4)return model;
 for(let i=0;i<4;i++){const t=model.components[i];if(!t){A[i].set(0,0,1,0);B[i].set(1,1,1,0);continue;}
  // Tidewater's positive-time IFFT phase travels opposite k; provider bearings
  // are FROM. This puts the phase velocity toward the shore, not out to sea.
  A[i].set(spectrumScale(t.height,t.period,t.gamma),(t.direction-111)*Math.PI/180,1,t.id==='wind'?.1:.95);
  B[i].set(1,2*Math.PI/t.period,t.gamma,t.id==='wind'?.01:.06);
 }
 app.fft.params.set('sysA',A);app.fft.params.set('sysB',B);
 const speed=Number.isFinite(c.ocean_current_velocity)&&Number.isFinite(c.ocean_current_direction)?c.ocean_current_velocity:0,angle=(c.ocean_current_direction-201)*Math.PI/180;
 // Native axes are rotated 180°; current bearing describes travel TO.
 app.fft.params.fields.current.value.set(-Math.sin(angle||0)*speed,Math.cos(angle||0)*speed,0,0);
 app.fft.needsSpectrum=true;const surfTarget=Number.isFinite(c.surfLowFt)&&Number.isFinite(c.surfHighFt)?(c.surfLowFt+c.surfHighFt)*.5*.3048:null;
 const surfAdjustment=surfTarget===null?1:clamp(surfTarget/Math.max(.1,model.height*1.25),.7,1.3);
 model.surfAdjustment=surfAdjustment;model.surfSource=surfTarget===null?null:'breaker height calibration est. · NWS FLZ108';
 app.shore.amplitude.value=model.height/2*surfAdjustment;app.shore.period.value=model.period;
 app.shore.curl.value=model.curl;app.shore.gamma.value=.78;
 if(app.forecastSurf){app.forecastSurf.fields.groupWaves.value=model.groupWaves;app.forecastSurf.fields.groupiness.value=model.groupiness;app.forecastSurf.fields.onshore.value=model.onshore;}
 return model;
}
export function installForecastSurf(shore){
 const uniforms=new UniformBlock('ForecastSurf',{groupWaves:['f32',7],groupiness:['f32',.5],onshore:['f32',0]});
 const module=new ShaderModule({name:'forecastSurf',uniforms,uniformName:'forecastSurf',code:''});shore.module.deps.push(module);
 const start=shore.module.code.indexOf('\tlet waveSet ='),end=shore.module.code.indexOf('\n',start);if(start<0)throw Error('Shore group hook changed');
 shore.module.code=shore.module.code.slice(0,start)+`\t// Two incommensurate group bands retain sets/lulls without a repeating seven-wave pulse.
 let group = .5+.34*sin(m*6.2831853/forecastSurf.groupWaves)+.16*sin(m*3.883222/forecastSurf.groupWaves+1.7);
 let waveSet = mix(1.0,.42+group*1.05,forecastSurf.groupiness);
 `+shore.module.code.slice(end);
 // Spilling whitewater builds at the crest before a plunging lip would land.
 shore.module.code=shore.module.code.replace('let landed = smoothstep( 0.86, 0.99, P.b );','let landed = smoothstep(mix(.22,.86,shoreP.curl),mix(.68,.99,shoreP.curl),P.b);');
 shore.module.code=shore.module.code.replaceAll('o.flow = dir * uFlow;','o.flow = dir * uFlow + frame.windDir * frame.windSpeed * .018;');
 return uniforms;
}
