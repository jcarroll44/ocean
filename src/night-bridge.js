// Branch-only renderer adapter. Original camera and gesture modules are intact.
if(q.get('ocean')==='webgpu'&&engine){
 const host=document.createElement('iframe');host.id='native-ocean';host.title='Tidewater ocean';host.setAttribute('aria-hidden','true');host.tabIndex=-1;
 host.src='ocean-proof/proof/frame.html?embedded=1&quality=auto'+(q.get('land')==='1'?'&land=1':'');$('#app').prepend(host);
 const status=document.createElement('button');status.id='ocean-backend';status.textContent='Opening ocean · WebGL active';status.setAttribute('aria-label','Ocean renderer status. Tap to use original water.');$('#app').append(status);
 let ready=false,failed=false,lastSend=0,lastFrame=performance.now(),paused=null,userFallback=false;
 const originalRender=engine.render.bind(engine),direction=new THREE.Vector3();
 status.onclick=()=>{userFallback=!userFallback;state.dirty=true;};
 const fallback=reason=>{ready=false;failed=true;host.hidden=true;status.textContent='Original water · '+reason;};
 const timeout=setTimeout(()=>{if(!ready)fallback('ocean load timeout');},180000);
 window.addEventListener('message',e=>{
  if(e.origin!==location.origin||e.source!==host.contentWindow||e.data?.type!=='proof')return;
  const d=e.data;if(d.status==='failed')fallback('WebGPU unavailable');
  if(d.status==='ready'&&!failed){ready=true;clearTimeout(timeout);}
  if(d.status==='running'){
   lastFrame=performance.now();window.__nightOcean.metrics=d;
   if(!paused)status.textContent=`WebGPU · ${(d.recentFps||0).toFixed(0)} fps · ${d.output.join('×')} · ${d.quality.name}`;
  }
  if(d.integrationWarning)window.__nightOcean.warning=d.integrationWarning;
 });
 window.__nightOcean={status:'loading',metrics:null,warning:null,originalRender};
 engine.render=function(dt){
  const now=performance.now(),sun=uniforms.uSun.value;
  // Until the celestial/rain/arc ports are accepted, preserve those approved
  // experiences with the original renderer. This is visibly labelled.
  const legacyReason=userFallback?'selected':sun.y<0?'night':state.playing||state.scrubbing||timeExploreOpacity>.05?'sun path':isStorm(conditions())?'rain':!realForecast()?'waiting for forecast':null;
  const active=ready&&!failed&&!legacyReason;
  host.hidden=!active;$('#ocean').style.opacity=active?'0':'1';
  window.__nightOcean.status=active?'WebGPU':'WebGL';
  if(ready&&paused===false&&now-lastFrame>15000&&!document.hidden)fallback('renderer stopped');
  if(paused!==!active){paused=!active;if(active)lastFrame=now;host.contentWindow.postMessage({type:'pause',value:paused},location.origin);}
  if(!active||dt===0){originalRender(dt);if(ready)status.textContent='Original water · '+(legacyReason||'fallback');}
  if(ready&&now-lastSend>33){
   const cam=engine.camera;cam.getWorldDirection(direction);const c=conditions();
   const forecast=realForecast()?Object.fromEntries(['swell','period','direction','wind','windDirection','tide','cloud'].map(k=>[k,c[k]])):null;
   host.contentWindow.postMessage({type:'daybuoy-frame',camera:{position:cam.position.toArray(),direction:direction.toArray(),fov:cam.fov,aspect:cam.aspect,near:cam.near,far:cam.far,shearX:cam.projectionMatrix.elements[8],shearY:cam.projectionMatrix.elements[9]},sun:sun.toArray(),forecast},location.origin);lastSend=now;
  }
 };
}
