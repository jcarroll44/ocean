attribute vec4 aParticle;uniform float uViewportHeight;
varying float vAlpha,vSeed,vKind,vDiameter;varying vec3 vParticle;
void main(){
 float x=aParticle.x,seed=aParticle.y,spawn=aParticle.z,kind=floor(aParticle.w),rnd=fract(aParticle.w),age=rig_ageAt(x),scale=sqrt(uRigHeight/1.2192);
 float plume=rig_noise(vec2(x*1.6,uRigEvent*13.+2.));
 float birth=kind<.5?-.40+spawn*1.15:kind<1.5?.76+spawn*.65:kind<2.5?.90+spawn*1.4:.82+spawn*.60;
 float elapsed=max(0.,age-birth),t=elapsed*scale,speed=sqrt(9.81*uRigHeight);
 float center=rig_breakZ()+rig_centerAt(x)-elapsed*uRigHeight*.3;
 vec2 profile=rig_section(.485,birth);
 vec3 p=vec3(x,mix(.05,profile.y,1.-step(.5,kind))*uRigHeight,center+mix(.90,profile.x,1.-step(.5,kind))*uRigHeight);
 float life=kind<.5?.30+.22*seed:kind<1.5?.65+.55*seed:kind<2.5?3.7:.65+.40*seed;
 if(kind<2.||kind>2.5){
  float vy=kind<.5?.16+.20*seed:kind<1.5?.48+.48*plume+.26*seed:.38+.8*seed;
  p.y+=t*speed*vy-4.905*t*t;
  p.z+=t*speed*(kind<.5?.20:.22+.38*rnd);
  p.x+=sin(seed*391.)*t*speed*.30;
 }else{
  float front=rig_frontAt(x,age);p.z=front-uRigHeight*(.05+spawn*2.4);
  float terrain=max(0.,bed(vec2(x,p.z)));
  p.y=terrain+rig_roller(x,p.z,age)+rig_churn(x,p.z,age)+uRigHeight*(.010+.020*seed);
  p.x+=.10*sin(age*4.+seed*100.);
 }
 float diameter=kind<.5?uRigHeight*(.008+.020*seed):kind<1.5?uRigHeight*(seed<.20?.08+.12*rnd:.012+.036*rnd):kind<2.5?uRigHeight*(.009+.020*seed):uRigHeight*(.003+.010*seed);
 float alpha=step(birth,age)*rig_sm(0.,.05,elapsed)*(1.-rig_sm(life*.55,life,elapsed));
 if(kind<1.5||kind>2.5)alpha*=rig_sm(bed(p.xz)-.02,bed(p.xz)+diameter*.35,p.y);
 if(kind>1.5&&kind<2.5)alpha*=1.-rig_sm(3.1,5.7,age-.9);
 if(kind>.5&&kind<1.5)alpha*=.45+.40*rig_sm(.15,.75,plume);
 alpha*=rig_shoulder(x)*(kind<.5||kind>2.5?uRigSpray:uRigFoam);
 p=rig_rotate(p);p.y+=uTide;vParticle=p;vDiameter=diameter;vAlpha=alpha;vSeed=seed;vKind=kind;
 gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);
 gl_PointSize=clamp(.5*uViewportHeight*projectionMatrix[1][1]*diameter/max(.2,gl_Position.w),1.,160.);
}
