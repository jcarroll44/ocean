// Wait for an actual submitted drawable before exporting. WebGPU canvases may
// be cleared between animation frames; resizing the host can also change FOV.
uvNow=function(t=state.time){return forecastUV(t);};
async function displayedSceneCopy(){
 const copy=document.createElement('canvas'),ctx=copy.getContext('2d'),host=$('#tidewater-ocean-layer'),native=host?.contentWindow?.__daybuoyOcean;
 const draw=()=>{const src=engine.getSceneCanvas?.()||$('#ocean');if(!src.width||!src.height)throw Error('Scene not ready');copy.width=src.width;copy.height=src.height;ctx.drawImage(src,0,0);copy.daybuoyCapture={time:state.time,conditions:{...conditions()},headline:$('#headline').getAttribute('aria-label')||$('#headline').textContent};};
 if(native?.draw){await new Promise((resolve,reject)=>{const original=native.draw;let timer;
  const restore=()=>{clearTimeout(timer);if(native.draw===wrapped)native.draw=original;};
  function wrapped(...args){const ok=original.apply(this,args);if(ok!==false){try{draw();restore();resolve();}catch(e){restore();reject(e);}}return ok;}
  timer=setTimeout(()=>{restore();reject(Error('Scene capture timed out'));},10000);native.draw=wrapped;
 });}else{engine.render(0);draw();}return copy;
}
const productSheetBase=renderSheet,productPresentationBase=renderPresentation;
renderSheet=function(){
 productSheetBase();if(!realForecast())return;const c=conditions(),el=$('#sheet-content');
 if(state.sheet==='air'&&!Number.isFinite(c.temperature)){const value=el.querySelector('.sheet-value');if(value)value.textContent='—';}
 if(state.sheet==='wind'&&!Number.isFinite(c.wind)){const value=el.querySelector('.reading strong');if(value)value.textContent='—';}
 if(state.sheet==='water')el.insertAdjacentHTML('beforeend',`<p class="weather-details">${Number.isFinite(c.tide)?'Tide '+(c.tide*FT).toFixed(1)+' ft MSL · NOAA':'Tide unavailable · scene holds its last sea level, or MSL at first load.'}</p>`);
 if(state.sheet!=='sun')el.insertAdjacentHTML('beforeend',`<p class="weather-details">${textHTML(clock(state.time))} · ${state.data.source==='saved'?'Saved forecast':'Forecast'} · ${textHTML(releaseStamp(state.data.retrievedAt))}</p>`);
};
renderPresentation=function(){
 productPresentationBase();if(state.data.source==='saved'||state.forecastFailed||navigator.onLine===false){const b=$('#reference-banner');if(Number.isFinite(state.data.retrievedAt)&&state.data.source!=='sample')b.textContent='Offline · forecast from '+clock(state.data.retrievedAt)+' · '+releaseStamp(state.data.retrievedAt);}
};
// Prevent disabled/loading share from exporting placeholder conditions.
document.addEventListener('click',event=>{const share=event.target.closest?.('#share-scene');if(share?.getAttribute('aria-disabled')==='true'){event.preventDefault();event.stopImmediatePropagation();}},{capture:true});
