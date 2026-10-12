// Read-only deployed checks. Service credential arrives through hidden stdin.
// Prints selected public metadata only, never headers, credentials or raw errors.
if(process.stdin.isTTY)process.stdin.setRawMode(true);
process.stdin.resume();console.log('Ready for hidden probe JSON');
let input='';process.stdin.on('data',async chunk=>{input+=chunk.toString();if(!input.includes('\n'))return;process.stdin.pause();if(process.stdin.isTTY)process.stdin.setRawMode(false);
 try{const {origin,token}=JSON.parse(input),headers=token?{'OAI-Sites-Authorization':'Bearer '+token}:{};
 for(const id of ['inlet-beach','cocoa-beach','san-diego']){
  const start=Date.now(),response=await fetch(origin+'/api/forecast?beach='+id,{headers,signal:AbortSignal.timeout(180000)});
  if(!response.ok){console.log(JSON.stringify({id,status:response.status}));continue;}
  const data=await response.json();console.log(JSON.stringify({id,status:response.status,schema:data.schema,source:data.source,rows:data.rows?.length,weather:data.weatherSource,feedStatus:data.feedStatus,cache:data.cache,retrievedAt:data.retrievedAt,ms:Date.now()-start}));
 }
 const r=await fetch(origin+'/api/results',{headers});console.log(JSON.stringify({uploaderStatus:r.status,...(r.ok?await r.json():{})}));
 }catch{console.log('Probe failed; no credential details printed.');process.exitCode=1;}finally{process.exit();}
});
