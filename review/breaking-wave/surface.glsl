// Shorebreak choreography in metres. Authored animation, not a fluid solver.
uniform float uRigTime,uRigHeight,uRigCurl,uRigPeel,uRigFoam,uRigSpray,uRigLipGlow,uRigEvent;
uniform float uRigAngle,uRigBreakOffset;
uniform vec3 uRigWaterColor,uRigFoamColor;
float rig_sat(float x){return clamp(x,0.,1.);}
float rig_sm(float a,float b,float x){float t=rig_sat((x-a)/(b-a));return t*t*(3.-2.*t);}
float rig_hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float rig_noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(rig_hash(i),rig_hash(i+vec2(1,0)),f.x),mix(rig_hash(i+vec2(0,1)),rig_hash(i+vec2(1)),f.x),f.y);}
float rig_fbm(vec2 p){return .57*rig_noise(p)+.28*rig_noise(p*2.03+11.)+.15*rig_noise(p*4.13+29.);}
vec2 rig_bez(vec2 a,vec2 b,vec2 c,vec2 d,float t){float s=1.-t;return a*s*s*s+3.*b*s*s*t+3.*c*s*t*t+d*t*t*t;}
float rig_mode(){float r=rig_hash(vec2(floor(uRigEvent)+17.,83.));return uRigEvent<.5?0.:r<.64?0.:r<.77?1.:r<.90?2.:3.;}
float rig_ageAt(float x){
 float mode=rig_mode(),pace=max(.5,uRigPeel);
 float offset=(rig_noise(vec2(x*.17,uRigEvent*7.))-.5)*.12;
 if(mode>.5&&mode<1.5)offset+=x*.035/pace;
 if(mode>1.5&&mode<2.5)offset-=x*.035/pace;
 if(mode>2.5)offset+=.23*sin(x*.53+uRigEvent)+.10*sin(x*1.3);
 return uRigTime/sqrt(uRigHeight/1.2192)-3.2+offset;
}
float rig_shoulder(float x){return 1.-rig_sm(36.,48.,abs(x));}
float rig_breakZ(){return -3.5-1.8*uRigHeight+uRigBreakOffset;}
float rig_centerAt(float x){float a=rig_ageAt(x);return -4.*uRigHeight*(1.-rig_sm(-3.2,.70,a));}
float rig_frontAt(float x,float age){
 float t=max(0.,age-.90),runup=min(3.4,uRigHeight*2.4);
 float forward=(uRigHeight+runup)*(1.-exp(-t*1.65));
 float back=(uRigHeight+runup+.9)*rig_sm(2.25,5.6,t);
 float irregular=uRigHeight*(.20*sin(x*1.3)+.09*sin(x*4.1)+.10*rig_noise(vec2(x*2.,uRigEvent)))*rig_sm(.0,.7,t);
 return -3.5-uRigHeight+uRigBreakOffset+forward-back+irregular;
}
float rig_roller(float x,float z,float age){
 float t=max(0.,age-.9),front=rig_frontAt(x,age),w=uRigHeight*(.35+.14*t);
 float n=rig_fbm(vec2(x*3.2,z*5.-uRigTime*3.));
 float ridge=exp(-pow((z-front+uRigHeight*.35)/max(.12,w),2.));
 return uRigHeight*(.20+.12*n)*exp(-t*.60)*ridge;
}
float rig_churn(float x,float z,float age){
 float t=max(0.,age-.9),behind=rig_frontAt(x,age)-z;
 float wake=rig_sm(0.,.22,behind)*(1.-rig_sm(1.5+uRigHeight*2.,3.+uRigHeight*2.5,behind));
 vec2 flow=vec2(x,z-uRigTime*.40);
 float broad=rig_fbm(flow*5.),fine=rig_noise(flow*21.);
 return uRigHeight*.10*exp(-t*.42)*wake*(.75*broad+.25*fine);
}
vec3 rig_rotate(vec3 p){float c=cos(uRigAngle),s=sin(uRigAngle);p.xz=mat2(c,-s,s,c)*p.xz;return p;}
vec2 rig_section(float q,float age){
 float curl=rig_sm(-.05,.68,age)*rig_sm(.25,.9,uRigHeight),w=uRigCurl;
 float ly=max(-.12,.84-1.75*pow(max(0.,age-.25),2.));
 vec2 p;
 if(q<0.)p=vec2(-12.+q*120.,0.);
 else if(q<.34)p=rig_bez(vec2(-12,0),vec2(-5,0),vec2(-1.65,.88),vec2(0,.90),q/.34);
 else if(q<.48){float t=(q-.34)/.14;
  p=mix(rig_bez(vec2(0,.90),vec2(.03,.91),vec2(.10,.90),vec2(.14,.86),t),rig_bez(vec2(0,.90),vec2(.38*w,1.04),vec2(.85*w,.88),vec2(.90*w,ly),t),curl);
 }else if(q<.51){float t=(q-.48)/.03;
  p=mix(mix(vec2(.14,.86),vec2(.17,.84),t),rig_bez(vec2(.90*w,ly),vec2(.91*w,ly-.045),vec2(.85*w,ly-.05),vec2(.84*w,ly+.02),t),curl);
 }else if(q<.64){float t=(q-.51)/.13;
  p=mix(rig_bez(vec2(.17,.84),vec2(.22,.75),vec2(.26,.62),vec2(.28,.48),t),rig_bez(vec2(.84*w,ly+.02),vec2(.91*w,.70),vec2(.01,.88),vec2(.035,.48),t),curl);
 }else if(q<.78)p=rig_bez(mix(vec2(.28,.48),vec2(.035,.48),curl),vec2(.1,.07),vec2(.4,-.10),vec2(.9,-.10),(q-.64)/.14);
 else if(q<=1.)p=rig_bez(vec2(.9,-.10),vec2(1.3,-.10),vec2(4,0),vec2(12,0),(q-.78)/.22);
 else p=vec2(12.+(q-1.)*60.,0.);
 return p;
}
vec3 rig_wavePoint(float x,float q){
 float age=rig_ageAt(x),build=rig_sm(-3.2,-.15,age),impact=rig_sm(1.04,1.15,age);
 vec2 section=rig_section(q,age);
 float shape=rig_shoulder(x)*(.15+.85*build)*(1.+.060*sin(x*.8)+.025*sin(x*1.7)+.010*sin(x*5.7));
 vec3 p=vec3(x,section.y*uRigHeight*shape,rig_breakZ()+rig_centerAt(x)+section.x*uRigHeight);
 if(q>=0.&&q<=1.){
  float flatZ=rig_breakZ()+(-12.+24.*rig_sm(0.,1.,q))*uRigHeight;
  p.z=mix(p.z,flatZ,impact);
  // Collapse vertically before redistributing the mesh along the beach.
  // All folded sections are on the same height field when their rows move.
  p.y=mix(p.y,rig_roller(x,p.z,age)*rig_shoulder(x),rig_sm(.72,1.04,age));
 }
 float chop=.006*sin(x*4.+p.z*3.-uRigTime*2.)+.004*sin(x*9.-p.z*6.+uRigTime);
 p.y+=chop*(1.-build*.65)*rig_sm(0.,.08,q)*(1.-rig_sm(1.,1.08,q))*rig_shoulder(x);
 return rig_rotate(p);
}
