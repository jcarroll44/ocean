// One monotonic time source. Dropped render frames never discard elapsed time.
export class WaveClock {
 constructor(now=0,epoch=30){this.origin=now;this.epoch=epoch;this.lastSeconds=epoch;}
 sample(now){const seconds=this.epoch+Math.max(0,now-this.origin)/1000;const dt=seconds-this.lastSeconds;this.lastSeconds=seconds;return {seconds,dt};}
}
export function phaseCycles(seconds,period=8,travel=0,wobble=0){return (seconds-travel)/period+wobble;}
// Tidewater increments both fields inside frame(). Set their pre-step value
// from absolute time. Small integration steps keep particles stable; wave
// phase remains absolute even during dropped frames, stalls and backgrounding.
export function renderAt(app,G,sample){
 const dt=Math.min(.25,Math.max(0,sample.dt));
 G.time.value=sample.seconds-dt;app.fft.time.value=sample.seconds-dt;
 app.frame(dt);
 return {waveSeconds:G.time.value,fftSeconds:app.fft.time.value,integrationDt:dt};
}
export class AutoQuality {
 constructor(level=2,max=5){this.level=level;this.max=max;this.slow=0;this.state='Measuring';}
 observe(fps){
  if(!Number.isFinite(fps))return false;
  if(fps>=30){this.slow=0;this.state='30 fps target met';return false;}
  this.slow++;if(this.level===this.max){this.state='Minimum quality · below 30 fps';return false;}
  this.state='Adjusting toward 30 fps';
  if(fps<24||this.slow>=2){this.level++;this.slow=0;return true;}return false;
 }
}
