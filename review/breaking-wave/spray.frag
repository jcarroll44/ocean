in float vAlpha,vSeed;out vec4 fragColor;
void main(){float r=length(gl_PointCoord-.5)*2.;if(r>1.0||vAlpha<.005)discard;
 float a=(1.0-smoothstep(.25,1.0,r))*vAlpha*.8;fragColor=vec4(vec3(.91,.96,.97)*(1.0-.12*r),a);}
