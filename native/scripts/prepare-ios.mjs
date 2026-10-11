import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {Resvg} from '@resvg/resvg-js';
import {PNG} from 'pngjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
process.chdir(root);
execFileSync(process.execPath,['scripts/build.mjs'],{cwd:path.dirname(root),stdio:'inherit'});
execFileSync(process.execPath,['scripts/build-production.mjs'],{cwd:path.dirname(root),stdio:'inherit'});
const svg=fs.readFileSync('assets/icon.svg','utf8');
const fontFamily=process.platform==='darwin'?'Helvetica':'DejaVu Sans';
const png=(source,width)=>PNG.sync.write(PNG.sync.read(new Resvg(source,{fitTo:{mode:'width',value:width},font:{sansSerifFamily:fontFamily,defaultFontFamily:fontFamily}}).render().asPng()),{colorType:2});
const assets='ios/App/App/Assets.xcassets';
fs.writeFileSync(assets+'/AppIcon.appiconset/AppIcon-512@2x.png',png(svg,1024));
const symbol=svg.replace(/<svg[^>]*>/,'').replace('</svg>','');
const splash=`<svg xmlns="http://www.w3.org/2000/svg" width="2732" height="2732" viewBox="0 0 2732 2732"><rect width="2732" height="2732" fill="#edf4f5"/><g transform="translate(1141 1080) scale(.44)">${symbol}</g><text x="1366" y="1680" text-anchor="middle" fill="#17394d" font-family="sans-serif" font-size="100" font-weight="600">DayBuoy</text></svg>`;
for(const file of ['splash-2732x2732.png','splash-2732x2732-1.png','splash-2732x2732-2.png'])fs.writeFileSync(assets+'/Splash.imageset/'+file,png(splash,2732));
if(fs.existsSync('../production/dist'))fs.writeFileSync('../production/dist/icon-180.png',png(svg,180));
for(const file of ['privacy.html','credits.html'])if(!fs.existsSync('www/'+file))throw Error('Missing bundled legal page: '+file);
execFileSync(process.execPath,['scripts/bundle.mjs',...process.argv.slice(2)],{stdio:'inherit'});
execFileSync(process.execPath,['node_modules/@capacitor/cli/bin/capacitor','sync','ios'],{stdio:'inherit'});
// Capacitor emits tools-version 5.9 plus .v26, an enum introduced only in
// PackageDescription 6.2. The string form preserves iOS 26 and Swift 5 mode.
const manifest='ios/App/CapApp-SPM/Package.swift';
fs.writeFileSync(manifest,fs.readFileSync(manifest,'utf8').replace('.iOS(.v26)','.iOS("26.0")'));
execFileSync(process.execPath,['scripts/check.mjs'],{stdio:'inherit'});
console.log('Ready for Xcode. Signing, compilation and physical-iPhone testing must happen on your Mac.');
