// Startup-only WebGPU feature isolation. Mandatory water/sky/FFT pipelines are
// NEVER swallowed. Optional render effects are removed if their pipeline fails.
// In a successful build this is a no-op: same v8.2 shader/mesh/budget policy.
export function createOptionalEffects(app,notify=()=>{}){
 const disabled=new Map(),reported=new Set();
 const describe=()=>({disabled:[...disabled].map(([effect,data])=>({effect,...data})),degraded:disabled.size>0});
 function disable(effect,reason,label=''){
  if(disabled.has(effect))return;
  const event={reason:String(reason||'pipeline unavailable').slice(0,400),pipeline:label,at:new Date().toISOString()};
  disabled.set(effect,event);
  if(effect==='spray'){
   const spray=app.spray;
   if(spray?.mesh){spray.mesh.visible=false;app.scene?.remove?.(spray.mesh);}
   if(spray)spray.update=()=>{}; // Skip the optional particle simulation.
  }else if(effect==='rain'){
   const rain=app.weatherSurfaces?.rain;
   if(rain){rain.visible=false;app.scene?.remove?.(rain);}
  }else if(effect==='lightning'){
   if(app.nativeWeather){app.nativeWeather.lightningDisabled=true;
    if(app.nativeWeather.uniforms?.fields?.flash)app.nativeWeather.uniforms.fields.flash.value=0;}
  }
  notify({status:'effect-disabled',effect,...event});
 }
 function checkPipelines(){
  const pipelines=app.engine?.meshRenderer?.pipelines;
  if(!pipelines)return describe();
  for(const p of pipelines.values()){
   if(!p?.handle?.failed)continue;
   const label=p.label||p.handle.label||'unknown';
   if(/^Spray(?: |$)/i.test(label))disable('spray','GPU render pipeline failed',label);
   else if(/^Forecast thin rain particles(?: |$)/i.test(label))disable('rain','GPU render pipeline failed',label);
   else if(!reported.has(label)){reported.add(label);notify({status:'mandatory-pipeline-failed',pipeline:label});throw Error('Mandatory GPU pipeline could not initialize: '+label);}
  }
  return describe();
 }
 return{disable,checkPipelines,describe,get lightningDisabled(){return disabled.has('lightning');}};
}
// Lightning bolts are an optional section of the shared native sky shader.
// A failed sky compile gets one source-level retry with the bolt function
// excluded. Any remaining sky failure is mandatory and still fails loudly.
export async function installOptionalSky(app,createBeach,GPU,effects){
 let beach=createBeach(app);
 await GPU.pipelinesReady();
 if(!beach.pass?.handle?.failed)return beach;
 const module=app.nativeWeather?.module;
 const code=module?.code||'',start=code.indexOf('fn nativeStormBolt(dir:vec3f)->vec3f {');
 const end=code.indexOf('fn nativeCloudShadow(',start);
 if(start<0||end<=start)throw Error('Mandatory sky failed and optional lightning could not be isolated');
 effects.disable('lightning','Initial sky pipeline rejected; recompiling with optional bolt disabled',beach.pass.handle.label||'DayBuoy native sky');
 module.code=code.slice(0,start)+'fn nativeStormBolt(dir:vec3f)->vec3f { return vec3f(0.0); }\n'+code.slice(end);
 app.scene?.remove?.(beach.stand);
 beach=createBeach(app);
 await GPU.pipelinesReady();
 if(beach.pass?.handle?.failed)throw Error('Mandatory sky failed after disabling optional lightning');
 return beach;
}
