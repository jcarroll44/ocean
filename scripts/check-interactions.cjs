// Executes the real registered input handlers and camera/story state machines.
// DOM and forecast fixtures are synthetic; this is not a browser/FPS test.
const fs=require('fs'),vm=require('vm'),assert=require('assert'),crypto=require('crypto');
const read=p=>fs.readFileSync(p,'utf8'),input=read('src/interaction.js'),cameraCode=read('src/camera.js');
const listeners=new Map(),elements=new Map();let now=2000;
class Element{
 constructor(key){this.key=key;this.dataset={};this.style={setProperty(){}};this.hidden=false;this.handlers={};this.classList={add(){},remove(){},toggle(){},contains(){return false;}};}
 closest(selectors){return selectors.split(',').some(s=>s.trim()===this.key)?this:null;}
 matches(s){return !!this.closest(s);}
 getBoundingClientRect(){return{left:0,top:0,width:390,height:844};}
 setPointerCapture(){} releasePointerCapture(){} remove(){} append(){} setAttribute(){} addEventListener(type,fn){(this.handlers[type]??=[]).push(fn);}
}
const $=key=>elements.get(key)||elements.set(key,new Element(key)).get(key);
const doc={addEventListener(type,fn,options){const capture=options===true||options?.capture===true;(listeners.get(type)||listeners.set(type,[]).get(type)).push({fn,capture});},querySelector:$};
const c={console,URLSearchParams,TextDecoder,Math,Map,Date,document:doc,window:{},navigator:{},performance:{now:()=>now},innerWidth:390,innerHeight:844,$};vm.createContext(c);
const run=s=>vm.runInContext(s,c);run(read('src/scene-data.js'));
const THREE=c.__mods['three.module.js'],astro=c.__mods['astro.js'],SITE=c.__mods['config.js'].SITE;Object.assign(SITE,{lat:30.28,lon:-86});
const H=3600000,RAD=Math.PI/180,base=Date.parse('2026-10-05T00:00:00-05:00'),camera=new THREE.PerspectiveCamera(55,390/844,.3,20000);
// Forecast values are test fixtures only and never enter the app or its UI.
const rows=Array.from({length:168},(_,h)=>({time:base+h*H,uv:Math.max(0,8-Math.abs(h%24-13)),swell:1,wind:5,rain:0,rainProbability:0,cloud:10,weatherCode:0}));
Object.assign(c,{THREE,...astro,SITE,RAD,HOUR:H,MIN:60000,reduced:false,review:false,q:new URLSearchParams(),
 state:{time:base+8*H,live:false,data:{rows,source:'live',retrievedAt:Date.now(),first:base,last:base+7*24*H-1},version:1,prefs:{skin:3}},
 clamp:(v,a,b)=>Math.max(a,Math.min(b,v)),mix:(a,b,t)=>a+(b-a)*t,uniforms:{uShear:{value:0},uPhase:{value:0},uTime:{value:0}},current:{},pathPoints:[],
 engine:{camera,setPose(x,y,z,yaw,pitch,zoom,shear){camera.position.set(x,y,z);camera.fov=2*Math.atan(.59/zoom)/RAD;camera.updateProjectionMatrix();camera.projectionMatrix.elements[9]=-shear/.59;camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();camera.lookAt(x+Math.sin(yaw)*Math.cos(pitch),y+Math.sin(pitch),z-Math.cos(yaw)*Math.cos(pitch));camera.updateMatrixWorld();c.uniforms.uShear.value=shear;}},
 project(v){const p=v.clone().project(camera);return{x:(p.x+1)*195,y:(1-p.y)*422,visible:p.z<1};},
 setTime(t,{live=false}={}){c.state.time=Math.max(c.state.data.first,Math.min(c.state.data.last,t));c.state.live=live;},
 holdTimeExploration(){},renderUI(){},notice(){},renderSheetPeek(){},clock:t=>String(t),
 sampleAt:(r,t)=>r.reduce((a,b)=>Math.abs(b.time-t)<Math.abs(a.time-t)?b:a),ripRiskAt:()=>({risk:'Low'}),isStorm:()=>false,
 uvFor:()=>({minutesTo:()=>60}),burnThreshold:()=>1,sunsetFor:()=>({score:{score:5}}),timeRange:()=>'',conditions:()=>rows[8]
});
function fn(s,name){const a=s.indexOf('function '+name+'('),b=s.indexOf('{',a);assert(a>=0,name);let n=1,i=b+1;for(;n;i++){if(s[i]==='{')n++;else if(s[i]==='}')n--;}return s.slice(a,i);}
assert.equal(crypto.createHash('sha256').update(fn(cameraCode,'beachPose')).digest('hex'),'e80ec112686de49863bea491350e36bca4034f919f7606d4b4a14f5d6b525224');
run(cameraCode);run(read('src/explore.js'));run(read('src/overnight.js'));
run(fn(read('src/daybuoy.js'),'openSheet'));
run(input);run('setDragQuality=low=>{state.dragQuality=low;};updateTideMark=()=>{};renderSheetPeek=()=>{};');run(read('src/story.js'));
const ui=read('src/daybuoy.js');run(ui.slice(ui.indexOf("document.addEventListener('click',e=>{"),ui.indexOf("document.addEventListener('keydown',e=>{")));
function dispatch(type,key,x=150,y=400,id=1){
 const e={type,target:$(key),pointerId:id,pointerType:'touch',isPrimary:id===1,button:0,clientX:x,clientY:y,preventDefault(){this.prevented=true;},stopImmediatePropagation(){this.stopped=true;},stopPropagation(){this.propagationStopped=true;}};
 const all=listeners.get(type)||[];
 for(const capture of [true,false]){if(!capture&&!e.stopped)for(const f of e.target.handlers[type]||[])f(e);for(const l of all.filter(l=>l.capture===capture)){if(e.stopped)break;l.fn(e);}}
 return e;
}
const pose=()=>run('({...cameraPose,fov:engine.camera.fov})');
function solar(){const s=astro.sunPosition(c.state.time);c.solarInput=s;run('sunEl=solarInput.altitude;sunRel=((solarInput.azimuth-201+540)%360)-180;');}
function tick(n=1){for(let i=0;i<n;i++){now+=1000/60;if(c.state.playing)run('advanceWatch(performance.now())');run('updateInteraction(1/60)');solar();run('updateCameraPose(1/60,!!state.timeCameraHeld||!!state.skyView||!!state.playing)');}}
function reset(hour=8){now+=2000;run('cancelTimeMotion();clearUserView();storyCard=false;storyReturn=null;intro=null;introChecked=true;state.storyEndPose=null;state.playing=false;state.paused=false;state.story=false;state.sheet=null;state.sheetCameraLocked=false;state.timeCameraHeld=true;state.skyView=false;state.glancing=false;glanceReturning=false;');c.state.time=base+hour*H;c.state.live=false;solar();run('cameraPose=manualTarget();engine.setPose(cameraPose.x,cameraPose.y,cameraPose.z,cameraPose.yaw,cameraPose.pitch,.59/Math.tan(cameraPose.fov*RAD/2),cameraPose.shear);');const d=astro.sunDay(c.state.time);c.pathPoints=Array.from({length:193},(_,i)=>{const t=d.sunrise+(d.sunset-d.sunrise)*i/192;c.sampleTime=t;return{t,position:run('sunPoint(sampleTime)')};});}
const results=[];const pass=(label,detail)=>results.push({check:label,result:'PASS',detail});

reset();let time=c.state.time,start=pose();dispatch('pointerdown','#ocean',90,420);now+=50;dispatch('pointermove','#sun-handle',210,470);tick(12);let p=pose();assert(p.yaw!==start.yaw&&p.pitch!==start.pitch);assert.equal(c.state.time,time);assert.deepEqual([p.x,p.y,p.z],[start.x,start.y,start.z]);dispatch('pointerup','#week-scrubber',210,470);tick(120);const held=pose();tick(120);assert(Math.abs(pose().yaw-held.yaw)<.00001);assert.equal(c.state.time,time);
// Neither crossing another target nor beginning time scrubbing resets a held view.
dispatch('pointerdown','#week-scrubber',140,760);now+=50;dispatch('pointermove','#week-scrubber',170,760);dispatch('pointerup','#week-scrubber',170,760);tick(120);assert(Math.abs(pose().yaw-held.yaw)<.00001);
// Absolute pitch and persistent entry-heading yaw bounds include repeated drags.
dispatch('pointerdown','#ocean',100,400);now+=20;dispatch('pointermove','#ocean',100000,100000);tick(60);assert(c.state.userLook.pitch<=60*RAD);assert(c.state.userLook.yaw>=c.state.userLook.anchorYaw-Math.PI/2);dispatch('pointercancel','#ocean');
pass('Drag scene → view rotates, time unchanged','Registered handlers; cross sun/dock, fixed position, inertia, held view and angular limits.');

reset();time=c.state.time;const point=run('project(domePoint(sunPoint(state.time)))');dispatch('pointerdown','#sun-handle',point.x,point.y);now+=50;dispatch('pointermove','#ocean',point.x,point.y-35);assert(c.state.time>time);const afterPoint=run('project(domePoint(sunPoint(state.time)))');assert(afterPoint.y<point.y-15);const sunTime=c.state.time;dispatch('pointerup','#ocean',point.x,point.y-35);tick(90);assert.equal(c.state.time,sunTime);assert.equal(run('timeMotion'),null);assert(/#sun-handle\{width:60px;height:60px/.test(read('src/home.css')));
pass('Drag sun → time changes, sun follows finger','Upward input advances morning sun upward on its true path; 60 px target; release holds time.');

reset();time=c.state.time;dispatch('pointerdown','#week-scrubber',130,760);now+=50;dispatch('pointermove','#ocean',230,760);assert(c.state.time!==time);assert.equal(run('dockCompact'),true);assert.equal(c.state.scrubbing,true);dispatch('pointerup','#ocean',230,760);assert.equal(c.state.scrubbing,false);tick(500);let b=run('selectedDayBounds()');assert(c.state.time>=b.min&&c.state.time<=b.max);assert.equal(run('dockCompact'),false);
pass('Drag scrubber → time changes, dock compacts','Ownership retained across canvas; header release flag clears; momentum stays within day.');

reset();time=c.state.time;start=pose();dispatch('pointerdown','#ocean',100,430,1);dispatch('pointerdown','#ocean',240,430,2);dispatch('pointermove','#ocean',320,430,2);tick(20);assert(pose().fov<start.fov);dispatch('pointermove','#ocean',10000,430,2);tick(60);assert(pose().fov>=35-1e-6);dispatch('pointermove','#ocean',101,430,2);tick(90);assert(pose().fov<=80+1e-6);dispatch('pointerup','#ocean',101,430,2);dispatch('pointerup','#ocean',100,430,1);assert.equal(c.state.time,time);
now+=500;dispatch('pointerdown','#ocean',100,400);now+=50;dispatch('pointerup','#ocean',100,400);now+=140;dispatch('pointerdown','#ocean',104,401);now+=50;dispatch('pointerup','#ocean',104,401);assert.equal(c.state.userLook,null);assert(c.state.cameraReset);tick(900);assert.equal(c.state.time,time);assert(Math.abs(pose().fov-start.fov)<.001);assert(Math.abs(pose().yaw-start.yaw)<.001);
// Second contact starting on sun must become pinch, not a second time gesture.
reset();time=c.state.time;dispatch('pointerdown','#sun-handle',100,200);dispatch('pointerdown','#ocean',230,220,2);dispatch('pointermove','#ocean',280,240,2);tick(10);assert.equal(c.state.time,time);assert.equal(run('sceneGesture.kind'),'pinch');dispatch('pointercancel','#ocean',280,240,2);dispatch('pointercancel','#sun-handle',100,200);assert.equal(run('scenePointers.size'),0);
pass('Pinch zooms; double-tap resets','Two pointers, 35–80° limits, lift/cancel handoff, sun-to-pinch promotion; time unchanged.');

reset();run("openSheet('water')");tick(900);start=pose();time=c.state.time;dispatch('pointerdown','[data-ribbon]',150,700);now+=100;dispatch('pointermove','[data-ribbon]',190,700);tick(90);assert(c.state.time!==time);assert(Math.abs(pose().yaw)<.00001);assert(Math.hypot(pose().x-start.x,pose().y-start.y,pose().z-start.z)<.001);assert.equal(run('peekKind'),'water');dispatch('pointerup','[data-ribbon]',190,700);tick(500);assert.equal(run('peekKind'),'water');
pass('Water sheet: scrub tide → camera stays on water','Water pose remains fixed; selected time changes; 170 px peek state persists after release.');

reset();dispatch('pointerdown','#ocean',100,400);now+=50;dispatch('pointermove','#ocean',160,430);dispatch('pointerup','#ocean',160,430);run('backToNow()');tick(100);assert.equal(c.state.live,true);assert.equal(c.state.userLook,null);assert.equal(c.state.timeCameraHeld,false);assert(Math.abs(c.state.time-Date.now())<2000);assert(Math.abs(pose().yaw)<.0001);assert.equal(run('timeMotion'),null);
pass('Back to now → live','Clears held look, inertia and time motion; returns default home heading and live time.');

reset();dispatch('pointerdown','#ocean',80,420);now+=60;dispatch('pointermove','#ocean',140,445);dispatch('pointerup','#ocean',140,445);tick(80);const preWatch=pose(),preTime=c.state.time;
now+=500;dispatch('click','#watch-day');assert(c.state.playing&&!c.state.paused);assert.equal(c.state.userLook,null);tick(180);assert(c.state.time!==preTime);time=c.state.time;
dispatch('pointerdown','#ocean',90,410);assert(c.state.paused);const paused=pose();tick(20);assert.equal(c.state.time,time);assert(Math.abs(pose().yaw-paused.yaw)<1e-8);now+=50;dispatch('pointermove','#ocean',180,440);tick(20);assert(pose().yaw!==paused.yaw);assert.equal(c.state.time,time);dispatch('pointerup','#ocean',180,440);tick(60);assert(c.state.paused);assert.equal($('#app').dataset.paused,'true');
// A subsequent scene tap cannot resume; only the explicit control can.
dispatch('pointerdown','#ocean',80,450);dispatch('pointerup','#ocean',80,450);assert(c.state.paused);now+=500;dispatch('click','#watch-day');assert(!c.state.paused);tick(20);assert(c.state.time!==time);run('stopWatch(true)');assert.equal(c.state.time,preTime);assert(c.state.userLook);assert(Math.abs(pose().yaw-preWatch.yaw)<1e-8);
pass('Watch plays; a tap pauses it','Actual story start/advance; first touch freezes time/camera, same touch looks, explicit Resume works, pre-watch view restores.');

// Day change is one of the explicit reset actions and preserves hour.
reset();dispatch('pointerdown','#ocean',60,400);dispatch('pointermove','#ocean',140,420);dispatch('pointerup','#ocean',140,420);const day=astro.localDayStart(c.state.time);run(`selectForecastDay(${day+48*H})`);assert.equal(c.state.userLook,null);assert.equal(c.state.time,day+56*H);
// Losing capture never starts coast, retains a stuck owner, or treats it as a tap.
reset();dispatch('pointerdown','#week-scrubber',100,750);now+=30;dispatch('pointermove','#ocean',200,750);dispatch('lostpointercapture','#app',200,750);assert.equal(run('timeGesture'),null);assert.equal(run('timeMotion'),null);
dispatch('pointerdown','#ocean',100,430);dispatch('pointermove','#ocean',-10000,-10000);assert(c.state.userLook.pitch>=-20*RAD);assert(c.state.userLook.yaw<=c.state.userLook.anchorYaw+Math.PI/2);dispatch('lostpointercapture','#app');assert.equal(run('sceneGesture'),null);assert.equal(run('scenePointers.size'),0);
// Taking manual control above a subject sheet uses its current position.
reset();dispatch('pointerdown','#ocean',100,430);dispatch('pointermove','#ocean',160,450);dispatch('pointerup','#ocean',160,450);tick(60);run("openSheet('water')");tick(900);const subject=pose();dispatch('pointerdown','#ocean',100,420);dispatch('pointermove','#ocean',140,440);tick(10);assert.deepEqual([pose().x,pose().y,pose().z],[subject.x,subject.y,subject.z]);dispatch('pointerup','#ocean',140,440);
// Any touch pauses: a dock touch first pauses only; an intentional next scrub
// exits the paused story instead of leaving an old moment headline on new time.
reset();now+=500;dispatch('click','#watch-day');tick(30);time=c.state.time;dispatch('pointerdown','#week-scrubber',180,750);assert(c.state.paused);assert.equal(run('timeGesture'),null);tick(30);assert.equal(c.state.time,time);dispatch('pointerup','#week-scrubber',180,750);dispatch('pointerdown','#week-scrubber',180,750);assert(!c.state.playing&&!c.state.story);dispatch('pointercancel','#week-scrubber',180,750);
reset();now+=500;dispatch('click','#watch-day');tick(30);time=c.state.time;dispatch('pointerdown','#sun-handle',160,200);assert(c.state.playing&&c.state.paused);dispatch('pointermove','#ocean',180,240);tick(20);assert.equal(c.state.time,time);dispatch('pointerup','#ocean',180,240);run("openSheet('water');backToNow()");tick(100);assert.equal(c.state.sheet,null);assert(c.state.live);assert(Math.abs(pose().yaw)<.0001);
console.log(JSON.stringify({viewport:{width:390,height:844},scope:'Actual registered event handlers + Three.js projection, mocked DOM and synthetic forecast. No rendered/browser/device/FPS claim.',checks:results,extra:'Day change preserves hour and clears held look; exact approved beachPose hash retained.'},null,2));
