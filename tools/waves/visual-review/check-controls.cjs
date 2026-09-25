// DOM/engine contract test; not a browser or device-performance test.
const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const root=path.resolve(__dirname,'../../..'),html=fs.readFileSync(root+'/review/breaking-wave/index.html','utf8');
const code=fs.readFileSync(root+'/review/breaking-wave/rig-controls.js','utf8');
async function setup(saved='{}'){
 const elements={},heights=[];
 for(const m of html.matchAll(/<(\w+)\s+([^>]+)>/g)){
  const attrs=Object.fromEntries([...m[2].matchAll(/([\w-]+)="([^"]*)"/g)].map(v=>[v[1],v[2]]));
  const el={...attrs,value:attrs.value||'',dataset:{height:attrs['data-height']},textContent:'',setAttribute(k,v){this[k]=v;}};
  if(attrs.id)elements[attrs.id]=el;if(attrs['data-height'])heights.push(el);
 }
 elements.view.value='app';
 const doc={getElementById(id){return elements[id]||null;},querySelectorAll(q){if(q==='[data-height]')return heights;if(q==='[data-tune]')return ['curl','glow','foam','spray','peel','period','offset','water','white'].map(id=>elements[id]);throw Error(q);},createElement(){return {};},head:{append(){}}};
 const position={set(...v){this.xyz=v;},xyz:[]},camera={position,lookAt(...v){this.target=v;},updateProjectionMatrix(){},updateMatrixWorld(){}};
 const engine={buoy:{group:{}},renderer:{domElement:{width:1000,height:680}},camera,resetLab(){}};
 const rig={tune(v){this.look={...v};},set(...v){this.frame=v;}};
 const uniforms={uRigEye:{value:{copy(){}}},uRigInvVP:{value:{multiplyMatrices(){}}},uTime:{},uPhase:{}};
 const lab={state:{prefs:{}},engine,uniforms,applyConditions(){}};
 const ctx={window:{__waveLab:lab,__ocean:{setView(){camera.position.set(0,10,26);}}},parent:{document:doc},document:doc,createWaveRig:async()=>rig,localStorage:{getItem(){return saved;},setItem(k,v){saved=v;}},console,Date,Math,URL,Blob};
 vm.createContext(ctx);await vm.runInContext(code,ctx);
 return {ctx,lab,rig,e:elements,heights,camera,getSaved:()=>JSON.parse(saved)};
}
(async()=>{
 const {ctx,lab,rig,e,heights,camera,getSaved}=await setup();
 assert.equal(ctx.window.__rigReview.height,4);assert.equal(rig.look.curl,1);
 heights[2].onclick();assert.equal(ctx.window.__rigReview.height,6);assert.equal(e['height-value'].textContent,'6.0 ft');
 e.phase.oninput({target:{value:'3.6'}});lab.tick(0);assert.equal(e.play.textContent,'Play');assert(Math.abs(rig.frame[0]-3.6*Math.sqrt(1.5))<1e-6);
 const oldTime=ctx.window.__rigReview.time;e.curl.value='1.4';e.curl.oninput();assert.equal(rig.look.curl,1.4);assert.equal(ctx.window.__rigReview.time,oldTime);assert.equal(getSaved().curl,1.4);
 e.period.value='9';e.period.oninput();assert.equal(ctx.window.__rigReview.time,oldTime*1.5);
 e.foam.value='0';e.foam.oninput();e.spray.value='0';e.spray.oninput();assert.equal(rig.look.foam,0);assert.equal(rig.look.spray,0);
 e.water.value='#123456';e.water.oninput();assert.equal(rig.look.water,'#123456');
 e['reset-look'].onclick();assert.equal(rig.look.curl,1);assert.equal(rig.look.foam,1);assert.equal(rig.look.period,6);
 lab.engine.beforeRender();assert.deepEqual(camera.position.xyz,[0,1.2,-.5]);assert.equal(camera.fov,50);
 heights[0].onclick();lab.engine.beforeRender();assert.deepEqual(camera.position.xyz,[0,1.2,-.5]);assert.equal(camera.fov,50);
 e.view.value='close';lab.engine.beforeRender();assert.equal(camera.position.xyz[1],.9);
 e.compare.onclick();assert.equal(ctx.window.__rigReview.height,2);e.replay.onclick();lab.tick(.05);assert(ctx.window.__rigReview.time>0);
 const malformed=await setup('{broken');assert.equal(malformed.rig.look.curl,1);
 const clamped=await setup('{"curl":100,"foam":-2,"water":"javascript:bad"}');assert.equal(clamped.rig.look.curl,1.5);assert.equal(clamped.rig.look.foam,0);assert.equal(clamped.rig.look.water,'#148c90');
 const looping=await setup();for(let i=0;i<170;i++)looping.lab.tick(.06);assert.equal(looping.rig.frame[5],1,'Next wave must receive a new event seed');looping.e.replay.onclick();looping.lab.tick(0);assert.equal(looping.rig.frame[5],1,'Replay keeps the same break pattern');
 console.log('PASS: presets, scrub/pause, live sliders, colours, period, reset, persistence, input bounds and fixed comparison camera.');
})().catch(e=>{console.error(e);process.exit(1);});
