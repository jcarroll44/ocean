import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';import {parseHTML} from 'linkedom';
import {scrubDayData,fixtureData} from '../ocean-proof/proof/weather-fixtures.js';
const H=3600000,now=Date.parse('2026-10-26T17:00:00Z'),dom=parseHTML(fs.readFileSync('dist/index.html','utf8')),{document}=dom,$=s=>document.querySelector(s);
class TestDate extends Date{constructor(...a){super(...(a.length?a:[now]));}static now(){return now;}}
const animations=[],haptics=[];let tick=10000;
dom.HTMLElement.prototype.animate=function(){animations.push({stat:this.matches('#metrics .db-stat b'),text:this.textContent});return{cancel(){}};};dom.HTMLElement.prototype.getBoundingClientRect=()=>({left:20,right:370,top:60,bottom:250,width:350,height:190});
const c={document,window:{addEventListener(){},dispatchEvent(){},webkit:{messageHandlers:{daybuoyHaptic:{postMessage:m=>haptics.push(m)}}}},Event:dom.Event,CustomEvent:dom.CustomEvent,navigator:{onLine:true},console:{warn(){},log(){},error(){}},URL,URLSearchParams,TextDecoder,Date:TestDate,location:{search:'',origin:'https://test'},matchMedia:()=>({matches:false}),localStorage:{getItem:k=>k==='daybuoy.welcomed'?'1':null,setItem(){}},innerWidth:390,innerHeight:844,devicePixelRatio:3,performance:{now:()=>tick},setInterval(){},setTimeout(){},clearTimeout(){},requestAnimationFrame(){},addEventListener(){},AbortSignal,fetch:()=>new Promise(()=>{})};
let code=$('script').textContent.replace(/\n\}\)\(\);\s*$/,`\nwindow.scrubTest={skyCharm,scrubDayModel,hapticTime,moonPhase,sunDay,weatherScenePacket,clearHaptics(){scrubLastTime=null;scrubHapticAt=-Infinity;}};\n})();`);
vm.createContext(c);vm.runInContext(code,c);const app=c.window.__daybuoy,bridge=c.window.__daybuoyFixture,test=c.window.scrubTest,s=app.state;
bridge.apply(scrubDayData(now));const b=bridge.beginScrub();assert.equal(b.end-b.start,24*H);
let seen=new Set();
for(let h=0;h<=23;h+=.1){bridge.scrubTo(b.start+h*H);tick+=100;app.renderUI();const charm=$('.sky-charm');seen.add(charm.dataset.sky);assert.equal($('.sky-time-label').hidden,false);assert.equal(Number(s.time),Number($('#week-scrubber').getAttribute('aria-valuenow')));assert.equal(charm.dataset.sky,test.skyCharm(app.conditions(),s.time).kind);assert.equal(test.weatherScenePacket(app.conditions()).forecastTime,s.time);assert.equal(test.weatherScenePacket(app.conditions()).scrubbing,true);}
assert(seen.has('sun')&&seen.has('moon')&&seen.has('rain')&&seen.has('lightning')&&seen.has('partly-cloudy'));
assert.equal($('.sky-tide-mark.high')!==null,true);assert.equal($('.sky-tide-mark.low')!==null,true);assert.match($('.db-line').style.background,/#243b59/);assert.match($('.db-line').style.background,/#e5b979/);assert.match($('.sky-rain-track').getAttribute('style'),/rgba\(55,138,197/);
assert(animations.some(n=>n.stat),'Actual current stat nodes roll, not phantom values');
const moon=test.skyCharm({...app.conditions(),rain:0,cloud:0,weatherCode:0,thunder:0},b.start);assert.equal(moon.fraction,test.moonPhase(b.start).fraction);assert.equal(moon.svg,undefined,'Orb must use native sky pixels, not icons');assert($('.sky-charm canvas'),'Live sky canvas exists');assert($('.sky-charm').classList.contains('is-dragging'));assert.match($('.sky-time-label').textContent,/^[A-Z][a-z]{2} /);assert.equal(typeof c.window.__daybuoySkyOrb,'function');
const model=test.scrubDayModel();
for(const moment of model.moments){test.clearHaptics();haptics.length=0;test.hapticTime(moment.time-1000);tick+=200;test.hapticTime(moment.time+1000);assert.equal(haptics.at(-1)?.kind,'moment',moment.kind);}
test.clearHaptics();haptics.length=0;test.hapticTime(b.start+H-1000);tick+=200;test.hapticTime(b.start+H+1000);assert.equal(haptics.at(-1).kind,'hour');
test.clearHaptics();haptics.length=0;test.hapticTime(b.start+H);test.hapticTime(b.start+2*H);test.hapticTime(b.start+3*H);assert(haptics.length<=1,'Bound fast scrub haptics');
bridge.endScrub();app.renderUI();assert.equal($('.sky-time-label').hidden,true);assert.equal(s.scrubbing,false);
s.data.tideEvents=[];s.version++;app.renderUI();assert.equal(document.querySelectorAll('.sky-tide-mark').length,0,'No invented missing tides');
bridge.apply(fixtureData('clear',now));s.data.source='sample';s.fixture=false;s.version++;app.renderUI();assert.equal($('.sky-track-extras').hidden,true,'Unavailable forecast has no synthetic rain/tide decoration');
assert.equal(fs.readFileSync('src/sky-scrubber.js','utf8').includes('pointerdown'),false,'No gesture ownership changes');
assert.match(fs.readFileSync('src/sky-scrubber.css','utf8'),/left:var\(--selected\)!important/,'Knob follows the existing per-frame selected-time coordinate');
console.log('PASS: real-app synthetic day scrub, sky charms/true moon, time label, light/rain/tide track, bounded hour/moment haptics, rolling current stats, no missing-data decoration. Node DOM only, no pixels/haptic device claim.');
