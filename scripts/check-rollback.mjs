// Real parsed HTML and complete application startup. No GPU, layout or phone claim.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';
import {parseHTML} from 'linkedom';

const read=p=>fs.readFileSync(p,'utf8'),H=3600000;
const now=Date.parse('2026-10-06T10:00:00-05:00'),today=Date.parse('2026-10-06T00:00:00-05:00');
class TestDate extends Date{constructor(...a){super(...(a.length?a:[now]));}static now(){return now;}}
function boot(html,search=''){
 const native=parseHTML(html),{document}=native;
 native.HTMLElement.prototype.animate=function(){return{cancel(){}};};
 native.HTMLElement.prototype.getBoundingClientRect=function(){return{left:20,right:370,top:0,bottom:32,width:350,height:32};};
 const cache=new Map([['daybuoy.welcomed','1'],['daybuoy.nws-surf',JSON.stringify({zone:'FLZ108',issued:now,periods:[{start:today,end:today+24*H,risk:'High'}]})]]);
 const window={addEventListener(){},innerWidth:390,innerHeight:844};
 const c={document,window,navigator:{onLine:true},console:{log(){},warn(){},error(){}},URL,URLSearchParams,TextDecoder,Date:TestDate,
  location:{search,origin:'https://test'},matchMedia:()=>({matches:false}),localStorage:{getItem:k=>cache.get(k)??null,setItem:(k,v)=>cache.set(k,v)},
  innerWidth:390,innerHeight:844,devicePixelRatio:3,performance:{now:()=>10000},setInterval(){},setTimeout(){},clearTimeout(){},requestAnimationFrame(){},addEventListener(){},AbortSignal,
  fetch:async()=>{throw Error('Network intentionally disabled in fixture test');}};
 // The GPU constructor alone is replaced. All production UI initialization,
 // data sampling, astronomy, rendering of text, and click handlers execute.
 const source=document.querySelector('script').textContent.replace("const {createOcean}=__mods['ocean-engine.js'];","const createOcean=()=>{throw Error('No GPU in DOM test')};");
 vm.createContext(c);let error;try{vm.runInContext(source,c);}catch(e){error=e;}
 return{document,c,window,error,$:s=>document.querySelector(s),click:el=>el.dispatchEvent(new native.Event('click',{bubbles:true}))};
}
const rejected=execFileSync('git',['show','eacc2c93f0e7e7e55bd1cba8940c0db14b750f4d:dist/index.html'],{encoding:'utf8',maxBuffer:20000000});
const old=boot(rejected);
assert.match(old.error?.message||'',/null/,'The actual rejected startup must reproduce the reported failure');
assert(old.$('#time-switch').innerHTML.startsWith('null'),'Missing lazy control was stringified into visible text');

const html=read('dist/index.html'),a=boot(html),{$,window,document,click}=a;
assert.ifError(a.error);
const app=window.__daybuoy,state=app.state;
// Synthetic test rows, never written to app assets or presented as observations.
const template=state.data.rows[0];state.data.rows=Array.from({length:169},(_,i)=>({...template,time:today+i*H}));
state.data.first=today;state.data.last=today+7*24*H;
for(const row of state.data.rows){const day=Math.floor((row.time-today)/(24*H));row.temperature=74+day*2;row.swell=day===4?6.5:1.2;row.wind=day===4?19:6;row.rain=0;row.weatherCode=0;row.rainProbability=5;row.uv=1;}
state.data.source='live';state.data.retrievedAt=now;state.version++;
app.renderUI();
assert.equal($('#back-to-now').hidden,true);
assert.equal($('#back-to-now').parentElement.id,'time-switch');
assert.equal($('#source-label').hidden,true);
assert.equal($('#hero-temp').textContent,'74');
assert.match($('#headline').textContent,/High rip risk/);
assert(!$('#time-switch').textContent.includes('null'));
assert.equal(document.querySelectorAll('#back-to-now').length,1);
assert.equal(document.querySelectorAll('#night-location,#native-ocean,#ocean-backend').length,0);
assert.notEqual($('#moment-action .action-main').textContent,$('#headline').textContent);

const saturday=today+4*24*H;
click($(`[data-day="${saturday}"]`));app.renderUI();
assert.equal(state.time,saturday+10*H,'A day click preserves hour and selects Saturday');
assert.equal(state.live,false);
assert.equal($('#clock-day').textContent,'Saturday');
assert.equal($('#clock-digits').textContent,'10:00');
assert.equal($('#hero-temp').textContent,'82','Header must use the selected forecast row');
assert.equal($('[data-sheet="air"] strong').textContent,'82°');
assert.match($('[data-sheet="waves"] strong').textContent,/6–7/);
assert.match($('#headline').textContent,/Choppy water/,'Today’s NWS risk must not leak into Saturday');
assert.equal($('#back-to-now').hidden,false);
assert.equal($('#source-label').hidden,true,'No duplicate selected-time chip above the header');
assert.equal($(`[data-day="${saturday}"]`).getAttribute('aria-pressed'),'true');
assert.equal(document.querySelectorAll('#days [aria-pressed="true"]').length,1);
assert.equal($('#week-scrubber').dataset.selectedDay,String(saturday));
assert.equal(Number($('#week-scrubber').getAttribute('aria-valuemin')),saturday);
assert(Math.abs(parseFloat($('#week-scrubber').style.getPropertyValue('--selected'))-100*10/24)<.001,'Thumb is selected-day hour, not week fraction');
assert.equal($('#app').dataset.forecastTime,String(state.time));

app.setHour(21);app.renderUI();
assert.equal($('#clock-digits').textContent,'9:00');assert.equal($('#clock-period').textContent,'PM');
assert.equal($('#clock-day').textContent,'Saturday');assert.match($('#headline').textContent,/Windy night/);
state.scrubbing=true;app.renderUI();assert.equal($('#scrub-time').hidden,false);
state.scrubbing=false;app.renderUI();assert.equal($('#scrub-time').hidden,true);
assert.equal($('#app').dataset.scrubbing,'false');

app.openSheet('water');app.renderUI();assert.equal($('#source-label').hidden,false,'Sheet retains the only visible time readout');
assert.match($('#source-label').textContent,/Sat.*9:00 PM/);
click($('#back-to-now'));app.renderUI();
assert.equal(state.live,true);assert.equal(state.time,now);assert.equal(state.sheet,null);
assert.equal($('#back-to-now').hidden,true);assert.equal($('#hero-temp').textContent,'74');
assert.equal($('#source-label').hidden,true);assert.equal($('#clock-day').textContent,'Today');

// Explicit query flags cannot silently re-enable either experiment.
for(const search of ['?ocean=webgpu&header=verdict','?breakers=tidewater&header=scene']){
 const b=boot(html,search);assert.ifError(b.error);assert.equal(b.document.querySelectorAll('#native-ocean,#night-location').length,0);assert.equal(b.window.__nightOcean,undefined);
}
const reference=execFileSync('git',['show','d008588a:src/scene-data.js'],{encoding:'utf8',maxBuffer:20000000});
assert.equal(read('src/scene-data.js'),reference);assert(html.includes(reference),'Exact baseline source must be embedded, without shader rewriting');
assert(!html.includes("__mods['breaker-pass.js']"));assert(!html.includes('native-ocean'));
const camera=read('src/camera.js'),oldCamera=execFileSync('git',['show','d008588a:src/camera.js'],{encoding:'utf8'});
const pose=s=>s.slice(s.indexOf('function beachPose()'),s.indexOf('\nfunction ',s.indexOf('function beachPose()')+1));
assert.equal(pose(camera),pose(oldCamera),'Approved beachPose stays exact');
const results={water:'PASS — d008588a exact scene source and unpatched shipped bundle',camera:'PASS — exact approved beachPose; later approved gesture/story modules unchanged',startup:'PASS — reproduced rejected null append; repaired DOM startup passes',selectedDay:'PASS — actual Saturday click changes header, tiles, verdict, track and selected day together',live:'PASS — Now hides in live; no duplicate time chip; sheet time and return-to-live pass',scope:'Parsed DOM, source and behavior tests only. No rendered screenshot, pixel comparison, GPU or iPhone FPS verification.'};
fs.writeFileSync('night-report/rollback-checks.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));
