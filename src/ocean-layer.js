// The default preview ocean is the pinned native Tidewater implementation.
// The main application, camera, controls and original scene source stay intact.
if(engine&&typeof navigator!=='undefined'){
 const canvas=$('#ocean'),scene=engine.scene,renderer=engine.renderer,originalRender=engine.render.bind(engine);
 const badge=document.createElement('div');badge.id='ocean-engine-status';badge.setAttribute('role','status');$('#app').append(badge);
 const debug=q.get('ocean-debug')==='1';
 const proof=window.__tidewater={backend:'loading',pin:'4811ba48d795197de5621985f404e765c0b7c0ef',metrics:null,error:null};
 let host,ready=false,failed=false,first=true;
 const direction=new THREE.Vector3();
 function fallback(reason){failed=true;ready=false;proof.backend='WebGL fallback';proof.error=reason;if(host)host.hidden=true;canvas.style.opacity='1';badge.hidden=false;badge.textContent='Standard ocean · Tidewater unavailable';badge.title=reason;}
 if(!navigator.gpu){fallback('This browser does not provide WebGPU.');}
 else{
  host=document.createElement('iframe');host.id='tidewater-ocean-layer';host.title='Tidewater ocean';host.tabIndex=-1;host.setAttribute('aria-hidden','true');host.setAttribute('allow','webgpu');host.src='ocean-proof/proof/ocean-only.html?noClouds=1&quality=auto';$('#app').prepend(host);
  badge.textContent='Loading Tidewater ocean…';
  const timeout=setTimeout(()=>{if(!ready)fallback('Tidewater initialization timed out.');},180000);
  window.addEventListener('message',e=>{
   if(e.origin!==location.origin||e.source!==host.contentWindow||e.data?.type!=='daybuoy-ocean')return;
   const d=e.data;if(d.status==='failed'){clearTimeout(timeout);fallback(d.reason);}
   if(d.status==='ready'&&!failed){ready=true;clearTimeout(timeout);proof.backend='WebGPU';badge.textContent='Tidewater ocean · WebGPU';}
   if(d.status==='running'){proof.metrics=d;if(debug){badge.hidden=false;badge.textContent=`Tidewater · ${Math.round(d.fps)} fps · ${d.resolution.join('×')} · ${d.quality.name}`;}}
  });
  engine.render=function(dt){
   if(!ready||failed){originalRender(dt);return;}
   const native=host.contentWindow.__daybuoyOcean;if(!native?.ready)return;
   // Suppress both old displaced water and its spray. Render the existing
   // background/sky/sand directly, without running the old wave/foam simulation.
   const water=scene.children.filter(o=>o.renderOrder===1&&o.isMesh||o.renderOrder===2&&o.isPoints);
   const foreground=scene.children.filter(o=>o.renderOrder>=90||o===weatherRoot);
   const originalVisibility=new Map(scene.children.map(o=>[o,o.visible]));
   const remember=new Map([...water,...foreground].map(o=>[o,o.visible]));
   for(const o of remember.keys())o.visible=false;
   renderer.setRenderTarget(null);renderer.setClearColor(0,1);renderer.clear();renderer.render(scene,engine.camera);
   engine.camera.getWorldDirection(direction);
   const c=conditions();
   const packet={camera:{position:engine.camera.position.toArray(),direction:direction.toArray(),fov:engine.camera.fov,aspect:engine.camera.aspect,near:engine.camera.near,far:engine.camera.far,shearX:engine.camera.projectionMatrix.elements[8],shearY:engine.camera.projectionMatrix.elements[9]},sun:uniforms.uSun.value.toArray(),moon:uniforms.uMoon.value.toArray(),moonlight:uniforms.uMoonInfo.value.z,lightning:uniforms.uLightning.value,
    forecast:realForecast()?Object.fromEntries(['swell','period','direction','wind','windDirection','tide','cloud'].map(k=>[k,c[k]])):null};
   try{
    if(!packet.forecast){for(const[o,v]of remember)o.visible=v;originalRender(dt);host.hidden=true;canvas.style.opacity='1';badge.hidden=false;badge.textContent='Waiting for marine forecast';return;}
    if(!native.begin(packet,canvas))return;
    const all=new Map(scene.children.map(o=>[o,o.visible]));
    for(const o of scene.children)o.visible=foreground.includes(o)&&remember.get(o);
    renderer.setClearColor(0,0);renderer.clear();renderer.render(scene,engine.camera);native.finish(canvas);
    for(const[o,v]of all)o.visible=v;
    renderer.setClearColor(0,1);host.hidden=false;canvas.style.opacity='0';
    if(first){first=false;setTimeout(()=>{if(!failed&&!debug)badge.hidden=true;},6000);}
   }catch(e){for(const[o,v]of originalVisibility)o.visible=v;fallback(e.message);originalRender(dt);}
   finally{for(const[o,v]of originalVisibility)o.visible=v;renderer.setClearColor(0,1);}
  };
  engine.getSceneCanvas=()=>ready&&!failed?host.contentWindow.__daybuoyOcean?.canvas||canvas:canvas;
 }
}
