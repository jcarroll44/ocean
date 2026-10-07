// Default resting pose; manual look rotates in place via interaction.js.
const orbitHome={az:0,el:11*RAD,r:28.52},orbitTarget=new THREE.Vector3(0,4.56,0);
// Shift the resting horizon to 23% without changing the view bearing or ocean geometry.
const HOME_LENS_SHIFT=.59*(1-2*.23)-Math.tan(orbitHome.el);
let freeOrbit={...orbitHome},cloudPuffs=[],cloudRoot=null,uvVersion=null,uvArcTube=null,uvArcDay=null,uvArcGlow=[];
function resetBeach(){clearUserView();freeOrbit={...orbitHome};state.dirty=true;}
function applyFreeCamera(){
 const o=orbitHome,c=Math.cos(o.el),p=new THREE.Vector3(-Math.sin(o.az)*c*o.r,Math.sin(o.el)*o.r,Math.cos(o.az)*c*o.r).add(orbitTarget);
 engine.setPose(p.x,p.y,p.z,o.az,-o.el,1,HOME_LENS_SHIFT);cameraPose={x:p.x,y:p.y,z:p.z,yaw:o.az,pitch:-o.el};state.cameraYaw=o.az;
 skyMix=0;domeRadius=SKY_RADIUS;
}
function forecastUV(t){const v=sampleAt(state.data.rows,t)?.uv;return Number.isFinite(v)?Math.max(0,v):null;}
function uvColour(v){if(v==null)return '#9db4bb';const n=Math.round(v);return n<3?'#289500':n<6?'#f7e400':n<8?'#f85900':n<11?'#d8001d':'#6b49c8';}
function arcColour(v){
 const mint=new THREE.Color('#8de2c0'),yellow=new THREE.Color('#ffe29a'),coral=new THREE.Color('#ff8879');
 if(v==null)return new THREE.Color('#abc3cb');
 return v<4?mint.lerp(yellow,clamp((v-1)/3,0,1)):yellow.lerp(coral,clamp((v-4)/4,0,1));
}
function updateUVArc(){
 if(uvArcDay!==pathDay){
  for(const m of uvArcGlow){m.parent.remove(m);m.geometry.dispose();m.material.dispose();}
  uvArcDay=pathDay;uvArcGlow=[];const curve=new THREE.CatmullRomCurve3(pathPoints.map(p=>p.position));
  for(const [radius,opacity] of [[.21,.045],[.13,.09],[.075,.18],[.035,.85]]){
   const m=new THREE.Mesh(new THREE.TubeGeometry(curve,192,radius,5,false),new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,opacity,depthTest:false,depthWrite:false}));
   m.userData.opacity=opacity;m.renderOrder=116;engine.scene.add(m);uvArcGlow.push(m);
  }
  uvArcTube=uvArcGlow.at(-1);uvVersion=null;
 }
 for(const m of uvArcGlow){m.position.copy(engine.camera.position);m.scale.setScalar(domeRadius/PATH_RADIUS);}
 if(uvVersion===state.version+':'+pathDay)return;uvVersion=state.version+':'+pathDay;
 const colours=pathPoints.flatMap(p=>arcColour(forecastUV(p.t)).toArray());
 for(const line of [pathLine,pathTrail]){line.geometry.setAttribute('color',new THREE.Float32BufferAttribute(colours,3));line.material.vertexColors=true;line.material.color.set(0xffffff);line.material.needsUpdate=true;}
 for(const m of uvArcGlow){const colours=[];for(let i=0;i<m.geometry.attributes.position.count;i++){const p=pathPoints[Math.min(pathPoints.length-1,Math.floor(i/6))];colours.push(...arcColour(forecastUV(p.t)).toArray());}m.geometry.setAttribute('color',new THREE.Float32BufferAttribute(colours,3));}
 for(const tick of tickGroup.children){const t=tick.userData,el=$(`[data-hour="${t.hour}"]`),v=forecastUV(t.time),color='#'+arcColour(v).getHexString();tick.material.color.set(color);if(el)el.innerHTML=`${t.hour%12||12}${t.hour<12?'a':'p'}<b style="--uv:${color}">UV ${v==null?'—':Math.round(v)}</b>`;}
}
function updateForecastClouds(){
 // Forecast low / middle / high coverage is rendered by the shared sky shader.
 // No opaque sphere puffs: a storm is a continuous, drifting cloud layer.
 const c=conditions(),covers=[c.cloudLow,c.cloudMid,c.cloudHigh].map(v=>Number.isFinite(v)?clamp(v/100,0,1):0);
 const obscured=1-(1-covers[0]*.8)*(1-covers[1]*.65)*(1-covers[2]*.35);
 sunMesh.material.opacity=1-obscured*.9;sunHalo.material.opacity=(1-obscured)*.5;
 $('#watch-weather-note').hidden=true;
}
function arcHit(x,y){if(timeExploreOpacity<=0||!uvArcGlow.some(o=>o.visible))return null;let best=null,distance=22;for(const p of sunPathScreen()){if(!p.visible)continue;const d=Math.hypot(x-p.x,y-p.y);if(d<distance){distance=d;best=p;}}return best;}
// Horizontal time gestures are owned by interaction.js; playback remains separate.
let exploreGesture=null,ignoreClickUntil=0;
document.addEventListener('click',event=>{if(performance.now()<ignoreClickUntil){event.preventDefault();event.stopImmediatePropagation();}},true);
function explorationProof(){return{orbit:{...freeOrbit},playing:state.playing,uv:forecastUV(state.time),uvColour:uvColour(forecastUV(state.time)),clouds:conditions(),camera:solarProof(),forecastVersion:state.version};}
