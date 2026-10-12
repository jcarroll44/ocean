import fs from 'node:fs';
import {generateProfile} from '../server/profile-generator.js';
const [lat,lon,destination]=process.argv.slice(2);
if(!lat||!lon||!destination)throw Error('Usage: node scripts/generate-beach.mjs LAT LON output.json');
const profile=await generateProfile(Number(lat),Number(lon));
fs.writeFileSync(destination,JSON.stringify(profile,null,2)+'\n');
console.log(JSON.stringify({file:destination,id:profile.id,facing:profile.facing,tideStation:profile.tideStation,surfZone:profile.surfZone,buoys:profile.buoys.map(s=>s.id),warnings:profile.provenance.warnings}));
