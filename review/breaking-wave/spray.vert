attribute vec4 aParticle;
uniform float uViewportHeight;
varying float vAlpha,vSeed,vMist;
void main(){
 float x=aParticle.x,seed=aParticle.y,age=ageAt(x);
 float lip=step(.48,aParticle.w);
 float birth=mix(1.40+aParticle.z*.80,-.05+aParticle.z*1.5,lip);
 float elapsed=max(0.,age-birth),t=elapsed*sqrt(uHeight/1.2192);
 vec2 origin=section(.487,birth);
 vec3 p=vec3(x,mix(.05,origin.y,lip)*uHeight,centerAt(x)+(mix(1.30,origin.x,lip)-elapsed*.70)*uHeight);
 float speed=sqrt(uHeight*9.81);
 p.y+=t*speed*mix(.38+seed*.65,.16+seed*.18,lip)-4.905*t*t;
 p.x+=sin(seed*195.)*t*speed*.23;
 p.z+=t*speed*mix(.23+aParticle.z*.5,.30+aParticle.z*.28,lip);
 float life=mix(.75,.6,lip)*sqrt(uHeight/1.2192);
 vAlpha=step(birth,age)*(1.-sm(life*.55,life,t))*sm(-.03,.06,p.y)*shoulderAt(x);
 vAlpha*=sm(0.,.12,uRigSpray)*step(seed,clamp(uRigSpray*.68,0.,1.));
 p=rig_place(p);vSeed=seed;vMist=step(.7,seed);
 gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);
 float diameter=uHeight*mix(.004+.012*seed,.025+.045*seed,vMist);
 gl_PointSize=clamp(uViewportHeight*projectionMatrix[1][1]*diameter/max(.1,gl_Position.w),1.,48.);
}
