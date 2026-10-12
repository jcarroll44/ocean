import fs from 'node:fs';
const root=new URL('../',import.meta.url);
let source=fs.readFileSync(new URL('vendor/tidewater/src/ocean/Breakers.js',root),'utf8');
const replace=(a,b)=>{if(!source.includes(a))throw Error('Pinned breaker hook changed: '+a);source=source.replaceAll(a,b);};
replace("'../engine/","'../vendor/tidewater/src/engine/");
replace("'./SurfFoam.js'","'../vendor/tidewater/src/ocean/SurfFoam.js'");
replace('const STEP = 2.0, K = 64;', 'const STEP = 3.0, K = 64;');
replace('128 m seaward','192 m seaward');
replace('this.NS * 6','this.NS * 9');replace('this.NS * 2','this.NS * 3');
replace('i * 6u','i * 9u');replace('st * 6u','st * 9u');replace('ot * 6u','ot * 9u');
replace('i * 2u + slot','i * 3u + slot');
replace('nSeg * 2;', 'nSeg * 3;');replace('slot < 2;', 'slot < 3;');replace('seg * 2 + slot','seg * 3 + slot');
replace('let slot = u32( m - floor( m * 0.5 ) * 2.0 );',`// One retained crest per shorebreak / inner-bar / outer-bar zone.
        // All 64 transect samples still drive spray and surface whitewater.
        let offshoreDistance=distance(pc,breakersStations[i].xy);
        let slot=select(select(0u,1u,offshoreDistance>22.0),2u,offshoreDistance>85.0);`);
replace('breakersCrestW[ base + 5u ] = vec4f( 0.0 );','breakersCrestW[ base + 5u ] = vec4f( 0.0 );\n\tbreakersCrestW[ base + 8u ] = vec4f( 0.0 );');
replace('breakersCrestW[ k ] = vec4f( root, b );',`let previous=breakersCrestW[k];
        // Retain the strongest active lip in this zone, without dropping spray
        // or surface foam from the other crests traversing it.
        let keep=breakersCrestW[k+2u].w<0.5 || abs(b-.5)<abs(previous.w-.5);
        if(keep){breakersCrestW[ k ] = vec4f( root, b );`);
replace('breakersCrestW[ k + 2u ] = vec4f( dir, trough, id );','breakersCrestW[ k + 2u ] = vec4f( dir, trough, id );}');
fs.writeFileSync(new URL('proof/ForecastBreakers.js',root),'// Generated adaptation of MIT Tidewater 4811ba48. Original lip shading is retained.\n// Three bar zones; same 64 samples, existing bounded spray ring.\n'+source);
