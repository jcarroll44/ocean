// Authored continuous plunging surface. This is a controllable animation model,
// not a calibrated fluid solver. Coordinates and height are in metres.
uniform float uTime, uHeight;
float sat(float a){return clamp(a,0.0,1.0);}
float sm(float a,float b,float x){float t=sat((x-a)/(b-a));return t*t*(3.0-2.0*t);}
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1)),f.x),f.y);}
float fbm(vec2 p){return .55*noise(p)+.27*noise(p*2.07)+.13*noise(p*4.13)+.05*noise(p*8.3);}
vec2 bez(vec2 a,vec2 b,vec2 c,vec2 d,float t){float s=1.0-t;return a*s*s*s+3.0*b*s*s*t+3.0*c*s*t*t+d*t*t*t;}
float ageAt(float x){return uTime/sqrt(uHeight/1.2192)-2.7+x*.10+.07*sin(x*1.6)+.035*sin(x*3.2);}
float ripple(vec2 p){return .009*sin(p.x*3.3+p.y*2.1-uTime*1.8)+.004*sin(p.x*7.5-p.y*5.1+uTime*2.4)+.015*sin(p.y*.6+p.x*.23-uTime*.8);}
float centerAt(float x){return (uTime/sqrt(uHeight/1.2192)-3.0)*.70*uHeight+.10*x+.12*sin(x*.3);}
// One topologically connected cross-section: back, outer jet, rounded lip,
// underside, hollow face, trough, and undisturbed sea. No rectangular patch.
vec3 wavePoint(float x,float q){
 float age=ageAt(x),curl=sm(-.2,.65,age),collapse=sm(1.50,1.95,age);
 float build=sm(-3.0,-.35,age),decay=1.0-sm(4.0,6.0,age);
 float shoulder=1.0-sm(11.0,24.0,abs(x));
 float amp=(.30+.70*build)*decay*shoulder;
 float lobe=1.0+.035*sin(x*1.2)+.015*sin(x*3.6);
 vec2 p;
 if(q<0.0){p=vec2(-8.0+q*180.0,0.0);}
 else if(q<.28){float t=q/.28;p=bez(vec2(-8,0),vec2(-4.0,.01),vec2(-2.0,.78),vec2(-.10,.84),t);}
 else if(q<.48){float t=(q-.28)/.20;
  vec2 a=bez(vec2(-.10,.84),vec2(-.02,.85),vec2(.03,.85),vec2(.08,.82),t);
  vec2 b=bez(vec2(-.10,.84),vec2(.40,1.00),vec2(1.26,.86),vec2(1.13,max(-.16,.76-.61*pow(max(0.0,age-.20),2.0))),t);
  p=mix(a,b,curl);
 }else if(q<.51){float t=(q-.48)/.03;
  vec2 a=mix(vec2(.08,.82),vec2(.12,.81),t);
  float ly=max(-.16,.76-.61*pow(max(0.0,age-.20),2.0));
  vec2 b=bez(vec2(1.13,ly),vec2(1.12,ly-.05),vec2(1.01,ly-.04),vec2(1.02,ly+.04),t);
  p=mix(a,b,curl);
 }else if(q<.66){float t=(q-.51)/.15;
  vec2 a=bez(vec2(.12,.81),vec2(.18,.79),vec2(.25,.73),vec2(.35,.60),t);
  vec2 b=bez(vec2(1.02,max(-.16,.76-.61*pow(max(0.0,age-.20),2.0))+.04),vec2(1.18,.57),vec2(.60,.86),vec2(.21,.64),t);
  p=mix(a,b,curl);
 }else if(q<.83){float t=(q-.66)/.17;
  vec2 a=bez(vec2(.35,.60),vec2(.55,.29),vec2(.90,-.16),vec2(1.35,-.16),t);
  vec2 b=bez(vec2(.21,.64),vec2(-.13,.47),vec2(-.01,-.16),vec2(.66,-.16),t);
  p=mix(a,b,curl);
 }else if(q<=1.0){float t=(q-.83)/.17;
  p=bez(mix(vec2(1.35,-.16),vec2(.66,-.16),curl),vec2(2.0,-.19),vec2(3.0,0),vec2(8,0),t);
 }else{p=vec2(8.0+(q-1.0)*70.0,0.0);}
 // After contact, the enclosed air pocket collapses into a travelling bore.
 // Keep the parameter order monotonic as the surface resolves.
 float boreZ=-8.0+16.0*sm(0.0,1.0,q);
 float boreFront=1.5+(max(0.0,age-1.5))*.8;
 float boreY=.33*exp(-pow((boreZ-boreFront)/1.2,2.0));
 if(q>=0.0&&q<=1.0){p.y=mix(p.y,boreY,collapse);p.x=mix(p.x,boreZ,sm(1.92,2.5,age));}
 p.y*=amp*lobe;
 p.x*=uHeight;p.y*=uHeight;
 p.x+=centerAt(x);
 float crash=sm(1.45,1.90,age)*(1.0-sm(3.3,5.3,age));
 float breakup=crash*exp(-pow((q-.63)/.26,2.0))*shoulder;
 p.y+=uHeight*.08*breakup*(noise(vec2(x*4.7,p.x*5.1-uTime*2.8))-.4);
 p.y+=ripple(vec2(x,p.x))*sm(0.,.08,q)*(1.-sm(1.,1.08,q))*(1.-sm(25.,35.,abs(x)))*(1.0-.72*build*exp(-pow((q-.56)/.28,2.0)));
 return vec3(x,p.y,p.x);
}
