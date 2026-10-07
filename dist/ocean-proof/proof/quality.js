export const PRESETS=[
 {name:'High',dpr:1.5,lod:2.5,spray:32768,reflection:.5,reflectionSeconds:3,cloud:1},
 {name:'Balanced+',dpr:1.5,lod:2,spray:16384,reflection:.4,reflectionSeconds:4,cloud:.85},
 {name:'Balanced',dpr:1.25,lod:1.75,spray:8192,reflection:.3,reflectionSeconds:5,cloud:.7},
 {name:'Phone',dpr:1,lod:1.5,spray:4096,reflection:.25,reflectionSeconds:6,cloud:.6},
 {name:'Low',dpr:1,lod:1.2,spray:2048,reflection:.2,reflectionSeconds:8,cloud:.45},
 {name:'Minimum',dpr:1,lod:1,spray:512,reflection:.125,reflectionSeconds:12,cloud:.3}
];
export function phoneDevice(){return /iPhone|iPad|Android/i.test(navigator.userAgent)||navigator.maxTouchPoints>1&&matchMedia('(pointer:coarse)').matches;}
export function initialQuality(){const q=new URLSearchParams(location.search).get('quality')||'auto';return {mode:q==='auto'?'auto':'manual',level:q==='auto'?(phoneDevice()?2:0):Math.max(0,Math.min(5,Number(q)||0))};}
export function applyQuality(app,level){
 const p=PRESETS[level];app.qualityLevel=level;
 const dpr=Math.min(devicePixelRatio||1,p.dpr);if(app.engine.renderScale!==dpr)app.engine.setRenderScale(dpr);
 applyMeshLOD(app,p.lod);
 app.spray.setBudget(p.spray);app.breakers.params.spray.value=Math.sqrt(p.spray/32768);
 app.refraction.scale=p.reflection;app.environment.interval=p.reflectionSeconds;
 if(app.clouds)app.clouds.resolutionScale=p.cloud;
 app.activeQuality={...p,level,dpr,fft:'4 × 256',mesh:'32-cell tiles',reflectionCube:app.environment.size};
 return app.activeQuality;
}
export function applyMeshLOD(app,factor){
 const lod=app.oceanLOD;let prev=0;
 for(let l=0;l<lod.levels;l++){
  const range=lod.leafSize*2**l*factor,start=prev+(range-prev)*.66;
  lod.ranges[l]=range;lod.uMorph.array[l].set(start,1/Math.max(.001,range-start));
  const m=lod.params.fields.morph.value[l];m.x=start;m.y=1/Math.max(.001,range-start);prev=range;
 }
 lod.params.set('morph',lod.params.fields.morph.value);
}
