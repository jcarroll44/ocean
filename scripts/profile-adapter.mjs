import {BEACH_PROFILES,INLET_PROFILE} from '../src/beach-profiles.js';
// Keep archival source bytes for rollback tests. Only these explicit hooks are
// transformed in both production and preview. Inlet uses exact v7 camera values.
export function profileScene(source){
 const a=source.indexOf("const SITE={",source.indexOf("var __e = __mods['config.js']")),b=source.indexOf('\n};',a)+3;
 if(a<0||b<3)throw Error('Profile config hook changed');
 const selector=`const catalogue=${JSON.stringify(BEACH_PROFILES)};\nconst SITE=globalThis.__DAYBUOY_PROFILE__||catalogue[new URLSearchParams(globalThis.location?.search||'').get('beach')]||catalogue['inlet-beach'];\nglobalThis.__daybuoyProfile=SITE;`;
 return source.slice(0,a)+selector+source.slice(b);
}
export function profileApp(html){
 html=html.replace('SITE.lat=30.28;SITE.lon=-86.0;','// Coordinates belong to the selected beach profile.');
 html=html.replaceAll('(c.direction??201)','(c.direction??SITE.facing)').replaceAll('(c.windDirection??201)','(c.windDirection??SITE.facing)');
 // Automatic sun following stays in the seaward hemisphere, including the
 // horizontal field of view. Leave the actual astronomical bearing untouched.
 html=html.replace('Math.max(-102+40*k,Math.min(60,sunRel))','Math.max(Math.max(-60,SITE.camera.yawMin+SITE.camera.yawEase*k),Math.min(Math.min(60,SITE.camera.yawMax),sunRel))').replace('const fov=55+25*k','const fov=SITE.camera.fov+SITE.camera.fovRise*k').replace('const back=28+42*k, h=10+16*k','const back=SITE.camera.back+SITE.camera.backRise*k, h=SITE.camera.height+SITE.camera.heightRise*k');
 html=html.replace('const orbitHome={az:0,el:11*RAD,r:28.52},orbitTarget=new THREE.Vector3(0,4.56,0);','const orbitHome={az:SITE.camera.restYaw*RAD,el:SITE.camera.restPitch*RAD,r:SITE.camera.restRadius},orbitTarget=new THREE.Vector3(...SITE.camera.restTarget);').replace('.59*(1-2*.23)-Math.tan(orbitHome.el)','SITE.camera.lensScale*(1-2*SITE.camera.horizon)-Math.tan(orbitHome.el)');
 html=html.replace("const SURF_ZONE='FLZ108',SURF_URL='https://forecast.weather.gov/product.php?site=TAE&issuedby=TAE&product=SRF&format=CI&version=1&glossary=0';",`const SURF_ZONE=SITE.surfZone,SURF_URL='https://forecast.weather.gov/product.php?site='+SITE.surfOffice+'&issuedby='+SITE.surfOffice+'&product=SRF&format=CI&version=1&glossary=0';`);
 html=html.replaceAll("/^FLZ108(?:-|>)/m.test(s)&&/South Walton/i.test(s)","surfSectionHasZone(s,SURF_ZONE)");
 // Legacy copy stays in the frozen reference, not the running location engine.
 html=html.replaceAll("'Inlet Beach'",'SITE.name').replaceAll("'DayBuoy · Inlet Beach'","'DayBuoy · '+SITE.name");
 return html;
}
export const baselineProfile=INLET_PROFILE;
