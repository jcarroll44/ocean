// CPU/DOM mocks, not a GPU benchmark or a browser recording.
const fs=require('fs'),vm=require('vm'),assert=require('assert'),cp=require('child_process'),crypto=require('crypto');
const read=p=>fs.readFileSync(p,'utf8'),hash=s=>crypto.createHash('sha256').update(s).digest('hex');
assert(process.argv[2],'Pass approved skyview-beach.html');
const ref=read(process.argv[2]),code=read('src/camera.js'),input=read('src/interaction.js');
function fn(s,name){const a=s.indexOf('function '+name+'('),b=s.indexOf('{',a);assert(a>=0,name);let n=1,i=b+1;for(;n&&i<s.length;i++){if(s[i]==='{')n++;else if(s[i]==='}')n--;}return s.slice(a,i);}
assert.equal(fn(code,'beachPose'),fn(ref,'beachPose'));
const c={console,URLSearchParams,TextDecoder,Math,Map,Date};vm.createContext(c);vm.runInContext(read('src/scene-data.js'),c);
const THREE=c.__mods['three.module.js'],astro=c.__mods['astro.js'];Object.assign(c.__mods['config.js'].SITE,{lat:30.28,lon:-86});
let now=0;const H=3600000,RAD=Math.PI/180,els=new Map(),checks=['beachPose byte-identical to approved HTML'];
const el=id=>els.get(id)||els.set(id,{dataset:{},style:{setProperty(){}},addEventListener(){},getBoundingClientRect(){return{left:0,width:390}},setPointerCapture(){}}).get(id);
const camera=new THREE.PerspectiveCamera(55,390/844,.3,20000),uniforms={uShear:{value:0}};
Object.assign(c,{THREE,...astro,RAD,HOUR:H,MIN:60000,innerWidth:390,innerHeight:844,performance:{now:()=>now},document:{addEventListener(){}},navigator:{},window:{},$:el,
 state:{time:Date.parse('2026-09-30T08:00:00-05:00'),data:{rows:[],first:Date.parse('2026-09-29'),last:Date.parse('2026-10-07')},version:1,playing:false},
 clamp:(v,a,b)=>Math.max(a,Math.min(b,v)),mix:(a,b,t)=>a+(b-a)*t,uniforms,HOME_LENS_SHIFT:.12,
 engine:{camera,setPose(x,y,z,yaw,pitch,zoom,shear){camera.position.set(x,y,z);camera.fov=2*Math.atan(.59/zoom)/RAD;camera.updateProjectionMatrix();camera.projectionMatrix.elements[9]=-shear/.59;camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();camera.lookAt(x+Math.sin(yaw)*Math.cos(pitch),y+Math.sin(pitch),z-Math.cos(yaw)*Math.cos(pitch));camera.updateMatrixWorld();uniforms.uShear.value=shear;}},
 setDragQuality(){},setTime(t){c.state.time=t;c.state.live=false;},setSkyView(active){c.state.skyView=active;if(active)c.state.timeCameraHeld=true;},holdTimeExploration(){},renderSheetPeek(){},updateTideMark(){},
 exploreGesture:null,ignoreClickUntil:0,peekKind:null,boPress:null,qualityRestoreAt:0,scrubWeek(){},pathPoints:[],reduced:false,
 project(v){const p=v.clone().project(camera);return{x:(p.x+1)*195,y:(1-p.y)*422,visible:p.z<1};}
});
vm.runInContext(code,c);vm.runInContext(fn(read('src/overnight.js'),'selectedDayBounds')+'\n'+fn(read('src/overnight.js'),'clampDay')+'\n'+input.slice(0,input.indexOf('let tideMark=')),c);
const run=s=>vm.runInContext(s,c),time=h=>Date.parse('2026-09-30T00:00:00-05:00')+h*H;
function solar(h){c.state.time=time(h);const s=astro.sunPosition(c.state.time);c.solarInput=s;run('sunEl=solarInput.altitude;sunRel=((solarInput.azimuth-201+540)%360)-180;');return s;}
function snap(){run('cameraVelocity={};sunGlance=null;glanceReturning=false;state.glancing=false;cameraPose=manualTarget();engine.setPose(cameraPose.x,cameraPose.y,cameraPose.z,cameraPose.yaw,cameraPose.pitch,.59/Math.tan(cameraPose.fov*RAD/2),cameraPose.shear);');}
const pose=()=>run('({...cameraPose,fov:engine.camera.fov})');
const refC={Math,Date};vm.createContext(refC);vm.runInContext('const LAT=30.28,LON=-86,TZ=-5,DATE=new Date(Date.UTC(2026,8,30));'+fn(ref,'solar'),refC);
const solarChecks=[7,10,13,18.5].map(hour=>{const s=solar(hour),r=vm.runInContext(`solar(${hour})`,refC);assert(Math.abs(s.azimuth-r.az)<1&&Math.abs(s.geometric-r.el)<1);return{hour,azimuth:s.azimuth,elevation:s.geometric,referenceAzimuth:r.az,referenceElevation:r.el};});
checks.push('four geometric solar checks within 1 degree of reference NOAA equations');
let maxHorizon=0;for(let h=6;h<=19;h+=.05){solar(h);snap();const p=pose(),v=.5+Math.tan(p.pitch)/(2*Math.tan(p.fov*RAD/2));maxHorizon=Math.max(maxHorizon,v);assert(v<=.62000001);assert(p.y>=10-1e-8&&p.y<=26+1e-8);assert(Math.hypot(p.x,p.z)<=70.000001);}
checks.push('day targets stay 10–26 m high / 28–70 m back; horizon never below 62%');
solar(7);snap();solar(13);let maxTurn=0,maxTravel=0;
for(let i=0;i<1800;i++){const a=pose();run('applyManualCamera(1/60)');const b=pose();maxTurn=Math.max(maxTurn,Math.abs(b.yaw-a.yaw)/RAD*60);maxTravel=Math.max(maxTravel,Math.hypot(b.x-a.x,b.y-a.y,b.z-a.z)*60);assert(maxTurn<=30.00001&&maxTravel<=5.00001);}
assert(Math.abs(pose().y-run('manualTarget().y'))<.0001);
run('let value=0,velocity=0;for(let i=0;i<300;i++){const s=criticalStep(value,1,velocity,1/60,7);if(s.value<value||s.value>1)throw Error("overshoot");value=s.value;velocity=s.velocity;}');
checks.push('critical easing converges without overshoot; manual turn ≤30°/s, movement ≤5 m/s');
c.state.sheet='water';assert.equal(run('manualTarget().yaw'),0);assert.equal(run('manualTarget().y'),3.8);c.state.sheet=null;checks.push('Water sheet remains water-locked');
solar(8);snap();const day=astro.sunDay(c.state.time);c.pathPoints=Array.from({length:193},(_,i)=>{const t=day.sunrise+(day.sunset-day.sunrise)*i/192;c.sampleTime=t;return{t,position:run('sunPoint(sampleTime)')};});
const ev=(x,y=0,type='pointermove')=>({pointerId:1,clientX:x,clientY:y,type,preventDefault(){},target:{closest:()=>el('curve')}});
c.event=ev(195,350);run("beginTimeGesture(event,'sun')");const before=c.state.time;now+=100;c.event=ev(195,310);run('moveTimeGesture(event)');assert(c.state.time>before,'Vertical sun drag advances morning');
const held=c.state.time;now+=100;run('moveTimeGesture(event)');assert.equal(c.state.time,held);c.event=ev(195,310,'pointerup');run('finishTimeGesture(event)');assert.equal(c.state.time,held);assert.equal(run('timeMotion'),null);assert(c.state.timeCameraHeld);
checks.push('vertical sun drag changes time; stationary finger / release retain exact time');
for(const kind of ['week','curve']){c.state.time=before;c.kind=kind;c.event=ev(100);run('cancelTimeMotion();beginTimeGesture(event,kind)');now+=100;c.event=ev(160);run('moveTimeGesture(event)');c.event=ev(160,0,'pointerup');run('finishTimeGesture(event)');for(let i=0;i<360;i++){now+=1000/60;run('updateInteraction(1/60)');}const b=run('selectedDayBounds()');assert(c.state.time>=b.min&&c.state.time<=b.max);}
checks.push('timeline / curves stay inside selected day; current scene gestures tested in check-interactions.cjs');
solar(13);snap();const start=pose();run('requestSunGlance()');let maxPitch=start.pitch,maxStep=0,previous=start,sunAdmitted=false;
for(let i=0;i<150;i++){now+=1000/60;run('applyManualCamera(1/60)');const p=pose(),sun=run('project(domePoint(sunPoint(state.time)))');sunAdmitted||=sun.visible&&sun.x>14&&sun.x<376&&sun.y>28&&sun.y<550;maxPitch=Math.max(maxPitch,p.pitch);maxStep=Math.max(maxStep,Math.abs(p.pitch-previous.pitch)/RAD);assert(Math.hypot(p.x-start.x,p.y-start.y,p.z-start.z)<1e-7);assert(Math.abs(p.yaw-start.yaw)<1e-7);previous=p;}
assert(sunAdmitted,'Glance must admit the actual sun disc at 390×844');assert(maxPitch>start.pitch+10*RAD);assert(maxStep<1.2);assert(Math.abs(pose().pitch-start.pitch)<.01);checks.push('tap glance admits real midday sun at 390×844, tilts in place and returns without a snap');
for(const file of ['src/scene-data.js','src/lighting.js','src/weather-effects.js'])assert.equal(read(file),cp.execFileSync('git',['show','aa25ab:'+file],{encoding:'utf8',maxBuffer:10000000}));
checks.push('water, NOAA astronomy, sky / colour, weather and stand source unchanged');
console.log(JSON.stringify({checks,referenceFileHash:hash(ref),beachPoseHash:hash(fn(ref,'beachPose')),solarChecks,maxHorizon,maxManualTurnDegreesPerSecond:maxTurn,maxManualMovementMetersPerSecond:maxTravel,visualQA:'unavailable',fps:'not measured',clip:'not recorded'},null,2));
