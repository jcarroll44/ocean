// Audit raw rendered pixels; never alter or repaint the displayed scene.
// Two documented geometric bands avoid DOM chrome; thresholds remove undefined
// low-saturation hue (noise around neutral grey).
const LIMITS=Object.freeze({magenta:[290,345],lime:[75,150],minimumSaturation:.12,minimumValue:.08});
export function hueOf(r,g,b){
 r/=255;g/=255;b/=255;
 const hi=Math.max(r,g,b),lo=Math.min(r,g,b),d=hi-lo;
 if(d<1e-9)return {hue:null,saturation:0,value:hi};
 let h=hi===r?((g-b)/d)%6:hi===g?(b-r)/d+2:(r-g)/d+4;
 h=(h*60+360)%360;return{hue:h,saturation:hi?d/hi:0,value:hi};
}
export function auditPixels(ctx,width,height,{stride=1,phase='unknown'}={}){
 const data=ctx.getImageData(0,0,width,height).data,regions=[
 {name:'sky',start:0,end:Math.floor(height*.30)},
 {name:'water-and-breakers',start:Math.floor(height*.30),end:Math.floor(height*.70)}
 ];
 const byRegion=[],violations=[];let examined=0;
 for(const region of regions){
  let magenta=0,lime=0,pixels=0;
  for(let y=region.start;y<region.end;y+=stride)for(let x=0;x<width;x+=stride){
   const i=(y*width+x)*4;
   if(data[i+3]<180)continue;
   const c=hueOf(data[i],data[i+1],data[i+2]);
   pixels++;examined++;
   if(c.hue===null||c.saturation<LIMITS.minimumSaturation||c.value<LIMITS.minimumValue)continue;
   const banned=c.hue>=290&&c.hue<=345?'magenta':c.hue>=75&&c.hue<=150?'lime':null;
   if(banned){
    if(banned==='magenta')magenta++;else lime++;
    if(violations.length<12)violations.push({region:region.name,kind:banned,x,y,hue:Math.round(c.hue),rgb:[data[i],data[i+1],data[i+2]]});
   }
  }
  byRegion.push({region:region.name,pixels,magenta,lime});
 }
 return {phase,size:[width,height],stride,examined,byRegion,violations,pass:byRegion.every(r=>r.magenta===0&&r.lime===0),limits:LIMITS};
}
export async function auditImage(blob,{phase='unknown'}={}){
 const bitmap=await createImageBitmap(blob);
 try{
  const canvas=document.createElement('canvas');canvas.width=bitmap.width;canvas.height=bitmap.height;
  const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(bitmap,0,0);
  return auditPixels(ctx,canvas.width,canvas.height,{phase,stride:1});
 }finally{bitmap.close();}
}
export function videoFrameAudit(phase='sunset-scrub'){
 let frames=0,failed=0,first=[],magenta=0,lime=0;
 return {
  inspect(ctx,width,height){
   const result=auditPixels(ctx,width,height,{stride:2,phase});
   frames++;if(!result.pass){failed++;if(first.length<5)first.push({frame:frames,violations:result.violations});}
   for(const band of result.byRegion){magenta+=band.magenta;lime+=band.lime;}
  },
  result(){return{phase,frames,failed,magenta,lime,first,pass:failed===0,checks:'Every successfully composed video frame, 2-pixel sampling, raw scene before DOM overlays'};}
 };
}
