import {srgb} from '../vendor/tidewater/src/world/terrain/TerrainShading.js';
import {sceneProfile} from '../../src/beach-profiles.js';
// Replace only Tidewater's three dry-sand pigment constants. Wetness, foam,
// normals, underwater attenuation and illumination retain the native code.
export function sugarWhite(terrain){
 const colors=sceneProfile().sand;
 const changes=[[[.83,.75,.6],colors[0]],[[.9,.84,.72],colors[1]],[[.84,.72,.55],colors[2]]];
 for(const [from,to] of changes){const a=srgb(...from);if(!terrain.material.surface.includes(a))throw Error('Sand pigment source changed');terrain.material.surface=terrain.material.surface.replace(a,srgb(...to));}
 terrain.material.needsUpdate=true;
}
