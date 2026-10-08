import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
// Keep the approved scene's original build intact; serve its exact outputs as
// static assets beside the Sites server endpoint. No client framework migration.
fs.rmSync('hosting/public',{recursive:true,force:true});fs.mkdirSync('hosting/public',{recursive:true});
for(const entry of fs.readdirSync('dist')){
 if(['client','server','.openai'].includes(entry))continue;
 fs.cpSync('dist/'+entry,'hosting/public/'+entry,{recursive:true});
}
fs.mkdirSync('hosting/.openai',{recursive:true});fs.copyFileSync('.openai/hosting.json','hosting/.openai/hosting.json');
execFileSync(process.execPath,['scripts/run-framework.mjs','build'],{cwd:'hosting',stdio:'inherit'});
for(const name of ['client','server','.openai']){
 fs.rmSync('dist/'+name,{recursive:true,force:true});
 fs.cpSync('hosting/dist/'+name,'dist/'+name,{recursive:true});
}
if(!fs.readFileSync('dist/server/index.js','utf8').includes('GITHUB_RESULTS_TOKEN'))throw Error('Missing results server.');
for(const file of ['index.html','ocean-live.html','ocean-overcast-profile.html','ocean-proof/proof/results-upload.js']){
 if(!fs.readFileSync('dist/'+file).equals(fs.readFileSync('dist/client/'+file)))throw Error('Static asset changed: '+file);
}
console.log('PASS: Sites Worker + byte-identical beach assets packaged. Runtime token is configured only in Sites.');
