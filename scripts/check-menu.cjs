// Static CSS cascade and real sheet markup checks. No browser or render claim.
const fs=require('fs'),vm=require('vm'),assert=require('assert'),postcss=require('postcss');
const read=p=>fs.readFileSync(p,'utf8');
const css=postcss.parse(['src/style.css','src/home.css','src/presentation.css'].map(read).join('\n'));
const node=(id,classes=[],attrs={},parent=null)=>({id,classes,attrs,parent});
function compound(s,n){
 if(/::|:(before|after|focus|active|hover)/.test(s))return false;
 let rejected=false;s=s.replace(/:not\(([^)]+)\)/g,(_,inside)=>{if(compound(inside,n))rejected=true;return '';});if(rejected)return false;
 for(const m of s.matchAll(/#([\w-]+)/g))if(n.id!==m[1])return false;
 for(const m of s.matchAll(/\.([\w-]+)/g))if(!n.classes.includes(m[1]))return false;
 for(const m of s.matchAll(/\[([\w-]+)(?:=['"]?([^\]'"\s]+)['"]?)?\]/g))if(!(m[1] in n.attrs)||(m[2]!==undefined&&n.attrs[m[1]]!==m[2]))return false;
 return true;
}
function matches(s,n){const parts=s.trim().split(/\s+/);let current=n;if(!compound(parts.pop(),current))return false;while(parts.length){const p=parts.pop();current=current.parent;while(current&&!compound(p,current))current=current.parent;if(!current)return false;}return true;}
function specificity(s){s=s.replace(/:not\(([^)]+)\)/g,'$1');return [(s.match(/#[\w-]+/g)||[]).length,(s.match(/\.[\w-]+|\[[^\]]+\]/g)||[]).length,0];}
function media(rule,w,h){for(let p=rule.parent;p;p=p.parent)if(p.type==='atrule'&&p.name==='media'){if(p.params.includes('prefers-reduced-motion'))return false;for(const m of p.params.matchAll(/(min|max)-(width|height):\s*(\d+)px/g)){const v=m[2]==='width'?w:h;if(m[1]==='min'?v<+m[3]:v>+m[3])return false;}}return true;}
function computed(n,w=390,h=844){const out={},wins={};let order=0;css.walkRules(r=>{order++;if(!media(r,w,h))return;for(const s of r.selector.split(',')){if(!matches(s,n))continue;const rank=specificity(s);r.walkDecls(d=>{const weight=[d.important?1:0,...rank,order],before=wins[d.prop];if(!before||weight.some((x,i)=>x>before[i]&&weight.slice(0,i).every((a,j)=>a===before[j]))){wins[d.prop]=weight;out[d.prop]=d.value;}});}});return out;}
const app=node('app'),dock=node('glass-dock',['glass','dock'],{},app),hero=node('hero',['hero'],{},app),timeSwitch=node('time-switch',[],{},app),watch=node(null,['watch-controls'],{},timeSwitch),sheet=node('expanded-sheet',['glass','expanded-sheet'],{},app);
assert.equal(computed(dock).height,'218px');assert.equal(computed(dock)['grid-template-rows'],'60px 36px 24px 44px');assert.match(computed(dock).background,/#f6fbfb/g);assert.equal(computed(hero).display,'grid');
app.attrs={'data-playing':'','data-story':'true'};assert.equal(computed(watch).top,'auto');assert.equal(computed(watch).bottom,'auto');assert.equal(computed(watch).position,'static');assert.equal(computed(watch,963,720).left,'auto');assert.equal(computed(watch,963,720).transform,'none');
for(const k of ['water','wind','waves','sun']){app.attrs={'data-sheet':k,'data-night':'true'};const s=computed(sheet);assert.equal(s.height,'auto',k+' must fit contents, not old fixed height');assert.equal(s.padding,'24px 16px 12px');assert.match(s.background,/#f6fbfb/g);assert.equal(computed(hero).display,'none');}
sheet.classes.push('peek');assert.equal(computed(sheet).height,'170px');sheet.classes.pop();app.attrs={'data-dock-compact':'true'};assert.equal(computed(dock).height,'92px');
// Execute the actual Water/Waves/Wind sheet renderer with controlled values.
const elements=new Map(),$=s=>elements.get(s)||elements.set(s,{innerHTML:'',focus(){}}).get(s);let risk='High';
const c={console,$,state:{sheet:'water',time:0,data:{last:1e15},prefs:{skin:3}},document:{activeElement:null},drag:null,review:false,MIN:60000,HOUR:3600000,Number,Math,conditions:()=>({sst:28.89,swell:1.5,wind:7,period:5,direction:200,windDirection:10,gust:12}),sunPosition:()=>({altitude:20}),cToF:v=>v*1.8+32,compass:()=>'S',ripRiskAt:()=>risk?{risk}:null,waterVerdict:()=>risk?'High rip risk · stay out of the water':'Check posted beach flags',SURF_URL:'https://forecast.weather.gov/',clock:()=>'11:22 AM'};
vm.createContext(c);vm.runInContext(read('src/sheets.js'),c);vm.runInContext("chart=k=>'<div class=\"chart-wrap\" data-chart=\"'+k+'\"></div>'",c);
vm.runInContext('renderSheet()',c);let html=$('#sheet-content').innerHTML;assert.match(html,/84°/);assert.equal((html.match(/class="reading"/g)||[]).length,3);assert(!html.includes('class="sheet-value"'));assert(!html.includes('rip-row'));assert.equal((html.match(/chart-wrap/g)||[]).length,1);assert.match(html,/data-water-detail="waves"/);assert.match(html,/data-water-detail="wind"/);assert.match(html,/NWS ↗/);
risk=null;vm.runInContext('renderSheet()',c);assert(!$('#sheet-content').innerHTML.includes('NWS ↗'));
for(const k of ['waves','wind']){c.state.sheet=k;vm.runInContext('renderSheet()',c);assert.equal(($('#sheet-content').innerHTML.match(/class="reading"/g)||[]).length,3);}
// Explicit camera/story preservation gate for this UI-only redesign.
const {execFileSync}=require('child_process');for(const file of ['src/camera.js','src/interaction.js','src/story.js','src/scene-data.js','src/lighting.js','src/weather-effects.js'])assert.equal(read(file),execFileSync('git',['show','cf23f514100647c3664a36c0b6c84caef429022c:'+file],{encoding:'utf8',maxBuffer:16*1024*1024}),file+' changed');
const clock=node('clock-digits',[],{},node('hero-clock',[],{},hero)),temperature=node('hero-temp',[],{},hero);
app.attrs={};assert.equal(computed(clock)['font-size'],'62px');assert.equal(computed(temperature)['font-size'],'34px');assert.equal(computed(timeSwitch).height,'42px');app.attrs={'data-scrubbing':'true'};assert.equal(computed(clock)['font-size'],'46px');
console.log('PASS: time-led header, light sea-glass panels, CSS cascade in home/story/compact/sheets at phone + desktop sizes; compact 3-reading Water; one tide chart; missing NWS stays hidden; approved camera/story/scene byte-identical. Static checks, not browser screenshots.');
