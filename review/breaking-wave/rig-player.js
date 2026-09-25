/* Shorebreak: one continuous water surface plus layered aerated-water sprites. */
(function(){
const world=`
vec3 rig_world(float x,float q){
 vec3 p=rig_wavePoint(x,q);float age=rig_ageAt(x),wa=rig_washAge(x),front=rig_frontAt(x,wa);
 p.y+=rig_nextSwell(x,p.z);
 float wash=rig_sm(1.20,1.60,wa)*(1.-rig_sm(7.8,9.,wa));
 float edge=rig_sm(0.,.28,front-p.z),onshore=rig_sm(-3.9,-3.2,p.z);
 if(wash>.001&&p.z<front){
  float shoreWake=1.-rig_sm(1.5+uRigHeight*2.,3.+uRigHeight*2.5,front-p.z);
  float film=(.012+.014*rig_noise(p.xz*5.-rig_clock()))*edge*wash*shoreWake;
  float aerated=max(0.,bed(p.xz))+film+rig_roller(x,p.z,wa)+rig_churn(x,p.z,wa);
  p.y=max(p.y,aerated);
 }
 // Dry vertices follow the beach too, avoiding sloping triangular sheets at
 // the advancing edge. Zero water depth is discarded by the fragment shader.
 p.y=max(p.y,bed(p.xz)+.025*wash*onshore);p.y+=uTide;return p;
}
`;
const vertex=`
attribute vec2 aRig;varying vec3 vRigPos,vRigNormal;varying float vRigQ,vRigAge;
void main(){float x=aRig.x,q=aRig.y;vec3 p=rig_world(x,q);
 vec3 dx=rig_world(x+.013,q)-rig_world(x-.013,q),dz=rig_world(x,q+.0001)-rig_world(x,q-.0001);
 vRigPos=p;vRigNormal=normalize(cross(dz,dx));vRigQ=q;vRigAge=rig_ageAt(x);
 gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}
`;
const fragment=`
varying vec3 vRigPos,vRigNormal;varying float vRigQ,vRigAge;
float bubbleLace(vec2 p){
 p+=vec2(rig_fbm(p*1.4),rig_fbm(p*1.4+43.))*.65;
 vec2 cell=floor(p),f=fract(p);float first=9.,second=9.;
 for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){
  vec2 c=vec2(float(i),float(j));vec2 seed=cell+c;
  vec2 spot=vec2(rig_hash(seed),rig_hash(seed+31.7));
  float d=length(c+spot-f);
  if(d<first){second=first;first=d;}else second=min(second,d);
 }
 return 1.-rig_sm(.012,.07,second-first);
}
void main(){
 float depth=vRigPos.y-bed(vRigPos.xz);if(depth<.001)discard;
 float age=vRigAge,wa=rig_washAge(vRigPos.x),impact=rig_sm(1.18,1.65,age);
 float shoreEdge=1.;
 if(bed(vRigPos.xz)>0.){shoreEdge=rig_sm(0.,.08,rig_frontAt(vRigPos.x,wa)-vRigPos.z)*rig_sm(1.2,1.6,wa)*(1.-rig_sm(7.8,9.,wa));if(shoreEdge<.001)discard;}
 vec3 n=normalize(vRigNormal),v=normalize(cameraPosition-vRigPos);if(dot(n,v)<0.)n=-n;
 float distanceToCamera=length(cameraPosition-vRigPos);
 vec2 r=micro(vRigPos.xz,distanceToCamera);n=normalize(n-vec3(r.x,0,r.y)*.055);
 vec2 rip=vRigPos.xy*vec2(7.,11.)+vec2(0.,rig_clock()*.7);
 float rx=rig_fbm(rip+vec2(.12,0))-rig_fbm(rip-vec2(.12,0));
 float ry=rig_fbm(rip+vec2(0,.12))-rig_fbm(rip-vec2(0,.12));
 n=normalize(n+vec3(rx,ry,0.)*.65*rig_sm(.1,.4,vRigPos.y/uRigHeight));
 vec3 base=shadeWater(vRigPos,n,v,max(depth,.04),0.);
 float face=rig_sm(.08,.30,vRigPos.y/uRigHeight)*(1.-impact)*rig_sm(-1.7,-.3,age);
 float warp=rig_noise(vRigPos.xy*vec2(3.,4.)-uRigTime*.2);
 float vertical=rig_fbm(vec2(vRigPos.x*10.+warp*2.,vRigPos.y*2.-uRigTime*.5));
 float fine=rig_noise(vRigPos.xy*vec2(53.,11.)-uRigTime*.8);
 float light=rig_sm(-.05,.9,vRigPos.y/uRigHeight);
 vec3 transmission=uRigWaterColor*(.12+1.12*pow(light,1.35)+uRigLipGlow*.25*pow(light,3.));
 transmission*=.97+.045*vertical+.014*fine;
 float fresnel=.024+.74*pow(1.-max(0.,dot(n,v)),5.);
 vec3 reflection=sky(reflect(-v,n),false);
 vec3 water=mix(transmission,reflection,fresnel);
 water=mix(water,base,.28);
 water*=mix(.78,1.16,rig_sm(-.25,.80,n.y));
 float under=rig_sm(.51,.56,vRigQ)*(1.-rig_sm(.66,.74,vRigQ));water*=1.-under*.12;
 float curtain=rig_sm(.58,.92,age)*(1.-rig_sm(1.24,1.5,age))*rig_sm(.37,.44,vRigQ)*(1.-rig_sm(.54,.61,vRigQ));
 water=mix(water,uRigWaterColor*(.70+.45*light)+reflection*.24,curtain*.25);
 float glint=pow(max(0.,dot(reflect(-v,n),sunDir())),180.);
 water+=vec3(.8,.96,.9)*glint*.6;
 float film=rig_sm(-.04,.05,bed(vRigPos.xz))*(1.-rig_sm(.06,.24,depth));
 base=mix(base,sand(vRigPos.xz,-v,1.,fwidth(vRigPos.xz)),film*.90);
 vec3 col=mix(base,water,face);
 float crest=exp(-pow((vRigQ-.485)/.008,2.))*rig_sm(-.30,.42,age)*(1.-impact);
 // Aeration travels over the rounding crest and stretches down the falling
 // sheet. Its fine streaks follow the water, rather than a painted lip line.
 float sheet=rig_sm(.345,.390,vRigQ)*(1.-rig_sm(.48,.505,vRigQ));
 float sheetAge=rig_sm(-.10,.85,age)*(1.-rig_sm(1.23,1.65,age));
 vec2 sheetUV=vec2(vRigPos.x*24.,vRigQ*130.-age*5.);
 float sheetNoise=rig_fbm(sheetUV+vec2(rig_noise(sheetUV*.3),0.));
 float filaments=rig_noise(vec2(vRigPos.x*95.,vRigQ*10.-age*2.));
 float aeration=sheet*sheetAge*(.025+.58*rig_sm(.43,.68,sheetNoise*.75+filaments*.25));
 float t=max(0.,wa-1.2),front=rig_frontAt(vRigPos.x,wa),behind=front-vRigPos.z;
 vec2 flow=vec2(vRigPos.x,vRigPos.z-front*.7);flow+=vec2(rig_noise(flow*2.),rig_noise(flow*2.+41.))*.12;
 float coarse=rig_fbm(flow*7.),grain=rig_noise(flow*54.);
 float rim=exp(-pow((behind-.07)/.16,2.));
 float wake=rig_sm(-.04,.14,behind)*(1.-rig_sm(1.5+uRigHeight*2.3,3.0+uRigHeight*2.6,behind));
 float fullness=1.-rig_sm(.35,1.85,t);
 float clusters=rig_sm(.45,.64,rig_fbm(flow*5.)+.08*grain);
 float lace=bubbleLace(flow*vec2(13.,9.))*(.20+.80*rig_fbm(flow*3.));
 float fineLace=rig_sm(.73,.89,rig_noise(flow*85.));
 float washOn=rig_sm(1.20,1.60,wa)*(1.-rig_sm(7.8,9.,wa));
 float froth=washOn*wake*mix(lace*.22+clusters*.46+fineLace*.08,.82+.12*grain,fullness);
 froth*=mix(.25+.75*lace,1.,rig_sm(.02,.24,behind))*exp(-max(0.,t-2.)*.18);
 froth=max(froth,washOn*rim*(.25+.60*lace));
 float foam=rig_sat(uRigFoam*(froth+aeration+crest*rig_sm(.30,.58,coarse)*(.25+.40*grain)))*rig_shoulder(vRigPos.x);
 // Foam lighting follows its churning layer, avoiding the submerged face's
 // shading discontinuity at the junction with the sloping beach.
 float e=.012;
 float nx=rig_churn(vRigPos.x+e,vRigPos.z,wa)-rig_churn(vRigPos.x-e,vRigPos.z,wa);
 float nz=rig_churn(vRigPos.x,vRigPos.z+e,wa)-rig_churn(vRigPos.x,vRigPos.z-e,wa);
 vec3 foamNormal=normalize(vec3(-nx,e*2.,-nz));
 float hollows=rig_fbm(flow*11.);
 vec3 white=uRigFoamColor*(.57+.36*max(0.,dot(foamNormal,sunDir()))+.07*hollows);
 col=mix(col,white,foam);
 col=mix(col,sky(normalize(vec3(-v.x,.003,-v.z)),false),seaHaze(distanceToCamera));
 float alpha=rig_sm(.001,.025,depth)*(1.-rig_sm(46.,65.,abs(vRigPos.x)))*rig_sm(-100.,-60.,vRigPos.z)*shoreEdge;
 if(alpha<.001)discard;gl_FragColor=vec4(finish(col),alpha);
}
`;
function meshData(){
 const xs=[-600,-160,-80,-55],qs=[-3,-1];for(let i=0;i<80;i++)qs.push(-.4+i*.005);for(let i=0;i<=320;i++)xs.push(-48+i*.3);xs.push(55,80,160,600);for(let i=0;i<=300;i++)qs.push(i/300);qs.push(1.1,1.5,2,5);
 const v=new Float32Array(xs.length*qs.length*2),idx=[];let k=0;for(const x of xs)for(const q of qs){v[k++]=x;v[k++]=q;}
 for(let i=0;i<xs.length-1;i++)for(let j=0;j<qs.length-1;j++){const a=i*qs.length+j;idx.push(a,a+1,a+qs.length,a+1,a+qs.length+1,a+qs.length);}
 return {v,idx:new Uint32Array(idx)};
}
function makePrograms(code,common){return {vertex:code.environment+common+world+vertex,fragment:code.environment+code.waves+code.waterLight+common+world+fragment};}
window.WaveRig={meshData,makePrograms};
window.createWaveRig=async function(lab){
 const {THREE,engine,uniforms:u}=lab;
 const [common,sv,sf,vf]=await Promise.all(['surface.glsl','spray.vert','spray.frag','whitewater.frag'].map(async p=>{const r=await fetch(p+'?v=shore04');if(!r.ok)throw Error(p+' failed to load');return r.text();}));
 Object.assign(u,{uRigTime:{value:0},uRigHeight:{value:1.2192},uRigAngle:{value:0},uRigBreakOffset:{value:0},uRigEvent:{value:0},uRigCurl:{value:1},uRigPeel:{value:1},uRigFoam:{value:1},uRigSpray:{value:1},uRigLipGlow:{value:.8},uRigWaterColor:{value:new THREE.Vector3(.012,.36,.33)},uRigFoamColor:{value:new THREE.Vector3(.89,.94,.91)}});
 const d=meshData(),geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(new Float32Array(d.v.length/2*3),3));geo.setAttribute('aRig',new THREE.BufferAttribute(d.v,2));geo.setIndex(new THREE.BufferAttribute(d.idx,1));
 const p=makePrograms(engine.labPrograms,common),mat=new THREE.ShaderMaterial({uniforms:u,vertexShader:p.vertex,fragmentShader:p.fragment,side:THREE.DoubleSide,transparent:true});const mesh=new THREE.Mesh(geo,mat);mesh.frustumCulled=false;mesh.renderOrder=1;engine.scene.add(mesh);engine.ocean.visible=false;engine.spray.visible=false;u.uBakeOn.value=0;
 let seed=7201;const rand=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;};
 const count=140000,seeds=new Float32Array(count*4);for(let i=0;i<count;i++){seeds[i*4]=(rand()-.5)*96;seeds[i*4+1]=rand();seeds[i*4+2]=rand();seeds[i*4+3]=(i<24000?0:i<84000?1:i<108000?2:3)+rand();}
 const sg=new THREE.BufferGeometry();sg.setAttribute('position',new THREE.BufferAttribute(new Float32Array(count*3),3));sg.setAttribute('aParticle',new THREE.BufferAttribute(seeds,4));u.uViewportHeight={value:engine.renderer.domElement.height};
 const sm=new THREE.ShaderMaterial({uniforms:u,vertexShader:engine.labPrograms.environment+common+sv,fragmentShader:engine.labPrograms.environment+common+sf,transparent:true,depthWrite:false});const spray=new THREE.Points(sg,sm);spray.frustumCulled=false;spray.renderOrder=3;engine.scene.add(spray);
 const vg=new THREE.BufferGeometry();vg.setAttribute('position',new THREE.BufferAttribute(new Float32Array([-1,-1,0,1,-1,0,-1,1,0,-1,1,0,1,-1,0,1,1,0]),3));
 const vm=new THREE.ShaderMaterial({uniforms:u,vertexShader:'varying vec2 vUv;void main(){vUv=position.xy*.5+.5;gl_Position=vec4(position,1.);}',fragmentShader:engine.labPrograms.environment+common+vf,transparent:true,depthWrite:false,depthTest:false});const volume=new THREE.Mesh(vg,vm);volume.frustumCulled=false;volume.renderOrder=2;engine.scene.add(volume);
 return {mesh,spray,volume,set(time,height,period=6,angle=0,offset=0,event=0){u.uRigTime.value=time*6/period;u.uRigHeight.value=Math.max(.3048,height*.3048);u.uRigAngle.value=angle;u.uRigBreakOffset.value=offset;u.uRigEvent.value=event;u.uViewportHeight.value=engine.renderer.domElement.height;},tune(values){for(const [name,key] of Object.entries({curl:'uRigCurl',peel:'uRigPeel',foam:'uRigFoam',spray:'uRigSpray',glow:'uRigLipGlow'}))if(Number.isFinite(values[name]))u[key].value=values[name];for(const [name,key] of Object.entries({water:'uRigWaterColor',white:'uRigFoamColor'}))if(/^#[0-9a-f]{6}$/i.test(values[name]||'')){const c=values[name].slice(1).match(/../g).map(v=>{const s=parseInt(v,16)/255;return s<=.04045?s/12.92:Math.pow((s+.055)/1.055,2.4);});u[key].value.set(...c);}},dispose(){engine.scene.remove(mesh,spray,volume);for(const o of [geo,mat,sg,sm,vg,vm])o.dispose();engine.ocean.visible=true;engine.spray.visible=true;}};
};
})();
