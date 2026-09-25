attribute vec4 aFoam;
varying vec3 vFoamPos,vFoamNormal;
varying float vFoamLife,vFoamSeed;
void main(){
 float x=aFoam.x,seed=aFoam.y,age=ageAt(x);
 float birth=1.37+aFoam.w*.22,t=max(0.,age-birth);
 float life=sm(0.,.20,t)*(1.-sm(2.3,4.7,t))*shoulderAt(x);
 life*=sm(0.,.15,uRigFoam)*step(seed,clamp(uRigFoam*.72,0.,1.));
 float trail=aFoam.z;
 float radius=uHeight*(.055+.095*seed)*life;
 vec3 p=position;
 float roll=t*5.+seed*30.;p.yz=mat2(cos(roll),-sin(roll),sin(roll),cos(roll))*p.yz;
 vec3 normalDirection=p;
 float rough=.94+.10*noise(p.xy*5.+vec2(seed*30.,t*2.))+.025*sin(p.z*14.+seed*60.+t*4.);
 vec3 scale=vec3(1.3,.76,1.1);
 float z=boreAt(age)-trail*1.7+.16*sin(seed*60.+t*2.);
 float churn=noise(vec2(x*1.8,z*2.-age*3.));
 float surface=(.22+.09*churn)*exp(-pow((z-boreAt(age))/.85,2.))+.045*(churn-.35)*exp(-pow((z-boreAt(age))/1.6,2.));
 surface*=shoulderAt(x)*(1.-sm(4.,6.,age));
 vec3 center=vec3(x,uHeight*surface-radius*.45,centerAt(x)+z*uHeight);
 center.y+=uHeight*.29*exp(-pow((t-.30)/.28,2.))*(1.-trail*.6);
 center.y+=radius*.10*sin(t*6.+seed*80.);
 p=center+p*scale*radius*rough;
 p=rig_place(p);p.y=max(p.y,bed(p.xz)+.009);
 vFoamPos=p;vFoamNormal=normalize(rig_rotate(normalDirection/scale));
 vFoamLife=life;vFoamSeed=seed;
 gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);
}
