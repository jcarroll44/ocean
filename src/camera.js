const PATH_RADIUS=34,PATH_ORIGIN=new THREE.Vector3(0,0,0);
// Exact beachPose from the supplied skyview-beach.html. Astronomy remains app-owned.
const SKY_RADIUS=3034,_up=new THREE.Vector3(0,1,0);
let sunEl=0,sunRel=0,domeRadius=SKY_RADIUS,cameraReturn=null;
const sunDir=new THREE.Vector3();
function headingVec(yawDeg,pitchDeg){const y=yawDeg*RAD,p=pitchDeg*RAD;return new THREE.Vector3(0,Math.sin(p),-Math.cos(p)).applyAxisAngle(_up,-y);}
function beachPose(){ // the secret sauce: you never leave the beach. The sun moves; you just step back.
  const D=Math.PI/180, sm=(a,b,x)=>{x=Math.min(1,Math.max(0,(x-a)/(b-a)));return x*x*(3-2*x);};
  const k=sm(8,50,sunEl);                                   // 0 at sunrise/sunset, 1 near the top of the arc
  const yaw=Math.max(-102+40*k,Math.min(60,sunRel))*(1-0.25*k);  // face the sun, ease back toward the water as it climbs
  const fov=55+25*k;                                        // lens widens a little
  const back=28+42*k, h=10+16*k;                            // step back and up the dune, never a drone
  const pos=new THREE.Vector3(0,h,back).applyAxisAngle(_up,-yaw*D);
  const tf=Math.tan(fov/2*D);
  let pitch=sunEl-Math.atan(0.56*tf)/D;                     // sun about 22% from the top of the screen...
  pitch=Math.min(pitch,Math.atan(0.24*tf)/D);               // ...but the horizon never drops below 62%: the ocean stays the hero
  pitch=Math.max(pitch,-11);
  return {pos,tgt:pos.clone().add(headingVec(yaw,pitch).multiplyScalar(60)),fov};}
function approvedBeachTarget(){
 const a=beachPose(),dir=a.tgt.clone().sub(a.pos).normalize();
 return{x:a.pos.x,y:a.pos.y,z:a.pos.z,yaw:Math.atan2(dir.x,-dir.z),pitch:Math.asin(dir.y),fov:a.fov,shear:0};
}
let cameraVelocity={},sunGlance=null,storyGlancePose=null,glanceReturning=false;
function criticalStep(value,target,velocity,dt,omega,limit=Infinity){
 const offset=value-target;
 if(velocity*offset>=0)velocity=0;
 const j=velocity+omega*offset,e=Math.exp(-omega*dt);
 let next=target+(offset+j*dt)*e,v=(velocity-omega*j*dt)*e;
 if(offset*(next-target)<0){next=target;v=0;}
 const delta=clamp(next-value,-limit*dt,limit*dt);
 if(delta!==next-value)v=delta/Math.max(dt,1e-6);
 return{value:value+delta,velocity:v};
}
function requestSunGlance(){
 if(!engine||sunEl<=0||['water','waves','wind'].includes(state.sheet))return;
 state.glanceReturnView=state.userLook?{...state.userLook}:null;state.userLook=null;
 sunGlance={start:performance.now(),pose:{...cameraPose,fov:engine.camera.fov,shear:uniforms.uShear.value}};
 state.timeCameraHeld=true;state.live=false;holdTimeExploration();state.dirty=true;
}
function glanceTarget(target){
 let amount=state.playing?(state.storyGlance||0):0;
 if(state.playing&&amount>0){storyGlancePose??={...cameraPose,fov:engine.camera.fov,shear:uniforms.uShear.value};target={...storyGlancePose};}else storyGlancePose=null;
 if(sunGlance&&!state.playing){const t=(performance.now()-sunGlance.start)/1500;
  if(t>=1){sunGlance=null;if(state.glanceReturnView){state.userLook=state.glanceReturnView;state.glanceReturnView=null;}}else{amount=Math.sin(clamp(t,0,1)*Math.PI);target={...sunGlance.pose};}
 }
 const desired=sunEl*RAD-Math.atan(.56*Math.tan(target.fov*RAD/2));
 const active=amount>.001&&desired>target.pitch;
 if(active)target={...target,pitch:mix(target.pitch,desired,amount)};
 if(state.glancing&&!active)glanceReturning=true;
 if(glanceReturning&&Math.abs((cameraPose?.pitch??target.pitch)-target.pitch)<.002)glanceReturning=false;
 state.glancing=active||glanceReturning;
 return target;
}
function applyBeachTarget(target,dt,cinematic=false){
 const p={...(cameraPose||{x:0,y:10,z:28,yaw:0,pitch:-11*RAD}),fov:engine.camera.fov,shear:uniforms.uShear.value};
 const step=clamp(dt,0,.05),omega=state.glancing?18:cinematic?9:7;
 target={...target,yaw:p.yaw+((target.yaw-p.yaw+Math.PI*3)%(Math.PI*2)-Math.PI)};
 const next={};for(const key of ['x','y','z','yaw','pitch','fov','shear']){
  const limit=key==='yaw'?30*RAD:key==='pitch'?(state.glancing?70:cinematic?35:12)*RAD:key==='fov'?25:Infinity;
  const s=criticalStep(p[key],target[key],cameraVelocity[key]||0,step,omega,limit);next[key]=s.value;cameraVelocity[key]=s.velocity;
 }
 const distance=Math.hypot(next.x-p.x,next.y-p.y,next.z-p.z),max=(cinematic?60:5)*step;
 if(distance>max)for(const key of ['x','y','z']){next[key]=p[key]+(next[key]-p[key])*max/distance;cameraVelocity[key]*=max/distance;}
 // Guard the horizon while FOV catches up; only an explicit glance may exceed it.
 if(!state.glancing)next.pitch=Math.min(next.pitch,Math.atan(.24*Math.tan(next.fov*RAD/2)));
 engine.setPose(next.x,next.y,next.z,next.yaw,next.pitch,.59/Math.tan(next.fov*RAD/2),next.shear);
 cameraPose=next;state.cameraYaw=next.yaw;state.manualShear=next.shear;skyMix=0;domeRadius=SKY_RADIUS;cameraReturn=null;
}
function applyCam(dt){applyBeachTarget(glanceTarget(approvedBeachTarget()),dt,true);}
function beginBeachReturn(){if(cameraPose)cameraReturn={...cameraPose,fov:engine.camera.fov,progress:0};}
function applyRestingCamera(dt){
 const transition=cameraReturn;applyFreeCamera();if(!transition)return;
 transition.progress=Math.min(1,transition.progress+(reduced?1:dt));const k=transition.progress*transition.progress*(3-2*transition.progress),end={...cameraPose},yaw=transition.yaw+(((end.yaw-transition.yaw+Math.PI*3)%(Math.PI*2))-Math.PI)*k,pitch=mix(transition.pitch,end.pitch,k),fov=mix(transition.fov,engine.camera.fov,k),p=new THREE.Vector3(mix(transition.x,end.x,k),mix(transition.y,end.y,k),mix(transition.z,end.z,k));
 engine.setPose(p.x,p.y,p.z,yaw,pitch,.59/Math.tan(fov*RAD/2),HOME_LENS_SHIFT*k);cameraPose={x:p.x,y:p.y,z:p.z,yaw,pitch};state.cameraYaw=yaw;if(transition.progress===1)cameraReturn=null;
}
function updateCameraPose(dt,wantsSky){
 if(state.playing&&!state.paused)applyCam(dt);
 else if(state.userLook&&!state.sheetCameraLocked)applyUserLook(dt);
 else if(state.cameraReset){const target=manualTarget();applyBeachTarget(target,dt);if(Math.hypot(cameraPose.x-target.x,cameraPose.y-target.y,cameraPose.z-target.z)<.01&&Math.abs(cameraPose.yaw-target.yaw)<.001&&Math.abs(cameraPose.pitch-target.pitch)<.001){state.cameraReset=false;state.timeCameraHeld=true;}}
 else if(wantsSky||state.sheet)applyManualCamera(dt);
 else{cameraVelocity={};applyRestingCamera(dt);}
}
let groundRing,dropLine,pathTrail,sunHalo,cameraPose=null,skyMix=0,dayGeometry=null,beachSpot,shadowMeshes=[];
const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};
function sunPoint(t){const s=sunPosition(t);return new THREE.Vector3(...sceneVector(s.azimuth,s.altitude)).multiplyScalar(PATH_RADIUS).add(PATH_ORIGIN);}
function makePath(){
 const d=localDayStart(state.time);if(!engine||d===pathDay)return;pathDay=d;dayGeometry=sunDay(state.time);
 const scene=engine.scene;
 for(const o of [pathLine,tickGroup,sunMesh,sunHalo,groundRing,dropLine,pathTrail])if(o){scene.remove(o);o.traverse?.(m=>{m.geometry?.dispose();m.material?.dispose();});}
 const start=dayGeometry.sunrise??d+6*HOUR,end=dayGeometry.sunset??d+19*HOUR;
 engine.camera.near=.3;engine.camera.far=20000;
 pathPoints=Array.from({length:193},(_,i)=>{const t=mix(start,end,i/192);return{t,position:sunPoint(t)};});
 const lineMaterial=new THREE.LineBasicMaterial({color:0xfff4d6,transparent:true,opacity:.68,depthTest:false,depthWrite:false});
 pathLine=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pathPoints.map(p=>p.position)),lineMaterial);pathLine.renderOrder=115;scene.add(pathLine);
 pathTrail=new THREE.Line(pathLine.geometry.clone(),new THREE.LineBasicMaterial({color:0xffc459,transparent:true,opacity:.85,depthTest:false,depthWrite:false}));pathTrail.renderOrder=116;scene.add(pathTrail);
 tickGroup=new THREE.Group();for(let h=5;h<21;h++){const t=d+h*HOUR,s=sunPosition(t);if(s.altitude<0)continue;const p=sunPoint(t),out=p.clone().sub(PATH_ORIGIN).normalize();const tick=new THREE.Line(new THREE.BufferGeometry().setFromPoints([p.clone().addScaledVector(out,-.45),p.clone().addScaledVector(out,.45)]),lineMaterial.clone());tick.userData={hour:h,time:t,position:p};tick.renderOrder=117;tickGroup.add(tick);}scene.add(tickGroup);
 sunMesh=new THREE.Mesh(new THREE.SphereGeometry(.75,20,16),new THREE.MeshBasicMaterial({color:0xffe797,transparent:true,depthTest:false,depthWrite:false}));sunMesh.renderOrder=119;scene.add(sunMesh);
 const glow=document.createElement('canvas');glow.width=glow.height=128;const ctx=glow.getContext('2d'),gradient=ctx.createRadialGradient(64,64,2,64,64,64);gradient.addColorStop(0,'#fffbd9');gradient.addColorStop(.15,'#ffe19ce6');gradient.addColorStop(.38,'#f3a43a50');gradient.addColorStop(1,'#f3a43a00');ctx.fillStyle=gradient;ctx.fillRect(0,0,128,128);sunHalo=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(glow),transparent:true,depthTest:false,depthWrite:false,blending:THREE.AdditiveBlending}));sunHalo.scale.set(5,5,1);sunHalo.renderOrder=118;scene.add(sunHalo);
 const circle=Array.from({length:145},(_,i)=>{const a=i*Math.PI*2/144,x=Math.sin(a)*PATH_RADIUS,z=Math.cos(a)*PATH_RADIUS;return new THREE.Vector3(x,Math.max(groundHeight(x,z),0)+.06,z);});groundRing=new THREE.Line(new THREE.BufferGeometry().setFromPoints(circle),new THREE.LineBasicMaterial({color:0xa8dcd8,transparent:true,opacity:.55,depthTest:false,depthWrite:false}));groundRing.renderOrder=114;scene.add(groundRing);
 dropLine=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3()]),new THREE.LineDashedMaterial({color:0xffd577,transparent:true,opacity:.65,dashSize:1.8,gapSize:1.3,depthTest:false,depthWrite:false}));dropLine.renderOrder=114;scene.add(dropLine);
 $('#path-labels').innerHTML=tickGroup.children.map(m=>`<span class="path-tick" data-hour="${m.userData.hour}"></span>`).join('')+'<span class="horizon-marker" data-event="sunrise"></span><span class="horizon-marker" data-event="sunset"></span><span class="ground-letter" data-cardinal="E">E</span><span class="ground-letter" data-cardinal="W">W</span>';

 makeBeachSpot();
}
function groundHeight(x,z){return .105*(z-(-3.5+.45*Math.sin(x*.10)+.15*Math.sin(x*.29)));}
function makeBeachSpot(){
 if(beachSpot)return;
 const scene=engine.scene;
 // Grade the shared sky / water-light shaders together, so reflections agree.
 // Wave geometry, bathymetry, solar direction and camera remain unchanged.
 installDayLighting(scene);
 beachSpot=new THREE.Group();scene.add(beachSpot);
 // Keep the observer origin for solar geometry. The beach stand is
 // managed by forecast effects; no person or buoy occupies this group.
}
function solarProof(){
 const s=sunPosition(state.time),dir=uniforms.uSun.value.clone().normalize(),p=engine.project(dir.toArray());
 const cameraDir=new THREE.Vector3();engine.camera.getWorldDirection(cameraDir);
 const bearing=((SITE.facing+Math.atan2(cameraDir.x,-cameraDir.z)/RAD)%360+360)%360;
 const az=((SITE.facing+Math.atan2(dir.x,-dir.z)/RAD)%360+360)%360,el=Math.asin(dir.y)/RAD;
 let projected=null;if(p){const ray=new THREE.Vector3(p.x*2-1,1-p.y*2,.5).unproject(engine.camera).sub(engine.camera.position).normalize();projected={x:p.x*innerWidth,y:p.y*innerHeight,azimuth:((SITE.facing+Math.atan2(ray.x,-ray.z)/RAD)%360+360)%360,elevation:Math.asin(ray.y)/RAD};}
 return{time:state.time,azimuth:s.azimuth,elevation:s.altitude,renderAzimuth:az,renderElevation:el,relative:((s.azimuth-bearing+540)%360)-180,cameraBearing:bearing,cameraPosition:engine.camera.position.toArray(),lookBack:!!state.lookBack,projected,visible:!!p&&p.x>=0&&p.x<=1&&p.y>=0&&p.y<=1};
}
function updateCompass(){
 const now=performance.now();if(now-lastCompassAt<100)return;lastCompassAt=now;
 const heading=((SITE.facing+(state.cameraYaw||0)/RAD)%360+360)%360,scale=1.4;
 const letters={0:'N',45:'NE',90:'E',135:'SE',180:'S',225:'SW',270:'W',315:'NW'};
 $('#compass-strip').innerHTML=Array.from({length:24},(_,i)=>{const a=i*15,delta=((a-heading+540)%360)-180,x=innerWidth/2+delta*scale;return x>8&&x<innerWidth-8?`<span style="left:${x}px" class="${letters[a]?'major':''}">${letters[a]||''}</span>`:'';}).join('')+`<b>${Math.round(heading)}°</b>`;
}
function toggleLookBack(){state.lookBack=!state.lookBack;cameraPose=null;state.dirty=true;$('#look-back').textContent=state.lookBack?'Return to beach':'Look back';updateCompass();}
function setSkyView(active){holdTimeExploration();state.skyView=!!active;if(active)state.timeCameraHeld=true;state.lookBack=false;state.live=false;state.dirty=true;}
function domePoint(v){return v.clone().multiplyScalar(domeRadius/PATH_RADIUS).add(engine.camera.position);}
function sunPathScreen(){return pathPoints.map(p=>({t:p.t,...project(domePoint(p.position))}));}
function skyProof(){
 const s=sunPosition(state.time),v=sunPoint(state.time).sub(PATH_ORIGIN).normalize(),points=sunPathScreen();
 return{...solarProof(),skyMix,skyView:!!state.skyView,playing:state.playing,diagramAzimuth:((SITE.facing+Math.atan2(v.x,-v.z)/RAD)%360+360)%360,diagramElevation:Math.asin(v.y)/RAD,arcBounds:{left:Math.min(...points.map(p=>p.x)),right:Math.max(...points.map(p=>p.x)),top:Math.min(...points.map(p=>p.y)),bottom:Math.max(...points.map(p=>p.y)),allVisible:points.every(p=>p.visible&&p.x>0&&p.x<innerWidth&&p.y>0&&p.y<innerHeight)},sunrise:dayGeometry.sunrise,sunset:dayGeometry.sunset,cameraPitch:cameraPose.pitch/RAD};
}
function updateSunCamera(dt){
 makePath();const s=sunPosition(state.time),day=dayGeometry,wantsSky=!!state.skyView||!!state.timeCameraHeld||state.playing;
 sunEl=s.altitude;sunRel=((s.azimuth-SITE.facing+540)%360)-180;sunDir.set(...sceneVector(s.azimuth,s.altitude));updateCameraPose(dt,wantsSky);if(state.playing||state.scrubbing)updateUVArc();
 const p=cameraPose;updateCompass();
 const heading=((SITE.facing+p.yaw/RAD)%360+360)%360,diagram=skyMix>.5;
 const facing=$('#facing-label');facing.hidden=false;facing.textContent=wantsSky?`Facing ${compass(heading)} · following the sun`:'Drag the sun or timeline to explore';
 // A celestial sphere in world coordinates: translation follows the observer,
 // orientation stays fixed to geographic azimuth/elevation. No camera parallax.
 for(const object of [pathLine,pathTrail,tickGroup]){object.position.copy(engine.camera.position);object.scale.setScalar(domeRadius/PATH_RADIUS);object.visible=true;}
 pathLine.material.opacity=.68;pathTrail.material.opacity=0;
 const point=sunDir.clone().multiplyScalar(domeRadius).add(engine.camera.position);
 const solarRadius=engine.camera.position.distanceTo(point)*Math.tan(engine.camera.fov*RAD/2)*14/innerHeight;
 sunMesh.scale.setScalar(solarRadius/.75);sunMesh.position.copy(point);sunHalo.position.copy(point);sunHalo.scale.set(solarRadius*5,solarRadius*5,1);
 sunMesh.visible=s.altitude>-.9;sunHalo.visible=s.altitude>-.9;sunHalo.material.opacity=.5;
 sunMesh.material.color.set(s.altitude<10?0xffd58c:0xfff5bd);
 updateForecastClouds(point);
 const progress=clamp((state.time-day.sunrise)/Math.max(1,day.sunset-day.sunrise),0,1);pathTrail.geometry.setDrawRange(0,Math.round(progress*(pathPoints.length-1))+1);
 groundRing.scale.setScalar(domeRadius/PATH_RADIUS);groundRing.visible=false;groundRing.material.opacity=skyMix*.45;
 dropLine.visible=false;const foot=point.clone();foot.y=Math.max(groundHeight(foot.x,foot.z),0)+.08;dropLine.geometry.setFromPoints([point,foot]);dropLine.computeLineDistances();dropLine.material.opacity=.25*skyMix;dropLine.material.dashSize=.7;dropLine.material.gapSize=.6;
 const screen=project(point),handle=$('#sun-handle'),bottom=wantsSky?innerHeight-80:state.sheet?innerHeight*(state.sheet==='sun'?.59:.44):innerHeight-225;
 const visible=screen.visible&&screen.x>10&&screen.x<innerWidth-10&&screen.y>26&&screen.y<bottom&&(diagram||s.altitude>-.9);
 const scrim=$('.sky-scrim');scrim.style.maskImage=visible?`radial-gradient(circle at ${screen.x}px ${screen.y}px,transparent 0 12px,#000 30px)`:'none';scrim.style.webkitMaskImage=scrim.style.maskImage;
 handle.hidden=!visible;handle.style.left=screen.x+'px';handle.style.top=screen.y+'px';handle.classList.toggle('right',screen.x>innerWidth-150);handle.classList.remove('edge');
 const hero=$('#hero').getBoundingClientRect();$('#sun-time').style.setProperty('top',screen.y<hero.bottom+55?'24px':'-31px','important');const collides=(px,py)=>px>hero.left-55&&px<hero.right+55&&py>hero.top-22&&py<hero.bottom+24;
 for(const tick of tickGroup.children){tick.material.opacity=.8;const el=$(`[data-hour="${tick.userData.hour}"]`);if(!el)continue;const pos=project(domePoint(tick.userData.position)),y=pos.y+(tick.userData.hour%2?27:-27);el.hidden=!pos.visible||pos.x<24||pos.x>innerWidth-24||y<85||y>bottom||collides(pos.x,y)||Math.hypot(pos.x-screen.x,pos.y-screen.y)<30;el.style.left=pos.x+'px';el.style.top=y+'px';}
 for(const event of ['sunrise','sunset']){const el=$(`[data-event="${event}"]`),pos=project(domePoint(sunPoint(day[event])));el.hidden=skyMix<.8||!pos.visible||pos.x<0||pos.x>innerWidth||pos.y<hero.bottom+22||pos.y>bottom-25;el.textContent=`${event==='sunrise'?'Sunrise':'Sunset'} ${clock(Math.round(day[event]/MIN)*MIN)}`;el.style.left=clamp(pos.x,76,innerWidth-76)+'px';el.style.top=(pos.y+23)+'px';}
 for(const [letter,angle] of [['E',90],['W',270]]){const v=new THREE.Vector3(...sceneVector(angle,0)).multiplyScalar(PATH_RADIUS);v.y=Math.max(groundHeight(v.x,v.z),0)+.08;const pos=project(domePoint(v)),el=$(`[data-cardinal="${letter}"]`);el.hidden=skyMix<.8||!pos.visible||pos.x<0||pos.x>innerWidth||pos.y<hero.bottom+22||pos.y>bottom;el.style.left=clamp(pos.x+(letter==='E'?-14:14),18,innerWidth-18)+'px';el.style.top=(pos.y-13)+'px';}
 const rel=((s.azimuth-heading+540)%360)-180,behind=Math.abs(rel)>90,edge=$('#sun-edge'),above=screen.visible&&screen.y<innerHeight*.015&&s.altitude>0;
 edge.hidden=!wantsSky||visible||!above||['water','waves','wind'].includes(state.sheet);edge.dataset.above=String(above);
 if(!edge.hidden){edge.textContent=`☀ ${Math.round(s.altitude)}° up`;edge.setAttribute('aria-label',edge.textContent+' · Tap to glance up');}
 $('#solar-debug').hidden=!state.debug;$('#look-back').hidden=true;
 $('#solar-debug').textContent=`Az ${s.azimuth.toFixed(2)}°\nEl ${s.altitude.toFixed(2)}°\nView ${heading.toFixed(1)}°`;
 const light=uniforms.uSun.value,den=light.y-.105*light.z;
 if(Math.abs(den)>.04){const n=new THREE.Vector3(0,1,-.105),l=light;const matrix=new THREE.Matrix4().set(1-l.x*n.x/den,-l.x*n.y/den,-l.x*n.z/den,l.x*.3675/den,-l.y*n.x/den,1-l.y*n.y/den,-l.y*n.z/den,l.y*.3675/den,-l.z*n.x/den,-l.z*n.y/den,1-l.z*n.z/den,l.z*.3675/den,0,0,0,1);beachSpot.updateMatrixWorld(true);for(const {source,shadow} of shadowMeshes){shadow.visible=s.altitude>1;shadow.matrix.copy(matrix).multiply(source.matrixWorld);shadow.matrix.elements[13]+=.035;}}else shadowMeshes.forEach(o=>o.shadow.visible=false);
 $('#app').dataset.camera='beach';
 $('#app').dataset.sky=wantsSky?'true':'false';$('#release-hint').hidden=!state.skyView||state.playing;$('#release-hint').textContent='Drag the sun along its path';
}
$('#sun-edge').addEventListener('click',requestSunGlance);
// Preserve the requested 30% speed-up over the 20-second reference.
const WATCH_DURATION_MS=20000/1.3;
function startWatch(){
 if(state.playing)return;holdTimeExploration();state.watchRestore={time:state.time,live:state.live,sheet:state.sheet,orbit:{...freeOrbit},current:{...current},phase:uniforms.uPhase.value,sceneTime:uniforms.uTime.value};state.lookBack=false;state.skyView=false;state.watchDay=sunDay(state.time);state.playing=true;state.paused=false;state.playProgress=0;state.playStart=performance.now();state.live=false;openSheet(null);$('#app').dataset.playing='true';watchAt(0);cameraReturn=null;
}
function watchAt(f){const day=state.watchDay||sunDay(state.time);state.playProgress=clamp(f,0,1);setTime(mix(day.sunrise??day.start+6*HOUR,day.sunset??day.start+19*HOUR,state.playProgress));}
function advanceWatch(now){if(state.paused)return;watchAt((now-state.playStart)/WATCH_DURATION_MS);if(state.playProgress>=1)stopWatch(true);}
function stopWatch(restore=true){if(state.playing){holdTimeExploration();beginBeachReturn();}const wasPlaying=state.playing;state.playing=false;state.skyView=false;state.paused=false;delete $('#app').dataset.playing;if(wasPlaying&&state.watchRestore){const saved=state.watchRestore;setTime(saved.time,{live:saved.live});freeOrbit={...saved.orbit};Object.assign(current,saved.current);uniforms.uPhase.value=saved.phase;uniforms.uTime.value=saved.sceneTime;openSheet(saved.sheet);state.watchRestore=null;}state.dirty=true;}
