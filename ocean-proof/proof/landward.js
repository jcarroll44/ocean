import {InstancedMesh,Mesh,Group,Object3D,Vector3,BufferGeometry,Float32BufferAttribute,BoxGeometry,CylinderGeometry,ConeGeometry,IcosahedronGeometry,mergeGeometries} from '../vendor/tidewater/src/engine/index.js';
import {standard} from '../vendor/tidewater/src/materials/Materials.js';
// Original low-poly coastal planting, in native coordinates (land is -Z).
// One draw per plant family. No textures, models, buildings or crowds loaded.
export function createLandward(app){
 const root=new Group();root.name='DayBuoy coastal dunes';app.scene.add(root);
 let seed=30028;const random=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296);
 const material=(color,wind=0)=>standard({color,roughness:.95,side:'double',uniforms:{bend:['f32',wind]},
  vertex:`let phase = v.model[3].x * 0.17 + v.model[3].z * 0.13;
   let bend = min(frame.windSpeed, 20.0) * mat.bend * pow(max(v.position.y, 0.0), 1.5) * (0.7 + 0.3 * sin(frame.time * 1.8 + phase));
   v.worldOffset += vec3f(frame.windDir.x * bend, 0.0, frame.windDir.y * bend);`,
  output:`let fog = smoothstep(110.0, 310.0, distance(in.P, frame.cameraPos));
   r.color = vec4f(mix(r.color.rgb, vec3f(0.48,0.62,0.65) * max(0.06,1.0-frame.night), fog),r.color.a);`});
 const geometry=points=>{const g=new BufferGeometry();g.setAttribute('position',new Float32BufferAttribute(points,3));g.computeVertexNormals();return g;};
 const oat=[];
 for(let i=0;i<7;i++){
  const a=i*2.4,h=.65+random()*.65,x=Math.cos(a)*.2,z=Math.sin(a)*.2;
  oat.push(x-.012,0,z,x+.012,0,z,x+.09,h,z+.06);
  for(let j=0;j<3;j++){const y=h-.13+j*.08;oat.push(x+.04,y,z+.06,x+.15,y+.07,z+.06,x+.09,y+.13,z+.07);}
 }
 const fan=[];
 for(let i=0;i<12;i++){
  const a=i/12*Math.PI*2, r=.85+random()*.3;
  fan.push(0,.22,0,Math.cos(a-.13)*r,.55,Math.sin(a-.13)*r,Math.cos(a)*r,.98,Math.sin(a)*r);
  fan.push(0,.22,0,Math.cos(a)*r,.98,Math.sin(a)*r,Math.cos(a+.13)*r,.55,Math.sin(a+.13)*r);
 }
 const instanced=(name,g,mat,count,z0,z1,scale)=>{
  const mesh=new InstancedMesh(g,mat,count),dummy=new Object3D();mesh.name=name;mesh.castShadow=true;mesh.receiveShadow=true;
  let placed=0;
  while(placed<count){const x=(random()-.5)*230,z=-(z0+random()*(z1-z0));if(Math.abs(x+18)<2.5)continue;
   dummy.position.set(x,app.terrainData.heightAt(x,z),z);dummy.rotation.y=random()*Math.PI*2;dummy.scale.setScalar(scale*(.72+random()*.56));dummy.updateMatrix();mesh.setMatrixAt(placed++,dummy.matrix);
  }
  mesh.instanceMatrix.needsUpdate=true;root.add(mesh);return mesh;
 };
 instanced('Sea oats',geometry(oat),material('#a2a17b',.018),360,26,78,1);
 instanced('Saw palmetto',geometry(fan),material('#537c64',.006),84,47,135,1);
 instanced('Rosemary scrub',new IcosahedronGeometry(.65,0).translate(0,.55,0),material('#6f8b7b',.008),108,40,135,1);
 const trunk=new CylinderGeometry(.1,.18,5,5).translate(-.18,2.5,0),crowns=[];
 for(let i=0;i<3;i++)crowns.push(new ConeGeometry(1.3-i*.22,2,6).translate(-.25-i*.18,3.4+i*.75,0));
 instanced('Wind bent coastal pines',mergeGeometries([trunk,...crowns]),material('#526e60',.0005),28,135,220,1);
 const woodMatrices=[],wood=material('#a29a8d'),box=(x,y,z,w,h,d,mat=wood)=>{const m=new Object3D();m.position.set(x,y,z);m.scale.set(w,h,d);m.updateMatrix();woodMatrices.push(m.matrix.clone());return m;};
 // A single weathered walkover, crossing the dune behind an empty stand.
 for(let i=0;i<70;i++){
  const z=-18-i*.55,y=app.terrainData.heightAt(-18,z)+.35;
  box(-18,y,z,2.2,.1,.49);
  if(i%6===0)for(const x of [-19.08,-16.92])box(x,y+.5,z,.09,1.1,.09);
  for(const x of [-19.08,-16.92])box(x,y+1,z,.07,.07,.56);
 }
 const standY=app.terrainData.heightAt(-13,-18);
 for(const x of [-14,-12])for(const z of [-19,-17])box(x,standY+1.4,z,.13,2.8,.13);
 box(-13,standY+2.8,-18,2.4,.15,2.4);box(-13,standY+4,-18,2.7,.12,2.7);
 for(const x of [-14,-12])for(const z of [-19,-17])box(x,standY+3.4,z,.09,1.2,.09);
 box(-14.4,standY+3.4,-18,.055,4.8,.055);
 // Neutral white pennant is a wind indicator, never an invented warning flag.
 const flag=geometry([0,0,0,1,.08,0,1,-.5,0,0,0,0,1,-.5,0,0,-.5,0]);
 const flagMat=material('#e4e7e2');flagMat.vertex=`let distanceAlong=max(v.position.x,0.0);let gust=sin(frame.time*3.0 + distanceAlong*5.0)*min(frame.windSpeed/20.0,0.3)*distanceAlong;v.position=vec3f(frame.windDir.x*distanceAlong,v.position.y+gust,frame.windDir.y*distanceAlong);`;
 const pennant=new Mesh(flag,flagMat);pennant.position.set(-14.4,standY+5.7,-18);root.add(pennant);
 const woodwork=new InstancedMesh(new BoxGeometry(1,1,1),wood,woodMatrices.length);woodwork.name='Walkover and empty stand';woodMatrices.forEach((m,i)=>woodwork.setMatrixAt(i,m));woodwork.instanceMatrix.needsUpdate=true;woodwork.castShadow=true;woodwork.receiveShadow=true;root.add(woodwork);
 return root;
}
