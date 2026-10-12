import fs from 'node:fs';
const root=new URL('../',import.meta.url),read=p=>fs.readFileSync(new URL(p,root),'utf8');
let source=read('vendor/tidewater/src/ocean/OceanFFT.js');
const replace=(a,b)=>{if(!source.includes(a))throw Error('Pinned Tidewater FFT hook changed: '+a);source=source.replace(a,b);};
source=source.replaceAll("'../engine/","'../vendor/tidewater/src/engine/");
source=source.replaceAll("'vec4f[2]', [ new Vector4(), new Vector4() ]","'vec4f[4]', [ new Vector4(), new Vector4(), new Vector4(), new Vector4() ]");
replace("choppiness: [ 'f32'", "forecastDelta: [ 'f32', 0 ],\n\t\t\tcurrent: [ 'vec4f', new Vector4() ],\n\t\t\tchoppiness: [ 'f32'");
replace('let S = max( S0 + S1, 0.0 );',`let sa2=ocean.sysA[2];let sb2=ocean.sysB[2];let sa3=ocean.sysA[3];let sb3=ocean.sysB[3];
        var extra=0.0;
        if(sa2.x>0.0){extra+=jonswap(omega,sa2,sb2)*directionSpectrum(theta,omega,sa2,sb2)*shortWavesFade(kLen,sb2);}
        if(sa3.x>0.0){extra+=jonswap(omega,sa3,sb3)*directionSpectrum(theta,omega,sa3,sb3)*shortWavesFade(kLen,sb3);}
        let S = max(S0+S1+extra,0.0);`);
// Translate the whole Hermitian pair. Adding k·U to only the common intrinsic
// frequency would break conjugate symmetry and distort the real height field.
replace('let hr = hv.x * cs - hv.y * sn + hv.z * cs + hv.w * sn;','let hr0 = hv.x * cs - hv.y * sn + hv.z * cs + hv.w * sn;');
replace('let hi = hv.x * sn + hv.y * cs - hv.z * sn + hv.w * cs;',`let hi0 = hv.x * sn + hv.y * cs - hv.z * sn + hv.w * cs;
        let adv=-dot(w.xy,ocean.current.xy)*time;
        let ac=cos(adv);let asn=sin(adv);
        let hr=hr0*ac-hi0*asn;let hi=hr0*asn+hi0*ac;`);
replace('const C = this.cascades;\n\n\t\tif ( this.needsSpectrum )', `const C = this.cascades;
        this.time.value += dt * this.timeScale;
        this._forecastElapsed=(this._forecastElapsed??0)+dt;
        if(!this.needsSpectrum && this._forecastElapsed<1/40){return;}
        this.params.fields.forecastDelta.value=this._forecastElapsed;
        this._forecastElapsed=0;

        if ( this.needsSpectrum )`);
replace('this.time.value += dt * this.timeScale;\n\t\tGPU.computePass', 'GPU.computePass');
source=source.replaceAll('ocean.foamDecay * frame.dt','ocean.foamDecay * ocean.forecastDelta').replaceAll('ocean.foamAdd * frame.dt','ocean.foamAdd * ocean.forecastDelta');
fs.writeFileSync(new URL('proof/ForecastOceanFFT.js',root),'// Generated adaptation of MIT Tidewater 4811ba48. Vendor remains byte-identical.\n// Four forecast systems share the existing cascades/row+column transforms.\n'+source);
