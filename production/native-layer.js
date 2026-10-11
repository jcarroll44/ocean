if(engine?.nativeScene){
 const canvas=$('#ocean'),direction=new THREE.Vector3(),priorCameraPose=updateCameraPose;
 updateCameraPose=function(dt,wantsSky){if(!state.playing&&!state.userLook&&!state.cameraReset&&!wantsSky&&!state.sheet)applyManualCamera(dt);else priorCameraPose(dt,wantsSky);};
 const badge=document.createElement('div');badge.id='ocean-engine-status';badge.setAttribute('role','status');$('#app').append(badge);
 const host=document.createElement('iframe');host.id='tidewater-ocean-layer';host.title='DayBuoy beach';host.tabIndex=-1;host.setAttribute('aria-hidden','true');host.setAttribute('allow','webgpu');host.src='/scene.html';
 $('#app').prepend(host);badge.textContent='Loading beach…';let ready=false,failed=false,first=true;
 const fallback=reason=>{if(failed)return;failed=true;ready=false;host.remove();canvas.style.opacity='1';badge.hidden=false;badge.textContent='Standard ocean · Tidewater unavailable';badge.title=reason;engine.activateFallback();};
 const timeout=setTimeout(()=>{if(!ready)fallback('Beach initialization timed out');},180000);
 addEventListener('message',e=>{
  if(e.origin!==location.origin||e.source!==host.contentWindow||e.data?.type!=='daybuoy-ocean')return;
  if(e.data.status==='failed'){clearTimeout(timeout);fallback(e.data.reason);}
  if(e.data.status==='ready'&&!failed){clearTimeout(timeout);ready=true;}
 });
 engine.render=function(){
  if(!ready||failed)return;const native=host.contentWindow.__daybuoyOcean;if(!native?.ready)return;
  const a=engine.camera;a.getWorldDirection(direction);const c=conditions();
  const forecast=realForecast()?Object.fromEntries(['swell','period','direction','wind','windDirection','tide','cloud','rain','cloudLow','cloudMid','cloudHigh'].map(k=>[k,c[k]])):null;
  if(!forecast){badge.hidden=false;badge.textContent='Waiting for marine forecast';return;}
  try{native.draw({camera:{position:a.position.toArray(),direction:direction.toArray(),fov:a.fov,aspect:a.aspect,near:a.near,far:a.far,shearX:a.projectionMatrix.elements[8],shearY:a.projectionMatrix.elements[9]},sun:uniforms.uSun.value.toArray(),moon:uniforms.uMoon.value.toArray(),moonInfo:uniforms.uMoonInfo.value.toArray(),moonlight:uniforms.uMoonInfo.value.z,afternoon:uniforms.uAfternoon.value,lightning:uniforms.uLightning.value,overlays:[...uvArcGlow,...rainRings.filter(r=>r.visible)],forecast});
   canvas.style.opacity='0';if(first){first=false;badge.hidden=true;}
  }catch(e){fallback(e.message);}
 };
 engine.getSceneCanvas=()=>ready&&!failed?host.contentWindow.__daybuoyOcean?.canvas||canvas:canvas;
}
