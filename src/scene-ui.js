let sceneCompass,windFlag,waveRuler;
function makeSceneDetails(){
 if(!engine||sceneCompass)return;
 const scene=engine.buoy.group.parent,white=new THREE.MeshBasicMaterial({color:0xe4f6ff,transparent:true,opacity:.55,depthWrite:false,side:THREE.DoubleSide});
 sceneCompass=new THREE.Group();sceneCompass.position.set(0,.55,-22);
 const ring=new THREE.Mesh(new THREE.RingGeometry(6.85,6.94,96),white);ring.rotation.x=-Math.PI/2;sceneCompass.add(ring);
 const inner=new THREE.Mesh(new THREE.CircleGeometry(6.8,96),new THREE.MeshBasicMaterial({color:0x78bfc7,transparent:true,opacity:.06,depthWrite:false,side:THREE.DoubleSide}));inner.rotation.x=-Math.PI/2;sceneCompass.add(inner);
 const arrow=new THREE.ArrowHelper(new THREE.Vector3(0,0,-1),new THREE.Vector3(),5,0xffc353,1.3,1.1);arrow.name='wind-arrow';sceneCompass.add(arrow);
 for(let i=0;i<24;i++){const a=i*Math.PI/12,v=new THREE.Vector3(Math.sin(a),0,Math.cos(a)),p1=v.clone().multiplyScalar(i%6===0?6:6.45),p2=v.clone().multiplyScalar(6.8);sceneCompass.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([p1,p2]),new THREE.LineBasicMaterial({color:0xf1faff,transparent:true,opacity:.7})));}
 ['N','E','S','W'].forEach((letter,i)=>{const canvas=document.createElement('canvas');canvas.width=canvas.height=96;const ctx=canvas.getContext('2d');ctx.font='800 64px Nunito, sans-serif';ctx.fillStyle='#edfaff';ctx.textAlign='center';ctx.fillText(letter,48,73);const tex=new THREE.CanvasTexture(canvas);const plane=new THREE.Mesh(new THREE.PlaneGeometry(1.5,1.5),new THREE.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false,side:THREE.DoubleSide}));plane.rotation.x=-Math.PI/2;const v=sceneVector(i*90,0);plane.position.set(v[0]*5.5,.03,v[2]*5.5);sceneCompass.add(plane);});sceneCompass.traverse(o=>{o.renderOrder=20;if(o.material){o.material.depthTest=false;o.material.depthWrite=false;o.material.transparent=true;}});scene.add(sceneCompass);
 windFlag=new THREE.Group();windFlag.position.set(4,.15,1.5);const pole=new THREE.Mesh(new THREE.CylinderGeometry(.04,.045,4.8,8),new THREE.MeshStandardMaterial({color:0xdce4df,metalness:.7,roughness:.4}));pole.position.y=2.4;windFlag.add(pole);
 const flag=new THREE.Mesh(new THREE.PlaneGeometry(1.8,.92,12,6),new THREE.MeshBasicMaterial({color:0xf3a43a,side:THREE.DoubleSide}));flag.position.set(.9,4.22,0);flag.name='cloth';flag.geometry.userData.base=Float32Array.from(flag.geometry.attributes.position.array);windFlag.add(flag);scene.add(windFlag);
 waveRuler=document.createElement('div');waveRuler.className='wave-ruler';waveRuler.hidden=true;$('#app').appendChild(waveRuler);
}
function updateSceneDetails(){
 makeSceneDetails();if(!engine)return;
 const c=conditions();sceneCompass.visible=state.sheet==='wind';windFlag.visible=state.sheet==='wind';waveRuler.hidden=state.sheet!=='waves';
 if(sceneCompass.visible){const direction=sceneVector((c.windDirection??225)+180,0);sceneCompass.getObjectByName('wind-arrow').setDirection(new THREE.Vector3(...direction));sceneCompass.position.y=(current.tide||0)+.55;const cloth=windFlag.getObjectByName('cloth'),a=cloth.geometry.attributes.position,b=cloth.geometry.userData.base;for(let i=0;i<a.count;i++){const x=b[i*3]+.9;a.setZ(i,Math.sin(x*5-uniforms.uTime.value*(2+c.wind*.08))*x*.16*Math.min(1,c.wind/12));a.setY(i,b[i*3+1]-.12*x*(1-clamp(c.wind/15,0,1)));}a.needsUpdate=true;windFlag.rotation.y=Math.atan2(direction[0],direction[2]);}
 if(!waveRuler.hidden){const buoy=engine.buoy.group.position,p=project(new THREE.Vector3(buoy.x+1.3,(current.tide||0)+c.swell/FT,buoy.z)),bottom=project(new THREE.Vector3(buoy.x+1.3,current.tide||0,buoy.z));waveRuler.style.left=p.x+'px';waveRuler.style.top=p.y+'px';waveRuler.style.height=Math.max(10,bottom.y-p.y)+'px';waveRuler.innerHTML=`<b>${c.swell.toFixed(1)} ft</b>`;}
}
