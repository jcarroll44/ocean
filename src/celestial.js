// Display treatment only. Directions, lunar phase, clouds and reflected light
// remain driven by the existing astronomical and forecast uniforms.
let celestialSky=null,celestialGlow=null;
function updateCelestialPresentation(){
 if(!engine)return;
 if(!celestialSky){
  engine.scene.traverse(o=>{
   if(o.renderOrder!==-100||!o.material?.fragmentShader?.includes('vec3 moonDisc('))return;
   const m=o.material,needle='float R=uMoonInfo.y*1.5;';
   if(!m.fragmentShader.includes(needle))throw Error('Lunar display shader changed');
   m.fragmentShader='uniform float uMoonDisplayRadius;\n'+m.fragmentShader.replace(needle,'float R=uMoonDisplayRadius;');
   m.uniforms={...m.uniforms,uMoonDisplayRadius:{value:.007}};m.needsUpdate=true;celestialSky=m;
  });
 }
 if(celestialSky){
  // A legible display size, like the existing sun marker. The centre and
  // illuminated limb still use the true uMoon/uSun vectors; never move it.
  celestialSky.uniforms.uMoonDisplayRadius.value=Math.max(uniforms.uMoonInfo.value.y*1.5,Math.tan(engine.camera.fov*RAD/2)*20/innerHeight);
 }
 if(!sunMesh||!sunHalo)return;
 if(!celestialGlow){
  const canvas=document.createElement('canvas');canvas.width=canvas.height=128;
  const ctx=canvas.getContext('2d'),g=ctx.createRadialGradient(64,64,0,64,64,64);
  g.addColorStop(0,'rgba(255,250,220,.88)');g.addColorStop(.24,'rgba(255,243,201,.48)');g.addColorStop(.55,'rgba(255,230,172,.12)');g.addColorStop(1,'rgba(255,226,164,0)');
  ctx.fillStyle=g;ctx.fillRect(0,0,128,128);celestialGlow=new THREE.CanvasTexture(canvas);
 }
 if(sunHalo.material.map!==celestialGlow){sunHalo.material.map?.dispose();sunHalo.material.map=celestialGlow;sunHalo.material.needsUpdate=true;}
 const size=mix(18,24,clamp(sunEl/30,0,1))/14;
 sunMesh.scale.multiplyScalar(size);sunHalo.scale.multiplyScalar(size*1.16);
 sunMesh.material.color.set(sunEl<10?0xffedcd:0xfffbe8);
 // Retain updateForecastClouds' opacity and the one existing sun object.
}
