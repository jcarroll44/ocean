// A short ray integral through the aerated roller beneath the ballistic spray.
varying vec2 vUv;
float foamNoise(vec3 p){
 vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
 vec2 a=i.xy+vec2(37.,17.)*i.z;
 float lo=mix(mix(rig_hash(a),rig_hash(a+vec2(1,0)),f.x),mix(rig_hash(a+vec2(0,1)),rig_hash(a+vec2(1)),f.x),f.y);
 a+=vec2(37.,17.);
 float hi=mix(mix(rig_hash(a),rig_hash(a+vec2(1,0)),f.x),mix(rig_hash(a+vec2(0,1)),rig_hash(a+vec2(1)),f.x),f.y);
 return mix(lo,hi,f.z);
}
float foamField(vec3 p){
 float age=rig_ageAt(p.x),t=age-1.20;
 float alive=rig_sm(0.,.18,t)*(1.-rig_sm(1.0,2.0,t));
 if(alive<.001)return -2.;
 float ground=max(0.,bed(p.xz));if(p.y<ground)return -2.;
 float pulse=rig_sm(0.,.22,t)*exp(-max(0.,t-.22)*1.65);
 float ry=uRigHeight*(.035+.26*pulse),rz=uRigHeight*(.16+.15*t);
 float center=rig_frontAt(p.x,age)-uRigHeight*(.16+.12*t);
 float lobes=rig_noise(vec2(p.x/uRigHeight*4.5,t*.75));
 ry*=.72+.50*lobes;center+=uRigHeight*.08*(lobes-.5);
 vec3 local=vec3(p.x,(p.y-ground-ry*.30),(p.z-center));
 float d=length(local.yz/vec2(ry,rz));
 if(d>1.45)return -2.;
 vec3 q=local/uRigHeight*9.;float angle=t*5.5;
 q.yz=mat2(cos(angle),-sin(angle),sin(angle),cos(angle))*q.yz;
 float n=foamNoise(q)*.50+foamNoise(q*2.03+11.)*.30+foamNoise(q*5.07+23.)*.20;
 float scallop=rig_noise(vec2(p.x/uRigHeight*3.,uRigEvent+31.));
 return 1.-d+(n-.5)*.65+(scallop-.5)*.30;
}
float foamDensity(vec3 p){
 float t=rig_ageAt(p.x)-1.20;
 float alive=rig_sm(0.,.18,t)*(1.-rig_sm(1.0,2.0,t));
 return rig_sm(-.01,.09,foamField(p))*alive*rig_shoulder(p.x);
}
void main(){
 float a=rig_ageAt(0.),spread=rig_mode()<.5?.32:2.1;
 vec4 farPoint=uRigInvVP*vec4(vUv*2.-1.,1.,1.);
 vec3 ro=uRigEye,rd=normalize(farPoint.xyz/farPoint.w-ro);
 // Retreated water leaves a damp reflective footprint on the exposed sand.
 float wetAlpha=0.;vec3 wetRGB=vec3(0.);
 if(rd.y<-.0001){
  float st=(ro.y-.105*(ro.z-baseShore(0.)))/(.105*rd.z-rd.y);
  vec3 sp=ro+rd*st;st=(ro.y-.105*(ro.z-baseShore(sp.x)))/(.105*rd.z-rd.y);sp=ro+rd*st;
  float wa=rig_washAge(sp.x),edge=rig_frontAt(sp.x,wa),reach=rig_frontAt(sp.x,3.2);
  wetAlpha=step(0.,st)*step(.001,bed(sp.xz))*rig_sm(.02,.13,sp.z-edge)*(1.-rig_sm(reach-.08,reach+.10,sp.z));
  vec3 sn=normalize(vec3(0,1,-.105)),reflected=reflect(rd,sn);reflected.y=abs(reflected.y);
  float fresnel=pow(1.-max(0.,dot(-rd,sn)),5.);
  wetRGB=mix(sand(sp.xz,rd,1.,fwidth(sp.xz)),sky(reflected,true),.12+.24*fresnel);
 }
 if(uRigFoam<.001||a<1.2-spread||a>3.2+spread){if(wetAlpha<.001)discard;gl_FragColor=vec4(finish(wetRGB),wetAlpha);return;}
 float front=rig_frontAt(0.,a);
 vec3 lo=vec3(-48.,0.,min(rig_breakZ()-uRigHeight,front-uRigHeight*3.)),hi=vec3(48.,uRigHeight*.8+.5,front+uRigHeight);
 vec3 t0=(lo-ro)/rd,t1=(hi-ro)/rd;
 vec3 mn=min(t0,t1),mx=max(t0,t1);
 float nearT=max(0.,max(mn.x,max(mn.y,mn.z))),farT=min(mx.x,min(mx.y,mx.z));
 if(farT<=nearT){if(wetAlpha<.001)discard;gl_FragColor=vec4(finish(wetRGB),wetAlpha);return;}
 // Stop at the beach: foam must not render through sand in dune/portrait views.
 float stepLength=(farT-nearT)/128.;
 float distance=nearT+(.25+.5*rig_hash(gl_FragCoord.xy))*stepLength;
 vec3 rgb=vec3(0.);float alpha=0.;
 for(int i=0;i<128;i++){
  if(distance>farT||alpha>.985)break;
  vec3 p=ro+rd*distance;
  if(p.y<bed(p.xz))break;
  float den=foamDensity(p);
  if(den>.001){
   float e=uRigHeight*.009;
   vec3 gradient=vec3(foamField(p+vec3(e,0,0)),foamField(p+vec3(0,e,0)),foamField(p+vec3(0,0,e)))-foamField(p);
   vec3 normal=length(gradient)>.001?normalize(-gradient):vec3(0.,1.,0.);
   float pockets=foamNoise(p/uRigHeight*27.);
   float light=mix(.27,1.08,rig_sm(-.28,.78,dot(normal,sunDir())));
   light*=1.-.24*rig_sm(.58,.82,pockets);
   float a=1.-exp(-den*stepLength/uRigHeight*64.*uRigFoam);
   rgb+=(1.-alpha)*a*uRigFoamColor*light;alpha+=(1.-alpha)*a;
  }
  distance+=stepLength;
 }
 rgb+=(1.-alpha)*wetAlpha*wetRGB;alpha+=(1.-alpha)*wetAlpha;
 if(alpha<.008)discard;
 gl_FragColor=vec4(finish(rgb/max(alpha,.001)),alpha);
}
