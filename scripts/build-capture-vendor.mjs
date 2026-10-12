import fs from 'node:fs';
import {build} from 'esbuild';
// Private review runner only; excluded from the production/native module graph.
await build({entryPoints:['node_modules/html-to-image/es/index.js'],bundle:true,format:'esm',minify:true,legalComments:'inline',outfile:'ocean-proof/proof/dom-capture-vendor.js',banner:{js:'/*! html-to-image 1.11.13 · MIT · Copyright (c) 2017–2025 W.Y. · see dom-capture-LICENSE.txt */'}});
fs.copyFileSync('node_modules/html-to-image/LICENSE','ocean-proof/proof/dom-capture-LICENSE.txt');
