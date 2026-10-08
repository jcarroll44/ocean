import assert from 'node:assert/strict';
import {handleResults} from '../server/results.js';
const origin='https://daybuoy-night-pass.jacobcarroll51.chatgpt.site';
const runId='2026-10-08T23-30-00Z-12345678-1234-1234-1234-123456789012';
let calls=[],objects=new Map(),trees=new Map(),commits=new Map(),head='initial',committed,conflict=true;
async function github(url,{method,headers,body}){
 assert(url.startsWith('https://api.github.com/repos/jcarroll44/ocean/'));assert.equal(headers.Authorization,'Bearer fake-unit-token');
 const path=url.split('/ocean/')[1],data=body&&JSON.parse(body);calls.push({path,method,data});
 if(path.startsWith('contents/'))return committed?Response.json({content:btoa(committed)}):new Response('',{status:404});
 if(path==='git/ref/heads/wip/tidewater-in-app')return Response.json({object:{sha:head}});
 if(path.startsWith('git/commits/'))return Response.json({tree:{sha:head+'-tree'}});
 if(path==='git/blobs'){const sha='blob-'+objects.size;objects.set(sha,Buffer.from(data.content,'base64'));return Response.json({sha});}
 if(path==='git/trees'){assert.equal(data.base_tree,head+'-tree');for(const e of data.tree)assert(e.path.startsWith('results/'));const sha='tree-'+trees.size;trees.set(sha,data.tree);return Response.json({sha});}
 if(path==='git/commits'){assert.deepEqual(data.parents,[head]);const sha='commit-'+commits.size;commits.set(sha,data);return Response.json({sha});}
 if(path==='git/refs/heads/wip/tidewater-in-app'){
  assert.equal(data.force,false);
  if(conflict){conflict=false;head='other-thread-change';return new Response('',{status:422});}
  const commit=commits.get(data.sha);assert.equal(commit.parents[0],'other-thread-change');head=data.sha;committed=trees.get(commit.tree).find(e=>e.path.endsWith('/manifest.json')).content;return Response.json({object:{sha:head}});
 }
 throw Error('Unexpected GitHub operation '+path);
}
function request({kind='overcast',id=runId,filename='report.json',body='{"test":true}',originHeader=origin,marker='1'}={}){
 const form=new FormData();form.set('runId',id);form.set('kind',kind);form.append('files',new Blob([body],{type:'application/json'}),filename);
 return new Request(origin+'/api/results',{method:'POST',headers:{Origin:originHeader,'X-DayBuoy-Upload':marker},body:form});
}
const env={GITHUB_RESULTS_TOKEN:'fake-unit-token'};
for(const args of [{originHeader:'https://evil.example'},{marker:'0'},{id:'../../main'},{kind:'main'},{filename:'secret.txt'},{body:'invalid-json'}]){
 const res=await handleResults(request(args),env,github);assert(res.status>=400);assert.equal(calls.length,0);
}
assert.equal((await handleResults(request(),{},github)).status,503);
const res=await handleResults(request(),env,github);assert.equal(res.status,200);const receipt=await res.json();assert.equal(receipt.ok,true);assert(receipt.path.startsWith('results/'));assert.equal(commits.size,2);
assert(calls.filter(x=>x.path==='git/trees').at(-1).data.base_tree==='other-thread-change-tree');
const before=objects.size;const retry=await handleResults(request(),env,github);assert.equal((await retry.json()).duplicate,true);assert.equal(objects.size,before);
assert.equal((await handleResults(request({body:'{"changed":true}'}),env,github)).status,409);
const metadata=JSON.parse(committed);assert.equal(metadata.files[0].size,13);assert.equal(metadata.files[0].sha256.length,64);assert(!committed.includes('fake-unit-token'));
console.log('PASS: upload allowlist, cross-site refusal, missing-token guard, exact evidence bytes, SHA-256 receipt, retry idempotency, conflict recovery and non-force WIP-only writes. Mock GitHub; no device evidence.');
