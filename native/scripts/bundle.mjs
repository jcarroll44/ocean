import fs from 'node:fs';import path from 'node:path';import {execFileSync} from 'node:child_process';import {fileURLToPath} from 'node:url';import {build} from '../../node_modules/esbuild/lib/main.js';
const native=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),repo=path.dirname(native);
const localFile=path.join(native,'release.local.json');
const settings=fs.existsSync(localFile)?JSON.parse(fs.readFileSync(localFile,'utf8')):{};
if(settings.sentryDsn&&!/^https:\/\/[a-zA-Z0-9]+@[a-zA-Z0-9.-]+\/[0-9]+$/.test(settings.sentryDsn))throw Error('Use the Sentry client DSN, not an auth token.');
if(settings.channel&&!['beta','production'].includes(settings.channel))throw Error('Release channel must be beta or production');
const configFile=path.join(native,'capacitor.config.json'),config=JSON.parse(fs.readFileSync(configFile,'utf8'));
delete config.server.url;
delete config.plugins.CapacitorUpdater;
if(settings.revenueCatPublicKey&&!/^appl_[A-Za-z0-9]+$/.test(settings.revenueCatPublicKey))throw Error('Expected RevenueCat Apple public SDK key only');
const apiBaseURL=settings.apiBaseURL||'https://daybuoy-night-pass.jacobcarroll51.chatgpt.site';
const api=new URL(apiBaseURL);if(api.protocol!=='https:'||api.username||api.password||api.search)throw Error('Expected a plain HTTPS API origin');
// Generated config carries public configuration only; never a service token.
fs.writeFileSync(configFile,JSON.stringify(config,null,2)+'\n');
const www=path.join(native,'www');
for(const item of fs.readdirSync(path.join(repo,'production/dist')))fs.cpSync(path.join(repo,'production/dist',item),path.join(www,item),{recursive:true});
const sha=execFileSync('git',['rev-parse','--short=12','HEAD'],{cwd:repo,encoding:'utf8'}).trim();
await build({entryPoints:[path.join(native,'src/runtime.js')],outfile:path.join(www,'assets/native.js'),bundle:true,minify:true,sourcemap:false,legalComments:'none',target:'safari26',format:'iife',define:{__DAYBUOY_NATIVE_CONFIG__:JSON.stringify({sentryDsn:settings.sentryDsn||'',channel:settings.channel||'beta',release:'daybuoy@1.0+'+sha,revenueCatPublicKey:settings.revenueCatPublicKey||'',apiBaseURL:api.origin})}});
const index=path.join(www,'index.html');let html=fs.readFileSync(index,'utf8');
html=html.replace('<script src="/assets/app.js" defer></script>','<script src="/assets/native.js" defer></script><script src="/assets/app.js" defer></script>');fs.writeFileSync(index,html);
console.log('Bundled web build. Updates: App Store / TestFlight only. Purchases: '+(settings.revenueCatPublicKey?'configured; device test required':'not configured')+'.');
if(process.argv.includes('--testflight')){
 if(!settings.revenueCatPublicKey||!settings.apiBaseURL)throw Error('TestFlight gate: run npm run configure first.');
 const response=await fetch(api.origin+'/api/forecast?beach=inlet-beach',{signal:AbortSignal.timeout(60000)});
 if(!response.ok||!(response.headers.get('content-type')||'').includes('application/json'))throw Error('TestFlight gate: forecast API must be reachable without private Sites login.');
 const data=await response.json();if(data.schema!==3||data.source!=='live')throw Error('TestFlight gate: live shared forecast unavailable.');
}
