// Shorebreak choreography in metres. Authored animation, not a fluid solver.
uniform float uRigTime,uRigHeight,uRigCurl,uRigPeel,uRigFoam,uRigSpray,uRigLipGlow,uRigEvent;
uniform float uRigAngle,uRigBreakOffset;
uniform vec3 uRigWaterColor,uRigFoamColor;
float rig_sat(float x){return clamp(x,0.,1.);}
float rig_sm(float a,float b,float x){float t=rig_sat((x-a)/(b-a));return t*t*(3.-2.*t);}
float rig_hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float rig_noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(rig_hash(i),rig_hash(i+vec2(1,0)),f.x),mix(rig_hash(i+vec2(0,1)),rig_hash(i+vec2(1)),f.x),f.y);}
float rig_fbm(vec2 p){return .57*rig_noise(p)+.28*rig_noise(p*2.03+11.)+.15*rig_noise(p*4.13+29.);}
float rig_clock(){return uRigTime+uRigEvent*9.5*sqrt(uRigHeight/1.2192);}
vec2 rig_bez(vec2 a,vec2 b,vec2 c,vec2 d,float t){float s=1.-t;return a*s*s*s+3.*b*s*s*t+3.*c*s*t*t+d*t*t*t;}
float rig_modeFor(float event){float r=rig_hash(vec2(floor(event)+17.,83.));return abs(event)<.5?0.:r<.64?0.:r<.77?1.:r<.90?2.:3.;}
float rig_mode(){return rig_modeFor(uRigEvent);}
float rig_offset(float x,float event){
 float mode=rig_modeFor(event),pace=max(.5,uRigPeel);
 float offset=(rig_noise(vec2(x*.23,event*7.))-.5)*.42+.075*sin(x*.81+event*2.1);
 if(mode>.5&&mode<1.5)offset+=x*.035/pace;
 if(mode>1.5&&mode<2.5)offset-=x*.035/pace;
 if(mode>2.5)offset+=.23*sin(x*.53+event)+.10*sin(x*1.3);
 return offset;
}
float rig_ageAt(float x){return uRigTime/sqrt(uRigHeight/1.2192)-4.2+rig_offset(x,uRigEvent);}
float rig_washAge(float x){float a=rig_ageAt(x);return a<1.2?uRigTime/sqrt(uRigHeight/1.2192)+5.3+rig_offset(x,uRigEvent-1.):a;}
float rig_shoulder(float x){return 1.-rig_sm(36.,48.,abs(x));}
float rig_breakZ(){return -3.5-1.8*uRigHeight+uRigBreakOffset;}
float rig_nextSwell(float x,float z){
 float phase=uRigTime/sqrt(uRigHeight/1.2192);
 float arrive=rig_sm(7.2,9.5,phase+rig_offset(x,uRigEvent+1.));
 float center=rig_breakZ()-14.24*uRigHeight;
 float shape=1.+.085*sin(x*.8)+.038*sin(x*1.7)+.013*sin(x*5.7);
 return .203*uRigHeight*shape*arrive*exp(-pow((z-center)/(2.88*uRigHeight),2.))*rig_shoulder(x);
}
float rig_centerAt(float x){float a=rig_ageAt(x);return -14.*uRigHeight*(1.-rig_sm(-4.2,.10,a));}
float rig_frontAt(float x,float age){
 float t=max(0.,age-1.20),runup=min(2.8,uRigHeight*1.9);
 float forward=(uRigHeight+runup)*(1.-exp(-t*1.35));
 float back=(uRigHeight+runup+4.*uRigHeight)*rig_sm(2.0,7.3,t);
 float irregular=uRigHeight*(.16*sin(x*1.3)+.06*sin(x*4.1)+.06*sin(x*9.3))*rig_sm(.0,.7,t);
 return -3.5-uRigHeight+uRigBreakOffset+forward-back+irregular;
}
float rig_roller(float x,float z,float age){
 float t=max(0.,age-1.2),front=rig_frontAt(x,age),w=uRigHeight*(.23+.10*t);
 float n=rig_fbm(vec2(x*3.2,z*5.-rig_clock()*3.));
 float ridge=exp(-pow((z-front+uRigHeight*.35)/max(.12,w),2.));
 return uRigHeight*(.24+.16*n)*exp(-t*1.05)*ridge;
}
float rig_churn(float x,float z,float age){
 float t=max(0.,age-1.2),behind=rig_frontAt(x,age)-z;
 float wake=rig_sm(0.,.22,behind)*(1.-rig_sm(1.5+uRigHeight*2.,3.+uRigHeight*2.5,behind));
 vec2 flow=vec2(x,z-rig_clock()*.40);
 float broad=rig_fbm(flow*5.),fine=rig_noise(flow*21.);
 return uRigHeight*.065*exp(-t*.75)*wake*(.75*broad+.25*fine);
}
vec3 rig_rotate(vec3 p){float c=cos(uRigAngle),s=sin(uRigAngle);p.xz=mat2(c,-s,s,c)*p.xz;return p;}
vec2 rig_section(float q,float age){
 float curl=rig_sm(-.15,.62,age)*rig_sm(.25,.65,uRigHeight),w=uRigCurl;
 float ly=max(-.15,.91-1.38*pow(max(0.,age-.34),2.));
 float tip=(.30+.94*rig_sm(-.05,1.15,age))*w;
 vec2 p;
 if(q<0.)p=vec2(-12.+q*120.,0.);
 else if(q<.34)p=rig_bez(vec2(-12,0),vec2(-5,0),vec2(-1.85,.78),vec2(-.22,.90),q/.34);
 else if(q<.48){float t=(q-.34)/.14;
  p=mix(rig_bez(vec2(-.22,.90),vec2(.0,.96),vec2(.22,.91),vec2(.27,.82),t),rig_bez(vec2(-.22,.90),vec2(.25*w,1.13),vec2(tip,.99),vec2(tip,ly),t),curl);
 }else if(q<.51){float t=(q-.48)/.03;
  p=mix(mix(vec2(.27,.82),vec2(.29,.80),t),rig_bez(vec2(tip,ly),vec2(tip+.025,ly-.032),vec2(tip-.045,ly-.035),vec2(tip-.055,ly+.018),t),curl);
 }else if(q<.64){float t=(q-.51)/.13;
  p=mix(rig_bez(vec2(.29,.80),vec2(.31,.74),vec2(.34,.60),vec2(.40,.43),t),rig_bez(vec2(tip-.055,ly+.018),vec2(tip-.06,.82),vec2(-.28,.86),vec2(-.23,.43),t),curl);
 }else if(q<.78)p=rig_bez(mix(vec2(.40,.43),vec2(-.23,.43),curl),vec2(-.30,.04),vec2(.4,-.10),vec2(.9,-.10),(q-.64)/.14);
 else if(q<=1.)p=rig_bez(vec2(.9,-.10),vec2(1.3,-.10),vec2(4,0),vec2(12,0),(q-.78)/.22);
 else p=vec2(12.+(q-1.)*60.,0.);
 return p;
}
vec3 rig_wavePoint(float x,float q){
 float age=rig_ageAt(x),build=rig_sm(-4.2,-.15,age),impact=rig_sm(1.68,1.82,age);
 vec2 section=rig_section(q,age);
 float shape=rig_shoulder(x)*(.35+.65*build)*(1.+.085*sin(x*.8)+.038*sin(x*1.7)+.013*sin(x*5.7));
 vec3 p=vec3(x,section.y*uRigHeight*shape,rig_breakZ()+rig_centerAt(x)+section.x*uRigHeight);
 float grid=q<0.?-12.+q*120.:q>1.?12.+(q-1.)*60.:-12.+24.*rig_sm(0.,1.,q);
 float approach=.58*exp(-pow((grid-rig_centerAt(x)/uRigHeight+.24)/2.88,2.))*uRigHeight*shape;
 p=mix(vec3(x,approach,rig_breakZ()+grid*uRigHeight),p,rig_sm(-1.5,-.20,age));
 float feather=rig_sm(.42,.86,age)*(1.-rig_sm(1.22,1.55,age))*exp(-pow((q-.485)/.045,2.));
 float flutter=rig_fbm(vec2(x*9.,age*2.))-0.5;
 p.y+=uRigHeight*.065*feather*flutter;p.z+=uRigHeight*.025*feather*sin(x*17.+age*4.);
 if(q>=0.&&q<=1.){
  float flatZ=rig_breakZ()+grid*uRigHeight;
  p.z=mix(p.z,flatZ,impact);
  // Collapse vertically before redistributing the mesh along the beach.
  // All folded sections are on the same height field when their rows move.
  p.y=mix(p.y,rig_roller(x,p.z,age)*rig_shoulder(x),rig_sm(1.22,1.67,age));
 }
 float clock=rig_clock();
 float chop=.004*sin(x*4.+p.z*3.-clock*2.)+.002*sin(x*9.-p.z*6.+clock);
 p.y+=chop*exp(-abs(p.z)*.02)*rig_shoulder(x);
 return rig_rotate(p);
}
