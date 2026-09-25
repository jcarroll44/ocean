/* Continuous procedural breaker. Original authored model, no fluid-bake claim. */
(function(){
const rename=s=>s.replace(/\buTime\b/g,'uRigTime').replace(/\buHeight\b/g,'uRigHeight').replace(/\b(hash|noise|fbm|sat|sm|bez|ripple|ageAt|centerAt|wavePoint)\b/g,'rig_$1');
const world=`
uniform float uRigAngle,uRigBreakOffset;
vec3 rig_world(float x,float q){
 vec3 p=rig_wavePoint(x,q);float c=cos(uRigAngle),s=sin(uRigAngle);
 p.xz=mat2(c,-s,s,c)*p.xz;p.z+=-3.5-5.2*uRigHeight+uRigBreakOffset;
 float a=rig_ageAt(x);
 float front=-3.5-5.2*uRigHeight+uRigBreakOffset+(rig_centerAt(x)+uRigHeight*(1.5+max(0.,a-1.5)*.8));
 float wash=rig_sm(2.7,4.1,a)*(1.-rig_sm(4.5,6.1,a));
 float coast=baseShore(p.x);
 float tip=front+wash*uRigHeight*.8;
 if(p.z>coast-.45&&p.z<tip&&wash>.01){
  float thin=wash*rig_sm(0.,.6,tip-p.z)*(.014+.020*rig_noise(p.xz*4.0));
  p.y=max(p.y,bed(p.xz)+thin);
 }
 p.y+=uTide;return p;
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
 vec3 n=normalize(vRigNormal),v=normalize(cameraPosition-vRigPos);if(dot(n,v)<0.)n=-n;
 float distanceToCamera=length(cameraPosition-vRigPos);
 vec2 rip=micro(vRigPos.xz,distanceToCamera);n=normalize(n-vec3(rip.x,0,rip.y)*.32);
 vec3 col=shadeWater(vRigPos,n,v,max(depth,uRigHeight*(1.-abs(n.y))*2.5),clamp(vRigPos.y/uRigHeight,0.,1.));
 float hollow=rig_sm(-.1,.6,vRigAge)*(1.-rig_sm(1.50,2.0,vRigAge))*rig_sm(.50,.62,vRigQ)*(1.-rig_sm(.82,.95,vRigQ));
 col*=1.-.42*hollow;
 vec2 flow=vRigPos.xz+vec2(0.,-uRigTime*.8);
 float turb=rig_fbm(flow*vec2(11.,8.));
 float shoulder=1.-rig_sm(11.,24.,abs(vRigPos.x));
 float lip=exp(-pow((vRigQ-.49)/.015,2.))*rig_sm(.1,.6,vRigAge)*(1.-rig_sm(1.5,2.,vRigAge));
 float crash=rig_sm(1.45,1.95,vRigAge)*(1.-rig_sm(4.4,6.0,vRigAge));
 float band=exp(-pow((vRigQ-.65)/.20,2.))*crash;
 float foam=clamp(lip*(.14+.4*turb)+band*(.40+1.1*rig_sm(.20,.48,turb)),0.,1.)*shoulder;
 // Thin lace at the moving runup edge and a decaying wake behind it.
 float shallow=1.-rig_sm(.01,.09,depth);
 foam=max(foam,shallow*crash*rig_sm(.35,.60,turb)*shoulder*.9);
 vec3 foamColor=vec3(.89,.94,.91)*(.55+.45*max(0.,dot(n,sunDir())));
 foamColor*=.89+.11*rig_noise(flow*34.);
 col=mix(col,foamColor,foam);
 col=mix(col,sky(normalize(vec3(-v.x,.003,-v.z)),false),seaHaze(distanceToCamera));
 float edge=rig_sm(-70.,-35.,vRigPos.z)*(1.-rig_sm(32.,60.,abs(vRigPos.x)));if(edge<.001)discard;gl_FragColor=vec4(finish(col),edge);
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
function makePrograms(code,common){const body=rename(common)+world;return {vertex:code.environment+body+vertex,fragment:code.environment+code.waves+code.waterLight+body+fragment};}
window.WaveRig={meshData,makePrograms,rename};
window.createWaveRig=async function(lab){
 const {THREE,engine,uniforms:u}=lab;const r=await fetch('surface.glsl');if(!r.ok)throw Error('Wave shape failed to load');const common=await r.text();
 Object.assign(u,{uRigTime:{value:0},uRigHeight:{value:1.2192},uRigAngle:{value:0},uRigBreakOffset:{value:0}});
 const data=meshData(),geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(new Float32Array(data.v.length/2*3),3));geo.setAttribute('aRig',new THREE.BufferAttribute(data.v,2));geo.setIndex(new THREE.BufferAttribute(data.idx,1));
 const shaders=makePrograms(engine.labPrograms,common);
 const material=new THREE.ShaderMaterial({uniforms:u,vertexShader:shaders.vertex,fragmentShader:shaders.fragment,side:THREE.DoubleSide,transparent:true});
 const mesh=new THREE.Mesh(geo,material);mesh.frustumCulled=false;mesh.renderOrder=1;engine.scene.add(mesh);
 engine.ocean.visible=false;engine.spray.visible=false;u.uBakeOn.value=0;
 const commonSpray=rename(common),spraySource=await (await fetch('spray.vert')).text(),sprayFrag=await (await fetch('spray.frag')).text();
 const sprayVertex=rename(spraySource).replace('in vec4 position;','attribute vec4 aParticle;').replace(/\bposition\./g,'aParticle.').replace('uniform mat4 uVP;uniform vec3 uEye;uniform float uViewportHeight;','uniform float uViewportHeight;').replace(/\bout /g,'varying ').replace('p.z+=t*uRigHeight*(.7+aParticle.w*1.6);','p.z+=t*uRigHeight*(.7+aParticle.w*1.6);float c=cos(uRigAngle),s=sin(uRigAngle);p.xz=mat2(c,-s,s,c)*p.xz;p.z+=-3.5-5.2*uRigHeight+uRigBreakOffset;').replace('uVP*vec4(p,1)','projectionMatrix*modelViewMatrix*vec4(p,1)');
 let seed=42;const rand=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;};const particles=new Float32Array(4000*4);for(let i=0;i<4000;i++){particles[i*4]=(rand()-.5)*42;for(let j=1;j<4;j++)particles[i*4+j]=rand();}
 const sg=new THREE.BufferGeometry();sg.setAttribute('position',new THREE.BufferAttribute(new Float32Array(4000*3),3));sg.setAttribute('aParticle',new THREE.BufferAttribute(particles,4));
 u.uViewportHeight={value:engine.renderer.domElement.height};
 const smat=new THREE.ShaderMaterial({uniforms:u,vertexShader:commonSpray+'\nuniform float uRigAngle,uRigBreakOffset;\n'+sprayVertex,fragmentShader:sprayFrag.replace(/\bin /g,'varying ').replace('out vec4 fragColor;','').replace(/\bfragColor\b/g,'gl_FragColor'),transparent:true,depthWrite:false});
 const spray=new THREE.Points(sg,smat);spray.frustumCulled=false;spray.renderOrder=2;engine.scene.add(spray);
 return {mesh,spray,set(time,height,period=6,angle=0,breakOffset=0){u.uRigTime.value=time*6/period;u.uRigHeight.value=height*.3048;u.uRigAngle.value=angle;u.uRigBreakOffset.value=breakOffset;u.uViewportHeight.value=engine.renderer.domElement.height;},dispose(){engine.scene.remove(mesh,spray);geo.dispose();material.dispose();sg.dispose();smat.dispose();engine.ocean.visible=true;engine.spray.visible=true;}};
};
})();
