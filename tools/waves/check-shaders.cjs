const fs=require('fs'),vm=require('vm'),path=require('path');
const root=path.resolve(__dirname,'../..');
let html=fs.readFileSync(path.join(root,'review/wave-lab/app.html'),'utf8');
if(!html.includes('/* ===== ocean-engine.js ===== */')){
 const zlib=require('zlib'),crypto=require('crypto'),assert=require('assert');
 const patch=JSON.parse(zlib.gunzipSync(Buffer.from(html.match(/atob\('([^']+)'\)/)[1],'base64')));
 let bytes=require('child_process').execFileSync('git',['show','bdc3ade:index.html'],{cwd:root,maxBuffer:8e6});
 const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
 assert.equal(hash(bytes),patch.sha);
 for(const [start,end,b64] of patch.ops.reverse())bytes=Buffer.concat([bytes.subarray(0,start),Buffer.from(b64,'base64'),bytes.subarray(end)]);
 assert.equal(hash(bytes),patch.targetSha);html=bytes.toString('utf8');
}
for(const [i,s] of [...html.matchAll(/<script\b[^>]*>(.*?)<\/script>/gs)].entries())new vm.Script(s[1],{filename:'inline-'+i});
const modules=Object.fromEntries([...html.matchAll(/\/\* ===== (.*?) ===== \*\/(.*?)(?=\/\* ===== |<\/script>)/gs)].map(m=>[m[1],m[2]]));
const ctx={__mods:{'three.module.js':{},'sky-layers.js':{},'buoy.js':{}},console,Math,Date,Float32Array,Uint8Array};vm.createContext(ctx);
for(const n of ['wave-spectrum.js','wave-populations.js','incoming-waves.js','breaking-events.js','breaker-surface.js','lip-detail.js','ocean-engine.js'])vm.runInContext(modules[n],ctx,{filename:n});
const engine=ctx.__mods['ocean-engine.js'],code=engine.labPrograms;
const player=fs.readFileSync(path.join(root,'review/wave-lab/baked-player.js'),'utf8');
const vertex=player.match(/const vertex = `([\s\S]*?)`;/)[1],fragment=player.match(/const fragment = `([\s\S]*?)`;/)[1];
const programs={...engine.shaderPrograms,baked:{vertex:code.environment+code.waves+vertex,fragment:code.environment+code.waves+code.waterLight+fragment}};
fs.writeFileSync(process.argv[2],JSON.stringify(programs));
console.log('Parsed preview JavaScript; extracted '+Object.keys(programs).length+' shader programs.');
