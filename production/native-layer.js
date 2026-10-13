if(engine?.nativeScene){
 const canvas=$('#ocean'),direction=new THREE.Vector3(),priorCameraPose=updateCameraPose;
 updateCameraPose=function(dt,wantsSky){if(!state.playing&&!state.userLook&&!state.cameraReset&&!wantsSky&&!state.sheet)applyManualCamera(dt);else priorCameraPose(dt,wantsSky);};
 const badge=document.createElement('div');badge.id='ocean-engine-status';badge.setAttribute('role','status');$('#app').append(badge);
 const host=document.createElement('iframe');host.id='tidewater-ocean-layer';host.title='DayBuoy beach';host.tabIndex=-1;host.setAttribute('aria-hidden','true');host.setAttribute('allow','webgpu');
 $('#app').prepend(host);badge.textContent='Loading beach…';let ready=false,failed=false,first=true,currentAttempt=0,lastStage='native-document',watchdog=null,retryTimer=null;
 const emit=(code,reason='')=>{try{dispatchEvent(new CustomEvent('daybuoy:diagnostic',{detail:{source:'renderer',code,stage:lastStage,attempt:currentAttempt,reason:String(reason).slice(0,250)}}));}catch{}};
 const status=label=>{lastStage=String(label||'loading');badge.hidden=false;badge.textContent='Preparing Tidewater · '+lastStage;clearTimeout(watchdog);if(!ready&&!failed)watchdog=setTimeout(()=>retry('No progress at '+lastStage+' after 240 s'),240000);};
 const startAttempt=()=>{if(failed)return;currentAttempt++;ready=false;host.src='/scene.html?initAttempt='+currentAttempt;status('native-document');if(currentAttempt>1)badge.textContent='Retrying Tidewater · '+currentAttempt+'/3';};
 const retry=reason=>{
  if(failed)return;clearTimeout(watchdog);clearTimeout(retryTimer);emit(reason.includes('progress')?'init-timeout':'init-failed',reason);
  if(currentAttempt>=3){fallback('Native beach failed after 3 attempts: '+reason);return;}
  ready=false;first=true;emit('init-retry',reason);badge.hidden=false;badge.textContent='Preparing Tidewater · retry '+(currentAttempt+1)+'/3';
  try{host.contentWindow.__daybuoyOcean?.dispose?.();}catch{}host.src='about:blank';
  retryTimer=setTimeout(startAttempt,currentAttempt===1?1500:4000);
 };
 const fallback=reason=>{if(failed)return;failed=true;clearTimeout(watchdog);clearTimeout(retryTimer);ready=false;host.remove();canvas.style.opacity='1';badge.hidden=false;badge.textContent='Standard ocean · Tidewater unavailable';badge.title=reason;releaseReport('renderer','unavailable');engine.activateFallback();};
 
 addEventListener('message',e=>{
  if(e.origin!==location.origin||e.source!==host.contentWindow||e.data?.type!=='daybuoy-ocean')return;
  if(e.data.attempt!=null&&e.data.attempt!==currentAttempt)return;
  if(e.data.status==='loading'&&!ready&&!failed)status(e.data.stage||e.data.label);
  if(e.data.status==='failed')retry(e.data.reason||'Native initialization failed');
  if(e.data.status==='effect-disabled'){try{dispatchEvent(new CustomEvent('daybuoy:diagnostic',{detail:{source:'renderer',code:'optional-disabled',effect:e.data.effect,stage:e.data.pipeline,attempt:currentAttempt}}));}catch{}}
  if(e.data.status==='ready'&&!failed){clearTimeout(watchdog);ready=true;}
 });
 engine.render=function(){
  if(!ready||failed)return;const native=host.contentWindow.__daybuoyOcean;if(!native?.ready)return;
  const a=engine.camera;a.getWorldDirection(direction);const c=conditions();
  const forecast=realForecast()?weatherScenePacket(c):null;
  if(!forecast){badge.hidden=false;badge.textContent='Waiting for marine forecast';return;}
  try{const drawn=native.draw({camera:{position:a.position.toArray(),direction:direction.toArray(),fov:a.fov,aspect:a.aspect,near:a.near,far:a.far,shearX:a.projectionMatrix.elements[8],shearY:a.projectionMatrix.elements[9]},sun:uniforms.uSun.value.toArray(),moon:uniforms.uMoon.value.toArray(),moonInfo:uniforms.uMoonInfo.value.toArray(),moonlight:uniforms.uMoonInfo.value.z,afternoon:uniforms.uAfternoon.value,lightning:uniforms.uLightning.value,overlays:[...uvArcGlow,...rainRings.filter(r=>r.visible)],forecast});if(drawn===false)return;
   canvas.style.opacity='0';if(first){first=false;clearTimeout(watchdog);badge.hidden=true;}
  }catch(e){retry(e.message);}
 };
 startAttempt();
 engine.getSceneCanvas=()=>ready&&!failed?host.contentWindow.__daybuoyOcean?.canvas||canvas:canvas;
}
