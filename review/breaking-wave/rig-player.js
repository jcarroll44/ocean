/* Continuous procedural breaker. Original authored model, no fluid-bake claim. */
(function(){
const rename=s=>s.replace(/\buTime\b/g,'uRigTime').replace(/\buHeight\b/g,'uRigHeight').replace(/\b(hash|noise|fbm|sat|sm|bez|ripple|ageAt|centerAt|wavePoint|section|shoulderAt|boreAt)\b/g,'rig_$1');
const placement=`
uniform float uRigAngle,uRigBreakOffset;
vec3 rig_rotate(vec3 p){float c=cos(uRigAngle),s=sin(uRigAngle);p.xz=mat2(c,-s,s,c)*p.xz;return p;}
vec3 rig_place(vec3 p){p=rig_rotate(p);p.z+=-3.5-4.5*uRigHeight+uRigBreakOffset;p.y+=uTide;return p;}
`;
const world=`
vec3 rig_world(float x,float q){
 vec3 p=rig_place(rig_wavePoint(x,q));
 float a=rig_ageAt(x);
 float front=-3.5-4.5*uRigHeight+uRigBreakOffset+(rig_centerAt(x)+uRigHeight*rig_boreAt(a));
 float wash=rig_sm(2.7,4.1,a)*(1.-rig_sm(4.5,6.1,a));
 float coast=baseShore(p.x);
 float tip=front+wash*uRigHeight*.8;
 if(p.z>coast-.45&&p.z<tip&&wash>.01){
  float thin=wash*rig_sm(0.,.6,tip-p.z)*(.014+.020*rig_noise(p.xz*4.0));
  p.y=max(p.y,bed(p.xz)+thin);
 }
 return p;
}
`;
const vertex=`
attribute vec2 aRig;
varying vec3 vRigPos,vRigNormal;
varying float vRigQ,vRigAge;
void main(){float x=aRig.x,q=aRig.y;vec3 p=rig_world(x,q);
 vec3 dx=rig_world(x+.015,q)-rig_world(x-.015,q),dz=rig_world(x,q+.00015)-rig_world(x,q-.00015);
 vRigNormal=normalize(cross(dz,dx));vRigPos=p;vRigQ=q;vRigAge=rig_ageAt(x);
 gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);}
`;
const fragment=`
varying vec3 vRigPos,vRigNormal;
varying float vRigQ,vRigAge;
void main(){
 float depth=vRigPos.y-bed(vRigPos.xz);if(depth<.001)discard;
 // Once a crest segment impacts, retire its suspended sheet. Leaving it in
 // the morph would cap the neighbouring air tunnel with a glass curtain.
 if(vRigAge>1.50&&vRigAge<1.97&&vRigQ>.29&&vRigQ<.80&&vRigPos.y>uRigHeight*.24)discard;
 vec3 n=normalize(vRigNormal),v=normalize(cameraPosition-vRigPos);if(dot(n,v)<0.)n=-n;
 float distanceToCamera=length(cameraPosition-vRigPos);
 vec2 rip=micro(vRigPos.xz,distanceToCamera);n=normalize(n-vec3(rip.x,0,rip.y)*.32);
 vec3 col=shadeWater(vRigPos,n,v,max(depth,uRigHeight*(1.-abs(n.y))*2.5),clamp(vRigPos.y/uRigHeight,0.,1.));
 float face=rig_sm(.26,.36,vRigQ)*(1.-rig_sm(.80,.9,vRigQ));
 col=mix(col,uRigWaterColor*(.30+.70*max(n.y,0.)),face*.18);
 // Under-roof shading follows orientation, not a painted dark barrel stripe.
 float under=rig_sm(.50,.55,vRigQ)*(1.-rig_sm(.67,.76,vRigQ));
 col*=1.-under*.40*(.25+.75*rig_sm(.1,.7,vRigPos.y/uRigHeight))*(1.-rig_sm(1.4,1.8,vRigAge));
 vec2 flow=vRigPos.xz+vec2(0.,-uRigTime*.8);
 float turb=rig_fbm(flow*vec2(11.,8.));
 float shoulder=rig_shoulderAt(vRigPos.x);
 float lip=exp(-pow((vRigQ-.49)/.022,2.))*rig_sm(.1,.6,vRigAge)*(1.-rig_sm(1.4,1.8,vRigAge));
 col+=uRigWaterColor*uRigLipGlow*exp(-pow((vRigQ-.44)/.10,2.))*.32*(1.-rig_sm(1.4,1.8,vRigAge));
 float tear=rig_sm(1.15,1.45,vRigAge)*(1.-rig_sm(1.70,1.95,vRigAge));
 lip+=tear*exp(-pow((vRigQ-.48)/.09,2.))*(.5+.5*rig_noise(vec2(vRigPos.x*18.,vRigQ*140.)));
 float crash=rig_sm(1.36,1.73,vRigAge)*(1.-rig_sm(4.4,6.0,vRigAge));
 float band=exp(-pow((vRigQ-.66)/.19,2.))*crash;
 float foam=clamp((lip*(.16+.5*turb)+band*(.70+.48*rig_sm(.20,.57,turb)))*uRigFoam,0.,1.)*shoulder;
 // Thin lace at the moving runup edge and a decaying wake behind it.
 float shallow=1.-rig_sm(.01,.09,depth);
 foam=max(foam,clamp(shallow*crash*rig_sm(.35,.60,turb)*shoulder*.9*uRigFoam,0.,1.));
 vec3 foamColor=uRigFoamColor*(.64+.36*max(0.,dot(n,sunDir())));
 foamColor*=.89+.11*rig_noise(flow*34.);
 col=mix(col,foamColor,foam);
 col=mix(col,sky(normalize(vec3(-v.x,.003,-v.z)),false),seaHaze(distanceToCamera));
 float edge=rig_sm(-70.,-35.,vRigPos.z)*(1.-rig_sm(32.,60.,abs(vRigPos.x)))*rig_sm(.001,.045,depth);if(edge<.001)discard;gl_FragColor=vec4(finish(col),edge);
}
`;
function meshData(){
 const xs=[-600,-160,-70,-40],qs=[-3,-1,-.4,-.1];
 for(let i=0;i<=240;i++)xs.push(-30+i*.25);xs.push(40,70,160,600);
 for(let i=0;i<=260;i++)qs.push(i/260);qs.push(1.1,1.5,2,5);
 const v=new Float32Array(xs.length*qs.length*2),idx=[];let k=0;
 for(const x of xs)for(const q of qs){v[k++]=x;v[k++]=q;}
 for(let i=0;i<xs.length-1;i++)for(let j=0;j<qs.length-1;j++){let a=i*qs.length+j;idx.push(a,a+1,a+qs.length,a+1,a+qs.length+1,a+qs.length);}
 return {v,idx:new Uint32Array(idx)};
}
function makePrograms(code,common){const body=rename(common)+placement+world;return {vertex:code.environment+body+vertex,fragment:code.environment+code.waves+code.waterLight+body+fragment};}
function foamData(rand){
 const pos=[],seed=[],idx=[],rings=7,segments=10;
 for(let cell=0;cell<1250;cell++){
  const base=pos.length/3,x=(rand()-.5)*40,s=rand(),trail=Math.pow(rand(),2.5),birth=rand();
  for(let i=0;i<=rings;i++)for(let j=0;j<=segments;j++){
   const lat=Math.PI*i/rings,lon=2*Math.PI*j/segments;
   pos.push(Math.sin(lat)*Math.cos(lon),Math.cos(lat),Math.sin(lat)*Math.sin(lon));seed.push(x,s,trail,birth);
  }
  for(let i=0;i<rings;i++)for(let j=0;j<segments;j++){const a=base+i*(segments+1)+j;idx.push(a,a+1,a+segments+1,a+1,a+segments+2,a+segments+1);}
 }
 return {pos:new Float32Array(pos),seed:new Float32Array(seed),idx:new Uint32Array(idx)};
}
window.WaveRig={meshData,makePrograms,rename,foamData};
window.createWaveRig=async function(lab){
 const {THREE,engine,uniforms:u}=lab;const r=await fetch('surface.glsl');if(!r.ok)throw Error('Wave shape failed to load');const common=await r.text();
 Object.assign(u,{uRigTime:{value:0},uRigHeight:{value:1.2192},uRigAngle:{value:0},uRigBreakOffset:{value:0},uRigCurl:{value:1.1},uRigPeel:{value:1},uRigFoam:{value:1.2},uRigSpray:{value:1.3},uRigLipGlow:{value:.6},uRigWaterColor:{value:new THREE.Vector3(.020,.26,.29)},uRigFoamColor:{value:new THREE.Vector3(.89,.94,.91)}});
 const data=meshData(),geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(new Float32Array(data.v.length/2*3),3));geo.setAttribute('aRig',new THREE.BufferAttribute(data.v,2));geo.setIndex(new THREE.BufferAttribute(data.idx,1));
 const shaders=makePrograms(engine.labPrograms,common);
 const material=new THREE.ShaderMaterial({uniforms:u,vertexShader:shaders.vertex,fragmentShader:shaders.fragment,side:THREE.DoubleSide,transparent:true});
 const mesh=new THREE.Mesh(geo,material);mesh.frustumCulled=false;mesh.renderOrder=1;engine.scene.add(mesh);
 engine.ocean.visible=false;engine.spray.visible=false;u.uBakeOn.value=0;
 const [spraySource,sprayFrag,foamVert,foamFrag]=await Promise.all(['spray.vert','spray.frag','foam.vert','foam.frag'].map(async path=>{const res=await fetch(path);if(!res.ok)throw Error(path+' failed to load');return res.text();}));
 let seed=42;const rand=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;};const count=14000,particles=new Float32Array(count*4);for(let i=0;i<count;i++){particles[i*4]=(rand()-.5)*40;for(let j=1;j<4;j++)particles[i*4+j]=rand();}
 const sg=new THREE.BufferGeometry();sg.setAttribute('position',new THREE.BufferAttribute(new Float32Array(count*3),3));sg.setAttribute('aParticle',new THREE.BufferAttribute(particles,4));
 u.uViewportHeight={value:engine.renderer.domElement.height};
 const smat=new THREE.ShaderMaterial({uniforms:u,vertexShader:rename(common)+'\nuniform float uTide;\n'+placement+rename(spraySource),fragmentShader:sprayFrag,transparent:true,depthWrite:false});
 const spray=new THREE.Points(sg,smat);spray.frustumCulled=false;spray.renderOrder=3;engine.scene.add(spray);
 const fd=foamData(rand),fg=new THREE.BufferGeometry();fg.setAttribute('position',new THREE.BufferAttribute(fd.pos,3));fg.setAttribute('aFoam',new THREE.BufferAttribute(fd.seed,4));fg.setIndex(new THREE.BufferAttribute(fd.idx,1));
 const fm=new THREE.ShaderMaterial({uniforms:u,vertexShader:engine.labPrograms.environment+rename(common)+placement+rename(foamVert),fragmentShader:engine.labPrograms.environment+rename(common)+foamFrag,transparent:true,side:THREE.DoubleSide});
 const foam=new THREE.Mesh(fg,fm);foam.frustumCulled=false;foam.renderOrder=2;engine.scene.add(foam);
 return {mesh,spray,foam,set(time,height,period=6,angle=0,breakOffset=0){u.uRigTime.value=time*6/period;u.uRigHeight.value=height*.3048;u.uRigAngle.value=angle;u.uRigBreakOffset.value=breakOffset;u.uViewportHeight.value=engine.renderer.domElement.height;},tune(values){for(const [name,key] of Object.entries({curl:'uRigCurl',peel:'uRigPeel',foam:'uRigFoam',spray:'uRigSpray',glow:'uRigLipGlow'}))if(Number.isFinite(values[name]))u[key].value=values[name];for(const [name,key] of Object.entries({water:'uRigWaterColor',white:'uRigFoamColor'}))if(/^#[0-9a-f]{6}$/i.test(values[name]||'')){const c=values[name].slice(1).match(/../g).map(v=>{const s=parseInt(v,16)/255;return s<=.04045?s/12.92:Math.pow((s+.055)/1.055,2.4);});u[key].value.set(...c);}},dispose(){engine.scene.remove(mesh,spray,foam);for(const o of [geo,material,sg,smat,fg,fm])o.dispose();engine.ocean.visible=true;engine.spray.visible=true;}};
};
})();
