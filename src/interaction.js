// Authority: INTERACTION-CONTRACT.md. Scene gestures NEVER call setTime.
// Input ownership is chosen on pointerdown and held until release/cancel.
let timeGesture=null,timeMotion=null,dockCompact=false,dockRestoreAt=0;
let sceneGesture=null,lastSceneTap=null,lookInertia={yaw:0,pitch:0},lookVelocity={};
const scenePointers=new Map();
function captureUserView(){
 if(!state.userLook||state.sheetCameraLocked){const p=cameraPose||{x:0,y:10,z:28,yaw:0,pitch:-11*RAD};state.userLook={...p,fov:engine.camera.fov,shear:uniforms.uShear.value,anchorYaw:p.yaw};}
 cameraVelocity={};cameraReturn=null;sunGlance=null;storyGlancePose=null;glanceReturning=false;state.glancing=false;state.storyEndPose=null;state.cameraReset=false;state.sheetCameraLocked=false;
 return state.userLook;
}
function clearUserView(){state.userLook=null;sceneGesture=null;scenePointers.clear();lookInertia={yaw:0,pitch:0};lookVelocity={};lastSceneTap=null;cameraVelocity={};state.cameraReset=false;}
function resetCurrentView(){
 cancelTimeMotion();clearUserView();state.storyEndPose=null;state.sheetCameraLocked=!!state.sheet;state.cameraReset=true;state.dirty=true;
}
function scenePair(){const p=[...scenePointers.values()];return p.length>=2?Math.max(1,Math.hypot(p[1].x-p[0].x,p[1].y-p[0].y)):0;}
function beginSceneGesture(e,pinching=false){
 timeGesture=null;timeMotion=null;exploreGesture=null;state.scrubbing=false;qualityRestoreAt=0;setDragQuality(false);
 const p=captureUserView();lookInertia={yaw:0,pitch:0};lookVelocity={};dockRestoreAt=0;setDockCompact(true);
 sceneGesture={id:e.pointerId,kind:pinching?'pinch':'look',x:e.clientX,y:e.clientY,lastX:e.clientX,lastY:e.clientY,yaw:p.yaw,pitch:p.pitch,fov:p.fov,distance:scenePair(),at:performance.now(),moved:pinching,wasPinch:pinching};
 $('#app').dataset.looking='true';
}
function moveSceneGesture(e){
 const g=sceneGesture;if(!g||!scenePointers.has(e.pointerId))return;
 e.preventDefault();scenePointers.set(e.pointerId,{x:e.clientX,y:e.clientY});const p=state.userLook;if(!p)return;
 if(g.kind==='pinch'){p.fov=clamp(2*Math.atan(Math.tan(g.fov*RAD/2)*g.distance/scenePair())/RAD,35,80);g.moved=true;state.dirty=true;return;}
 if(e.pointerId!==g.id)return;
 const dx=e.clientX-g.x,dy=e.clientY-g.y;if(Math.hypot(dx,dy)>4)g.moved=true;if(!g.moved)return;
 const now=performance.now(),dt=Math.max(.008,(now-g.at)/1000),scale=2*Math.atan(Math.tan(p.fov*RAD/2)*innerWidth/innerHeight)/innerWidth;
 const yaw=clamp(g.yaw-dx*scale,p.anchorYaw-Math.PI/2,p.anchorYaw+Math.PI/2),pitch=clamp(g.pitch+dy*p.fov*RAD/innerHeight,-20*RAD,60*RAD);
 lookInertia.yaw=clamp((yaw-p.yaw)/dt,-90*RAD,90*RAD);lookInertia.pitch=clamp((pitch-p.pitch)/dt,-60*RAD,60*RAD);
 p.yaw=yaw;p.pitch=pitch;g.lastX=e.clientX;g.lastY=e.clientY;g.at=now;state.dirty=true;
}
function finishSceneGesture(e){
 const g=sceneGesture;if(!g||!scenePointers.has(e.pointerId))return;
 scenePointers.delete(e.pointerId);
 if(scenePointers.size){const [id,p]=scenePointers.entries().next().value;beginSceneGesture({pointerId:id,clientX:p.x,clientY:p.y});sceneGesture.moved=true;sceneGesture.wasPinch=true;return;}
 const now=performance.now();if(e.type!=='pointerup'||g.wasPinch||now-g.at>100||!g.moved||reduced)lookInertia={yaw:0,pitch:0};
 if(!g.moved&&e.type==='pointerup'){
  if(lastSceneTap&&now-lastSceneTap.at<320&&Math.hypot(e.clientX-lastSceneTap.x,e.clientY-lastSceneTap.y)<28)resetCurrentView();
  else lastSceneTap={at:now,x:e.clientX,y:e.clientY};
 }else lastSceneTap=null;
 sceneGesture=null;delete $('#app').dataset.looking;dockRestoreAt=now+1500;ignoreClickUntil=now+400;state.dirty=true;
}
function applyUserLook(dt){
 const p=state.userLook;if(!p)return;const step=clamp(dt,0,.05);
 if(!sceneGesture){const decay=Math.exp(-step*9),gain=(1-decay)/9;p.yaw=clamp(p.yaw+lookInertia.yaw*gain,p.anchorYaw-Math.PI/2,p.anchorYaw+Math.PI/2);p.pitch=clamp(p.pitch+lookInertia.pitch*gain,-20*RAD,60*RAD);lookInertia.yaw*=decay;lookInertia.pitch*=decay;}
 const current=cameraPose||p,out={...p};
 for(const key of ['yaw','pitch','fov']){const s=criticalStep(key==='fov'?engine.camera.fov:current[key],p[key],lookVelocity[key]||0,step,24);out[key]=s.value;lookVelocity[key]=s.velocity;}
 engine.setPose(p.x,p.y,p.z,out.yaw,out.pitch,.59/Math.tan(out.fov*RAD/2),p.shear);cameraPose=out;state.cameraYaw=out.yaw;state.manualShear=p.shear;skyMix=0;domeRadius=SKY_RADIUS;
}
// Sun dragging uses both axes on the real, projected ephemeris. Incremental
// pointer motion excludes the camera's own motion: a stationary finger never
// advances the clock just because the camera is catching up.
function sunDragTime(dx,dy,bounds){
 if(Math.hypot(dx,dy)<.01)return state.time;
 const here=project(domePoint(sunPoint(state.time))),points=sunPathScreen();
 if(!here.visible)return state.time;
 const x=here.x+dx,y=here.y+dy;let best=state.time,distance=Infinity;
 for(let i=1;i<points.length;i++){
  const a=points[i-1],b=points[i];if(!a.visible||!b.visible)continue;
  if(b.t<state.time-2*HOUR||a.t>state.time+2*HOUR)continue;
  const vx=b.x-a.x,vy=b.y-a.y,length=vx*vx+vy*vy;if(length<.001)continue;
  const f=clamp(((x-a.x)*vx+(y-a.y)*vy)/length,0,1),t=mix(a.t,b.t,f);
  const d=Math.hypot(x-a.x-vx*f,y-a.y-vy*f);
  if(d<distance){distance=d;best=t;}
 }
 return clampDay(best,bounds);
}
const momentCache=new Map();
function dayDetents(t){
 const d=localDayStart(t),key=d+':'+state.version;if(momentCache.has(key))return momentCache.get(key);
 const day=sunDay(t),rows=state.data.rows.filter(r=>r.time>=d&&r.time<d+24*HOUR&&Number.isFinite(r.uv)),peak=rows.reduce((a,b)=>!a||b.uv>a.uv?b:a,null);
 const moments=[day.sunrise,peak?.uv>0?peak.time:null,day.sunset].filter(Number.isFinite);momentCache.set(key,moments);return moments;
}
function nearestDetent(t){const moments=dayDetents(t),special=moments.find(v=>Math.abs(v-t)<12*MIN);return special??Math.round(t/HOUR)*HOUR;}
function timeHaptic(kind){if(window.webkit?.messageHandlers?.daybuoyHaptic)window.webkit.messageHandlers.daybuoyHaptic.postMessage({kind});else navigator.vibrate?.(kind==='moment'?[10,15,10]:6);}
function setDockCompact(value){dockCompact=value;$('#app').dataset.dockCompact=String(value);state.dirty=true;}
function cancelTimeMotion(){sunGlance=null;timeMotion=null;timeGesture=null;sceneGesture=null;scenePointers.clear();lookInertia={yaw:0,pitch:0};exploreGesture=null;state.scrubbing=false;dockRestoreAt=0;qualityRestoreAt=0;delete $('#app').dataset.looking;setDragQuality(false);}
function beginTimeGesture(e,kind){
 if(!['sun','week','curve'].includes(kind))throw Error('Scene input cannot own forecast time');
 if(state.playing&&state.paused)stopWatch(false);
 state.storyEndPose=null;sunGlance=null;lookInertia={yaw:0,pitch:0};
 if(kind==='curve'&&['water','waves','wind'].includes(state.sheet))state.sheetCameraLocked=true;
 setDragQuality(true);
 timeMotion=null;dockRestoreAt=0;setDockCompact(true);const target=kind==='week'?$('#week-scrubber'):kind==='curve'?e.target.closest('[data-ribbon]'):$('#ocean');
 try{$('#app').setPointerCapture?.(e.pointerId);}catch{}timeGesture={id:e.pointerId,kind,x:e.clientX,y:e.clientY,start:state.time,bounds:selectedDayBounds(),edge:null,at:performance.now(),lastX:e.clientX,lastY:e.clientY,velocity:0,axis:null,moved:false,rect:target.getBoundingClientRect(),lastMoment:null};
 exploreGesture={kind:'time'};state.scrubbing=true;state.dirty=true;
 if(state.sheet){peekKind=state.sheet;renderSheetPeek();}
}
function moveTimeGesture(e){
 const g=timeGesture;if(!g||g.id!==e.pointerId)return;const dx=e.clientX-g.x,dy=e.clientY-g.y;
 if(!g.axis&&Math.hypot(dx,dy)>7)g.axis=g.kind==='sun'?'path':Math.abs(dx)>Math.abs(dy)*1.2?'x':'y';if(g.axis!=='x'&&g.axis!=='path')return;
 e.preventDefault();g.moved=true;setSkyView(true);const now=performance.now(),elapsed=Math.max(.012,(now-g.at)/1000),span=g.bounds.end-g.bounds.start,width=g.rect.width;
 const raw=g.kind==='sun'?sunDragTime(e.clientX-g.lastX,e.clientY-g.lastY,g.bounds):g.kind==='week'?g.bounds.start+(e.clientX-g.rect.left)/width*span:g.start+dx/width*span;g.velocity=g.kind==='sun'?0:mix(g.velocity,clamp((e.clientX-g.lastX)/width*span/elapsed,-180*HOUR,180*HOUR),.65);g.lastX=e.clientX;g.lastY=e.clientY;g.at=now;
 const edge=raw<=g.bounds.min?'start':raw>=g.bounds.max?'end':null;if(edge&&edge!==g.edge)timeHaptic('boundary');g.edge=edge;setTime(clampDay(raw,g.bounds));if(edge)g.velocity=0;const moment=dayDetents(state.time).find(t=>Math.abs(t-state.time)<6*MIN);if(moment&&moment!==g.lastMoment){timeHaptic('moment');g.lastMoment=moment;}
}
function finishTimeGesture(e){
 qualityRestoreAt=performance.now()+300;
 const g=timeGesture;if(!g||g.id!==e.pointerId)return;
 if(e.type!=='pointerup'){timeMotion=null;ignoreClickUntil=performance.now()+400;}
 else if(g.moved){const velocity=performance.now()-g.at<120?g.velocity:0;timeMotion=g.kind==='sun'?null:Math.abs(velocity)>2*HOUR?{velocity,phase:'coast',bounds:g.bounds}:{phase:'settle',bounds:g.bounds,target:clampDay(nearestDetent(state.time),g.bounds)};ignoreClickUntil=performance.now()+400;}
 else if(g.axis!=='y'&&g.kind==='week'){setSkyView(true);scrubWeek(e.clientX);}
 state.scrubbing=false;if(g.moved||g.kind==='week')setSkyView(false);timeGesture=null;exploreGesture=null;scenePointers.delete(e.pointerId);dockRestoreAt=performance.now()+1500;state.dirty=true;
}
function updateInteraction(dt){
 if(qualityRestoreAt&&performance.now()>=qualityRestoreAt&&!timeGesture&&!timeMotion){setDragQuality(false);qualityRestoreAt=0;}
 updateTideMark();
 if(timeMotion&&(!state.playing||state.paused)&&!timeGesture){const m=timeMotion;
  if(m.phase==='coast'){const decay=Math.exp(-dt*4.2),previous=state.time;const raw=state.time+m.velocity*(1-decay)/4.2;setTime(clampDay(raw,m.bounds));m.velocity*=decay;if(raw<m.bounds.min||raw>m.bounds.max){timeHaptic('boundary');timeMotion=null;}else if(Math.abs(m.velocity)<.7*HOUR||state.time===previous){m.phase='settle';m.target=clampDay(nearestDetent(state.time),m.bounds);}}
  else{const d=m.target-state.time;setTime(Math.abs(d)<2000?m.target:state.time+d*(1-Math.exp(-dt*14)));if(Math.abs(d)<2000){timeMotion=null;timeHaptic(dayDetents(state.time).some(t=>Math.abs(t-state.time)<MIN)?'moment':'hour');}}
 }
 if(dockRestoreAt&&performance.now()>=dockRestoreAt&&!timeGesture&&!timeMotion&&!sceneGesture){setDockCompact(false);dockRestoreAt=0;}
 // Position runs at animation cadence; text stays independently capped at 10 Hz.
 const track=$('#week-scrubber');if(track){const bounds=selectedDayBounds();track.style.setProperty('--selected',clamp((state.time-bounds.start)/(bounds.end-bounds.start)*100,0,100)+'%');}
}
function interactionPointerDown(e){
 if(e.button>0)return;
 const scene=!!e.target.closest('#ocean,#sun-handle');
 const justPaused=state.playing&&!state.paused;
 if(justPaused){pauseStoryForInteraction();ignoreClickUntil=performance.now()+400;if(!scene){e.preventDefault();e.stopImmediatePropagation();return;}}
 if(storyCard&&scene)stopWatch(false);
 // A second scene contact promotes look/sun to pinch. Dock touches cannot.
 if(scene&&scenePointers.size===1&&!scenePointers.has(e.pointerId)){
  e.preventDefault();e.stopImmediatePropagation();scenePointers.set(e.pointerId,{x:e.clientX,y:e.clientY});try{$('#app').setPointerCapture(e.pointerId);}catch{}beginSceneGesture(e,true);return;
 }
 if(scenePointers.size||timeGesture||sceneGesture||e.isPrimary===false)return;
 const kind=justPaused&&scene?'look':e.target.closest('#week-scrubber')?'week':e.target.closest('[data-ribbon]')?'curve':e.target.closest('#sun-handle')?'sun':e.target.closest('#ocean')?'look':null;
 if(!kind)return;e.preventDefault();e.stopImmediatePropagation();
 // Stop the first-open animation from changing time underneath an active hand.
 if(intro){intro=null;$('#welcome-line')?.remove();$('#app').classList.remove('first-open');}
 if(scene){scenePointers.set(e.pointerId,{x:e.clientX,y:e.clientY});try{$('#app').setPointerCapture(e.pointerId);}catch{}}
 if(kind==='look')beginSceneGesture(e);else beginTimeGesture(e,kind);
}
function interactionPointerMove(e){
 if(sceneGesture){e.stopImmediatePropagation();moveSceneGesture(e);}
 else if(timeGesture){if(scenePointers.has(e.pointerId))scenePointers.set(e.pointerId,{x:e.clientX,y:e.clientY});e.stopImmediatePropagation();moveTimeGesture(e);}
}
function interactionPointerEnd(e){if(sceneGesture){e.stopImmediatePropagation();finishSceneGesture(e);}else if(timeGesture){e.stopImmediatePropagation();finishTimeGesture(e);}}
document.addEventListener('pointerdown',interactionPointerDown,{capture:true,passive:false});
document.addEventListener('pointermove',interactionPointerMove,{capture:true,passive:false});
for(const type of ['pointerup','pointercancel','lostpointercapture'])document.addEventListener(type,interactionPointerEnd,true);
document.addEventListener('dblclick',e=>{if(e.target.closest('#ocean')){e.preventDefault();resetCurrentView();}},true);
window.__interaction={proof:()=>({owner:sceneGesture?.kind||timeGesture?.kind||null,gesture:timeGesture?{kind:timeGesture.kind,axis:timeGesture.axis,bounds:timeGesture.bounds}:null,momentum:!!timeMotion,compact:dockCompact,manualView:state.userLook?{...state.userLook}:null}),cancelTimeMotion,resetCurrentView};
// One approved beach target for direct sun dragging, the timeline and playback.
function manualTarget(){
 if(['water','waves','wind'].includes(state.sheet)){const water=state.sheet==='water';return{x:0,y:water?3.8:6,z:water?14:20,yaw:0,pitch:(water?-9:-6)*RAD,fov:64,shear:0};}
 if(sunEl<-8)return{x:0,y:10,z:28,yaw:0,pitch:-11*RAD,fov:55,shear:0};
 return approvedBeachTarget();
}
function applyManualCamera(dt){
 if(state.userLook&&!state.sheetCameraLocked){applyUserLook(dt);return;}
 if(state.storyEndPose){const p=state.storyEndPose;engine.setPose(p.x,p.y,p.z,p.yaw,p.pitch,.59/Math.tan(p.fov*RAD/2),p.shear);cameraPose={...p};state.cameraYaw=p.yaw;return;}
 applyBeachTarget(glanceTarget(manualTarget()),dt);
}
let tideMark=null,tideMarkLabel=null;
function updateTideMark(){
 if(!engine)return;
 if(!tideMark){tideMark=new THREE.Line(new THREE.BufferGeometry(),new THREE.LineBasicMaterial({color:0xe5f4fa,transparent:true,opacity:.6,depthWrite:false}));engine.scene.add(tideMark);tideMarkLabel=document.createElement('span');tideMarkLabel.id='tide-mark';$('#app').append(tideMarkLabel);}
 const d=localDayStart(state.time),high=state.data.tideEvents?.find(e=>e.type==='H'&&e.time>=d&&e.time<d+24*HOUR),show=state.sheet==='water'&&!!high&&realForecast();tideMark.visible=show;tideMarkLabel.hidden=!show;if(!show)return;
 const z=-3.5+high.level/.105,points=[-9,-4,0,4,9].map(x=>new THREE.Vector3(x,groundHeight(x,z)+.025,z));tideMark.geometry.setFromPoints(points);const p=project(points[3]);tideMarkLabel.textContent='High '+clock(high.time);tideMarkLabel.hidden=!p.visible||p.y<innerHeight*.3||p.y>innerHeight-170;tideMarkLabel.style.left=clamp(p.x,60,innerWidth-90)+'px';tideMarkLabel.style.top=p.y-19+'px';
}
function renderInteractionReadout(){
 let line=$('#compact-values');if(!line){line=document.createElement('p');line.id='compact-values';$('#glass-dock').append(line);}
 line.textContent=realForecast()?metrics().map(([key,name,value])=>(key==='sun'?'UV ':'')+value).join(' · '):'Forecast unavailable';line.setAttribute('aria-label','Air, water, waves, wind and UV');
 const peek=$('#sheet-peek-line');if(peek)peek.textContent=clock(state.time)+' · '+(state.sheet==='water'&&Number.isFinite(conditions().tide)?'Tide '+(conditions().tide*FT).toFixed(1)+' ft · NOAA':hourVerdict());
}

// Single text layer: retain only the new value, roll it into its fixed box.
const baseRenderUI=renderUI;let previousReadouts=new Map();
renderUI=function(){
 const old=previousReadouts;baseRenderUI();previousReadouts=new Map();
 for(const el of document.querySelectorAll('#hero-temp,.metric strong')){
  const key=el.id||el.closest('[data-sheet]').dataset.sheet,value=el.textContent;previousReadouts.set(key,value);
  if(old.has(key)&&old.get(key)!==value&&!reduced){el.getAnimations?.().forEach(a=>a.cancel());el.animate([{transform:'translateY(5px)'},{transform:'translateY(0)'}],{duration:95,easing:'ease-out'});}
 }
};

// Sky Pro is not installed. Lightweight angular cloud sprites share their mask
// with the reflected sky, Moon and stars. No stretched planar noise texture.
// Coverage uses the forecast; individual puff locations are illustrative.
function installSoftCloudFallback(shader){
 const start=shader.indexOf('float layerCover('),end=shader.indexOf('vec3 cloudLayers(',start);
 if(start<0||end<0)return shader;
 const field=`float layerCover(vec3 rd,float layer,float cover){
  if(cover<.003||rd.y<=.002)return 0.;
  float a=(atan(rd.x,-rd.z)+PI)/(2.*PI)*9.+uTime*.003*sin(uWindDirection)*(.3+uWind*.035)/(1.+layer*.5);
  float cell=floor(a),x=fract(a),e=asin(clamp(rd.y,0.,1.));
  float density=0.;
  for(int i=-1;i<=1;i++){
   float id=mod(cell+float(i)+90.,9.);
   float seed=hash(vec2(id,layer+8.));
   float present=smoothstep(seed-.14,seed+.07,cover);
   float cy=.16+layer*.29+hash(vec2(id+7.,layer+3.))*.23;
   vec2 q=vec2((x-float(i)-.5)*1.25,(e-cy)/(layer>1.5?.16:.21));
   float body=exp(-dot(q,q)*2.8);
   if(uCloudQuality>.5){vec2 q2=q-vec2(.38,.16);body=max(body,exp(-dot(q2,q2)*4.));
   vec2 q3=q+vec2(.36,.10);body=max(body,exp(-dot(q3,q3)*4.8));}
   density=max(density,body*present);
  }
  float deck=smoothstep(.80,1.,cover)*.72;
  density=max(density,deck);
  return clamp(density*(layer>1.5?.10:.88),0.,.97)*smoothstep(.002,.07,rd.y);
 }
 `;
 shader=shader.slice(0,start)+field+shader.slice(end);
 shader=shader.replace('float relief=cloudNoise(bodyP+vec2(.17,.28)),thickness=j==0?.12:j==1?.28:.52;','float relief=.70-.28*alpha,thickness=j==0?.12:j==1?.20:.30;');
 // Dense low/mid overcast hides stars and direct moonlight. The thin high
 // veil still transmits light; moon position/phase and star catalogue are untouched.
 shader=shader.replace('return 1.-(1.-c.x)*(1.-c.y)*(1.-c.z);','return max(1.-(1.-c.x)*(1.-c.y)*(1.-c.z),smoothstep(.86,.98,max(uCloudLayers.x,uCloudLayers.y))*.997);');
 shader=shader.replace('float coverage=1.-(1.-layers.x)*(1.-layers.y)*(1.-layers.z);','float coverage=max(1.-(1.-layers.x)*(1.-layers.y)*(1.-layers.z),smoothstep(.86,.98,max(uCloudLayers.x,uCloudLayers.y))*.997);');
 shader=shader.replace('(1.0-.92*coverage)*smoothstep','pow(1.0-coverage,2.0)*smoothstep');
 shader=shader.replace('(1.0-.90*cloudCover(normalize(uMoon)))','pow(1.0-cloudCover(normalize(uMoon)),2.0)');
 // A readable navy ambient sky reflects into the water at night. This is
 // sky exposure, not invented moonlight: lunar specular remains astronomical.
 shader=shader.replaceAll('vec3(.006,.013,.036)','vec3(.014,.032,.076)').replaceAll('vec3(.018,.034,.065)','vec3(.035,.063,.115)').replaceAll('vec3(.024,.035,.053)','vec3(.022,.041,.080)').replaceAll('vec3(.018,.025,.036)','vec3(.023,.043,.078)').replaceAll('vec3(.012,.019,.027)','vec3(.020,.036,.063)');
 return shader;
}

let qualityRestoreAt=0;
function setDragQuality(low){
 if(state.dragQuality===low)return;state.dragQuality=low;uniforms.uCloudQuality.value=low?0:1;resize();
}
// The forecast loader requests all seven days in one batch. Scrubbing samples
// these resident hourly rows; it never performs a network request.
window.__interaction.quality=()=>({low:!!state.dragQuality,pixelRatio:Math.min(devicePixelRatio,state.dragQuality?.8:1.6),cloudQuality:uniforms.uCloudQuality.value,residentHours:state.data.rows.length});
