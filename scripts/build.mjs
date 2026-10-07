import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
// User-required gate: input regressions block every build/delivery.
execFileSync(process.execPath,['scripts/check-interactions.cjs'],{stdio:'inherit'});
fs.mkdirSync('dist',{recursive:true});
const read=p=>fs.readFileSync('src/'+p,'utf8');
// Original scene is retained for sky/land and explicit unsupported fallback.
// The default preview composes the pinned Tidewater ocean over that scene.
let html=read('index.html').replace('/* DAYBUOY_CSS */',()=>read('reference-fonts.css')+'\n'+read('reference-host.css')+'\n@layer legacy{'+read('style.css')+'\n'+read('home.css')+'\n'+read('presentation.css')+'}\n'+read('reference.css')).replace('/* DAYBUOY_JS */',()=>read('scene-data.js')+'\n'+read('daybuoy.js').replace('/* DAYBUOY_SHEETS */',()=>read('sheets.js')).replace('/* DAYBUOY_SCENE_UI */',()=>read('scene-ui.js')+'\n'+read('reference-icons.js')+'\n'+read('home.js')+'\n'+read('presentation.js')).replace('/* DAYBUOY_CAMERA */',()=>read('camera.js')).replace('/* DAYBUOY_EXPLORE */',()=>read('explore.js')).replace('/* DAYBUOY_LIGHTING */',()=>read('lighting.js').replace('/* DAYBUOY_DAILY_HIGHS */',()=>fs.readFileSync('assets/forecast/daily-highs.json','utf8'))));
html=html.replace('/* DAYBUOY_CELESTIAL */',()=>read('celestial.js'));
// An alpha framebuffer lets the existing rain/path render as an overlay.
// The scene shaders and all geometry remain byte-for-byte original.
html=html.replace('new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:', 'new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:');
html=html.replace('/* DAYBUOY_OVERNIGHT */',()=>read('overnight.js')+'\n'+read('weather-effects.js')+'\n'+read('interaction.js')+'\n'+read('surf.js')+'\n'+read('story.js'));
html=html.replace('</style>',()=>read('ocean-layer.css')+'\n</style>');
html=html.replace('window.__ocean=window.__daybuoy;',()=> 'window.__ocean=window.__daybuoy;\n'+read('ocean-layer.js'));
// Both share paths use the actual displayed ocean. No story/camera edits.
html=html.replace("src=$('#ocean'),scale=", "src=engine.getSceneCanvas?.()||$('#ocean'),scale=");
html=html.replace("ctx.drawImage($('#ocean'),0,0,1080,1080)", "ctx.drawImage(engine.getSceneCanvas?.()||$('#ocean'),0,0,1080,1080)");
fs.cpSync('assets','dist/assets',{recursive:true});
fs.cpSync('ui-reference','dist/ui-reference',{recursive:true});
fs.cpSync('ui-review','dist/ui-review',{recursive:true});
fs.writeFileSync('dist/index.html',html);
// The new exact reference supersedes the former header's visual assertions.
execFileSync(process.execPath,['scripts/check-reference.mjs'],{stdio:'inherit'});
execFileSync(process.execPath,['scripts/check-reference-preservation.mjs'],{stdio:'inherit'});
execFileSync(process.execPath,['scripts/check-celestial.cjs'],{stdio:'inherit'});
// The wave experiment is withdrawn. check-rollback requires the exact baseline
// bundle; the historical wave-only scope test no longer describes this build.
execFileSync(process.execPath,['scripts/check-ocean-layer.mjs'],{stdio:'inherit'});
console.log('Built exact reference UI with native Tidewater ocean layer. Camera and surroundings retained.');

execFileSync(process.execPath,['scripts/build.mjs'],{cwd:'ocean-proof',stdio:'inherit'});
fs.cpSync('ocean-proof/dist','dist/ocean-proof',{recursive:true});
for(const name of fs.readdirSync('ocean-proof/public'))fs.cpSync('ocean-proof/public/'+name,'dist/'+name,{recursive:true});
execFileSync(process.execPath,['scripts/check-night.mjs'],{stdio:'inherit'});
// Historical rollback regression remains available against its saved revision.
if(fs.existsSync('night-report'))fs.cpSync('night-report','dist/night-report',{recursive:true});
