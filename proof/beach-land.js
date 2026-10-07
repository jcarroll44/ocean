// The approved DayBuoy beach profile, not Tidewater's island generator.
import {TerrainData} from '../vendor/tidewater/src/world/TerrainData.js';
export const beachHeight=(x,z)=>.105*(z-(-3.5+.45*Math.sin(x*.10)+.15*Math.sin(x*.29)));
export function createBeachTerrain(){
 const t=Object.create(TerrainData.prototype);
 Object.assign(t,{size:2048,res:512,texel:4,origin:-1024,pads:[],rockSites:[]});
 const n=t.res*t.res;t.heights=new Float32Array(n);t.rock=new Float32Array(n);
 for(const key of ['sand','path','gully','seagrass','rubble','scarp'])t[key]=new Uint8Array(n);
 t.sand.fill(255);
 for(let j=0;j<t.res;j++)for(let i=0;i<t.res;i++){
  const x=t.origin+(i+.5)*t.texel,z=t.origin+(j+.5)*t.texel;
  // Native coordinates are DayBuoy rotated 180 degrees. Cap distant inland
  // ground at a low dune; the entire visible foreshore keeps the old slope.
  t.heights[j*t.res+i]=Math.max(-90,Math.min(8,beachHeight(-x,-z)));
 }
 t.buildMinMax();return t;
}

