export const PIPE_PASSES=['native-pipe','native-pipe175','native-pipe15','native-pipe-fxaa','native-pipe-flare','native-pipe-combo'];
export function pipelineSettings(pass,q=new URLSearchParams()){
 if(!PIPE_PASSES.includes(pass))return null;
 if(pass==='native-pipe-combo'){
  const dpr=Number(q.get('profile-dpr')??2),aa=q.get('profile-aa')??'taa',flare=q.get('profile-flare')??'1';
  if(![2,1.75,1.5].includes(dpr)||!['taa','fxaa'].includes(aa)||!['0','1'].includes(flare))throw Error('Invalid pipeline combination');
  return {dpr,aa,flare:flare==='1'};
 }
 return {dpr:pass==='native-pipe175'?1.75:pass==='native-pipe15'?1.5:2,aa:pass==='native-pipe-fxaa'?'fxaa':'taa',flare:pass!=='native-pipe-flare'};
}
export function comboQuery(config){return '&profile-dpr='+config.dpr+'&profile-aa='+config.aa+'&profile-flare='+(config.flare?'1':'0');}
export function chooseCombo(rows){
 const base=rows.filter(r=>r.pass==='native-pipe'),fps=base.reduce((n,r)=>n+r.fps,0)/base.length;
 const find=pass=>rows.find(r=>r.pass===pass);
 const dprs=rows.filter(r=>['native-pipe','native-pipe175','native-pipe15'].includes(r.pass));
 // Preserve sharpness if a DPR already holds 30 in every measured second.
 const sufficient=dprs.filter(r=>r.minOneSecondFPS>=30).sort((a,b)=>b.config.dpr-a.config.dpr);
 const fastest=dprs.slice().sort((a,b)=>b.fps-a.fps)[0];
 return {pass:'native-pipe-combo',dpr:(sufficient[0]??fastest).config.dpr,
  aa:find('native-pipe-fxaa')?.fps>fps*1.03?'fxaa':'taa',flare:!(find('native-pipe-flare')?.fps>fps*1.03)};
}
export function chooseSustained(rows){
 const candidates=rows.filter(r=>PIPE_PASSES.includes(r.pass)&&r.metric==='gpu-completed-pipelined');
 const sufficient=candidates.filter(r=>r.minOneSecondFPS>=30);
 const changes=r=>(r.config.aa==='fxaa'?1:0)+(r.config.flare?0:1);
 return (sufficient.length?sufficient.sort((a,b)=>b.config.dpr-a.config.dpr||changes(a)-changes(b)||b.fps-a.fps):candidates.sort((a,b)=>b.fps-a.fps))[0]?.config;
}
// Completion notifications can cover multiple frames. Count each exactly once
// in whole-second bins; do not invent individual frame completion timestamps.
export class CompletedProfileRun{
 constructor(config){this.config=config;this.origin=null;this.start=null;this.last=null;this.events=[];this.done=false;}
 observe(now,count=1){
  if(this.done)return null;
  if(!Number.isInteger(count)||count<1)throw Error('Invalid completed-frame count');
  if(this.origin===null)this.origin=now;
  if(now-this.origin<this.config.warmup*1000)return null;
  if(this.start===null){this.start=this.last=now;return null;}
  this.events.push({now,count,gap:now-this.last});this.last=now;
  if(now-this.start<this.config.seconds*1000)return null;
  this.done=true;
  const duration=(now-this.start)/1000,bins=Array.from({length:Math.floor(duration)},()=>0);
  for(const e of this.events){const i=Math.floor((e.now-this.start)/1000);if(i<bins.length)bins[i]+=e.count;}
  const sorted=this.events.map(e=>e.gap).sort((a,b)=>a-b),q=p=>sorted[Math.ceil(sorted.length*p)-1];
  const frames=this.events.reduce((n,e)=>n+e.count,0),min=Math.min(...bins);
  return {pass:this.config.pass,duration,frames,fps:frames/duration,minOneSecondFPS:min,oneSecondFPS:bins,
   metric:'gpu-completed-pipelined',measurement:'Frames covered by resolved asynchronous GPU queue fences; max 2 outstanding. Notification timestamps are CPU delivery times, not individual GPU timestamps or display scanout.',
   p95CompletionGapMs:q(.95),p99CompletionGapMs:q(.99),maxCompletionGapMs:sorted.at(-1),
   completionNotifications:this.events.length,maxCompletionBatch:Math.max(...this.events.map(e=>e.count)),
   meetsCadenceTarget:this.config.seconds===120&&frames/duration>=30&&min>=30,
   targetDefinition:'At least 30 confirmed GPU-completed frames in every whole second of a 120-second window. Notification gaps are reported separately; individual frame latency is not inferred from batched callbacks.'};
 }
}
