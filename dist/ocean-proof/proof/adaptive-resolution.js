export const PRODUCTION_SETTINGS=Object.freeze({dpr:1.5,aa:'fxaa',flare:true});
export const ADAPTIVE_PASS='native-adaptive';
export const RESOLUTION_POLICY=Object.freeze({initial:1.5,floor:1.25,ceiling:1.6,step:.05,downBelow:32,upAbove:38,windowMs:1000});
const target=(dpr,fps)=>Number(Math.max(RESOLUTION_POLICY.floor,Math.min(RESOLUTION_POLICY.ceiling,
 dpr+(fps<RESOLUTION_POLICY.downBelow?-RESOLUTION_POLICY.step:fps>RESOLUTION_POLICY.upAbove?RESOLUTION_POLICY.step:0))).toFixed(2));
const bounded=d=>Number.isFinite(d)&&d>=1.25&&d<=1.6&&Math.abs(d*20-Math.round(d*20))<1e-8;

// Count resolved GPU frame watermarks, including seconds with zero completions.
// A pending resize stops new submissions until the existing two-frame window
// empties. No rAF callback awaits a fence and resize time stays in FPS accounting.
export class AdaptiveResolution{
 constructor(){this.dpr=1.5;this.minDpr=1.5;this.maxDpr=1.5;this.end=null;this.frames=0;this.pending=null;this.samples=[];this.changes=[];this.verifiedFrames=0;this.index=0;}
 resetWindow(){this.end=null;this.frames=0;this.pending=null;}
 observe(now,count=0){
  if(this.end===null){if(!count)return;this.end=now+1000;}
  while(now>=this.end){
   const next=target(this.dpr,this.frames),request=!this.pending&&next!==this.dpr;
   const sample={index:this.index++,end:this.end,fps:this.frames,dpr:this.dpr,requestedDpr:request?next:null};
   this.samples.push(sample);if(this.samples.length>300)this.samples.shift();
   if(request)this.pending=sample;
   this.frames=0;this.end+=1000;
  }
  this.frames+=count;
 }
 prepare(now,inFlight,resize){
  this.observe(now);
  if(!this.pending)return true;
  if(inFlight!==0)return false;
  const s=this.pending,from=this.dpr,to=s.requestedDpr;
  const dimensions=resize(to);
  this.dpr=to;this.minDpr=Math.min(this.minDpr,to);this.maxDpr=Math.max(this.maxDpr,to);
  this.changes.push({sampleIndex:s.index,at:now,fps:s.fps,from,to,inFlight,dimensions});
  if(this.changes.length>300)this.changes.shift();
  this.pending=null;return true;
 }
 verifyFrame(width,height,actual){
  if(actual.length!==4||actual.some((v,i)=>v!==Math.floor((i%2?height:width)*this.dpr)))throw Error('Adaptive ocean/output dimensions do not match the controlled DPR');
  this.verifiedFrames++;
 }
 result(){return {policy:RESOLUTION_POLICY,currentDpr:this.dpr,minDpr:this.minDpr,maxDpr:this.maxDpr,verifiedFrames:this.verifiedFrames,samples:this.samples.slice(),changes:this.changes.slice()};}
}

export function validateAdaptiveResult(r,width,height){
 const a=r.adaptiveResolution;
 if(r.config?.adaptive!==true||r.config.dpr!==1.5||!a||!a.samples?.length||!Array.isArray(a.changes)||a.verifiedFrames!==r.pipeline?.submitted||!a.verifiedFrames)return false;
 if(Object.entries(RESOLUTION_POLICY).some(([k,v])=>a.policy?.[k]!==v))return false;
 if(a.samples.some((s,i)=>s.index!==i||!Number.isFinite(s.end)||!Number.isInteger(s.fps)||s.fps<0||!bounded(s.dpr)||i&&s.end-a.samples[i-1].end!==1000))return false;
 let dpr=1.5,min=1.5,max=1.5,last=-1;
 for(const c of a.changes){
  const s=a.samples[c.sampleIndex];
  if(!s||c.sampleIndex<=last||c.from!==dpr||s.dpr!==dpr||c.fps!==s.fps||c.to!==s.requestedDpr||c.to!==target(dpr,c.fps)||c.to===dpr||!bounded(c.to)||c.inFlight!==0||!Number.isFinite(c.at)||c.at<s.end)return false;
  if(c.dimensions?.length!==4||c.dimensions.some((v,i)=>v!==Math.floor((i%2?height:width)*c.to)))return false;
  dpr=c.to;min=Math.min(min,dpr);max=Math.max(max,dpr);last=c.sampleIndex;
 }
 return dpr===a.currentDpr&&min===a.minDpr&&max===a.maxDpr&&r.resolutionVerifiedEveryFrame===true&&
  [r.resolution,r.output].every(size=>size?.[0]===Math.floor(width*dpr)&&size?.[1]===Math.floor(height*dpr));
}
