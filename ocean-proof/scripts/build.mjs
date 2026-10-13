import fs from 'node:fs';import {execFileSync} from 'node:child_process';import {build as bundle} from 'esbuild';
execFileSync(process.execPath,['scripts/generate-forecast-fft.mjs'],{stdio:'inherit'});
execFileSync(process.execPath,['scripts/generate-grid128.mjs'],{stdio:'inherit'});
execFileSync(process.execPath,['scripts/check.mjs'],{stdio:'inherit'});
fs.rmSync('dist',{recursive:true,force:true});fs.mkdirSync('dist');
for(const p of ['index.html','proof.css','report.html','proof','baseline','vendor','upstream-integrity.json'])fs.cpSync(p,'dist/'+p,{recursive:true});
for(const name of fs.readdirSync('public'))fs.cpSync('public/'+name,'dist/'+name,{recursive:true});
if(fs.existsSync('validation.json'))fs.copyFileSync('validation.json','dist/validation.json');
console.log('Built isolated ocean proof. Main application unchanged.');

// A cold gate uses one native module and unchanged embedded cloud noise data;
// it sends no extra asset requests before the first native frame.
const inlineClouds=Object.fromEntries(['takram-shape.bin','takram-detail.bin'].map(name=>[name,fs.readFileSync('proof/'+name).toString('base64')]));
await bundle({entryPoints:['proof/native-scene.js'],outfile:'dist/proof/native-scene.bundle.js',bundle:true,format:'esm',target:'safari17',minify:true,legalComments:'none',banner:{js:'globalThis.__DAYBUOY_BUNDLED_CLOUDS__='+JSON.stringify(inlineClouds)+';'},logLevel:'warning'});
const sceneHtml=fs.readFileSync('dist/proof/native-scene.html','utf8');
if(!sceneHtml.includes('src="native-scene.js"'))throw Error('Native gate entry changed');
fs.writeFileSync('dist/proof/native-scene.html',sceneHtml.replace('src="native-scene.js"','src="native-scene.bundle.js"'));
console.log('PASS: gate native module and cloud noise bundled for first-frame startup.');
