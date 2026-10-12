// The approved DayBuoy beach profile, not Tidewater's island generator.
import {TerrainData} from '../vendor/tidewater/src/world/TerrainData.js';
import {INLET_PROFILE,sceneProfile} from '../../src/beach-profiles.js';
export const beachHeight=(x,z)=>.105*(z-(-3.5+.45*Math.sin(x*.10)+.15*Math.sin(x*.29)));
export function coastalHeight(x,z){
 const shore=beachHeight(x,z);if(z<=18)return shore;
 const t=Math.min(1,(z-18)/15),ease=t*t*(3-2*t);
 const ridge=2.2+1.7*Math.exp(-(((z-50-7*Math.sin(x*.035))/17)**2));
 return shore*(1-ease)+ridge*ease;
}
// Typical Gulf two-sandbar profile, NOT a surveyed Inlet Beach seabed.
// Keep the approved dry beach/swash slope; only submerged terrain changes.
export function barredHeight(x,z,bars=INLET_PROFILE.bars){
 const distance=-z-3.5;if(distance<=7)return coastalHeight(x,z);
 const ramp=Math.min(1,(distance-7)/8),blend=ramp*ramp*(3-2*ramp);
 const along=.8*Math.sin(x*.017)+.35*Math.sin(x*.063);
 const inner=bars.inner+along*3,outer=bars.outer+along*6;
 const depth=bars.base+distance*bars.slope-bars.innerLift*Math.exp(-(((distance-inner)/bars.innerWidth)**2))-bars.outerLift*Math.exp(-(((distance-outer)/bars.outerWidth)**2));
 return coastalHeight(x,z)*(1-blend)-depth*blend;
}
export function createBeachTerrain({bars=false,profile=sceneProfile()}={}){
 const t=Object.create(TerrainData.prototype);
 Object.assign(t,{size:2048,res:512,texel:4,origin:-1024,pads:[],rockSites:[]});
 const n=t.res*t.res;t.heights=new Float32Array(n);t.rock=new Float32Array(n);
 for(const key of ['sand','path','gully','seagrass','rubble','scarp'])t[key]=new Uint8Array(n);
 t.sand.fill(255);
 for(let j=0;j<t.res;j++)for(let i=0;i<t.res;i++){
  const x=t.origin+(i+.5)*t.texel,z=t.origin+(j+.5)*t.texel;
  // Native coordinates are DayBuoy rotated 180 degrees. Cap distant inland
  // ground at a low dune; the entire visible foreshore keeps the old slope.
  t.heights[j*t.res+i]=Math.max(-90,Math.min(4,(bars?barredHeight(-x,-z,profile.bars):coastalHeight(-x,-z))));
 }
 t.buildMinMax();return t;
}

