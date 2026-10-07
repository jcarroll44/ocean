/* Tidewater-derived plunge experiment, isolated from the retained renderer.
 * Adapted from Breakers._buildMesh and shoreWhitewater at
 * 4811ba48d795197de5621985f404e765c0b7c0ef. MIT, DRG Software Solutions LLC.
 * See assets/licenses/tidewater.txt. This is an adaptation, not its engine.
 */
(function(){
 const enabled=typeof location!=='undefined'&&new URLSearchParams(location.search).get('breakers')==='tidewater';
 const surface=__mods['breaker-surface.js'],legacy=surface.sectionCurve;
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),sq=x=>x*x,mix=(a,b,t)=>a+(b-a)*t;
 const ramp=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};
 // Metres in Y; dimensionless cross-shore parameter in X, as in the original.
 // The .8H forward throw and quadratic fall are Tidewater's ballistic lip.
 // Our existing crest age is seconds, mapped explicitly to a 1.45 s plunge.
 function plungeCurve(s,height,crest,tide,age){
  const scale=Math.max(.85,height);
  const root=Math.max(height*.25,crest-tide+height*.8*ramp(.10,.65,age));
  const trough=-height*.14;
  const drop=root-trough;
  const throwDistance=drop*.8;
  const q=clamp((age-.65)/1.45,0,1);
  const u=clamp((s+.6)/.6,0,1);
  const theta=clamp(s/.85,0,1)*1.5707963267948966;
  const tipX=throwDistance*q;
  const tipY=root-drop*q*q;
  const backX=s*scale+.6*scale*Math.exp(-sq((s+.6)/.85));
  const backY=root*Math.exp(-sq((s+.6)/.9));
  const lipX=throwDistance*q*u;
  const lipY=root-drop*sq(q*u);
  const faceX=tipX+(drop*.32-tipX)*(1-Math.cos(theta));
  const faceY=tipY+(trough-tipY)*Math.sin(theta);
  const tailX=drop*.32+(s-.85)*scale;
  const tailY=trough*(1-ramp(.85,2.4,s));
  const x=s<-.6?backX:s<=0?lipX:s<.85?faceX:tailX;
  const y=s<-.6?backY:s<=0?lipY:s<.85?faceY:tailY;
  const collapse=ramp(2.15,3.45,age);
  const elapsed=Math.max(0,age-2.75);
  const bore=height*.22*Math.exp(-elapsed*.16)*Math.exp(-sq((s-throwDistance/scale)/(.72+elapsed*.075)));
  return [mix(x/scale,s,collapse),tide+mix(y,bore,collapse)];
 }
 function sectionCurve(s,height,crest,tide,age){
  const a=legacy(s,height,crest,tide,age),b=plungeCurve(s,height,crest,tide,age),w=ramp(.65,1.2,age);
  return [mix(a[0],b[0],w),mix(a[1],b[1],w)];
 }
 // Foam follows actual mean-water contact of this same ballistic tip. The
 // existing per-segment peel delay is passed in as age. No foam before impact.
 function impactMask(dz,height,crest,tide,age,length){
  const scale=Math.max(.85,height);
  const root=Math.max(height*.25,crest-tide+height*.8*ramp(.10,.65,age));
  const drop=root+height*.14;
  const xi=drop*.8*length/scale;
  const contact=Math.sqrt(root/drop);
  const q=(age-.65)/1.45;
  const landed=ramp(contact,contact+.09,q);
  const spread=clamp((q-contact)/.45,0,1);
  const center=mix(xi*contact,xi,ramp(2.15,3.45,age));
  const reach=Math.max(.12,xi*.25+spread*(xi*.9+1));
  const impact=landed*(1-ramp(reach*.6,reach,Math.abs(dz-center)))*(1-ramp(1.4,1.9,q));
  const width=.35+height*.45+Math.max(0,age-3.45)*.10;
  const roller=landed*ramp(2.15,3.45,age)*Math.exp(-sq((dz-center)/width))*Math.exp(-Math.max(0,age-3.45)*.16);
  return Math.max(impact,roller)*Math.min(1,height);
 }
 function body(fn){return fn.toString().slice(fn.toString().indexOf('{')+1,-1)
  .replace(/\bconst\b/g,'float').replace(/Math\./g,'')
  .replace(/(?<![\w.])(\d+)(?![\w.])/g,'$1.0')
  .replace(/return \[([^;]+)\];/,'return vec2($1);');}
 const curveGLSL=`vec2 twPlunge(float s,float height,float crest,float tide,float age){${body(plungeCurve)}}
 vec2 sectionCurve(float s,float height,float crest,float tide,float age){
  return mix(twLegacy(s,height,crest,tide,age),twPlunge(s,height,crest,tide,age),ramp(.65,1.2,age));
 }`;
 const foamHelpers=`
 uniform vec4 uBreakerShape[20];
 float twSq(float x){return x*x;}
 float twRamp(float a,float b,float x){return smoothstep(a,b,x);}
 float twImpact(float dz,float height,float crest,float tide,float age,float length){${body(impactMask).replace(/\bsq\(/g,'twSq(').replace(/\bramp\(/g,'twRamp(')}}
 `;
 function replaceOnce(source,from,to){
  if(source.split(from).length!==2)throw Error('Breaker patch anchor changed');
  return source.replace(from,()=>to);
 }
 function patchFoam(source){
  if(!enabled)return source;
  source=replaceOnce(source,'uniform vec4 uBreakerInjection[20];','uniform vec4 uBreakerInjection[20];'+foamHelpers);
  // Small wind/crest spray remains; dense whitewater is reserved for impact.
  source=replaceOnce(source,'source=mix(source,sharedFoam,incomingMix());','source=mix(source,sharedFoam*.12,incomingMix());');
  source=replaceOnce(source,`   float band=exp(-pow(dz/max(.5,event.w),2.0));
   source=max(source,segment*band*injection.x*incomingMix());`, `   vec4 shape=uBreakerShape[i];
   if(shape.y<=0.0)continue;
   float age=shape.z-.7*clamp(along+.5,0.0,1.0);
   float seed=fract(sin(event.x*12.9898)*43758.5453)*6.28318530718;
   float m=1.0+.30*sin(along*7.1+seed)+.15*sin(along*15.7+seed*2.3);
   float impact=twImpact(dz,shape.y*m,uTide+(shape.x-uTide)*m,uTide,age,max(.85,shape.y));
   source=max(source,segment*impact*incomingMix());`);
  return source;
 }
 function patchOcean(source){
  return enabled?replaceOnce(source,'sharedFoam*(.55+.45*lace)','sharedFoam*(.08+.12*lace)'):source;
 }
 if(enabled){
  surface.breakerSurfaceGLSL=replaceOnce(surface.breakerSurfaceGLSL,'vec2 sectionCurve(float s,float height,float crest,float tide,float age)','vec2 twLegacy(float s,float height,float crest,float tide,float age)');
  surface.breakerSurfaceGLSL=replaceOnce(surface.breakerSurfaceGLSL,'vec3 foldSurface(vec2 q,vec3 base){',curveGLSL+'\nvec3 foldSurface(vec2 q,vec3 base){');
  surface.sectionCurve=sectionCurve;
  surface.deformSurfacePoint=function(q,base,events,tide,H){
   const p=base.slice();
   for(const e of events){
    const {length,s,age,weight}=surface.surfaceWindow(q,e,H,tide);
    if(weight<=0)continue;
    const m=surface.crestModulation((q[0]-e.x)/e.width,e.x);
    const curve=sectionCurve(s,e.height*m,tide+(e.y-tide)*m,tide,age);
    p[1]=mix(p[1],curve[1],weight);p[2]=mix(p[2],q[1]+length*(curve[0]-s),weight);
   }
   return p;
  };
 }
 __mods['breaker-pass.js']={enabled,sectionCurve,plungeCurve,impactMask,patchFoam,patchOcean};
})();
