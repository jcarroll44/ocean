// Production submission window. Rendering never awaits a per-frame fence.
// One asynchronous observer retires only the submissions covered by its fence.
export class FramePipeline{
 constructor({queue,onComplete,onError,now=()=>performance.now(),limit=2}){
  this.queue=queue;this.onComplete=onComplete;this.onError=onError;this.now=now;this.limit=limit;
  this.submitted=0;this.completed=0;this.maxInFlight=0;this.observing=false;this.error=null;this.waiters=[];
 }
 get inFlight(){return this.submitted-this.completed;}
 get busy(){return !!this.error||this.inFlight>=this.limit;}
 submittedFrame(){
  if(this.busy)throw Error('Frame submission exceeded the GPU window');
  this.submitted++;this.maxInFlight=Math.max(this.maxInFlight,this.inFlight);this._observe();
 }
 _observe(){
  if(this.observing||!this.inFlight||this.error)return;
  const through=this.submitted;this.observing=true;
  // This promise is observed, never awaited by draw/rAF. A second frame may
  // be submitted while it is pending; later work is not credited prematurely.
  this.queue.onSubmittedWorkDone().then(()=>{
   this.observing=false;
   const count=through-this.completed;this.completed=through;
   this.onComplete({now:this.now(),count,through});
   if(!this.inFlight)for(const w of this.waiters.splice(0))w.resolve();
   this._observe();
  }).catch(error=>{this.error=error;this.observing=false;for(const w of this.waiters.splice(0))w.reject(error);this.onError(error);});
 }
 drain(){if(this.error)return Promise.reject(this.error);if(!this.inFlight)return Promise.resolve();return new Promise((resolve,reject)=>this.waiters.push({resolve,reject}));}
 stats(){return {maxFramesInFlight:this.limit,maxObservedInFlight:this.maxInFlight,submitted:this.submitted,completed:this.completed,outstanding:this.inFlight,completionObserver:'one asynchronous queue-fence observer; counts only its captured submission watermark'};}
}
export function throttleReadbacks(app,GPU,now=()=>performance.now()){
 let nextWaterFrame=-Infinity,nextAtmosphereMs=-Infinity;
 const water=app.query.readback.request.bind(app.query.readback),atmosphere=app.atmosphere.readback.request.bind(app.atmosphere.readback);
 app.query.readback.request=(...args)=>{
  if(GPU.frame<nextWaterFrame)return false;
  const accepted=water(...args);if(accepted)nextWaterFrame=GPU.frame+4;return accepted;
 };
 app.atmosphere.readback.request=(...args)=>{
  const t=now();if(t<nextAtmosphereMs)return false;
  const accepted=atmosphere(...args);if(accepted)nextAtmosphereMs=t+250;return accepted;
 };
 return {waterMinFrameInterval:4,atmosphereMinMilliseconds:250,async:true,gpuQueriesRetained:true};
}
