import fs from 'node:fs';import path from 'node:path';import {execFileSync} from 'node:child_process';import {fileURLToPath} from 'node:url';import {build} from '../../node_modules/esbuild/lib/main.js';
const native=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),repo=path.dirname(native);
const localFile=path.join(native,'release.local.json');
const settings=fs.existsSync(localFile)?JSON.parse(fs.readFileSync(localFile,'utf8')):{};
if(settings.sentryDsn&&!/^https:\/\/[a-zA-Z0-9]+@[a-zA-Z0-9.-]+\/[0-9]+$/.test(settings.sentryDsn))throw Error('Use the Sentry client DSN, not an auth token.');
if(settings.channel&&!['beta','production'].includes(settings.channel))throw Error('Release channel must be beta or production');
const configFile=path.join(native,'capacitor.config.json'),config=JSON.parse(fs.readFileSync(configFile,'utf8'));
delete config.server.url;
const updater=config.plugins.CapacitorUpdater;
updater.autoUpdate='off';delete updater.publicKey;
if(settings.capgoEnabled){
 if(!settings.capgoPublicKeyFile)throw Error('Choose a Capgo public key file; keep the private key outside the repo.');
 updater.publicKey=fs.readFileSync(path.resolve(native,settings.capgoPublicKeyFile),'utf8');
 if(!updater.publicKey.includes('BEGIN PUBLIC KEY')||updater.publicKey.includes('PRIVATE'))throw Error('Expected only the public key');
 updater.autoUpdate='atBackground';
}
updater.defaultChannel=settings.channel||'beta';
// Generated config carries public configuration only; never a service token.
fs.writeFileSync(configFile,JSON.stringify(config,null,2)+'\n');
const www=path.join(native,'www');
for(const item of fs.readdirSync(path.join(repo,'production/dist')))fs.cpSync(path.join(repo,'production/dist',item),path.join(www,item),{recursive:true});
const sha=execFileSync('git',['rev-parse','--short=12','HEAD'],{cwd:repo,encoding:'utf8'}).trim();
await build({entryPoints:[path.join(native,'src/runtime.js')],outfile:path.join(www,'assets/native.js'),bundle:true,minify:true,sourcemap:false,legalComments:'none',target:'safari26',format:'iife',define:{__DAYBUOY_NATIVE_CONFIG__:JSON.stringify({sentryDsn:settings.sentryDsn||'',channel:updater.defaultChannel,release:'daybuoy@1.0+'+sha})}});
const index=path.join(www,'index.html');let html=fs.readFileSync(index,'utf8');
html=html.replace('<script src="/assets/app.js" defer></script>','<script src="/assets/native.js" defer></script><script src="/assets/app.js" defer></script>');fs.writeFileSync(index,html);
console.log('Bundled web build. Diagnostics: '+(settings.sentryDsn?'configured (verify receipt on device)':'needs Sentry DSN')+'. OTA: '+(settings.capgoEnabled?'configured (verify rollback on device)':'needs Capgo app/public key')+'.');
if(process.argv.includes('--testflight')&&(!settings.sentryDsn||!settings.capgoEnabled))throw Error('TestFlight release gate: configure native/release.local.json for diagnostics and OTA first. Local preview builds remain available.');
