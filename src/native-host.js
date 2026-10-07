// CPU camera/interaction host. No graphics context, legacy ocean geometry,
// texture upload or rendering occurs here. Three's math remains UI-compatible.
function createSceneHost(canvas,u,onError){
 const oldCreate=__mods['ocean-engine.js'].createOcean;
 const search=new URLSearchParams(location.search);
 const oldProfile=search.get('ocean-profile')==='1'&&!search.get('profile-pass')?.startsWith('native');
 if(!navigator.gpu||oldProfile)return oldCreate(canvas,u,onError);
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(61.08,1,.1,2500);
 for(const [k,v] of Object.entries({uYaw:0,uPitch:0,uZoom:1,uExposure:1,uClarity:.9,uDark:0,uGlow:.35,uShear:.13}))u[k]??={value:v};
 u.uCamera={value:new THREE.Vector3(0,10,26)};
 u.uMoon??={value:new THREE.Vector3(0,-1,0)};u.uMoonInfo??={value:new THREE.Vector4(0,.00454,0,0)};u.uGalactic??={value:new THREE.Matrix3()};
 const buoy={group:new THREE.Group(),update(){}};scene.add(buoy.group);
 const sky={update(){},resize(){}};
 let yaw=0,pitch=0;
 const lens=()=>{camera.fov=2*Math.atan(.59/u.uZoom.value)*180/Math.PI;camera.updateProjectionMatrix();camera.projectionMatrix.elements[9]=-u.uShear.value/.59;camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();};
 const aim=()=>{const c=Math.cos(pitch),p=u.uCamera.value;camera.position.copy(p);camera.lookAt(p.x+108*Math.sin(yaw)*c,p.y+108*Math.sin(pitch),p.z-108*Math.cos(yaw)*c);camera.updateMatrixWorld();};
 const host={nativeScene:true,scene,camera,sky,buoy,render(){},
  setPose(x,y,z,lookYaw,lookPitch,zoom,shear){u.uCamera.value.set(x,y,z);yaw=lookYaw;pitch=lookPitch;u.uYaw.value=yaw;u.uPitch.value=pitch;u.uZoom.value=zoom;u.uShear.value=shear;lens();aim();},
  setView(y,p=pitch){yaw=y;pitch=p;u.uYaw.value=y;u.uPitch.value=p;aim();},
  setZoom(z){u.uZoom.value=Math.max(.5,Math.min(6,z));lens();},
  setShear(s){u.uShear.value=s;lens();},
  resize(w,h){camera.aspect=w/h;lens();},
  project(dir){const v=new THREE.Vector3(...dir).multiplyScalar(1000).add(u.uCamera.value).project(camera);return v.z>1?null:{x:(v.x+1)/2,y:(1-v.y)/2};},
  activateFallback(){
   const pose={position:camera.position.clone(),yaw,pitch,zoom:u.uZoom.value,shear:u.uShear.value};
   const legacy=oldCreate(canvas,u,onError),legacyScene=legacy.buoy.group.parent;
   legacy.buoy.group.removeFromParent();legacy.buoy.update=()=>{};
   for(const object of [...scene.children])legacyScene.add(object);
   if(typeof installDayLighting==='function')installDayLighting(legacyScene);
   Object.assign(host,legacy,{scene:legacyScene,nativeScene:false});
   host.resize(innerWidth,innerHeight,Math.min(devicePixelRatio,1.6));
   host.setPose(...pose.position.toArray(),pose.yaw,pose.pitch,pose.zoom,pose.shear);
  }
 };
 aim();lens();return host;
}
