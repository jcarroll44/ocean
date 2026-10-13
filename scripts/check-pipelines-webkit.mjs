import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {spawn,execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
if(process.platform!=='darwin')throw Error('Apple WebKit compiler required. This host cannot issue a Safari pass.');
const folder=path.resolve('.pipeline-check');fs.mkdirSync(folder,{recursive:true});
const bytes=fs.readFileSync(path.join(folder,'manifest.json'));
const server=http.createServer((req,res)=>{
 const files={'/manifest.json':[bytes,'application/json'],'/pipeline-compiler.html':[fs.readFileSync('scripts/pipeline-compiler.html'),'text/html'],'/pipeline-compiler.js':[fs.readFileSync('scripts/pipeline-compiler.js'),'application/javascript']};
 const found=files[req.url];if(!found){res.writeHead(404);res.end();return;}res.writeHead(200,{'Content-Type':found[1],'Cache-Control':'no-store'});res.end(found[0]);
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
try{
 const bin=path.join(folder,'PipelineCompiler'),reportPath=path.join(folder,'webkit-report.json');
 execFileSync('swiftc',['scripts/PipelineCompiler.swift','-framework','AppKit','-framework','WebKit','-o',bin],{stdio:'inherit'});
 const status=await new Promise((resolve,reject)=>{const child=spawn(bin,[`http://127.0.0.1:${server.address().port}/pipeline-compiler.html`,reportPath],{stdio:'inherit'});child.on('error',reject);child.on('exit',resolve);});
 const result=JSON.parse(fs.readFileSync(reportPath));
 console.log(JSON.stringify({passed:result.passed,errors:result.errors,modules:result.modules?.length,pipelines:result.pipelines?.length,failures:[...(result.modules||[]),...(result.pipelines||[])].filter(p=>p.errors?.length)},null,2));
 assert.equal(status,0,'Apple WebKit rejected a pipeline or could not compile');
 assert.equal(result.manifestHash,createHash('sha256').update(bytes).digest('hex'),'Compiler result must match this exact manifest');
 assert.equal(result.passed,true);assert.equal(result.pipelines.length,JSON.parse(bytes).pipelines.length);
}finally{server.close();}
