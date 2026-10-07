// The default preview ocean is the pinned native Tidewater implementation.
// The main application, camera, controls and original scene source stay intact.
if(engine&&typeof navigator!=='undefined'){
 const canvas=$('#ocean'),scene=engine.scene,renderer=engine.renderer,originalRender=engine.render.bind(engine);
 const badge=document.createElement('div');badge.id='ocean-engine-status';badge.setAttribute('role','status');$('#app').append(badge);
 const profiling=q.get('ocean-profile')==='1',debug=q.get('ocean-debug')==='1'||profiling;
 const profilePass=q.get('profile-pass')||'baseline';
 const profileDPR=profilePass==='dpr1'?1:profilePass==='dpr15'?1.5:2;
 // Opt-in until phone cadence AND appearance pass. No ocean quality changes.
 const atlas=profiling&&profilePass==='atlas';
 const singleLayer=profiling&&['host-single','host-all'].includes(profilePass);
 const bakedSky=profiling&&['host-sky','host-all'].includes(profilePass);
 const noShadows=profiling&&['host-shadows','host-all'].includes(profilePass);
 if(noShadows&&renderer.shadowMap)renderer.shadowMap.enabled=false;
 let backgroundBake=null;
 function bakeBackground(){
  if(!bakedSky||backgroundBake)return;
  const quad=scene.children.find(o=>o.isMesh&&o.renderOrder===-100);
  if(!quad)throw Error('Profiling background quad missing');
  const visibility=new Map(scene.children.map(o=>[o,o.visible]));
  const target=new THREE.WebGLRenderTarget(canvas.width,canvas.height,{depthBuffer:false,stencilBuffer:false});
  try{
   for(const o of scene.children)o.visible=o===quad;
   renderer.setRenderTarget(target);renderer.setClearColor(0,1);renderer.clear();renderer.render(scene,engine.camera);
   // Raw shader preserves the existing encoded colour; no second colour-space
   // conversion. This freezes the whole expensive quad, including old water.
   quad.material=new THREE.ShaderMaterial({uniforms:{baked:{value:target.texture}},
    vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.0,1.0);}',
    fragmentShader:'uniform sampler2D baked;varying vec2 vUv;void main(){gl_FragColor=texture2D(baked,vUv);}',
    depthTest:false,depthWrite:false,toneMapped:false});
   backgroundBake=target;
  }finally{for(const[o,v]of visibility)o.visible=v;renderer.setRenderTarget(null);}
 }
 const profileSend=data=>{if(profiling)parent.postMessage({...data,type:'daybuoy-profile'},location.origin);};
 if(profiling){
  // Controlled diagnostic fixture; never labels invented values as live data.
  for(const row of state.data.rows)Object.assign(row,{swell:3,period:8,tide:0,wind:8,windDirection:201,direction:201,cloud:0,cloudLow:0,cloudMid:0,cloudHigh:0,rain:0,weatherCode:0,visibility:28000});
  setTime(Date.parse('2026-10-05T12:00:00-05:00'));state.live=false;
  const resize=engine.resize?.bind(engine);
  if(resize)engine.resize=(w,h)=>resize(w,h,profileDPR);
  renderer.setPixelRatio(profileDPR);renderer.setSize(innerWidth,innerHeight,false);
 }
 const proof=window.__tidewater={backend:'loading',pin:'4811ba48d795197de5621985f404e765c0b7c0ef',metrics:null,error:null};
 let host,ready=false,failed=false,first=true;
 const direction=new THREE.Vector3();
 function fallback(reason){failed=true;ready=false;proof.backend='WebGL fallback';proof.error=reason;if(atlas){renderer.setScissorTest(false);renderer.setSize(innerWidth,innerHeight,false);}if(host)host.hidden=true;canvas.style.opacity='1';badge.hidden=false;badge.textContent='Standard ocean · Tidewater unavailable';badge.title=reason;profileSend({status:'failed',reason});}
 if(!navigator.gpu){fallback('This browser does not provide WebGPU.');}
 else{
  host=document.createElement('iframe');host.id='tidewater-ocean-layer';host.title='Tidewater ocean';host.tabIndex=-1;host.setAttribute('aria-hidden','true');host.setAttribute('allow','webgpu');host.src='ocean-proof/proof/ocean-only.html?noClouds=1&quality=auto';$('#app').prepend(host);
  if(profiling)host.src='ocean-proof/proof/ocean-only.html?noClouds=1&quality=0&ocean-profile=1&profile-pass='+encodeURIComponent(profilePass)+'&profile-seconds='+(q.get('profile-seconds')==='120'?'120':'20');
  badge.textContent='Loading Tidewater ocean…';
  const timeout=setTimeout(()=>{if(!ready)fallback('Tidewater initialization timed out.');},180000);
  window.addEventListener('message',e=>{
   if(e.origin!==location.origin||e.source!==host.contentWindow||e.data?.type!=='daybuoy-ocean')return;
   const d=e.data;if(d.status==='failed'){clearTimeout(timeout);fallback(d.reason);}
   if(profiling)profileSend(d);
   if(d.status==='ready'&&!failed){ready=true;clearTimeout(timeout);proof.backend='WebGPU';badge.textContent='Tidewater ocean · WebGPU';}
   if(d.status==='running'){proof.metrics=d;if(debug){badge.hidden=false;badge.textContent=`Tidewater · ${Math.round(d.fps)} fps · ${d.resolution.join('×')} · ${d.quality.name}`;}}
  });
  engine.render=function(dt){
   if(!ready||failed){originalRender(dt);return;}
   const native=host.contentWindow.__daybuoyOcean;if(!native?.ready)return;
   if(profiling){
    // Exact resting proof pose, applied only to the diagnostic fixture.
    const el=11*Math.PI/180,r=28.52,y=4.56+Math.sin(el)*r,z=Math.cos(el)*r;
    const a=engine.camera;a.position.set(0,y,z);a.up.set(0,1,0);a.lookAt(0,y+Math.sin(-el),z-Math.cos(el));
    a.fov=2*Math.atan(.59)*180/Math.PI;a.aspect=innerWidth/innerHeight;a.updateProjectionMatrix();
    a.projectionMatrix.elements[9]=-(.59*(1-2*.23)-Math.tan(el))/.59;a.projectionMatrixInverse.copy(a.projectionMatrix).invert();
    uniforms.uSun.value.set(-.33561098722843147,.8086223263512117,-.48321340893844417);
    uniforms.uCloud.value=0;uniforms.uCloudLayers.value.set(0,0,0);uniforms.uRain.value=0;
   }
   // Suppress both old displaced water and its spray. Render the existing
   // background/sky/sand directly, without running the old wave/foam simulation.
   const water=scene.children.filter(o=>o.renderOrder===1&&o.isMesh||o.renderOrder===2&&o.isPoints);
   const foreground=scene.children.filter(o=>o.renderOrder>=90||o===weatherRoot);
   const originalVisibility=new Map(scene.children.map(o=>[o,o.visible]));
   const remember=new Map([...water,...foreground].map(o=>[o,o.visible]));
   for(const o of remember.keys())o.visible=false;
   const w=atlas?innerWidth:0,h=atlas?innerHeight:0;
   if(atlas){
    // Two scissored full-size views in one drawing buffer. No resampling,
    // intermediate render target, image readback, or second context transfer.
    const pixels=Math.floor(w*profileDPR);
    if(canvas.width!==pixels*2||canvas.height!==Math.floor(h*profileDPR))renderer.setSize(pixels*2/profileDPR,h,false);
    renderer.setViewport(0,0,pixels/profileDPR,h);renderer.setScissor(0,0,pixels/profileDPR,h);renderer.setScissorTest(true);
   }
   bakeBackground();
   renderer.setRenderTarget(null);renderer.setClearColor(0,1);renderer.clear();renderer.render(scene,engine.camera);
   engine.camera.getWorldDirection(direction);
   const c=conditions();
   const packet={camera:{position:engine.camera.position.toArray(),direction:direction.toArray(),fov:engine.camera.fov,aspect:engine.camera.aspect,near:engine.camera.near,far:engine.camera.far,shearX:engine.camera.projectionMatrix.elements[8],shearY:engine.camera.projectionMatrix.elements[9]},sun:uniforms.uSun.value.toArray(),moon:uniforms.uMoon.value.toArray(),moonlight:uniforms.uMoonInfo.value.z,lightning:uniforms.uLightning.value,
    forecast:profiling?{swell:3,period:8,direction:201,wind:8,windDirection:201,tide:0,cloud:0}:realForecast()?Object.fromEntries(['swell','period','direction','wind','windDirection','tide','cloud'].map(k=>[k,c[k]])):null};
   try{
    if(!packet.forecast){for(const[o,v]of remember)o.visible=v;originalRender(dt);host.hidden=true;canvas.style.opacity='1';badge.hidden=false;badge.textContent='Waiting for marine forecast';return;}
    if(!atlas&&!native.begin(packet,canvas))return;
    const all=new Map(scene.children.map(o=>[o,o.visible]));
    for(const o of scene.children)o.visible=foreground.includes(o)&&remember.get(o);
    if(atlas){const half=canvas.width/2/profileDPR;renderer.setViewport(half,0,half,h);renderer.setScissor(half,0,half,h);}
    if(!singleLayer){renderer.setClearColor(0,0);renderer.clear();renderer.render(scene,engine.camera);}
    if(atlas&&!native.begin(packet,canvas))return;
    native.finish(atlas||singleLayer?null:canvas);
    for(const[o,v]of all)o.visible=v;
    renderer.setClearColor(0,1);host.hidden=false;canvas.style.opacity='0';
    if(first){first=false;setTimeout(()=>{if(!failed&&!debug)badge.hidden=true;},6000);}
   }catch(e){for(const[o,v]of originalVisibility)o.visible=v;fallback(e.message);originalRender(dt);}
   finally{for(const[o,v]of originalVisibility)o.visible=v;renderer.setClearColor(0,1);if(atlas){renderer.setScissorTest(false);renderer.setViewport(0,0,w,h);}}
  };
  engine.getSceneCanvas=()=>ready&&!failed?host.contentWindow.__daybuoyOcean?.canvas||canvas:canvas;
 }
}
