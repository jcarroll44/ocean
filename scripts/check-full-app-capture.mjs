import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
const src=fs.readFileSync('ocean-proof/proof/full-app-capture.js','utf8').replace(/^import .*;\n/gm,'').replace('export async function','async function');
for(const failure of [false,true]){
 let drawCount=0,uiCount=0,now=0,fail=false;const draws=[],root={},scene={},overlay={};
 const original=()=>{drawCount++;return true;},api={draw:original};
 const ctx={clearRect(){},drawImage(...args){draws.push(args);}};
 const canvas={getContext:()=>ctx},document={hidden:false,createElement:()=>canvas};
 const win={innerWidth:390,innerHeight:844,document:{getElementById:()=>root,fonts:{ready:Promise.resolve()}},__daybuoy:{engine:{getSceneCanvas:()=>scene}}};
 const c={document,performance:{now:()=>now},liveOcean:()=>api,getFontEmbedCSS:async()=> 'embedded font',toCanvas:async(node,options)=>{uiCount++;assert.equal(node,root);assert.equal(options.fontEmbedCSS,'embedded font');assert.equal(options.filter({id:'ocean'}),false);assert.equal(options.filter({id:'tidewater-ocean-layer'}),false);assert.equal(options.filter({className:'sky-orb-pixels'}),true,'Real orb retained');if(fail)throw Error('raster failed');return overlay;}};
 vm.createContext(c);vm.runInContext(src,c);c.win=win;const capture=await vm.runInContext('fullAppCapture(win)',c);
 api.draw();assert.equal(drawCount,1);assert.equal(draws[0][0],scene);assert.equal(draws[1][0],overlay);assert.equal(canvas.width,390);assert.equal(canvas.height,844);
 now=200;fail=failure;api.draw();await new Promise(r=>setImmediate(r));
 if(failure)assert.throws(()=>capture.validate(),/raster failed/);else{capture.validate();assert.equal(capture.state().uiFrames,2);document.hidden=true;assert.throws(()=>capture.validate(),/hidden/);}
 capture.stop();assert.equal(api.draw,original,'Always restore actual native draw hook');
}
assert(!fs.readFileSync('ocean-proof/proof/scrub-evidence.js','utf8').includes('recordLiveCanvas(app.engine.getSceneCanvas()'),'Full day must record the actual UI composite');
console.log('PASS: live scene + actual DOM/orb composition, raster failure propagation, hidden rejection and draw restoration. Mock canvas; rendered iPhone clip pending.');
