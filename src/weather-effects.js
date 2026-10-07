// Additive forecast effects; no ocean geometry or shader changes.
let weatherRoot,rainRings=[],sandDust;
function initWeatherEffects(){
 if(weatherRoot||!engine)return;const scene=engine.scene;weatherRoot=new THREE.Group();scene.add(weatherRoot);
 // Night sky contrast only: retain astronomical directions and cloud occlusion.
 // Ocean surface, reflections and wave materials remain unchanged.
 scene.traverse(o=>{const m=o.material;if(!m?.fragmentShader||m.userData.scrubNight)return;if(o.renderOrder===-100){m.fragmentShader=m.fragmentShader.replace('vec3(.006,.013,.036)','vec3(.003,.010,.043)').replace('vec3(.018,.034,.065)','vec3(.012,.027,.072)').replace('vec3(.024,.035,.053)','vec3(.012,.024,.064)');m.needsUpdate=true;m.userData.scrubNight=true;}else if(o.isPoints&&m.fragmentShader.includes('vLight*core*twinkle*vOcc*uDark*moonGlare')){m.fragmentShader=m.fragmentShader.replace('vLight*core*twinkle*vOcc*uDark*moonGlare','vLight*core*twinkle*vOcc*uDark*moonGlare*1.35');m.needsUpdate=true;m.userData.scrubNight=true;}});
 for(let i=0;i<32;i++){const ring=new THREE.Mesh(new THREE.RingGeometry(.92,1,32),new THREE.MeshBasicMaterial({color:0xe1edf3,transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.userData={x:(i*13.71%42)-21,z:-12-(i*7.31%38),offset:i*.173};weatherRoot.add(ring);rainRings.push(ring);}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(new Float32Array(720),3));sandDust=new THREE.Points(geo,new THREE.PointsMaterial({color:0xf4e9d4,size:.055,transparent:true,opacity:.26,depthWrite:false}));weatherRoot.add(sandDust);
 const flash=document.createElement('div');flash.id='storm-flash';$('#app').append(flash);
}
function updateWeatherEffects(){
 initWeatherEffects();if(!weatherRoot)return;const c=conditions(),t=uniforms.uTime.value,valid=realForecast();weatherRoot.visible=valid;windFlag.visible=false;
 rainRings.forEach(r=>{const phase=(t*.7+r.userData.offset)%1;r.visible=valid&&c.rain>.05;r.position.set(r.userData.x,(Number.isFinite(c.tide)?c.tide:0)+.04,r.userData.z);r.scale.setScalar(.08+phase*.65);r.material.opacity=Math.min(.25,(c.rain||0)*.08)*(1-phase);});
 sandDust.visible=valid&&c.wind>15;const a=sandDust.geometry.attributes.position,dir=sceneVector((c.windDirection||0)+180,0);if(sandDust.visible){for(let i=0;i<a.count;i++){const x=((i*2.73+t*dir[0]*c.wind*.15)%34+34)%34-17,z=((i*.83+t*dir[2]*c.wind*.15)%14+14)%14+4;a.setXYZ(i,x,groundHeight(x,z)+.05+(i%7)*.018,z);}a.needsUpdate=true;}
 // Thunderstorm codes alone trigger occasional cloud flashes. Light reaches
 // cloud, crest, sand and rain shaders; the HUD never flashes white.
 const thunder=valid&&c.weatherCode>=95,phase=(t+3.7)%13.7;
 uniforms.uLightning.value=thunder&&!reduced?.7*Math.exp(-Math.pow((phase-1.2)/.12,2))+.4*Math.exp(-Math.pow((phase-1.55)/.18,2)):0;
 $('#storm-flash').style.opacity='0';
 state.weatherEffects={heatRequested:c.apparent>90,sand:sandDust.visible,rain:c.rain>.05,thunder,lightning:uniforms.uLightning.value,tide:Number.isFinite(c.tide)?c.tide:null,stand:false,flagBearing:null};
}
