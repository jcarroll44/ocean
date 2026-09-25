varying float vAlpha,vSeed,vKind,vDiameter;varying vec3 vParticle;varying vec2 vStreak;
void main(){
 if(vAlpha<.003)discard;vec2 p=(gl_PointCoord-.5)*2.;float r=length(p);
 bool drop=vKind>2.5;
 if(drop||vKind<.5){vec2 along=vec2(dot(p,vec2(vStreak.y,-vStreak.x)),dot(p,vStreak));along.x*=drop?9.:3.;r=length(along);}
 float n=rig_fbm(p*vec2(5.,6.)+vSeed*113.),micro=rig_noise(p*41.+vSeed*71.);
 float edge=1.-rig_sm(.35+.18*n,1.,r);
 float density=rig_sm(.28,.64,n*.85+micro*.15);
 float alpha=edge*vAlpha*(drop?.70:vKind<.5?.65:vKind<1.5?.80:.55)*mix(drop?.7:.2,1.,density);
 float worldY=vParticle.y-p.y*vDiameter*.5;
 alpha*=rig_sm(bed(vParticle.xz)-.025,bed(vParticle.xz)+.025,worldY);
 if(alpha<.004)discard;
 float cluster=rig_fbm(vParticle.xy*vec2(2.,4.)+vec2(vParticle.z*1.8,uRigTime*.25));
 float elevation=rig_sm(.06,.8,vParticle.y/uRigHeight);
 float shade=vKind>1.5?.91+.09*cluster:.82+.10*elevation+.08*cluster;
 shade*=.82+.24*density;
 vec3 col=uRigFoamColor*shade;
 col=mix(col,sky(normalize(vParticle-cameraPosition),false),seaHaze(length(vParticle-cameraPosition)));
 gl_FragColor=vec4(finish(col),alpha);
}
