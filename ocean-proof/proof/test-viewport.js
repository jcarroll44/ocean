// Diagnostic-only: keep the render workload constant when browser chrome moves.
// Do not change ordinary app sizing or erase time spent resizing from FPS bins.
export function pinTestViewport(stage,outer,onEvent=()=>{}){
 const size=[outer.innerWidth,outer.innerHeight];
 const pin=element=>{if(!element)return;for(const [key,value] of [['width',size[0]+'px'],['height',size[1]+'px']])if(element.style[key]!==value)element.style[key]=value;};
 pin(stage);
 const resized=()=>onEvent({at:new Date().toISOString(),outer:[outer.innerWidth,outer.innerHeight],visual:outer.visualViewport?[outer.visualViewport.width,outer.visualViewport.height]:null,renderViewport:size.slice(),action:'Browser viewport changed; fixed test surface retained; FPS clock uninterrupted.'});
 outer.addEventListener('resize',resized);outer.visualViewport?.addEventListener('resize',resized);
 return {
  size,
  bindScene(){
   const win=stage.contentWindow,app=win?.document.getElementById('app'),frame=win?.document.getElementById('tidewater-ocean-layer');
   // Override the product's 100dvh only inside this test iframe. Some iOS
   // versions report dynamic CSS viewport units differently from innerHeight.
   pin(app);pin(frame);return win;
  },
  verify(win,dpr){
   const native=win.document.getElementById('tidewater-ocean-layer')?.contentWindow,a=native?.__app;
   if(win.innerWidth!==size[0]||win.innerHeight!==size[1]||native?.innerWidth!==size[0]||native?.innerHeight!==size[1])throw Error('Pinned render viewport changed unexpectedly.');
   const actual=[a?.engine.width,a?.engine.height,a?.engine.canvas.width,a?.engine.canvas.height];
   if(actual.some((v,i)=>v!==Math.floor(size[i%2]*dpr)))throw Error('Actual render dimensions do not match adaptive DPR.');
   return actual;
  },
  dispose(){outer.removeEventListener('resize',resized);outer.visualViewport?.removeEventListener('resize',resized);}
 };
}
