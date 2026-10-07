// Unit conversion and coordinate mapping only; no reconstructed ocean shader.
export const FT_TO_M=.3048, KNOT_TO_MPS=.514444;
export function marineInput(c){
 if(!c||![c.swell,c.period,c.direction,c.wind,c.windDirection].every(Number.isFinite)||c.swell<0||c.period<=0||c.wind<0)return null;
 const direction=(c.direction-201)*Math.PI/180,wind=(c.windDirection-201)*Math.PI/180;
 return {heightM:c.swell*FT_TO_M,amplitude:c.swell*FT_TO_M/2,period:c.period,
  windMps:c.wind*KNOT_TO_MPS,waveAngle:c.direction-291,windAngle:c.windDirection-291,
  propagation:[Math.sin(direction),-Math.cos(direction)],windVector:[Math.sin(wind),-Math.cos(wind)],
  chop:Math.min(1.1,.55+c.wind*.025),tide:Number.isFinite(c.tide)?c.tide:0,
  cloud:Number.isFinite(c.cloud)?Math.max(0,Math.min(1,c.cloud/100)):null};
}
export function applyMarine(app,G,c){
 const p=marineInput(c);if(!p)return false;
 app.shore.amplitude.value=p.amplitude;app.shore.period.value=p.period;
 // Relative energy mapping, not yet a measured Hs calibration.
 const gain=(p.heightM/.68)**2;
 app.fft.local.scale=gain;app.fft.swell.scale=.48*gain;
 app.fft.local.windSpeed=p.windMps;app.fft.local.windDirection=p.windAngle;
 app.fft.swell.windDirection=p.waveAngle;app.fft.choppiness.value=p.chop;
 app.fft.updateSpectrumUniforms();
 app.fft.params.fields.sysB.value[1].y=2*Math.PI/p.period;
 app.fft.params.set('sysB',app.fft.params.fields.sysB.value);app.fft.needsSpectrum=true;
 G.windSpeed.value=p.windMps;G.windDir.value.set(...p.windVector);G.seaLevel.value=p.tide;
 if(app.clouds&&p.cloud!==null)app.clouds.coverage.value=p.cloud;
 app.marine=p;return true;
}
