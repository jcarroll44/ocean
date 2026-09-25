uniform vec3 uRigFoamColor;
varying float vAlpha,vSeed,vMist;
void main(){
 vec2 uv=(gl_PointCoord-.5)*2.;uv.x*=mix(1.6,1.,vMist);float r=length(uv);if(r>1.||vAlpha<.005)discard;
 float a=(1.-smoothstep(mix(.48,.0,vMist),1.,r))*vAlpha*mix(.65,.16,vMist);
 vec3 c=pow(uRigFoamColor,vec3(1./2.2))*(.91+.09*sqrt(max(0.,1.-r*r)));
 gl_FragColor=vec4(c,a);
}
