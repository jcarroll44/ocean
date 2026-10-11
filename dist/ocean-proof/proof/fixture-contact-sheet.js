// Layout of authentic captured pixels only. Runs after cadence/clip capture;
// never part of the measured loop. No exposure, colour or synthetic repaint.
export async function fixtureContactSheet(entries,{revision,runId},env=globalThis){
 if(entries.length!==10)throw Error('Contact sheet requires all ten captures.');
 const pad=20,gap=12,width=300,height=538,header=102,label=30,footer=38;
 const canvas=env.document.createElement('canvas');canvas.width=pad*2+width*5+gap*4;canvas.height=header+(height+label+gap)*2+footer;
 const ctx=canvas.getContext('2d');if(!ctx)throw Error('Contact sheet canvas unavailable.');
 ctx.fillStyle='#e9eeed';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#183339';ctx.font='600 26px system-ui';ctx.fillText('DayBuoy · ten weather fixtures',pad,35);
 ctx.font='14px system-ui';ctx.fillText('Actual iPhone captures · synthetic weather · '+revision,pad,61);ctx.fillText(runId,pad,83);
 for(let i=0;i<entries.length;i++){
  const entry=entries[i],bitmap=await env.createImageBitmap(entry.blob);
  try{
   const x=pad+(i%5)*(width+gap),y=header+Math.floor(i/5)*(height+label+gap);
   ctx.fillStyle='#183339';ctx.font='600 16px system-ui';ctx.fillText(entry.title,x,y+20);
   ctx.fillStyle='#071019';ctx.fillRect(x,y+label,width,height);
   const scale=Math.min(width/bitmap.width,height/bitmap.height),w=bitmap.width*scale,h=bitmap.height*scale;
   ctx.drawImage(bitmap,x+(width-w)/2,y+label+(height-h)/2,w,h);
  }finally{bitmap.close();}
 }
 ctx.font='13px system-ui';ctx.fillStyle='#52666a';ctx.fillText('Unretouched scene screenshots · originals and gate JSON in the same results folder',pad,canvas.height-15);
 const blob=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error('Contact sheet encoding failed.')),'image/jpeg',.92));
 return{name:'fixtures-contact-sheet.jpg',blob};
}
