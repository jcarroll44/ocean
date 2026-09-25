varying vec3 vFoamPos,vFoamNormal;
varying float vFoamLife,vFoamSeed;
void main(){
 if(vFoamLife<.01)discard;
 vec3 n=normalize(vFoamNormal);
 vec2 tex=vFoamPos.xz*70.+vFoamPos.y*16.;
 float small=rig_fbm(tex);
 n=normalize(n+vec3(rig_noise(tex)-.5,0.,rig_noise(tex+31.)-.5)*.35);
 float light=.60+.28*max(0.,dot(n,sunDir()))+.12*small;
 float ambient=.78+.22*rig_sm(-.2,.5,n.y);
 vec3 col=uRigFoamColor*light*ambient;
 col=mix(col,sky(normalize(vFoamPos-cameraPosition),false),seaHaze(length(cameraPosition-vFoamPos)));
 gl_FragColor=vec4(finish(col),1.);
}
