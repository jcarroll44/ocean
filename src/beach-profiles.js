// Sole editable beach catalogue. The retained historical scene bundle is adapted
// at build time; live additions can be supplied by the server's profile registry.
export const INLET_PROFILE={
 schema:1,id:'inlet-beach',name:'Inlet Beach',region:'Florida Gulf',visible:true,
 lat:30.28,lon:-86,zone:'America/Chicago',facing:201,shoreline:291,
 marine:{lat:30.24,lon:-86},tideStation:'8729210',surfZone:'FLZ108',surfOffice:'TAE',surfName:'South Walton',
 buoys:[{id:'42012',lat:30.058,lon:-87.555},{id:'42039',lat:28.788,lon:-86.008},{id:'42036',lat:28.5,lon:-84.508}],
 elevation:3,url:'https://daybuoy.jacobcarroll51.chatgpt.site/',
 water:{absorption:[.42,.075,.035],scattering:[.012,.018,.024]},
 sand:[[.93,.907,.854],[237/255,230/255,214/255],[.922,.895,.843]],
 bars:{base:.65,slope:.022,inner:45,innerLift:.68,innerWidth:13,outer:125,outerLift:1.05,outerWidth:25,source:'typical Gulf two-bar profile est.; not a seabed survey'},
 camera:{yawMin:-102,yawEase:40,yawMax:60,fov:55,fovRise:25,back:28,backRise:42,height:10,heightRise:16,restYaw:0,restPitch:11,restRadius:28.52,restTarget:[0,4.56,0],horizon:.23,lensScale:.59},
 provenance:{facing:'est. · regional coastline normal; v7-approved 201° framing',colors:'est. · regional appearance',tide:'NOAA CO-OPS',buoys:'NOAA NDBC'}
};
export const BEACH_PROFILES={
 'inlet-beach':INLET_PROFILE,
 'cocoa-beach':{...INLET_PROFILE,id:'cocoa-beach',name:'Cocoa Beach',region:'Florida Atlantic',visible:false,lat:28.3201,lon:-80.6075,zone:'America/New_York',facing:92.1,shoreline:182.1,marine:{lat:28.328,lon:-80.565},tideStation:'8721604',surfZone:'FLZ747',surfOffice:'MLB',surfName:'Southern Brevard Barrier Islands',buoys:[{id:'41113',lat:28.4,lon:-80.533},{id:'41009',lat:28.508,lon:-80.185}],water:{absorption:[.3,.095,.04],scattering:[.018,.035,.029]},sand:[[.78,.73,.63],[.87,.82,.72],[.81,.76,.66]],bars:{...INLET_PROFILE.bars,inner:40,outer:110,source:'typical Atlantic sandy beach profile est.; not a seabed survey'},provenance:{facing:'est. · OpenStreetMap coastline (ODbL)',colors:'est. · regional appearance',tide:'NOAA CO-OPS',buoys:'NOAA NDBC'}},
 'san-diego':{...INLET_PROFILE,id:'san-diego',name:'San Diego · Mission Beach',region:'Southern California',visible:false,lat:32.7706,lon:-117.2529,zone:'America/Los_Angeles',facing:268.02,shoreline:358.02,marine:{lat:32.7706,lon:-117.296},tideStation:'9410170',surfZone:'CAZ043',surfOffice:'SGX',surfName:'San Diego County Coastal Areas',buoys:[{id:'46254',lat:32.868,lon:-117.267},{id:'46258',lat:32.749,lon:-117.502},{id:'46232',lat:32.517,lon:-117.425}],water:{absorption:[.34,.095,.045],scattering:[.012,.021,.027]},sand:[[.71,.65,.55],[.81,.76,.66],[.75,.69,.59]],bars:{...INLET_PROFILE.bars,base:.8,slope:.03,inner:35,outer:100,outerLift:.65,source:'typical Pacific sandy beach profile est.; not a seabed survey'},camera:{...INLET_PROFILE.camera,yawMin:-70,yawMax:102},provenance:{facing:'est. · coastline normal',colors:'est. · regional appearance',tide:'NOAA CO-OPS',buoys:'NOAA NDBC'}}
};
export function validateProfile(p){
 if(!p||p.schema!==1||!/^[-a-z0-9]{1,64}$/.test(p.id)||!Number.isFinite(p.lat)||Math.abs(p.lat)>85||!Number.isFinite(p.lon)||Math.abs(p.lon)>180||!Number.isFinite(p.facing)||p.facing<0||p.facing>=360)throw Error('Invalid beach profile');
 new Intl.DateTimeFormat('en',{timeZone:p.zone});
 if(!p.marine||![p.marine.lat,p.marine.lon].every(Number.isFinite)||!p.camera||!p.bars||!p.sand?.every(c=>c.length===3&&c.every(v=>Number.isFinite(v)&&v>=0&&v<=1)))throw Error('Incomplete beach profile');
 if(typeof p.name!=='string'||!p.name.trim()||p.name.length>100||p.sand.length!==3||Math.abs(p.marine.lat)>85||Math.abs(p.marine.lon)>180)throw Error('Invalid profile appearance');
 for(const key of Object.keys(INLET_PROFILE.camera))if(key==='restTarget'?!Array.isArray(p.camera[key])||p.camera[key].length!==3||!p.camera[key].every(Number.isFinite):!Number.isFinite(p.camera[key]))throw Error('Invalid profile camera');
 for(const key of ['base','slope','inner','innerLift','innerWidth','outer','outerLift','outerWidth'])if(!Number.isFinite(p.bars[key])||p.bars[key]<0)throw Error('Invalid profile bars');
 if(p.bars.innerWidth===0||p.bars.outerWidth===0||!['absorption','scattering'].every(k=>p.water?.[k]?.length===3&&p.water[k].every(v=>Number.isFinite(v)&&v>=0&&v<=2)))throw Error('Invalid profile material');
 if(!Array.isArray(p.buoys)||p.buoys.length>3||p.buoys.some(b=>!/^[a-z0-9]{4,7}$/.test(b.id)||![b.lat,b.lon].every(Number.isFinite)))throw Error('Invalid buoy profile');
 return p;
}
export const profileFacing=c=>Number.isFinite(c?.facing)?c.facing:INLET_PROFILE.facing;
export function sceneProfile(){try{return validateProfile(globalThis.parent?.__daybuoyProfile||globalThis.__DAYBUOY_PROFILE__||INLET_PROFILE);}catch{return INLET_PROFILE;}}
