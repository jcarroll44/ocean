export const PRE_OVERCAST_COMMIT='b29957b11d46a92416233f2f4bcf8e2c44610404';
export const OVERCAST_COMMIT='9104aae084372722e6124c9c0995aaad45a639b7';
export const OVERCAST_CASES=['baseline','previous','deck-off','surf-off','exposure-off','old-fov','lip-off','flat'];
export function overcastConfig(search=''){
 const q=new URLSearchParams(search),pass=q.get('overcast-test');
 if(pass&&!OVERCAST_CASES.includes(pass))throw Error('Unknown overcast diagnostic');
 return {pass:pass||null,deck:pass!=='deck-off',surf:pass!=='surf-off',exposure:pass!=='exposure-off',lip:pass!=='lip-off',cheap:pass==='flat'};
}
export const CASE_LABELS={baseline:'overcast-1 baseline',previous:'Before overcast-1 (pinned source)', 'deck-off':'New deck off (sky + reflections + neutral lighting)', 'surf-off':'New oblique surf adjustment off', 'exposure-off':'12% exposure increase off', 'old-fov':'Previous FOV (unchanged; repeat control)', 'lip-off':'New lip guard off (may show pillars)',flat:'Cheap smooth deck candidate'};
