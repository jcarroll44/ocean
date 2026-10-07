// One GPU renderer. The parent supplies CPU camera/forecast/astronomy only.
if(engine?.nativeScene){
 const canvas=$('#ocean'),profiling=q.get('ocean-profile')==='1',pass=q.get('profile-pass')||'native';
 const debug=profiling||q.get('ocean-debug')==='1',direction=new THREE.Vector3();
 const badge=document.createElement('div');badge.id='ocean-engine-status';badge.setAttribute('role','status');$('#app').append(badge);
 const proof=window.__tidewater={backend:'loading',pin:'4811ba48d795197de5621985f404e765c0b7c0ef',metrics:null,error:null};
 const host=document.createElement('iframe');host.id='tidewater-ocean-layer';host.title='DayBuoy native beach';host.tabIndex=-1;host.setAttribute('aria-hidden','true');host.setAttribute('allow','webgpu');
 host.src='ocean-proof/proof/native-scene.html?noClouds=1&quality=0'+(profiling?'&ocean-profile=1&profile-pass='+encodeURIComponent(pass)+'&profile-seconds='+(q.get('profile-seconds')==='120'?'120':'20'):'')+(q.get('native-capture')==='1'?'&native-capture=1':'');
 $('#app').prepend(host);badge.textContent='Loading native beach…';
 let ready=false,failed=false,first=true;
 const send=d=>{if(profiling)parent.postMessage({...d,type:'daybuoy-profile'},location.origin);};
 const fallback=reason=>{if(failed)return;failed=true;ready=false;host.remove();canvas.style.opacity='1';proof.backend='WebGL fallback';proof.error=reason;badge.hidden=false;badge.textContent='Standard ocean · Tidewater unavailable';badge.title=reason;engine.activateFallback();send({status:'failed',reason});};
 const timeout=setTimeout(()=>{if(!ready)fallback('Native beach initialization timed out');},180000);
 if(profiling){
  for(const row of state.data.rows)Object.assign(row,{swell:3,period:8,tide:0,wind:8,windDirection:201,direction:201,cloud:0,cloudLow:0,cloudMid:0,cloudHigh:0,rain:0,weatherCode:0,visibility:28000});
  setTime(Date.parse('2026-10-05T12:00:00-05:00'));state.live=false;
 }
 window.addEventListener('message',e=>{
  if(e.origin!==location.origin||e.source!==host.contentWindow||e.data?.type!=='daybuoy-ocean')return;
  const d=e.data;send(d);
  if(d.status==='failed'){clearTimeout(timeout);fallback(d.reason);}
  if(d.status==='ready'&&!failed){clearTimeout(timeout);ready=true;proof.backend='WebGPU native scene';}
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
  const forecast=profiling?{swell:3,period:8,direction:201,wind:8,windDirection:201,tide:0,cloud:0,rain:0}:realForecast()?Object.fromEntries(['swell','period','direction','wind','windDirection','tide','cloud','rain','cloudLow','cloudMid','cloudHigh'].map(k=>[k,c[k]])):null;
  if(!forecast){badge.hidden=false;badge.textContent='Waiting for marine forecast';return;}
  try{
   native.draw({camera:{position:a.position.toArray(),direction:direction.toArray(),fov:a.fov,aspect:a.aspect,near:a.near,far:a.far,shearX:a.projectionMatrix.elements[8],shearY:a.projectionMatrix.elements[9]},sun:uniforms.uSun.value.toArray(),moon:uniforms.uMoon.value.toArray(),moonInfo:uniforms.uMoonInfo.value.toArray(),moonlight:uniforms.uMoonInfo.value.z,afternoon:uniforms.uAfternoon.value,lightning:uniforms.uLightning.value,overlays:[...uvArcGlow,...rainRings.filter(r=>r.visible)],forecast});
   canvas.style.opacity='0';if(first){first=false;badge.textContent='Tidewater · native WebGPU beach';setTimeout(()=>{if(!failed&&!debug)badge.hidden=true;},6000);}
  }catch(e){fallback(e.message);}
 };
 proof.capturePair=()=>host.contentWindow.__daybuoyOcean.capturePair();
 engine.getSceneCanvas=()=>ready&&!failed?host.contentWindow.__daybuoyOcean?.canvas||canvas:canvas;
}
