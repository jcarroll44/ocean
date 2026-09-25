in vec4 position;
uniform mat4 uVP;uniform vec3 uEye;uniform float uViewportHeight;
out float vAlpha,vSeed;
void main(){
 float x=position.x,seed=position.y,age=ageAt(x);
 float birth=1.48+position.z*.5,t=max(0.0,age-birth)*sqrt(uHeight/1.2192);
 float life=.55+seed*.4;
 vec3 p=vec3(x,0,centerAt(x)+1.10*uHeight);
 p.y=uHeight*(.04+t*(1.4+seed*1.0)-4.905*t*t/uHeight);
 p.x+=sin(seed*95.0)*t*.3;
 p.z+=t*uHeight*(.7+position.w*1.6);
 vAlpha=step(birth,age)*(1.0-sm(life*.55,life,t))*sm(-.03,.08,p.y)*(1.0-sm(11.,22.,abs(x)));
 vSeed=seed;gl_Position=uVP*vec4(p,1);
 gl_PointSize=clamp(uViewportHeight*uHeight*(.007+seed*.015)/max(.1,gl_Position.w),1.0,18.0);
}
