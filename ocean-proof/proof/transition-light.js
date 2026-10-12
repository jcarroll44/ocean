// Smooth asynchronous irradiance samples during forecast traversal only.
// At rest this returns the original values exactly, including the moon path.
export function transitionLight(){let previous=null,last=null,settling=false;return(G,active,now=performance.now())=>{
 const keys=['sunColor','skyIrradiance','horizonColor'],values=keys.map(k=>G[k].value),dt=last===null?0:Math.max(0,Math.min(.1,(now-last)/1000));last=now;
 if(!previous){previous=values.map(v=>v.clone());return;}
 settling=settling||active;let error=0;
 for(let i=0;i<values.length;i++){const v=values[i],p=previous[i],k=1-Math.exp(-dt/0.10);error=Math.max(error,Math.abs(v.r-p.r),Math.abs(v.g-p.g),Math.abs(v.b-p.b));if(settling){p.r+=(v.r-p.r)*k;p.g+=(v.g-p.g)*k;p.b+=(v.b-p.b)*k;v.copy(p);}else p.copy(v);}
 if(!active&&error<.0001)settling=false;
 };}
