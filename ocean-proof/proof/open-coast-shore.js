// WIP open-coast adaptation of the upstream island exposure field. Keep its
// refracted directions/phase and forecast H/2. Treat alignment attenuation as
// energy, taking its square root for height instead of suppressing it linearly.
// Only shoreward, oblique swell in the surf/swash zone is affected.
export function retainObliqueSurf(field,propagation){
 const oblique=Math.max(0,Math.min(1,(Math.abs(propagation[0])-.7)/.2));
 if(propagation[1]>=0||!oblique)return field;
 for(let i=0;i<field.depth.length;i++){
  const depth=field.depth[i],near=Math.max(0,Math.min(1,(12-depth)/6));
  if(depth< -2||!near)continue;
  const k=i*4,x=field.data[k+1],z=field.data[k+2],e=Math.hypot(x,z);
  if(!(e>0&&e<1))continue;
  const target=e+(Math.sqrt(e)-e)*near*oblique,scale=target/e;
  field.data[k+1]*=scale;field.data[k+2]*=scale;
 }
 return field;
}
