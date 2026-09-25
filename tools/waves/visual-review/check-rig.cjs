const fs=require('fs'),vm=require('vm'),path=require('path');const root=path.resolve(__dirname,'../../..');
let html=fs.readFileSync(root+'/review/breaking-wave/app.html','utf8');
const patch=JSON.parse(require('zlib').gunzipSync(Buffer.from(html.match(/atob\('([^']+)'\)/)[1],'base64')));
let raw=require('child_process').execFileSync('git',['show','bdc3ade:index.html'],{cwd:root,maxBuffer:8e6});
const hash=b=>require('crypto').createHash('sha256').update(b).digest('hex');
if(hash(raw)!==patch.sha)throw Error('Preview base checksum failed');
for(const [a,b,content] of [...patch.ops].reverse())raw=Buffer.concat([raw.subarray(0,a),Buffer.from(content,'base64'),raw.subarray(b)]);
if(hash(raw)!==patch.targetSha)throw Error('Preview target checksum failed');html=raw.toString();
const modules=Object.fromEntries([...html.matchAll(/\/\* ===== (.*?) ===== \*\/(.*?)(?=\/\* ===== |<\/script>)/gs)].map(m=>[m[1],m[2]]));
const ctx={window:{},__mods:{'three.module.js':{},'sky-layers.js':{},'buoy.js':{}},console,Math,Date,Float32Array,Uint8Array,Uint32Array};vm.createContext(ctx);
for(const n of ['wave-spectrum.js','wave-populations.js','incoming-waves.js','breaking-events.js','breaker-surface.js','lip-detail.js','ocean-engine.js'])vm.runInContext(modules[n],ctx,{filename:n});
vm.runInContext(fs.readFileSync(root+'/review/breaking-wave/rig-player.js','utf8'),ctx);
const rig=ctx.window.WaveRig,engine=ctx.__mods['ocean-engine.js'],programs={...engine.shaderPrograms,rig:rig.makePrograms(engine.labPrograms,fs.readFileSync(root+'/review/breaking-wave/surface.glsl','utf8'))};
fs.writeFileSync('/tmp/rig-programs.json',JSON.stringify(programs));
const data=rig.meshData();fs.writeFileSync('/tmp/rig-v.bin',Buffer.from(data.v.buffer));fs.writeFileSync('/tmp/rig-i.bin',Buffer.from(data.idx.buffer));
for(const name of ['rig-controls.js','rig-player.js'])new vm.Script(fs.readFileSync(root+'/review/breaking-wave/'+name,'utf8'));
console.log('Shaders extracted, JavaScript parsed.');

(async()=>{
const mats=[];class Geometry{constructor(){this.attributes={};}setAttribute(k,v){this.attributes[k]=v;return this;}setIndex(){return this;}}class Attr{constructor(a,b){this.array=a;this.itemSize=b;}}
class Material{constructor(opts){mats.push(opts);}}class Object3D{constructor(g,m){this.geometry=g;this.material=m;}}
const THREE={BufferGeometry:Geometry,BufferAttribute:Attr,ShaderMaterial:Material,Mesh:Object3D,Points:Object3D,DoubleSide:2};
ctx.fetch=async name=>({ok:true,text:async()=>fs.readFileSync(root+'/review/breaking-wave/'+name,'utf8')});
const uniforms={uBakeOn:{value:0}},lab={THREE,uniforms,engine:{labPrograms:engine.labPrograms,scene:{add(){}},ocean:{},spray:{},renderer:{domElement:{height:720}}}};
const built=await ctx.window.createWaveRig(lab);built.set(3.6,4);
if(mats.length!==2)throw Error('Expected water and spray materials');
programs.rigSpray={vertex:mats[1].vertexShader,fragment:mats[1].fragmentShader};
if(!programs.rigSpray.vertex.includes('p.z+=-3.5-5.2*uRigHeight+uRigBreakOffset;'))throw Error('Spray must follow wave position');
fs.writeFileSync('/tmp/rig-programs.json',JSON.stringify(programs));
fs.writeFileSync('/tmp/rig-particles.bin',Buffer.from(built.spray.geometry.attributes.aParticle.array.buffer));
console.log('Wave and spray built; positions follow same event.');
})().catch(e=>{console.error(e);process.exit(1)});
