// Runs unchanged in Apple WKWebView (Safari's WebGPU implementation).
// Every error, missing adapter, timeout or incomplete inventory is a failure.
export async function compilePipelines(manifest,{gpu=navigator.gpu}={}){
 const result={schema:1,backend:'Apple WebKit WebGPU',userAgent:navigator.userAgent,revision:manifest.revision,manifestHash:manifest.manifestHash,passed:false,modules:[],pipelines:[],errors:[],physicalIPhone:false};
 let device;
 try{
  if(!gpu)throw Error('WebGPU unavailable; no compiler evidence');
  const adapter=await gpu.requestAdapter({powerPreference:'high-performance'});
  if(!adapter)throw Error('WebGPU adapter unavailable; no compiler evidence');
  // Same negotiated limits as the frozen production GPU.init path.
  const want={maxSampledTexturesPerShaderStage:32,maxSamplersPerShaderStage:16,maxStorageBuffersPerShaderStage:10,maxStorageTexturesPerShaderStage:8,maxComputeWorkgroupStorageSize:32768,maxColorAttachmentBytesPerSample:64,maxStorageBuffersInVertexStage:4,maxStorageBuffersInFragmentStage:8,maxStorageTexturesInFragmentStage:4,maxBindingsPerBindGroup:1000,maxBufferSize:1073741824,maxStorageBufferBindingSize:536870912};
  const limits=Object.fromEntries(Object.entries(want).filter(([k])=>adapter.limits[k]!==undefined).map(([k,v])=>[k,Math.min(v,adapter.limits[k])]));
  const features=manifest.features||[];
  for(const feature of features)if(!adapter.features.has(feature))throw Error('Missing source variant capability: '+feature);
  device=await adapter.requestDevice({requiredLimits:limits,requiredFeatures:features});
  result.limits=limits;result.features=features;
  device.addEventListener('uncapturederror',e=>result.errors.push(e.error.message));
  const modules=new Map();
  for(const [id,descriptor] of Object.entries(manifest.shaders)){
   device.pushErrorScope('validation');
   const module=device.createShaderModule(descriptor),info=await module.getCompilationInfo();
   const errors=info.messages.filter(m=>m.type==='error').map(m=>`${m.lineNum}:${m.linePos} ${m.message}`);
   const scoped=await device.popErrorScope();if(scoped)errors.push(scoped.message);
   modules.set(id,module);result.modules.push({id,label:descriptor.label,errors});
  }
  const layoutCache=new Map();
  function hydrate(value){
   if(!value||typeof value!=='object')return value;
   if(value.kind==='shader'){if(!modules.has(value.id))throw Error('Missing module '+value.id);return modules.get(value.id);}
   if(value.kind==='bindGroupLayout'||value.kind==='pipelineLayout'){
    const key=JSON.stringify(value);if(!layoutCache.has(key))layoutCache.set(key,device[value.kind==='bindGroupLayout'?'createBindGroupLayout':'createPipelineLayout'](hydrate(value.descriptor)));return layoutCache.get(key);
   }
   if(Array.isArray(value))return value.map(hydrate);
   return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,hydrate(v)]));
  }
  for(const item of manifest.pipelines){
   const errors=[];device.pushErrorScope('validation');
   try{await device[item.kind==='render'?'createRenderPipelineAsync':'createComputePipelineAsync'](hydrate(item.descriptor));}catch(e){errors.push(e.message);}
   const scoped=await device.popErrorScope();if(scoped)errors.push(scoped.message);
   result.pipelines.push({kind:item.kind,label:item.descriptor.label,errors});
  }
  result.passed=result.errors.length===0&&result.modules.every(m=>!m.errors.length)&&result.pipelines.length===manifest.pipelines.length&&result.pipelines.length>0&&result.pipelines.every(p=>!p.errors.length);
 }catch(e){result.errors.push(String(e.message||e));}finally{device?.destroy();}
 return result;
}
