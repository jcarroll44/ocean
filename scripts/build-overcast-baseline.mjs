// Reproducible historical native renderer, not a simulation of old settings.
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {PRE_OVERCAST_COMMIT} from '../ocean-proof/proof/overcast-profile-config.js';
const base='dist/overcast-previous';fs.mkdirSync(base,{recursive:true});
const archive=fs.readFileSync('benchmarks/pre-overcast-native.tar.gz');
const archiveSHA256='f0f7cdd7cf6ea7c01896492adabb00d516ed200b68abcf27e6336f346235a22e';
if(createHash('sha256').update(archive).digest('hex')!==archiveSHA256)throw Error('Historical renderer archive changed');
execFileSync('tar',['-xz','--strip-components=1','-C',base],{input:archive});
const file=path.join(base,'ocean-proof/proof/native-scene.js'),source=fs.readFileSync(file,'utf8');
const needle='evidence(){return {';
if(source.split(needle).length!==2)throw Error('Previous diagnostic telemetry hook changed');
// Only add pending-worker telemetry; rendering, shaders and scheduling are untouched.
fs.writeFileSync(file,source.replace(needle,needle+'shoreFieldPending:shoreBusy||!!pendingShore,'));
const manifest={commit:PRE_OVERCAST_COMMIT,archiveSHA256,scope:'Exact historical dist/ocean-proof; native-scene evidence adds shoreFieldPending only. native-capture=1 freezes DPR at its original production 1.5; no fixed forecast/proof camera.',originalNativeSHA256:createHash('sha256').update(source).digest('hex')};
fs.writeFileSync(path.join(base,'provenance.json'),JSON.stringify(manifest,null,2));
console.log('Packaged pre-overcast native source at '+PRE_OVERCAST_COMMIT);
