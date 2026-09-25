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
 float age=rig_ageAt(p.x),t=age-.80;
 float alive=rig_sm(0.,.25,t)*(1.-rig_sm(1.7,3.5,t));
 if(alive<.001)return -2.;
 float ground=max(0.,bed(p.xz));if(p.y<ground)return -2.;
 float pulse=rig_sm(0.,.4,t)*exp(-max(0.,t-.4)*1.5);
 float ry=uRigHeight*(.05+.48*pulse),rz=uRigHeight*(.30+.20*t);
 float center=rig_frontAt(p.x,age)-uRigHeight*(.18+.20*t);
 vec3 local=vec3(p.x,(p.y-ground-ry*.30),(p.z-center));
 float d=length(local.yz/vec2(ry,rz));
 if(d>1.45)return -2.;
 vec3 q=local/uRigHeight*8.+vec3(0.,-t*1.6,t*.7);
 float n=foamNoise(q)*.50+foamNoise(q*2.03+11.)*.30+foamNoise(q*5.07+23.)*.20;
 float scallop=rig_noise(vec2(p.x/uRigHeight*3.,uRigEvent+31.));
 return 1.-d+(n-.5)*.85+(scallop-.5)*.30;
}
float foamDensity(vec3 p){
 float t=rig_ageAt(p.x)-.80;
 float alive=rig_sm(0.,.25,t)*(1.-rig_sm(1.7,3.5,t));
 return rig_sm(-.01,.09,foamField(p))*alive*rig_shoulder(p.x);
}
void main(){
 if(uRigFoam<.001)discard;
 float a=rig_ageAt(0.),spread=rig_mode()<.5?.1:1.9;
 if(a<.8-spread||a>4.3+spread)discard;
 vec4 farPoint=uRigInvVP*vec4(vUv*2.-1.,1.,1.);
 vec3 ro=uRigEye,rd=normalize(farPoint.xyz/farPoint.w-ro);
 float front=rig_frontAt(0.,a);
 vec3 lo=vec3(-48.,0.,min(rig_breakZ()-uRigHeight,front-uRigHeight*3.)),hi=vec3(48.,uRigHeight*.8+.5,front+uRigHeight);
 vec3 t0=(lo-ro)/rd,t1=(hi-ro)/rd;
 vec3 mn=min(t0,t1),mx=max(t0,t1);
 float nearT=max(0.,max(mn.x,max(mn.y,mn.z))),farT=min(mx.x,min(mx.y,mx.z));
 if(farT<=nearT)discard;
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
   float e=uRigHeight*.025;
   vec3 gradient=vec3(foamField(p+vec3(e,0,0)),foamField(p+vec3(0,e,0)),foamField(p+vec3(0,0,e)))-foamField(p);
   vec3 normal=length(gradient)>.001?normalize(-gradient):vec3(0.,1.,0.);
   float light=(.35+.65*max(0.,dot(normal,sunDir())))*(.85+.15*foamNoise(p/uRigHeight*24.));
   float a=1.-exp(-den*stepLength/uRigHeight*28.*uRigFoam);
   rgb+=(1.-alpha)*a*uRigFoamColor*light;alpha+=(1.-alpha)*a;
  }
  distance+=stepLength;
 }
 if(alpha<.008)discard;
 gl_FragColor=vec4(finish(rgb/max(alpha,.001)),alpha);
}
