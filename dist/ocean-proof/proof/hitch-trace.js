import {Texture} from '../vendor/tidewater/src/engine/gpu/Texture.js';
// Diagnostic only: CPU encode time is NOT GPU duration. Timestamp unsupported
// devices report that explicitly. No per-frame readback/fence is added.
export function installHitchTrace(GPU){
 const events=[],samples=[],gpuSamples=[],cpu={};let since=performance.now(),frameStart=0,frames=0,maxFrameMs=0,lastGPU=-Infinity,busy=false;
 const event=(type,data={})=>{events.push({at:performance.now(),frame:GPU.frame,type,...data});if(events.length>1600)events.shift();};
 const measure=(name,fn)=>{const t=performance.now();try{return fn();}finally{const ms=performance.now()-t,s=cpu[name]??={calls:0,totalMs:0,maxMs:0};s.calls++;s.totalMs+=ms;s.maxMs=Math.max(s.maxMs,ms);}};
 const wrap=(object,key,label)=>{if(typeof object?.[key]!=='function')return;const original=object[key];object[key]=function(...args){return measure(label,()=>original.apply(this,args));};};
 const asyncPipeline=GPU._async;
 GPU._async=function(desc,kind){event('pipeline-request',{label:desc.label,kind});return asyncPipeline.call(this,desc,kind);};
 const ready=GPU.ready;GPU.ready=function(h){if(!h.pipeline&&!h.failed)event('pipeline-sync',{label:h.label,kind:h.kind});return ready.call(this,h);};
 const create=Texture.prototype._create,upload=Texture.prototype.upload;
 Texture.prototype._create=function(){event('texture-create',{label:this.label,width:this.width,height:this.height,format:this.format});return measure('texture-create',()=>create.call(this));};
 Texture.prototype.upload=function(data,options){const t=performance.now();const result=upload.call(this,data,options);event('texture-upload',{label:this.label,bytes:data.byteLength,cpuMs:performance.now()-t});return result;};
 let query,resolve,readback,gpuError=null;
 if(GPU.hasTimestamp){try{
  query=GPU.device.createQuerySet({type:'timestamp',count:512});
  resolve=GPU.device.createBuffer({size:4096,usage:GPUBufferUsage.QUERY_RESOLVE|GPUBufferUsage.COPY_SRC});
  readback=GPU.device.createBuffer({size:4096,usage:GPUBufferUsage.COPY_DST|GPUBufferUsage.MAP_READ});
 }catch(e){gpuError=String(e);}}
 const getEncoder=GPU.getEncoder;
 GPU.getEncoder=function(){
  const fresh=!this.encoder,encoder=getEncoder.call(this),now=performance.now();
  if(!fresh||!query||busy||now-lastGPU<1000)return encoder;
  lastGPU=now;busy=true;const labels=[],frame=this.frame;
  for(const method of ['beginComputePass','beginRenderPass']){
   const begin=encoder[method].bind(encoder);
   encoder[method]=desc=>{
    if(labels.length>=256||desc?.timestampWrites)return begin(desc);
    const i=labels.length;labels.push(desc?.label||method);
    return begin({...desc,timestampWrites:{querySet:query,beginningOfPassWriteIndex:2*i,endOfPassWriteIndex:2*i+1}});
   };
  }
  this.onSubmit(enc=>{if(labels.length){enc.resolveQuerySet(query,0,labels.length*2,resolve,0);enc.copyBufferToBuffer(resolve,0,readback,0,labels.length*16);}},()=>{
   if(!labels.length){busy=false;return;}
   void readback.mapAsync(GPUMapMode.READ).then(()=>{
    const times=new BigUint64Array(readback.getMappedRange()),passes={};
    labels.forEach((name,i)=>{const ms=Number(times[i*2+1]-times[i*2])/1e6;passes[name]=(passes[name]||0)+ms;});
    gpuSamples.push({at:now,frame,passes});if(gpuSamples.length>180)gpuSamples.shift();readback.unmap();
   }).catch(e=>{gpuError=String(e);event('timestamp-error',{message:gpuError});}).finally(()=>{busy=false;});
  });
  return encoder;
 };
 return {
  event,
  track(app){wrap(app.nativeWeather?.cache,'step','cloud-cache.step');for(const [name,key] of [['atmosphere','update'],['fft','update'],['shoreSim','update'],['breakers','update'],['spray','update'],['environment','update'],['terrainGPU','update'],['shadows','render'],['sceneRenderer','render'],['post','beginFrame'],['post','render']])wrap(app[name],key,name+'.'+key);},
  begin(){frameStart=performance.now();},
  end(app){
   maxFrameMs=Math.max(maxFrameMs,performance.now()-frameStart);frames++;
   const now=performance.now();if(now-since<1000)return;
   const h=app.breakers?._hist,a=h?.[0],b=h?.at(-1),span=b&&a?b.t-a.t:0;
   samples.push({at:now,durationMs:now-since,frames,maxFrameMs,cpu:structuredClone(cpu),pendingPipelines:GPU._pending.size,
    sprayBudget:app.breakers?.uniforms.fields.budget.value,emissionsPerSecond:span>0?((b.head-a.head)>>>0)/span:null,
    environmentStep:app.environment?._stepIndex,needsSpectrum:app.fft.needsSpectrum});
   if(samples.length>180)samples.shift();for(const key in cpu)delete cpu[key];since=now;frames=0;maxFrameMs=0;
  },
  result(){return {schema:1,timeOrigin:performance.timeOrigin,timestampSupported:!!query,timestampError:gpuError,
   note:'CPU values measure JavaScript encoding; GPU pass timestamps sample one frame per second where supported. Times are relative to timeOrigin. No display/thermal attribution.',
   events:events.slice(),samples:samples.slice(),gpuSamples:gpuSamples.slice()};}
 };
}
