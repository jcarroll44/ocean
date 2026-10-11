import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
import {build,transform} from 'esbuild';
import {parse} from '../native/node_modules/acorn/dist/acorn.mjs';
const root=process.cwd(),out=path.resolve('production/dist');
fs.mkdirSync(out,{recursive:true});
const read=p=>fs.readFileSync(p,'utf8'),write=(p,s)=>{fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,s);};
const replace=(s,a,b)=>{assert(s.includes(a),'Production hook missing: '+a.slice(0,100));return s.replace(a,b);};
function appRuntime(s){
 const ast=parse(s,{ecmaVersion:'latest',sourceType:'module'}),c=ast.body.find(n=>n.type==='ExportNamedDeclaration'&&n.declaration?.id?.name==='App').declaration;
 const keep=new Set(['constructor','precompile','updateSun','applyAtmosphereReadback','frame','_frame','setRenderScale']);
 const methods=c.body.body.filter(n=>keep.has(n.key.name)).map(n=>s.slice(n.start,n.end));
 let body=methods.join('\n');
 body=body.replace(/this\.updateFPS\( dt \);/,'').replace(/this\.profiler\.update\( dt \);/,'').replace(/this\.updateAudio\( dt \);/,'').replace(/if \( this\.ui \) this\.ui\.update\( dt \);/,'');
 body=body.replace(/if \( this\.input\.hit\( 'KeyF' \) \)[\s\S]*?(?=this\.boatCtl\.update)/,'');
 body=body.replace('new URLSearchParams( location.search )','new URLSearchParams()');
 return `import {Vector3,Color,MathUtils} from './engine/index.js';import {GPU} from './engine/gpu/GPU.js';import {FrameUniforms} from './engine/render/Frame.js';import {G} from './core/Globals.js';import {DEPTH_FORMAT} from './engine/render/SceneRenderer.js';import {SUN_ILLUMINANCE} from './sky/Atmosphere.js';import {sunDirectionFromTime} from './sky/Sky.js';import {LENS_REACH} from './post/Underwater.js';import {updateCameraVelocity} from './post/CameraVelocity.js';const _up=new Vector3(0,1,0);export class App{${body}}`;
}
function beachRuntime(s){
 s=replace(s,"this.profileConfig=profileConfig(location.search)","this.profileConfig=null");
 s=replace(s,"this.initialQuality=this.profileConfig?{mode:'manual',level:0}:initialQuality()","this.initialQuality={mode:'manual',level:0}");
 s=replace(s,"this.clouds=this.qs.has('noClouds')?null:new SkyProClouds(engine,this.atmosphere)","this.clouds=null");
 const ast=parse(s,{ecmaVersion:'latest',sourceType:'module'}),cuts=[];
 function walk(n){if(!n||typeof n!=='object')return;
  if(n.type==='ImportDeclaration'&&(n.source.value.includes('profile.js')||n.source.value.includes('SkyProClouds')||n.source.value.includes('landward.js'))){cuts.push([n.start,n.end]);return;}
  if(n.type==='IfStatement'&&(/this\.profileConfig/.test(s.slice(n.test.start,n.test.end))||s.slice(n.test.start,n.test.end).includes("this.qs.get('land')")||s.slice(n.test.start,n.test.end)==='view')){cuts.push([n.start,n.end]);return;}
  if(n.type==='ExpressionStatement'&&s.slice(n.start,n.end).startsWith('installShaderAblation(')){cuts.push([n.start,n.end]);return;}
  for(const [k,v]of Object.entries(n)){if(k==='start'||k==='end')continue;if(Array.isArray(v))v.forEach(walk);else walk(v);}
 }walk(ast);for(const [a,b]of cuts.sort((a,b)=>b[0]-a[0]))s=s.slice(0,a)+s.slice(b);
 s=replace(s,'breakersForProfile(BreakerSystem,this.profileConfig)','BreakerSystem');s=s.replace('window.__app=this;','');
 // Startup seed is not exposed as a testing control. Live forecast replaces it before display.
 s=s.replaceAll('setTestHeight','initializeWater').replace('this.testHeight=feet;','');
 return s;
}
const plugin={name:'production-only',setup(b){b.onLoad({filter:/\/vendor\/tidewater\/src\/App\.js$/},args=>({contents:appRuntime(read(args.path)),loader:'js',resolveDir:path.dirname(args.path)}));b.onLoad({filter:/\/proof\/BeachApp\.js$/},args=>({contents:beachRuntime(read(args.path)),loader:'js',resolveDir:path.dirname(args.path)}));}};
const opts={bundle:true,minify:true,sourcemap:false,legalComments:'none',target:'safari17',format:'esm',plugins:[plugin],metafile:true};
const scene=await build({...opts,entryPoints:['production/native-scene.js'],outfile:out+'/assets/scene.js'});
const shore=await build({...opts,entryPoints:['ocean-proof/proof/shore-worker.js'],outfile:out+'/assets/shore.js'});
for(const p of Object.keys(scene.metafile.inputs))assert(!/\/(?:profile|native-capture|hitch-trace|results-upload|grid128|DebugViews|Profiler|Game|Input)\b/.test(p),'Diagnostic dependency shipped: '+p);
let html=read('dist/index.html');
html=replace(html,read('src/native-layer.js'),read('production/native-layer.js'));
html=replace(html,read('src/fixture-bridge.js'),'');
html=replace(html,read('src/ocean-layer.js'),'');
html=html.replace(/<script>([\s\S]*?)<\/script>/g,(_,s)=>{
 s=s.replace("const q=new URLSearchParams(location.search),review=q.get('review')==='1';","const q=new URLSearchParams([...new URLSearchParams(location.search)].filter(([k])=>['hour','t','sheet'].includes(k))),review=false;");
 s=s.replace(/new URLSearchParams\(location.search\)/g,'new URLSearchParams()');
 s=s.replace("[...new URLSearchParams()].filter", "[...new URLSearchParams(location.search)].filter");
 s=s.replace("review=q.get('review')==='1'","review=false").replace("debug:q.get('debug')==='1'","debug:false");
 s=s.replace(/function reviewData\(\)\{[\s\S]*?(?=\nfunction adopt\()/,'');
 s=s.replace(/if\(data.source==='review'\)\{[^\n]+\n/,'');
 s=s.replace('adopt(review?reviewData():savedForecast()||finalize(sampleForecast(Date.now())))','adopt(savedForecast()||finalize(sampleForecast(Date.now())))');
 s=s.replace(/let compassHold;[^\n]+\n/,'').replace(/addEventListener\('keydown',e=>\{if\(e.key.toLowerCase\(\)==='d'[\s\S]*?\}\);\n/,'');
 // Retain only the scene's internal parent/iframe bridge, not testing APIs.
 s=s.replace(/window\.__daybuoy=\{[\s\S]*?;window\.__ocean=window\.__daybuoy;/,'window.__daybuoy={state,engine,uniforms,conditions};');
 s=s.replace(/window\.__surf=\{[^\n]+\n/,'');
 s=s.replace('if(!navigator.gpu||oldProfile)','if(!navigator.gpu)');
 s=s.replace(/ const oldProfile=[^\n]+\n/,'');
 write('production/.app-input.js',s);return '<script src="/assets/app.js" defer></script>';
});
const app=await build({entryPoints:['production/.app-input.js'],outfile:out+'/assets/app.js',minify:true,sourcemap:false,legalComments:'none',target:'safari17',format:'iife'});
let css='';html=html.replace(/<style>([\s\S]*?)<\/style>/g,(_,s)=>{css+=s;return '';});css=css.replaceAll('ui-reference/fonts/','/fonts/');
write(out+'/assets/app.css',(await transform(css,{loader:'css',minify:true})).code);
html=html.replace('</head>','<link rel="stylesheet" href="/assets/app.css"><link rel="icon" href="/icon.svg"><link rel="apple-touch-icon" href="/icon-180.png"></head>');
html=html.replace(/<!--[^]*?-->/g,'').replace(/>\s+</g,'><');
// Legal links are added to an existing details section, not across the approved scene.
const js=read(out+'/assets/app.js');
write(out+'/assets/app.js',js+'\n'+(await transform(`document.addEventListener('click',()=>{setTimeout(()=>{for(const section of document.querySelectorAll('#sheet-content')){if(!section.querySelector('[data-legal]')){const p=document.createElement('p');p.dataset.legal='1';p.innerHTML='<a href="/privacy.html" target="_blank" rel="noopener">Privacy</a> · <a href="/credits.html" target="_blank" rel="noopener">Open-source credits</a>';section.append(p);}}},0);});`,{minify:true})).code);
write(out+'/index.html',html);
write(out+'/scene.html',read('ocean-proof/proof/native-scene.html').replace('src="native-scene.js"','src="/assets/scene.js"').replaceAll('\n',''));
fs.cpSync('ui-reference/fonts',out+'/fonts',{recursive:true});
fs.copyFileSync('native/assets/icon.svg',out+'/icon.svg');
const mit=read('ocean-proof/vendor/tidewater/LICENSE');
const ofl=read('src/NOTICE.txt');
const licenses=[['Tidewater',mit],['Three.js r170',mit.replace('Copyright (c) 2026 DRG Software Solutions LLC','Copyright 2010-2024 Three.js Authors')],['Capacitor (iPhone wrapper)',read('native/node_modules/@capacitor/core/LICENSE')],['Poppins',ofl.replace('Bundled Nunito font license','Bundled Poppins font license').replace('Copyright 2014 The Nunito Project Authors (https://github.com/googlefonts/nunito)','Copyright 2020 The Poppins Project Authors (https://github.com/itfoundry/Poppins)')],['Nunito (fallback)',ofl]];
const escaped=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
licenses.push(['Capgo updater (native app)',read('native/node_modules/@capgo/capacitor-updater/LICENSE')],['Sentry Capacitor (native app)',read('native/node_modules/@sentry/capacitor/LICENSE')]);
for(const name of ['share','filesystem'])licenses.push(['Capacitor '+name+' (native app)',read('native/node_modules/@capacitor/'+name+'/LICENSE')]);
const credits=read('production/credits.html').replace('<!-- LICENSES -->',licenses.map(([title,text])=>'<h2>'+title+'</h2><pre>'+escaped(text)+'</pre>').join(''));
for(const file of ['privacy.html','credits.html']){const content=file==='credits.html'?credits:read('production/'+file);write(out+'/'+file,content);write('native/www/'+file,content);}
write(out+'/404.html','<!doctype html><title>DayBuoy · Not found</title><p>This page is not available.</p><a href="/">Open DayBuoy</a>');
write(out+'/robots.txt','User-agent: *\nAllow: /\n');
write('production/build-manifest.json',JSON.stringify({baseline:'0f6ff5b83dad580a9ea6c2272bb79aa67d556ce4',inputs:Object.keys(scene.metafile.inputs),workerInputs:Object.keys(shore.metafile.inputs),sourceMaps:false,minified:true},null,2));
console.log('Production built: minified app + scene + shore worker; no diagnostic routes or upload server.');
