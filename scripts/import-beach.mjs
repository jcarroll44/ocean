import fs from 'node:fs';
import {validateProfile} from '../src/beach-profiles.js';
const [file,origin]=process.argv.slice(2),key=process.env.PROFILE_ADMIN_KEY;
if(!file||!origin||!key)throw Error('Usage: PROFILE_ADMIN_KEY in environment, node scripts/import-beach.mjs profile.json https://your-data-host');
const profile=validateProfile(JSON.parse(fs.readFileSync(file,'utf8'))),url=new URL('/api/profile',origin);
if(url.protocol!=='https:')throw Error('HTTPS required');
const headers={'Content-Type':'application/json',Authorization:'Bearer '+key};
// Optional Sites service access stays in configured environment, never output.
if(process.env.SITES_SERVICE_TOKEN)headers['OAI-Sites-Authorization']=process.env.SITES_SERVICE_TOKEN;
const response=await fetch(url,{method:'PUT',headers,body:JSON.stringify(profile)});
if(!response.ok)throw Error('Profile import failed: HTTP '+response.status);
console.log('Imported hidden profile '+profile.id+'. No rebuild needed.');
