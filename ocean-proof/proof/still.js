export function captureStill(proof){return new Promise((resolve,reject)=>{
 const timeout=setTimeout(()=>{stop();reject(Error('No frame received. Keep Safari visible.'));},15000);
 const stop=proof.subscribeFrames(info=>{clearTimeout(timeout);stop();const c=document.createElement('canvas');c.width=390;c.height=844;c.getContext('2d').drawImage(proof.canvas,0,0,390,844);c.toBlob(blob=>blob?resolve({blob,waveSeconds:info.waveSeconds}):reject(Error('Still export failed')),'image/png');});
});}
