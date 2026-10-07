// Real presentation functions with controlled DOM/forecast fixtures.
// This checks state/copy, not rendered geometry or a physical iPhone.
const fs=require('fs'),vm=require('vm'),assert=require('assert'),postcss=require('postcss');
const read=p=>fs.readFileSync(p,'utf8'),nodes=new Map();
class Node{
 constructor(){this.dataset={};this.attrs={};this.style={setProperty(){}};this.hidden=false;this.textContent='';this.innerHTML='';}
 setAttribute(k,v){this.attrs[k]=v;} append(n){nodes.set('#'+n.id,n);} querySelector(s){return $(s);} insertAdjacentHTML(pos,s){this.innerHTML+=s;} addEventListener(){}
}
const $=s=>nodes.get(s)||nodes.set(s,new Node()).get(s),H=3600000,base=Date.parse('2026-10-10T00:00:00-05:00');
let available=true,conditions={temperature:80,sst:28,swell:1,period:8,wind:6,windDirection:210,cloud:20,rain:0,rainProbability:5,weatherCode:0},risk=null,elevation=20;
const state={time:base+8*H,live:false,data:{source:'live',retrievedAt:base,rows:[]},prefs:{skin:3},cameraYaw:0};
const c={console,document:{createElement:()=>new Node(),addEventListener(){}},window:{addEventListener(){}},navigator:{onLine:true},$,state,HOUR:H,MIN:60000,RAD:Math.PI/180,FT:3.28084,SITE:{facing:201,zone:'America/Chicago'},conditions:()=>conditions,realForecast:()=>available,sunDay:()=>({sunrise:base+7*H,sunset:base+18*H,solarNoon:base+12*H}),sunPosition:()=>({altitude:elevation}),forecastUV:()=>conditions.uv??1,ripRiskAt:()=>risk&&({risk}),sunsetFor:()=>({score:{score:8}}),burnMinutes:()=>22,burnThreshold:()=>350,stormWindow:()=>'5 PM–midnight',clock:t=>new Date(t-5*H).toISOString().slice(11,16),weekday:()=>'Sat',moonPhase:()=>({fraction:.23}),nightInfo:()=>({fraction:.23,moon:{altitude:-10},rise:base+27*H,description:'Below the horizon'}),isStorm:c=>c.weatherCode>=95||c.rain>=1,compass:()=>'SW',cToF:t=>t*1.8+32,clamp:(v,a,b)=>Math.max(a,Math.min(b,v)),refresh:async()=>{},forecastRuns:()=>[],timeRange:()=>'6–8 AM'};
c.initHome=()=>{};c.initWeekScrubber=()=>{}; // This unit harness pre-creates its controls; check-rollback runs real DOM startup.
vm.createContext(c);vm.runInContext(read('src/presentation.js'),c);const run=s=>vm.runInContext(s,c);
// Selected clock persists across release; day names are never overwritten.
run('renderPresentation()');assert.equal($('#clock-digits').textContent,'8:00');assert.equal($('#clock-period').textContent,'AM');assert.equal($('#clock-day').textContent,'Saturday');assert.equal($('#back-to-now').hidden,false);assert.equal($('#back-to-now').attrs['aria-pressed'],'false');assert.equal($('#source-label').textContent,'Sat · 08:00');state.scrubbing=true;run('renderPresentation()');assert.equal($('#scrub-time').hidden,false);state.scrubbing=false;run('renderPresentation()');assert.equal($('#scrub-time').hidden,true);assert.equal($('#source-label').textContent,'Sat · 08:00');assert(!read('src/overnight.js').includes('b.firstChild.textContent=smallClock'));
// Live/saved/offline use distinct honesty states.
state.live=true;run('renderPresentation()');assert.equal($('#source-label').hidden,true);assert.equal($('#back-to-now').attrs['aria-pressed'],'true');assert.equal($('#source-label').dataset.live,'true');c.navigator.onLine=false;run('renderPresentation()');assert.equal($('#source-label').dataset.live,'false');assert.match($('#forecast-status').textContent,/Offline/);c.navigator.onLine=true;state.data.source='saved';run('renderPresentation()');assert.equal($('#source-label').dataset.live,'false');assert.match($('#forecast-status').textContent,/Forecast saved/);state.data.source='live';
// Dawn/noon/sunset/night use actual condition-dependent answers and routes.
state.live=false;for(const [hour,alt] of [[7,0],[12,60],[18,0],[22,-20]]){state.time=base+hour*H;elevation=alt;run('renderPresentation()');assert($('#headline').textContent);assert($('#moment-action').attrs['aria-label']);}
assert.equal($('#moment-action').dataset.action,'sun');assert.match($('.action-copy').innerHTML,/Moonrise/);
state.time=base+12*H;elevation=60;conditions.uv=8;run('renderPresentation()');assert.match($('.action-copy').innerHTML,/22 min est\./);assert.equal($('#moment-action').dataset.action,'sun');
risk='High';run('renderPresentation()');assert.equal($('#moment-action').dataset.action,'water');assert.equal($('#moment-action').dataset.hazard,'true');assert.match($('#headline').textContent,/Stay ashore/);conditions.weatherCode=95;run('renderPresentation()');assert.equal($('#moment-action').dataset.action,'air');assert.match($('#headline').textContent,/Head indoors/);risk=null;conditions.weatherCode=0;
// Playback progress has its own surface; the action remains a forecast answer.
state.story=true;state.playProgress=.4;$('#headline').textContent='Peak UV 8';run('renderPresentation()');assert.equal($('#headline').textContent,'Peak UV 8');assert.equal($('#story-progress').hidden,false);assert.equal($('#story-progress').attrs['aria-valuenow'],'40');assert(!/Tap anywhere|of 6|Moving through|Paused/.test($('.action-copy').innerHTML));state.story=false;
// No-data never exposes synthetic temperatures in compact line or details.
available=false;state.sheet='water';run('renderPresentation()');assert.equal($('#moment-action').dataset.action,'retry');assert.equal($('#compact-values').textContent,'Forecast not available');assert.match($('#sheet-content').innerHTML,/retry-forecast/);
assert.match(run("forecastMethod('sun')"),/not been clinically validated/);assert.match(run("forecastMethod('sun')"),/unvalidated 0–10/);assert.match(run("sheetPeekAnswer('waves')"),/1.0 ft/);
// Parse all emitted CSS and JavaScript; verify retained surfaces byte-for-byte.
const css=postcss.parse(read('src/presentation.css'));assert(css.nodes.length>100);
new vm.Script(read('dist/index.html').match(/<script>([\s\S]*)<\/script>/)[1]);
console.log('PASS: selected day/time, dawn/noon/sunset/night copy, hazard routing, live/saved/offline/no-data, estimate disclosure, story progress, CSS and bundle syntax. Mock DOM; no rendered QA.');
