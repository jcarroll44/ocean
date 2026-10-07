// Reuse the existing behavioral harness, then exercise the new composition.
const fs=require('fs');
const harness=fs.readFileSync('scripts/check-presentation.cjs','utf8');
new Function('require',harness+`
Node.prototype.prepend=function(n){nodes.set('#'+n.id,n);};
c.q=new URLSearchParams('?header=verdict');c.parent={};c.location={origin:'https://test'};
c.document.querySelectorAll=()=>[$('.metric strong'),$('.metric .meaning'),$('#days button small')];
state.sheet=null;available=true;state.live=true;state.data.source='live';conditions.uv=1;
run(read('src/night-presentation.js'));
assert.equal($('#app').dataset.header,'verdict');assert.equal($('#night-location').textContent,'Inlet Beach');assert.equal($('#night-location').dataset.live,'true');assert.equal($('#back-to-now').hidden,true);
state.live=false;run('renderPresentation()');assert.equal($('#back-to-now').textContent,'Back to now');assert.equal($('#back-to-now').hidden,false);assert.match($('#night-location').textContent,/Sat/);assert.equal($('#night-location').dataset.live,'false');
conditions.weatherCode=95;run('renderPresentation()');assert.equal($('.action-main').textContent,'Thunderstorms. Head indoors.');assert.equal($('#moment-action').dataset.action,'air');
available=false;run('renderPresentation()');assert.equal($('#hero-temp').textContent,'—');assert.equal($('.metric strong').textContent,'—');assert.equal($('#moment-action').dataset.action,'retry');
const nightCSS=postcss.parse(read('src/night.css'));assert(nightCSS.nodes.length>35);assert.match(read('src/night.css'),/height:min\\(216px,26dvh\\)/);assert.match(read('src/night.css'),/grid-template-areas:"temp location" "temp answer"/);assert.match(read('src/night.css'),/font-size:64px/);
console.log('PASS: branch header live/selected states, useful hazard action, absent-data numbers hidden, A/B layout source and dock height cap. No rendered claim.');
`)(require);
