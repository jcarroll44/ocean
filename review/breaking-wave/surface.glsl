// Authored plunging breaker; metres, not a calibrated fluid solver.
uniform float uTime,uHeight;
uniform float uRigCurl,uRigPeel,uRigFoam,uRigSpray,uRigLipGlow;
uniform vec3 uRigWaterColor,uRigFoamColor;
float sat(float a){return clamp(a,0.0,1.0);}
float sm(float a,float b,float x){float t=sat((x-a)/(b-a));return t*t*(3.0-2.0*t);}
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){return .55*noise(p)+.27*noise(p*2.07)+.13*noise(p*4.13)+.05*noise(p*8.3);}
vec2 bez(vec2 a,vec2 b,vec2 c,vec2 d,float t){float s=1.0-t;return a*s*s*s+3.0*b*s*s*t+3.0*c*s*t*t+d*t*t*t;}
float ageAt(float x){return uTime/sqrt(uHeight/1.2192)-2.7+x*.17/max(.35,uRigPeel)+.06*sin(x*1.6)+.025*sin(x*3.2);}
float ripple(vec2 p){return .009*sin(p.x*3.3+p.y*2.1-uTime*1.8)+.004*sin(p.x*7.5-p.y*5.1+uTime*2.4)+.015*sin(p.y*.6+p.x*.23-uTime*.8);}
float centerAt(float x){return (uTime/sqrt(uHeight/1.2192)-3.0)*.70*uHeight+.08*x+.09*sin(x*.3);}
float shoulderAt(float x){return 1.-sm(9.,21.,abs(x));}
float boreAt(float age){return 1.35+max(0.,age-1.45)*.86;}
// The cross-section folds back on itself: a thick outer roof, a round lip,
// an underside, then a concave inner face. There is actual air between them.
vec2 section(float q,float age){
 float curl=sm(-.25,.65,age),w=uRigCurl;
 float ly=max(-.18,.76-.72*pow(max(0.,age-.28),2.0));
 float throwX=(1.10+.18*sm(.2,1.4,age))*w;
 vec2 p;
 if(q<0.)p=vec2(-8.+q*180.,0.);
 else if(q<.28)p=bez(vec2(-8,0),vec2(-4,.01),vec2(-1.7,.79),vec2(-.10,.84),q/.28);
 else if(q<.48){float t=(q-.28)/.20;
  p=mix(bez(vec2(-.10,.84),vec2(-.02,.85),vec2(.03,.85),vec2(.08,.82),t),
    bez(vec2(-.10,.84),vec2(.40*w,1.04),vec2(1.30*w,.90),vec2(throwX,ly),t),curl);
 }else if(q<.51){float t=(q-.48)/.03;
  p=mix(mix(vec2(.08,.82),vec2(.12,.81),t),
    bez(vec2(throwX,ly),vec2(throwX+.005,ly-.04),vec2(throwX-.065,ly-.05),vec2(throwX-.075,ly+.035),t),curl);
 }else if(q<.66){float t=(q-.51)/.15;
  p=mix(bez(vec2(.12,.81),vec2(.18,.79),vec2(.25,.73),vec2(.35,.60),t),
    bez(vec2(throwX-.075,ly+.035),vec2(1.18*w,.85),vec2(.15*w,.89),vec2(.04*w,.49),t),curl);
 }else if(q<.83){float t=(q-.66)/.17;
  p=mix(bez(vec2(.35,.60),vec2(.55,.29),vec2(.90,-.16),vec2(1.35,-.16),t),
    bez(vec2(.04*w,.49),vec2(-.12*w,.11),vec2(.15*w,-.18),vec2(.78*w,-.16),t),curl);
 }else if(q<=1.)p=bez(mix(vec2(1.35,-.16),vec2(.78*w,-.16),curl),vec2(2.,-.19),vec2(3,0),vec2(8,0),(q-.83)/.17);
 else p=vec2(8.+(q-1.)*70.,0.);
 return p;
}
vec3 wavePoint(float x,float q){
 float age=ageAt(x),build=sm(-3.,-.35,age),decay=1.-sm(4.,6.,age),shoulder=shoulderAt(x);
 vec2 p=section(q,age);
 // Contact tears the jet and rapidly folds it into a rough travelling bore.
 // Do not leave a vertical, smoothly shrinking glass wall after impact.
 float impact=sm(1.38,1.76,age),unroll=sm(1.53,1.96,age);
 if(q>=0.&&q<=1.){
  float z=-8.+16.*sm(0.,1.,q);
  p.x=mix(p.x,z,unroll);
  float front=boreAt(age),bump=exp(-pow((p.x-front)/.85,2.));
  float churn=noise(vec2(x*1.8,p.x*2.-age*3.));
  float bore=(.22+.09*churn)*bump;
  p.y=mix(p.y,bore,impact);
  p.y+=impact*.045*(churn-.35)*exp(-pow((p.x-front)/1.6,2.));
  p.x+=impact*.035*sin(x*7.+age*5.)*bump;
 }
 float amp=(.30+.70*build)*decay*shoulder;
 p.y*=amp*(1.+.025*sin(x*1.2)+.012*sin(x*3.6));
 float lip=exp(-pow((q-.48)/.11,2.))*sm(.4,1.3,age)*(1.-impact);
 p.y+=.022*lip*shoulder*sin(x*17.+age*3.);
 p*=uHeight;p.x+=centerAt(x);
 p.y+=ripple(vec2(x,p.x))*sm(0.,.08,q)*(1.-sm(1.,1.08,q))*(1.-sm(25.,35.,abs(x)))*(1.-.72*build*exp(-pow((q-.56)/.28,2.)));
 return vec3(x,p.y,p.x);
}
