import {srgb} from '../vendor/tidewater/src/world/terrain/TerrainShading.js';
// Replace only Tidewater's three dry-sand pigment constants. Wetness, foam,
// normals, underwater attenuation and illumination retain the native code.
export function sugarWhite(terrain){
 const changes=[[[.83,.75,.6],[.91,.894,.863]],[[.9,.84,.72],[239/255,235/255,226/255]],[[.84,.72,.55],[.92,.904,.873]]];
 for(const [from,to] of changes){const a=srgb(...from);if(!terrain.material.surface.includes(a))throw Error('Sand pigment source changed');terrain.material.surface=terrain.material.surface.replace(a,srgb(...to));}
 terrain.material.needsUpdate=true;
}
