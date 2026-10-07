import fs from 'node:fs';import {execFileSync} from 'node:child_process';
execFileSync(process.execPath,['scripts/check.mjs'],{stdio:'inherit'});
fs.rmSync('dist',{recursive:true,force:true});fs.mkdirSync('dist');
for(const p of ['index.html','proof.css','report.html','proof','baseline','vendor','upstream-integrity.json'])fs.cpSync(p,'dist/'+p,{recursive:true});
for(const name of fs.readdirSync('public'))fs.cpSync('public/'+name,'dist/'+name,{recursive:true});
if(fs.existsSync('validation.json'))fs.copyFileSync('validation.json','dist/validation.json');
console.log('Built isolated ocean proof. Main application unchanged.');
