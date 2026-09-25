attribute vec4 aParticle;uniform float uViewportHeight;
varying float vAlpha,vSeed,vKind,vDiameter;varying vec3 vParticle;varying vec2 vStreak;
void main(){
 float x=aParticle.x,seed=aParticle.y,spawn=aParticle.z,kind=floor(aParticle.w),rnd=fract(aParticle.w),age=rig_ageAt(x),scale=sqrt(uRigHeight/1.2192);
 float plume=rig_noise(vec2(x*1.6,uRigEvent*13.+2.));
 float birth=kind<.5?-.25+spawn*1.25:kind<1.5?1.20+spawn*.45:kind<2.5?1.20+spawn*.85:1.18+spawn*.48;
 float elapsed=max(0.,age-birth),t=elapsed*scale,speed=sqrt(9.81*uRigHeight);
 float center=rig_breakZ()+rig_centerAt(x)-elapsed*uRigHeight*.3;
 vec2 profile=rig_section(.485,birth);
 float heightVariation=1.+.085*sin(x*.8)+.038*sin(x*1.7)+.013*sin(x*5.7);
 vec3 p=vec3(x,mix(.05,profile.y*heightVariation,1.-step(.5,kind))*uRigHeight,center+mix(1.22,profile.x,1.-step(.5,kind))*uRigHeight);
 vec3 velocity=vec3(0.,1.,0.);
 float life=kind<.5?.30+.22*seed:kind<1.5?.65+.55*seed:kind<2.5?3.7:.65+.40*seed;
 if(kind<2.||kind>2.5){
  float vy=kind<.5?.16+.20*seed:kind<1.5?.48+.48*plume+.26*seed:.38+.8*seed;
  velocity=vec3(sin(seed*391.)*speed*.12,speed*vy-9.81*t,speed*(kind<.5?.20:.22+.38*rnd));
  p.y+=t*speed*vy-4.905*t*t;
  p.z+=t*speed*(kind<.5?.20:.22+.38*rnd);
  p.x+=sin(seed*391.)*t*speed*.12;
 }else{
  float front=rig_frontAt(x,age);p.z=front-uRigHeight*(.05+spawn*2.4);
  float terrain=max(0.,bed(vec2(x,p.z)));
  p.y=terrain+rig_roller(x,p.z,age)+rig_churn(x,p.z,age)+uRigHeight*(.010+.020*seed);
  p.x+=.10*sin(age*4.+seed*100.);
 }
 float diameter=kind<.5?uRigHeight*(.010+.026*seed):kind<1.5?uRigHeight*(.012+.032*rnd):kind<2.5?uRigHeight*(.009+.020*seed):uRigHeight*(.015+.030*seed);
 float alpha=step(birth,age)*rig_sm(0.,.05,elapsed)*(1.-rig_sm(life*.55,life,elapsed));
 if(kind<1.5||kind>2.5)alpha*=rig_sm(bed(p.xz)-.02,bed(p.xz)+diameter*.35,p.y);
 if(kind>1.5&&kind<2.5)alpha*=1.-rig_sm(1.2,2.5,age-1.2);
 if(kind>.5&&kind<1.5)alpha*=.45+.40*rig_sm(.15,.75,plume);
 alpha*=rig_shoulder(x)*(kind<.5||kind>2.5?uRigSpray:uRigFoam);
 p=rig_rotate(p);p.y+=uTide;vParticle=p;vDiameter=diameter;vAlpha=alpha;vSeed=seed;vKind=kind;
 gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);
 vec4 moved=projectionMatrix*modelViewMatrix*vec4(p+velocity*.01,1.);
 vec2 screen=(moved.xy/moved.w-gl_Position.xy/gl_Position.w)*vec2(uResolution.x/uResolution.y,-1.);
 vStreak=normalize(screen+vec2(.000001));
 gl_PointSize=clamp(.5*uViewportHeight*projectionMatrix[1][1]*diameter/max(.2,gl_Position.w),1.,160.);
}
