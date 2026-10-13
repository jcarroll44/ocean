// One GPU renderer. The parent supplies CPU camera/forecast/astronomy only.
if(engine?.nativeScene){
 const canvas=$('#ocean'),profiling=q.get('ocean-profile')==='1',pass=q.get('profile-pass')||'native';
 if(!profiling){
  const priorCameraPose=updateCameraPose;
  updateCameraPose=function(dt,wantsSky){
   if(!state.playing&&!state.userLook&&!state.cameraReset&&!wantsSky&&!state.sheet)applyManualCamera(dt);
   else priorCameraPose(dt,wantsSky);
  };
 }
 const debug=profiling||q.get('ocean-debug')==='1',direction=new THREE.Vector3();
 const badge=document.createElement('div');badge.id='ocean-engine-status';badge.setAttribute('role','status');$('#app').append(badge);
 const proof=window.__tidewater={backend:'loading',pin:'4811ba48d795197de5621985f404e765c0b7c0ef',metrics:null,error:null};
 const host=document.createElement('iframe');host.id='tidewater-ocean-layer';host.title='DayBuoy native beach';host.tabIndex=-1;host.setAttribute('aria-hidden','true');host.setAttribute('allow','webgpu');
 host.src='ocean-proof/proof/native-scene.html?noClouds=1&quality=0'+(profiling?'&ocean-profile=1&profile-pass='+encodeURIComponent(pass)+'&profile-seconds='+(q.get('profile-seconds')==='120'?'120':'20')+['profile-dpr','profile-aa','profile-flare'].filter(k=>q.has(k)).map(k=>'&'+k+'='+encodeURIComponent(q.get(k))).join(''):'')+(q.get('native-capture')==='1'?'&native-capture=1':'');
 // Live regression tests never enable the sunny/fixed-camera ocean-profile fixture.
 if(q.has('overcast-test')){
  const test=q.get('overcast-test');
  if(!['baseline','previous','deck-off','surf-off','exposure-off','old-fov','lip-off','flat'].includes(test))throw Error('Unknown overcast diagnostic');
  host.src=(test==='previous'?'/overcast-previous/':'/')+'ocean-proof/proof/native-scene.html?noClouds=1&quality=0&native-capture=1&overcast-test='+test;
 }
 const nativeBaseURL=host.src;
 host.removeAttribute('src');
 $('#app').prepend(host);badge.textContent='Loading native beach…';
 let ready=false,failed=false,first=true,currentAttempt=0,lastStage='native-document',watchdog=null,retryTimer=null;
 proof.stage=lastStage;proof.attempts=[];proof.startupComplete=false;
 const emit=(code,reason='')=>{try{window.dispatchEvent(new CustomEvent('daybuoy:diagnostic',{detail:{source:'renderer',code,attempt:currentAttempt,stage:lastStage,reason:String(reason).slice(0,250)}}));}catch{}};
 const status=label=>{lastStage=String(label||'loading');proof.stage=lastStage;badge.hidden=false;badge.textContent='Preparing Tidewater · '+lastStage;clearTimeout(watchdog);if(!ready&&!failed)watchdog=setTimeout(()=>retry('No progress at '+lastStage+' after 240 s'),240000);};
 const startAttempt=()=>{
  if(failed)return;currentAttempt++;proof.backend='loading';proof.error=null;ready=false;
  const glue=nativeBaseURL.includes('?')?'&':'?';host.src=nativeBaseURL+glue+'initAttempt='+currentAttempt;
  status('native-document');if(currentAttempt>1)badge.textContent='Retrying Tidewater · '+currentAttempt+'/3';
 };
 const retry=reason=>{
  if(failed)return;clearTimeout(watchdog);clearTimeout(retryTimer);const last=lastStage;
  proof.attempts.push({attempt:currentAttempt,stage:last,reason:String(reason).slice(0,500),at:Date.now()});
  proof.error=String(reason);emit(reason.includes('progress')?'init-timeout':'init-failed',reason);
  if(currentAttempt>=3){fallback('Native beach failed after 3 attempts: '+reason);return;}
  ready=false;first=true;emit('init-retry',reason);badge.hidden=false;badge.textContent='Preparing Tidewater · retry '+(currentAttempt+1)+'/3';
  try{host.contentWindow.__daybuoyOcean?.dispose?.();}catch{}
  host.src='about:blank';
  retryTimer=setTimeout(startAttempt,currentAttempt===1?1500:4000);
 };
 const send=d=>{if(profiling)parent.postMessage({...d,type:'daybuoy-profile'},location.origin);};
 const fallback=reason=>{if(failed)return;failed=true;clearTimeout(watchdog);clearTimeout(retryTimer);ready=false;host.remove();canvas.style.opacity='1';proof.backend='WebGL fallback';proof.error=reason;badge.hidden=!debug;badge.textContent=debug?'Standard ocean · Tidewater unavailable':'';badge.title=reason;releaseReport('renderer','unavailable');engine.activateFallback();send({status:'failed',reason});};
 
 if(profiling){
  // Wrap the existing callback only in diagnostics; original UI/camera source
  // and ordinary scheduling stay intact. Include CPU work even on gated frames.
  const sceneFrame=frame;
  frame=function(now){
   const native=host.contentWindow.__daybuoyOcean,start=performance.now();
   native?.profileFrameStart?.(now,performance.timeOrigin);
   try{return sceneFrame(now);}finally{native?.profileFrameEnd?.(performance.now()-start);}
  };
  for(const row of state.data.rows)Object.assign(row,{swell:3,period:8,tide:0,wind:8,windDirection:201,direction:201,cloud:0,cloudLow:0,cloudMid:0,cloudHigh:0,rain:0,weatherCode:0,visibility:28000});
  setTime(Date.parse('2026-10-05T12:00:00-05:00'));state.live=false;
 }
 window.addEventListener('message',e=>{
  if(e.origin!==location.origin||e.source!==host.contentWindow||e.data?.type!=='daybuoy-ocean')return;
  const d=e.data;send(d);
  if(d.attempt!=null&&d.attempt!==currentAttempt)return;
  if(d.status==='loading'&&!ready&&!failed)status(d.stage||d.label);
  if(d.status==='failed')retry(d.reason||'Native initialization failed');
  if(d.status==='ready'&&!failed){clearTimeout(watchdog);ready=true;proof.backend='WebGPU native scene';proof.stage='renderer-ready';}
  if(d.status==='effect-disabled'){(proof.disabledEffects??=[]).push({effect:d.effect,pipeline:d.pipeline,reason:d.reason});try{window.dispatchEvent(new CustomEvent('daybuoy:diagnostic',{detail:{source:'renderer',code:'optional-disabled',effect:d.effect,stage:d.pipeline,attempt:currentAttempt}}));}catch{}}
  if(d.status==='running'){proof.metrics=d;if(debug){badge.hidden=false;badge.textContent=`Native beach · ${d.fps.toFixed(1)} fps · ${d.resolution.join('×')}`;}}
 });
 engine.render=function(){
  if(!ready||failed)return;
  const native=host.contentWindow.__daybuoyOcean;if(!native?.ready)return;
  const a=engine.camera;
  if(profiling){
   const el=11*Math.PI/180,r=28.52,y=4.56+Math.sin(el)*r,z=Math.cos(el)*r;
   a.position.set(0,y,z);a.up.set(0,1,0);a.lookAt(0,y+Math.sin(-el),z-Math.cos(el));a.fov=2*Math.atan(.59)*180/Math.PI;a.aspect=innerWidth/innerHeight;a.updateProjectionMatrix();
   a.projectionMatrix.elements[9]=-(.59*(1-2*.23)-Math.tan(el))/.59;a.projectionMatrixInverse.copy(a.projectionMatrix).invert();
   uniforms.uSun.value.set(-.33561098722843147,.8086223263512117,-.48321340893844417);
  }
  a.getWorldDirection(direction);const c=conditions();
  const forecast=profiling?{swell:3,period:8,direction:201,wind:8,windDirection:201,tide:0,cloud:0,rain:0}:realForecast()?weatherScenePacket(c):null;
  if(!forecast){badge.hidden=false;badge.textContent='Waiting for marine forecast';return;}
  try{
   const drawn=native.draw({camera:{position:a.position.toArray(),direction:direction.toArray(),fov:a.fov,aspect:a.aspect,near:a.near,far:a.far,shearX:a.projectionMatrix.elements[8],shearY:a.projectionMatrix.elements[9]},sun:uniforms.uSun.value.toArray(),moon:uniforms.uMoon.value.toArray(),moonInfo:uniforms.uMoonInfo.value.toArray(),moonlight:uniforms.uMoonInfo.value.z,afternoon:uniforms.uAfternoon.value,lightning:uniforms.uLightning.value,overlays:[...uvArcGlow,...rainRings.filter(r=>r.visible)],forecast});
   if(drawn===false)return;
   canvas.style.opacity='0';if(first){first=false;proof.startupComplete=true;proof.stage='first-live-frame';clearTimeout(watchdog);badge.textContent='Tidewater · native WebGPU beach';setTimeout(()=>{if(!failed&&!debug)badge.hidden=true;},6000);}
  }catch(e){retry(e.message);}
 };
 startAttempt();
 proof.capturePair=()=>host.contentWindow.__daybuoyOcean.capturePair();
 engine.getSceneCanvas=()=>ready&&!failed?host.contentWindow.__daybuoyOcean?.canvas||canvas:canvas;
}
