// Behavioral regression checks against the actual bundled app modules.
const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const html=fs.readFileSync(process.argv[2]||path.join(__dirname,'../../index.html'),'utf8');
const modules=Object.fromEntries([...html.matchAll(/\/\* ===== (.*?) ===== \*\/(.*?)(?=\/\* ===== |<\/script>)/gs)].map(m=>[m[1],m[2]]));
const ctx={__mods:{},Math};vm.createContext(ctx);
for(const name of ['wave-spectrum.js','wave-populations.js'])vm.runInContext(modules[name],ctx);
const {makeSpectrum}=ctx.__mods['wave-spectrum.js'];
const {windActivation,windSpectrum}=ctx.__mods['wave-populations.js'];
const ft=.3048,knotsPerMph=.8689762419,wind=5*knotsPerMph;
const hs=m=>Math.sqrt(8*m.reduce((s,v)=>s+v[2]*v[2],0));
let directions=0;
for(const bearing of [0,90,124,180,201,270,359]){
 const direction=(bearing-201)*Math.PI/180;
 const reference=makeSpectrum(1.5*ft,6,direction,wind).modes;
 for(const height of [1.5,2,2.49,2.75,3,4,8]){
  const modes=makeSpectrum(height*ft,6,direction,wind).modes;
  assert(Math.abs(hs(modes)-height*ft)<1e-9,'Hs normalization');
  modes.forEach((m,i)=>assert(Math.abs(m[0]-reference[i][0])+Math.abs(m[1]-reference[i][1])<1e-10,'height must not change direction'));
  directions++;
 }
}
assert.equal(windActivation(0),0);
let previous=0;
for(let w=0;w<36;w+=.01){const a=windActivation(w);assert(a>=previous&&a<=1);assert(a-previous<.003);previous=a;}
const east=(90-201)*Math.PI/180;
const modes=windSpectrum(6,wind,east,.13);
assert(hs(modes)>0&&hs(modes)<.05,'5 mph adds small, nonzero wind displacement');
const drift=modes.reduce((a,m)=>[a[0]+m[0]*m[2]**2,a[1]+m[1]*m[2]**2],[0,0]);
assert(drift[0]>0,'east wind travels west/right in this beach frame');
const small=makeSpectrum(1.5*ft,6,0,wind).modes,large=makeSpectrum(2*ft,6,0,wind).modes;
assert(Math.abs(hs(large)/hs(small)-4/3)<1e-10);
console.log(JSON.stringify({directionCases:directions,windMph:5,windKnots:wind,windActivation:windActivation(wind),windHsMeters:hs(modes),matchedHeightRatio:hs(large)/hs(small)},null,2));
