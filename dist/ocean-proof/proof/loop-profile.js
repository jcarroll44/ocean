// Opt-in loop diagnostics. rAF submissions are never labelled GPU/display FPS.
export const LOOP_PASSES=['native-empty','native-empty-raf','native-readback','native-raf'];
export function loopMode(pass){
 return {empty:pass==='native-empty'||pass==='native-empty-raf',
  wait:!['native-empty-raf','native-readback','native-raf'].includes(pass),
  readbacks:pass!=='native-readback'};
}
export class FrameGate{
 constructor(wait=true,now=()=>performance.now()){this.wait=wait;this.now=now;this.busy=false;}
 submitted(queue,rafTime,tick,fail){
  if(!this.wait){tick(rafTime);return;}
  this.busy=true;
  queue.onSubmittedWorkDone().then(()=>{this.busy=false;tick(this.now());}).catch(fail);
 }
}
export function clearFrame(GPU){
 GPU.beginFrame();
 const pass=GPU.encoder.beginRenderPass({label:'Round 5 clear-only frame',colorAttachments:[{
  view:GPU.context.getCurrentTexture().createView(),clearValue:{r:.12,g:.36,b:.55,a:1},loadOp:'clear',storeOp:'store'
 }]});pass.end();GPU.submit();
}
const summary=values=>{
 const a=values.slice().sort((a,b)=>a-b);
 return {samples:a.length,meanMs:a.length?a.reduce((x,y)=>x+y,0)/a.length:null,
  p95Ms:a.length?a[Math.ceil(a.length*.95)-1]:null,maxMs:a.at(-1)??null};
};
export class LoopProbe{
 constructor(run,mode){this.run=run;this.mode=mode;this.frames=[];this.requests=[];this.current=null;}
 begin(timestamp,busy){this.current={timestamp,busy,cpuMs:0,drawMs:null};}
 end(cpuMs){if(this.current){this.current.cpuMs=cpuMs;this.frames.push(this.current);this.current=null;}}
 draw(cpuMs){if(this.current)this.current.drawMs=cpuMs;}
 readbacks(app,now=()=>performance.now()){
  // Keep GPU height queries / irradiance compute. Only CPU staging copies and
  // mapAsync are suppressed. Prime fixed-scene lighting during early warm-up.
  for(const [name,owner] of [['waterHeight',app.query],['atmosphere',app.atmosphere]]){
   const rb=owner.readback,request=rb.request.bind(rb);
   rb.request=(...args)=>{
    const t=now(),off=!this.mode.readbacks&&this.run.origin!==null&&t-this.run.origin>=3000;
    const accepted=off?false:request(...args);
    this.requests.push({name,t,off,accepted});return accepted;
   };
  }
 }
 result(){
  const start=this.run.start,end=this.run.last,frames=this.frames.filter(f=>f.timestamp>=start&&f.timestamp<=end);
  const intervals=frames.slice(1).map((f,i)=>f.timestamp-frames[i].timestamp),requests=this.requests.filter(r=>r.t>=start&&r.t<=end);
  return {
   perFrameCompletionWait:this.mode.wait,cpuReadbacksEnabled:this.mode.readbacks,clearOnly:this.mode.empty,
   cpuFrame:summary(frames.map(f=>f.cpuMs)),cpuRender:summary(frames.filter(f=>f.drawMs!==null).map(f=>f.drawMs)),
   cpuScope:'Synchronous parent rAF callback, including scene/UI update and native render encoding; excludes async callbacks, worker work, GPU execution and queue wait. cpuRender is the native draw subset.',
   rafCallbacks:frames.length,rafFPS:intervals.length?1000*intervals.length/intervals.reduce((a,b)=>a+b,0):null,
   rafIntervals:summary(intervals),skippedWhileGPUInFlight:frames.filter(f=>f.busy).length,
   submittedFrames:frames.filter(f=>f.drawMs!==null).length,
   readbackRequests:Object.fromEntries(['waterHeight','atmosphere'].map(name=>[name,{accepted:requests.filter(r=>r.name===name&&r.accepted).length,suppressed:requests.filter(r=>r.name===name&&r.off).length}])),
   timestampQueries:false,occlusionQueries:false,
   readbackScope:'WaterQuery and Atmosphere staging copies/mapAsync; disabled after 3 s of warm-up. GPU queries remain. Fixed forecast prevents shore-worker upload fences. Timestamp/occlusion profilers are not active.'
  };
 }
}
