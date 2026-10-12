import {toCanvas,getFontEmbedCSS} from './dom-capture-vendor.js';
import {liveOcean} from './live-evidence.js';
// Record the actual UI, including its live canvas orb, over the actual native
// drawable. This is a DOM + scene composite, not an OS screen recording.
export async function fullAppCapture(win){
 const root=win.document.getElementById('app'),api=liveOcean(win),scene=win.__daybuoy.engine.getSceneCanvas();
 const width=Math.round(win.innerWidth),height=Math.round(win.innerHeight),canvas=document.createElement('canvas');
 canvas.width=width;canvas.height=height;const ctx=canvas.getContext('2d');
 if(!ctx)throw Error('Full-app capture canvas unavailable.');
 await win.document.fonts?.ready;
 const fontEmbedCSS=await getFontEmbedCSS(root),skip=new Set(['ocean','tidewater-ocean-layer','ocean-engine-status']);
 const options={width,height,pixelRatio:1,fontEmbedCSS,preferredFontFormat:'woff2',backgroundColor:'transparent',style:{background:'transparent',width:width+'px',height:height+'px'},filter:node=>!skip.has(node.id)};
 let overlay=null,busy=false,active=true,error=null,last=-Infinity,uiFrames=0,sceneFrames=0,maxUiMs=0;
 async function refresh(){
  if(busy||!active)return;busy=true;const start=performance.now();
  try{const image=await toCanvas(root,options);if(active){overlay=image;uiFrames++;maxUiMs=Math.max(maxUiMs,performance.now()-start);}}
  catch(e){error=e;}finally{busy=false;last=performance.now();}
 }
 await refresh();if(error)throw Error('Full-app UI capture failed: '+error.message);
 const original=api.draw;
 function wrapped(...args){
  const result=original.apply(this,args);if(result!==false&&active){
   try{ctx.clearRect(0,0,width,height);ctx.drawImage(scene,0,0,width,height);if(overlay)ctx.drawImage(overlay,0,0,width,height);sceneFrames++;if(performance.now()-last>=125)void refresh();}catch(e){error=e;}
  }return result;
 }
 api.draw=wrapped;
 return {canvas,validate(){if(error)throw Error('Full-app capture failed: '+error.message);if(document.hidden)throw Error('Full-app capture interrupted while hidden.');},state:()=>({source:'actual DOM raster + live WebGPU scene',uiFrames,sceneFrames,maxUiMs,uiRateLimit:8,resolution:[width,height],osScreenRecording:false}),stop(){active=false;if(api.draw===wrapped)api.draw=original;}};
}
