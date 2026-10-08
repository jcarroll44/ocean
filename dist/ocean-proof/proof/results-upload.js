// Shared by every test/capture page. Only the server knows the GitHub token.
const DB='daybuoy-evidence-v1',STORE='pending';
export const newRunId=()=>new Date().toISOString().slice(0,19).replace(/:/g,'-')+'Z-'+crypto.randomUUID();
export const jsonFile=value=>({name:'report.json',blob:new Blob([JSON.stringify(value,null,2)],{type:'application/json'})});
function database(){return new Promise((resolve,reject)=>{const r=indexedDB.open(DB,1);r.onupgradeneeded=()=>r.result.createObjectStore(STORE,{keyPath:'runId'});r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
async function cached(action,value){const db=await database();try{return await new Promise((resolve,reject)=>{const tx=db.transaction(STORE,action==='getAll'?'readonly':'readwrite'),s=tx.objectStore(STORE),r=value===undefined?s[action]():s[action](value);tx.oncomplete=()=>resolve(r.result);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);});}finally{db.close();}}
async function send(bundle,onStatus){
 let last;
 for(let attempt=0;attempt<3;attempt++){
  try{onStatus('Sending results automatically…');const body=new FormData();body.set('runId',bundle.runId);body.set('kind',bundle.kind);for(const f of bundle.files)body.append('files',f.blob,f.name);
   const response=await fetch('/api/results',{method:'POST',headers:{'X-DayBuoy-Upload':'1'},credentials:'same-origin',body,signal:AbortSignal.timeout(180000)});
   if(!response.headers.get('content-type')?.includes('application/json'))throw Error('Sign in to DayBuoy again to send saved results.');
   const result=await response.json();if(!response.ok||!result.ok)throw Error(result.error||'Upload failed.');
   await cached('delete',bundle.runId).catch(()=>{});onStatus('Results sent. You can close this page.');return result;
  }catch(error){last=error;if(attempt<2)await new Promise(r=>setTimeout(r,2000*(attempt+1)));}
 }
 throw last;
}
export async function uploadEvidence(bundle,onStatus=()=>{}){
 let persisted=false;try{await cached('put',bundle);persisted=true;}catch{}
 try{return await send(bundle,onStatus);}catch(error){onStatus(persisted?'Results saved on this phone. Reopen this test page to retry automatically. '+error.message:'Upload failed. Keep this page open and use its download fallback. '+error.message);throw error;}
}
// Call before any new benchmark starts, never during timed measurement.
export async function retryPending(onStatus=()=>{}){
 let list;try{list=await cached('getAll');}catch{return;}
 for(const bundle of list){try{await send(bundle,onStatus);}catch(error){onStatus('Previous results are saved here; upload will retry next time.');break;}}
}
export function nativeCanvas(win){return win.__daybuoy?.engine?.getSceneCanvas?.()||win.__app?.engine?.canvas||win.document.querySelector('canvas');}
export async function captureScreenshot(win){
 const child=win.document.getElementById('tidewater-ocean-layer')?.contentWindow||win;
 const api=child.__daybuoyOcean,canvas=nativeCanvas(win);
 if(!canvas)throw Error('No displayed canvas to capture.');
 const copy=win.document.createElement('canvas');copy.width=canvas.width;copy.height=canvas.height;const ctx=copy.getContext('2d');
 if(api?.draw){
  // Copy synchronously in the successful draw, before WebGPU clears its drawable.
  await new Promise((resolve,reject)=>{const original=api.draw;const timer=setTimeout(()=>{if(api.draw===wrapped)api.draw=original;reject(Error('Screenshot frame timed out.'));},10000);
   function wrapped(...args){const result=original.apply(this,args);if(result!==false){try{copy.width=canvas.width;copy.height=canvas.height;ctx.drawImage(canvas,0,0);clearTimeout(timer);api.draw=original;resolve();}catch(error){clearTimeout(timer);api.draw=original;reject(error);}}return result;}api.draw=wrapped;});
 }else{await new Promise(resolve=>win.requestAnimationFrame(()=>{ctx.drawImage(canvas,0,0);resolve();}));}
 const blob=await new Promise(resolve=>copy.toBlob(resolve,'image/png'));if(!blob)throw Error('Screenshot export failed.');return blob;
}
