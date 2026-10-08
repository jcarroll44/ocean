// Runs only on the owner-private Site. Credentials never enter a browser bundle.
const REPO='jcarroll44/ocean',BRANCH='wip/tidewater-in-app';
const ORIGIN='https://daybuoy-night-pass.jacobcarroll51.chatgpt.site';
const MAX_BODY=24*1024*1024,MAX_FILE=12*1024*1024;
const json=(value,status=200)=>Response.json(value,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
class UploadError extends Error{constructor(message,status=400){super(message);this.status=status;}}
const hex=bytes=>Array.from(new Uint8Array(bytes),x=>x.toString(16).padStart(2,'0')).join('');
const digest=async bytes=>hex(await crypto.subtle.digest('SHA-256',bytes));
function base64(bytes){let s='';for(let i=0;i<bytes.length;i+=8192)s+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(s);}
async function limitedBody(request){
 if(Number(request.headers.get('content-length'))>MAX_BODY)throw new UploadError('Upload exceeds 24 MB.',413);
 const reader=request.body?.getReader();if(!reader)throw new UploadError('Missing upload.');
 const parts=[];let size=0;
 while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>MAX_BODY){await reader.cancel();throw new UploadError('Upload exceeds 24 MB.',413);}parts.push(value);}
 return new Blob(parts);
}
export async function handleResults(request,env,fetchGit=fetch){
 const url=new URL(request.url);
 if(url.pathname!=='/api/results')return null;
 // Sites dispatch enforces owner-only access for browsers and service callers.
 // Keep that audience; reject cross-site writes even from a signed-in browser.
 if(request.method==='GET')return json({ready:!!env.GITHUB_RESULTS_TOKEN,repository:REPO,branch:BRANCH});
 if(request.method!=='POST')return json({error:'POST required.'},405);
 const origin=request.headers.get('origin');
 if((origin&&origin!==ORIGIN)||request.headers.get('sec-fetch-site')==='cross-site'||request.headers.get('x-daybuoy-upload')!=='1')return json({error:'Same-site upload required.'},403);
 if(!env.GITHUB_RESULTS_TOKEN)return json({error:'Results uploader is not configured.'},503);
 try{
  const type=request.headers.get('content-type')||'';if(!type.startsWith('multipart/form-data;'))throw new UploadError('Multipart upload required.',415);
  const form=await new Response(await limitedBody(request),{headers:{'content-type':type}}).formData();
  const runId=form.get('runId'),kind=form.get('kind');
  if(typeof runId!=='string'||!/^\d{4}-\d{2}-\d{2}T[\d-]{8}Z-[a-f0-9-]{36}$/.test(runId))throw new UploadError('Invalid run ID.');
  if(!['overcast','live','profile','comparison','smoke'].includes(kind))throw new UploadError('Invalid test kind.');
  const files=form.getAll('files');if(!files.length||files.length>24)throw new UploadError('Expected 1–24 evidence files.');
  const names=new Set(),prepared=[];
  for(const file of files){
   if(typeof file==='string'||!file.size||file.size>MAX_FILE)throw new UploadError('Empty file or file exceeds 12 MB.',413);
   if(!/^[a-z0-9][a-z0-9._-]{0,90}\.(json|png|jpg|mp4|webm)$/.test(file.name)||names.has(file.name)||['manifest.json','latest.json'].includes(file.name))throw new UploadError('Invalid or duplicate filename.');
   names.add(file.name);const bytes=new Uint8Array(await file.arrayBuffer());
   if(file.name.endsWith('.json')){try{JSON.parse(new TextDecoder().decode(bytes));}catch{throw new UploadError('Invalid JSON evidence.');}}
   prepared.push({name:file.name,size:file.size,type:file.type,sha256:await digest(bytes),content:base64(bytes)});
  }
  if(!names.has('report.json'))throw new UploadError('report.json is required.');
  const fingerprint=await digest(new TextEncoder().encode(JSON.stringify(prepared.map(({name,size,sha256})=>({name,size,sha256})).sort((a,b)=>a.name.localeCompare(b.name)))));
  const folder=`results/${runId}`;
  async function git(path,method='GET',body){
   let res;try{res=await fetchGit(`https://api.github.com/repos/${REPO}/${path}`,{method,headers:{Authorization:`Bearer ${env.GITHUB_RESULTS_TOKEN}`,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','User-Agent':'DayBuoy-results','Content-Type':'application/json'},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(45000)});}catch{throw new UploadError('GitHub connection failed; results remain on this device.',502);}
   if(res.status===404)return null;
   if(!res.ok){const error=new UploadError(res.status===401||res.status===403?'GitHub rejected the token. Check its expiry and ocean Contents permission.':'GitHub upload failed; results remain on this device.',502);error.gitStatus=res.status;throw error;}
   return res.json();
  }
  async function existing(){
   const result=await git(`contents/${folder}/manifest.json?ref=${encodeURIComponent(BRANCH)}`);
   if(!result)return null;
   const stored=JSON.parse(atob(result.content.replace(/\s/g,'')));
   if(stored.fingerprint!==fingerprint||stored.kind!==kind)throw new UploadError('This run ID already holds different evidence.',409);
   return json({ok:true,runId,path:folder,url:`https://github.com/${REPO}/tree/${BRANCH}/${folder}`,duplicate:true});
  }
  const found=await existing();if(found)return found;
  const manifest={schema:1,runId,kind,fingerprint,receivedAt:new Date().toISOString(),files:prepared.map(({content,...file})=>file)};
  const tree=[];
  for(const file of prepared){const blob=await git('git/blobs','POST',{encoding:'base64',content:file.content});tree.push({path:`${folder}/${file.name}`,mode:'100644',type:'blob',sha:blob.sha});delete file.content;}
  tree.push({path:`${folder}/manifest.json`,mode:'100644',type:'blob',content:JSON.stringify(manifest,null,2)});
  if(kind!=='smoke')tree.push({path:'results/latest.json',mode:'100644',type:'blob',content:JSON.stringify({runId,kind,path:folder,receivedAt:manifest.receivedAt},null,2)});
  for(let attempt=0;attempt<4;attempt++){
   if(attempt){const saved=await existing();if(saved)return saved;}
   const ref=await git(`git/ref/heads/${BRANCH}`);if(!ref)throw new UploadError('WIP branch not found.',502);
   const parent=await git(`git/commits/${ref.object.sha}`);
   const nextTree=await git('git/trees','POST',{base_tree:parent.tree.sha,tree});
   const commit=await git('git/commits','POST',{message:`Save ${kind} test evidence ${runId}`,tree:nextTree.sha,parents:[ref.object.sha]});
   try{await git(`git/refs/heads/${BRANCH}`,'PATCH',{sha:commit.sha,force:false});return json({ok:true,runId,path:folder,commit:commit.sha,url:`https://github.com/${REPO}/tree/${BRANCH}/${folder}`});}
   catch(error){if(![409,422].includes(error.gitStatus)||attempt===3)throw error;}
  }
 }catch(error){return json({error:error instanceof UploadError?error.message:'Upload could not finish; results remain on this device.'},error instanceof UploadError?error.status:500);}
}
