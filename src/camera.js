const PATH_RADIUS=120,PATH_ORIGIN=new THREE.Vector3(0,3.5,14);
let groundRing,dropLine,pathTrail,sunHalo,cameraPose=null,dayGeometry=null;
const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};
function sunPoint(t){const s=sunPosition(t);return new THREE.Vector3(...sceneVector(s.azimuth,s.altitude)).multiplyScalar(PATH_RADIUS).add(PATH_ORIGIN);}
function makePath(){
 const d=localDayStart(state.time);if(!engine||d===pathDay)return;pathDay=d;dayGeometry=sunDay(state.time);
 const scene=engine.buoy.group.parent;
 for(const o of [pathLine,tickGroup,sunMesh,sunHalo,groundRing,dropLine,pathTrail])if(o){scene.remove(o);o.traverse?.(m=>{m.geometry?.dispose();m.material?.dispose();});}
 const start=dayGeometry.sunrise??d+6*HOUR,end=dayGeometry.sunset??d+19*HOUR;
 pathPoints=Array.from({length:193},(_,i)=>{const t=mix(start,end,i/192);return{t,position:sunPoint(t)};});
 const lineMaterial=new THREE.LineBasicMaterial({color:0xfff4d6,transparent:true,opacity:.68,depthTest:false,depthWrite:false});
 pathLine=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pathPoints.map(p=>p.position)),lineMaterial);pathLine.renderOrder=115;scene.add(pathLine);
 pathTrail=new THREE.Line(pathLine.geometry.clone(),new THREE.LineBasicMaterial({color:0xffc459,transparent:true,opacity:.85,depthTest:false,depthWrite:false}));pathTrail.renderOrder=116;scene.add(pathTrail);
 tickGroup=new THREE.Group();for(let h=5;h<21;h++){const t=d+h*HOUR,s=sunPosition(t);if(s.altitude<0)continue;const p=sunPoint(t),out=p.clone().sub(PATH_ORIGIN).normalize();const tick=new THREE.Line(new THREE.BufferGeometry().setFromPoints([p.clone().addScaledVector(out,-.9),p.clone().addScaledVector(out,.9)]),lineMaterial.clone());tick.userData={hour:h,time:t,position:p};tick.renderOrder=117;tickGroup.add(tick);}scene.add(tickGroup);
 sunMesh=new THREE.Mesh(new THREE.SphereGeometry(1.2,20,16),new THREE.MeshBasicMaterial({color:0xffe797,transparent:true,depthTest:false,depthWrite:false}));sunMesh.renderOrder=119;scene.add(sunMesh);
 const glow=document.createElement('canvas');glow.width=glow.height=128;const ctx=glow.getContext('2d'),gradient=ctx.createRadialGradient(64,64,2,64,64,64);gradient.addColorStop(0,'#fffbd9');gradient.addColorStop(.15,'#ffe19ce6');gradient.addColorStop(.38,'#f3a43a50');gradient.addColorStop(1,'#f3a43a00');ctx.fillStyle=gradient;ctx.fillRect(0,0,128,128);sunHalo=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(glow),transparent:true,depthTest:false,depthWrite:false,blending:THREE.AdditiveBlending}));sunHalo.scale.set(12,12,1);sunHalo.renderOrder=118;scene.add(sunHalo);
 const circle=Array.from({length:145},(_,i)=>{const a=i*Math.PI*2/144,x=Math.sin(a)*PATH_RADIUS,z=14+Math.cos(a)*PATH_RADIUS;return new THREE.Vector3(x,Math.max(.3,.105*(z+3.5)+.2),z);});groundRing=new THREE.Line(new THREE.BufferGeometry().setFromPoints(circle),new THREE.LineBasicMaterial({color:0xa8dcd8,transparent:true,opacity:.55,depthTest:false,depthWrite:false}));groundRing.renderOrder=114;scene.add(groundRing);
 dropLine=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3()]),new THREE.LineDashedMaterial({color:0xffd577,transparent:true,opacity:.65,dashSize:1.8,gapSize:1.3,depthTest:false,depthWrite:false}));dropLine.renderOrder=114;scene.add(dropLine);
 $('#path-labels').innerHTML=tickGroup.children.filter(m=>m.userData.hour%2===0).map(m=>`<span class="path-tick" data-hour="${m.userData.hour}">${m.userData.hour>12?m.userData.hour-12:m.userData.hour}${m.userData.hour>=12?'p':'a'}</span>`).join('');
}
function updateSunCamera(dt){
 makePath();const s=sunPosition(state.time),day=dayGeometry,ratio=clamp((s.altitude-7)/Math.max(20,day.noonAltitude-7),0,1),dome=smooth(.25,.94,ratio);
 const az=((s.azimuth-SITE.facing+540)%360-180)*RAD;
 const y=mix(3.5,113,dome),z=mix(14,314,dome),yaw=az*(1-dome),pitch=mix(clamp(s.altitude*.30,-2,13)*RAD,Math.atan2(45-y,z+12),dome),zoom=mix(.92,.56,dome);
 // Lens shift allocates the view to the unobscured scene; the path is always 3D.
 const horizon=state.playing?.56:state.sheet?(state.sheet==='sun'?.38:.26):.43;
 const lowShear=(1-2*horizon)*.59+Math.tan(pitch)*zoom;
 const domeShear=state.playing?-.015:state.sheet?(state.sheet==='sun'?.13:.26):-.15;
 const target={x:0,y,z,yaw,pitch,zoom,shear:mix(lowShear,domeShear,dome)};
 const k=reduced||dt>1?1:1-Math.exp(-dt*7);if(!cameraPose)cameraPose={...target};else for(const key of Object.keys(target))cameraPose[key]=mix(cameraPose[key],target[key],k);
 const p=cameraPose;engine.setPose(p.x,p.y,p.z,p.yaw,p.pitch,p.zoom,p.shear);
 const point=sunPoint(state.time);sunMesh.position.copy(point);sunHalo.position.copy(point);sunMesh.visible=sunHalo.visible=s.altitude>-.9;
 const progress=clamp((state.time-(day.sunrise??day.start))/(Math.max(1,(day.sunset??day.end)-(day.sunrise??day.start))),0,1);pathTrail.geometry.setDrawRange(0,Math.round(progress*(pathPoints.length-1))+1);
 groundRing.visible=dropLine.visible=dome>.12;groundRing.material.opacity=dome*.5;dropLine.material.opacity=dome*.7;
 const groundY=Math.max(current.tide+.15,.105*(point.z+3.5)+.15),a=dropLine.geometry.attributes.position;a.setXYZ(0,point.x,point.y,point.z);a.setXYZ(1,point.x,groundY,point.z);a.needsUpdate=true;dropLine.computeLineDistances();
 const screen=project(point),handle=$('#sun-handle'),bottom=state.playing?innerHeight-85:state.sheet?innerHeight*(state.sheet==='sun'?.59:.44):innerHeight-240;
 handle.hidden=!screen.visible||s.altitude<-.9||screen.x<10||screen.x>innerWidth-10||screen.y<75||screen.y>bottom;handle.style.left=screen.x+'px';handle.style.top=screen.y+'px';handle.classList.toggle('right',screen.x>innerWidth-110);handle.classList.remove('edge');
 for(const tick of tickGroup.children){const el=$(`[data-hour="${tick.userData.hour}"]`);if(!el)continue;const pos=project(tick.userData.position);el.hidden=!pos.visible||pos.x<14||pos.x>innerWidth-14||pos.y<85||pos.y>bottom||Math.hypot(pos.x-screen.x,pos.y-screen.y)<38;el.style.left=pos.x+'px';el.style.top=(pos.y-12)+'px';}
 $('#app').dataset.camera=dome>.75?'dome':dome>.1?'rising':'beach';
}
function startWatch(){
 state.watchRestore={time:state.time,live:state.live,sheet:state.sheet};state.watchDay=sunDay(state.time);state.playing=true;state.paused=false;state.playProgress=0;state.playStart=performance.now();state.live=false;openSheet(null);$('#app').dataset.playing='true';watchAt(0);
}
function watchAt(f){const day=state.watchDay||sunDay(state.time);state.playProgress=clamp(f,0,1);setTime(mix(day.sunrise??day.start+6*HOUR,day.sunset??day.start+19*HOUR,state.playProgress));}
function advanceWatch(now){if(state.paused)return;watchAt((now-state.playStart)/20000);if(state.playProgress>=1)stopWatch(false);}
function stopWatch(restore=false){state.playing=false;state.paused=false;delete $('#app').dataset.playing;if(restore&&state.watchRestore){setTime(state.watchRestore.time,{live:state.watchRestore.live});openSheet(state.watchRestore.sheet);}state.dirty=true;}
