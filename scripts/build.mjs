import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
// User-required gate: input regressions block every build/delivery.
execFileSync(process.execPath,['scripts/check-interactions.cjs'],{stdio:'inherit'});
execFileSync(process.execPath,['ocean-proof/scripts/generate-forecast-fft.mjs'],{stdio:'inherit'});
execFileSync(process.execPath,['ocean-proof/scripts/generate-forecast-breakers.mjs'],{stdio:'inherit'});
execFileSync(process.execPath,['ocean-proof/scripts/generate-grid128.mjs'],{stdio:'inherit'});
execFileSync(process.execPath,['scripts/build-capture-vendor.mjs'],{stdio:'inherit'});
fs.mkdirSync('dist',{recursive:true});
const read=p=>fs.readFileSync('src/'+p,'utf8');
// Original scene source is retained for explicit unsupported/device failure
// fallback and old diagnostic routes. Successful native rendering never opens it.
let html=read('index.html').replace('/* DAYBUOY_CSS */',()=>read('reference-fonts.css')+'\n'+read('reference-host.css')+'\n@layer legacy{'+read('style.css')+'\n'+read('home.css')+'\n'+read('presentation.css')+'}\n'+read('reference.css')).replace('/* DAYBUOY_JS */',()=>read('scene-data.js')+'\n'+read('daybuoy.js').replace('/* DAYBUOY_SHEETS */',()=>read('sheets.js')).replace('/* DAYBUOY_SCENE_UI */',()=>read('scene-ui.js')+'\n'+read('reference-icons.js')+'\n'+read('home.js')+'\n'+read('presentation.js')).replace('/* DAYBUOY_CAMERA */',()=>read('camera.js')).replace('/* DAYBUOY_EXPLORE */',()=>read('explore.js')).replace('/* DAYBUOY_LIGHTING */',()=>read('lighting.js').replace('/* DAYBUOY_DAILY_HIGHS */',()=>fs.readFileSync('assets/forecast/daily-highs.json','utf8'))));
html=html.replace("const {createOcean}=__mods['ocean-engine.js'];",()=>read('native-host.js')+'\nconst createOcean=createSceneHost;');
// Missing precipitation is unavailable, not an invented dry forecast.
html=html.replace('rain:w.precip??((w.rainOnly??0)+(w.showers??0))','rain:w.precip??(Number.isFinite(w.rainOnly)&&Number.isFinite(w.showers)?w.rainOnly+w.showers:null)');
html=html.replace("(()=>{\n'use strict';",()=>read('weather-data.js').replace('/* WEATHER_MODEL */',read('weather-model.js').replaceAll('export ',''))+'\n'+read('marine-data.js').replace('/* MARINE_MODEL */',read('marine-model.js').replaceAll('export ',''))+"\n(()=>{\n'use strict';");
html=html.replace('/* DAYBUOY_CELESTIAL */',()=>read('celestial.js'));
// An alpha framebuffer lets the existing rain/path render as an overlay.
// The scene shaders and all geometry remain byte-for-byte original.
html=html.replace('new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:', 'new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:');
html=html.replace('/* DAYBUOY_OVERNIGHT */',()=>read('overnight.js')+'\n'+read('weather-effects.js')+'\n'+read('interaction.js')+'\n'+read('surf.js')+'\n'+read('story.js'));
html=html.replace('refresh();setInterval(refresh,15*MIN);requestAnimationFrame(frame);',()=>read('release.js')+'\n'+read('weather-glyphs.js')+'\n'+read('sky-scrubber.js')+'\n'+read('weather-scene.js')+'\n'+read('premium-ui.js')+'\n'+read('product-audit.js')+'\n'+read('fixture-bridge.js')+'\nrefresh();setInterval(refresh,15*MIN);requestAnimationFrame(frame);');
html=html.replace('</style>',()=>read('release.css')+'\n</style>');
html=html.replace('</style>',()=>read('sky-scrubber.css')+'\n</style>');
html=html.replace('</style>',()=>read('premium-ui.css')+'\n</style>');
html=html.replace('</style>',()=>read('ocean-layer.css')+'\n</style>');
html=html.replace('window.__ocean=window.__daybuoy;',()=> 'window.__ocean=window.__daybuoy;\n'+read('native-layer.js')+'\nif(!engine?.nativeScene){'+read('ocean-layer.js')+'\n}');
// Both share paths use the actual displayed ocean. No story/camera edits.
html=html.replace("src=$('#ocean'),scale=", "src=await displayedSceneCopy(),scale=");
html=html.replace("ctx.fillText(Math.round(conditions().temperature)+'°',56,260)","ctx.fillText(Number.isFinite(src.daybuoyCapture.conditions.temperature)?Math.round(src.daybuoyCapture.conditions.temperature)+'°':'—',56,260)");
html=html.replace("ctx.fillText($('#headline').getAttribute('aria-label')||$('#headline').textContent,62,330)","ctx.fillText(src.daybuoyCapture.headline,62,330)");
html=html.replace('ctx.fillText(`${weekday(state.time)} · ${clock(state.time)}','ctx.fillText(`${weekday(src.daybuoyCapture.time)} · ${clock(src.daybuoyCapture.time)}');
html=html.replace("try{uniforms.uResolution.value.set(1080,1080);engine.resize(1080,1080,1);engine.render(0);ctx.drawImage($('#ocean'),0,0,1080,1080);}finally{resize();engine.render(0);}","const scene=await displayedSceneCopy(),sceneScale=Math.max(1080/scene.width,1080/scene.height);ctx.drawImage(scene,(1080-scene.width*sceneScale)/2,(1080-scene.height*sceneScale)/2,scene.width*sceneScale,scene.height*sceneScale);");
fs.cpSync('assets','dist/assets',{recursive:true});
fs.cpSync('ui-reference','dist/ui-reference',{recursive:true});
fs.cpSync('ui-review','dist/ui-review',{recursive:true});
fs.writeFileSync('dist/index.html',html);
fs.copyFileSync('ocean-profile.html','dist/ocean-profile.html');
fs.copyFileSync('ocean-live.html','dist/ocean-live.html');
fs.copyFileSync('weather-fixtures.html','dist/weather-fixtures.html');
fs.mkdirSync('dist/src',{recursive:true});fs.copyFileSync('src/weather-model.js','dist/src/weather-model.js');fs.copyFileSync('src/marine-model.js','dist/src/marine-model.js');
fs.copyFileSync('ocean-overcast-profile.html','dist/ocean-overcast-profile.html');
execFileSync(process.execPath,['scripts/check-ocean-profile.mjs'],{stdio:'inherit'});
execFileSync(process.execPath,['scripts/check-ocean-round2.mjs'],{stdio:'inherit'});
execFileSync(process.execPath,['scripts/check-ocean-host-profile.mjs'],{stdio:'inherit'});
execFileSync(process.execPath,['scripts/check-native-scene.mjs'],{stdio:'inherit'});
execFileSync(process.execPath,['scripts/check-native-startup.mjs'],{stdio:'inherit'});
execFileSync(process.execPath,['scripts/check-loop-profile.mjs'],{stdio:'inherit'});
execFileSync(process.execPath,['scripts/check-pipeline.mjs'],{stdio:'inherit'});
execFileSync(process.execPath,['scripts/check-adaptive-resolution.mjs'],{stdio:'inherit'});
execFileSync(process.execPath,['scripts/check-live-ocean.mjs'],{stdio:'inherit'});
execFileSync(process.execPath,['scripts/check-capture-flow.mjs'],{stdio:'inherit'});
execFileSync(process.execPath,['scripts/check-results-upload.mjs'],{stdio:'inherit'});
execFileSync(process.execPath,['scripts/check-overcast.mjs'],{stdio:'inherit'});
execFileSync(process.execPath,['scripts/check-scene-polish.mjs'],{stdio:'inherit'});
execFileSync(process.execPath,['scripts/check-hitch-work.mjs'],{stdio:'inherit'});
execFileSync(process.execPath,['scripts/check-overcast-profile.mjs'],{stdio:'inherit'});
execFileSync(process.execPath,['scripts/check-overcast-runner.mjs'],{stdio:'inherit'});
execFileSync(process.execPath,['scripts/check-diagnostic-device.mjs'],{stdio:'inherit'});
execFileSync(process.execPath,['scripts/check-integration.mjs'],{stdio:'inherit'});
// The new exact reference supersedes the former header's visual assertions.
execFileSync(process.execPath,['scripts/check-reference.mjs'],{stdio:'inherit'});
execFileSync(process.execPath,['scripts/check-release.mjs'],{stdio:'inherit'});
execFileSync(process.execPath,['scripts/check-sky-scrubber.mjs'],{stdio:'inherit'});
execFileSync(process.execPath,['scripts/check-sky-orb.mjs'],{stdio:'inherit'});
execFileSync(process.execPath,['scripts/check-full-app-capture.mjs'],{stdio:'inherit'});
execFileSync(process.execPath,['scripts/check-weather-data.mjs'],{stdio:'inherit'});
execFileSync(process.execPath,['scripts/check-marine-waves.mjs'],{stdio:'inherit'});
execFileSync(process.execPath,['scripts/check-weather-gate.mjs'],{stdio:'inherit'});
execFileSync(process.execPath,['scripts/check-screenshot-visibility.mjs'],{stdio:'inherit'});
execFileSync(process.execPath,['scripts/check-night-storm.mjs'],{stdio:'inherit'});
execFileSync(process.execPath,['scripts/check-cloud-cache.mjs'],{stdio:'inherit'});
execFileSync(process.execPath,['scripts/check-weather-optics.mjs'],{stdio:'inherit'});
execFileSync(process.execPath,['scripts/check-product-audit.mjs'],{stdio:'inherit'});
execFileSync(process.execPath,['scripts/check-reference-preservation.mjs'],{stdio:'inherit'});
execFileSync(process.execPath,['scripts/check-celestial.cjs'],{stdio:'inherit'});
// The wave experiment is withdrawn. check-rollback requires the exact baseline
// bundle; the historical wave-only scope test no longer describes this build.
execFileSync(process.execPath,['scripts/check-ocean-layer.mjs'],{stdio:'inherit'});
console.log('Built exact reference UI with one native WebGPU scene. Approved camera retained; ported surroundings require phone review.');

execFileSync(process.execPath,['scripts/build.mjs'],{cwd:'ocean-proof',stdio:'inherit'});
fs.cpSync('ocean-proof/dist','dist/ocean-proof',{recursive:true});
execFileSync(process.execPath,['scripts/build-overcast-baseline.mjs'],{stdio:'inherit'});
for(const name of fs.readdirSync('ocean-proof/public'))fs.cpSync('ocean-proof/public/'+name,'dist/'+name,{recursive:true});
execFileSync(process.execPath,['scripts/check-night.mjs'],{stdio:'inherit'});
// Historical rollback regression remains available against its saved revision.
if(fs.existsSync('night-report'))fs.cpSync('night-report','dist/night-report',{recursive:true});
