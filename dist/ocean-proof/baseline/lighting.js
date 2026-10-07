function installSoftCloudFallback(shader){
 const start=shader.indexOf('float layerCover('),end=shader.indexOf('vec3 cloudLayers(',start);
 if(start<0||end<0)return shader;
 const field=`float layerCover(vec3 rd,float layer,float cover){
  if(cover<.003||rd.y<=.002)return 0.;
  float a=(atan(rd.x,-rd.z)+PI)/(2.*PI)*9.+uTime*.003*sin(uWindDirection)*(.3+uWind*.035)/(1.+layer*.5);
  float cell=floor(a),x=fract(a),e=asin(clamp(rd.y,0.,1.));
  float density=0.;
  for(int i=-1;i<=1;i++){
   float id=mod(cell+float(i)+90.,9.);
   float seed=hash(vec2(id,layer+8.));
   float present=smoothstep(seed-.14,seed+.07,cover);
   float cy=.16+layer*.29+hash(vec2(id+7.,layer+3.))*.23;
   vec2 q=vec2((x-float(i)-.5)*1.25,(e-cy)/(layer>1.5?.16:.21));
   float body=exp(-dot(q,q)*2.8);
   if(uCloudQuality>.5){vec2 q2=q-vec2(.38,.16);body=max(body,exp(-dot(q2,q2)*4.));
   vec2 q3=q+vec2(.36,.10);body=max(body,exp(-dot(q3,q3)*4.8));}
   density=max(density,body*present);
  }
  float deck=smoothstep(.80,1.,cover)*.72;
  density=max(density,deck);
  return clamp(density*(layer>1.5?.10:.88),0.,.97)*smoothstep(.002,.07,rd.y);
 }
 `;
 shader=shader.slice(0,start)+field+shader.slice(end);
 shader=shader.replace('float relief=cloudNoise(bodyP+vec2(.17,.28)),thickness=j==0?.12:j==1?.28:.52;','float relief=.70-.28*alpha,thickness=j==0?.12:j==1?.20:.30;');
 // Dense low/mid overcast hides stars and direct moonlight. The thin high
 // veil still transmits light; moon position/phase and star catalogue are untouched.
 shader=shader.replace('return 1.-(1.-c.x)*(1.-c.y)*(1.-c.z);','return max(1.-(1.-c.x)*(1.-c.y)*(1.-c.z),smoothstep(.86,.98,max(uCloudLayers.x,uCloudLayers.y))*.997);');
 shader=shader.replace('float coverage=1.-(1.-layers.x)*(1.-layers.y)*(1.-layers.z);','float coverage=max(1.-(1.-layers.x)*(1.-layers.y)*(1.-layers.z),smoothstep(.86,.98,max(uCloudLayers.x,uCloudLayers.y))*.997);');
 shader=shader.replace('(1.0-.92*coverage)*smoothstep','pow(1.0-coverage,2.0)*smoothstep');
 shader=shader.replace('(1.0-.90*cloudCover(normalize(uMoon)))','pow(1.0-cloudCover(normalize(uMoon)),2.0)');
 // A readable navy ambient sky reflects into the water at night. This is
 // sky exposure, not invented moonlight: lunar specular remains astronomical.
 shader=shader.replaceAll('vec3(.006,.013,.036)','vec3(.014,.032,.076)').replaceAll('vec3(.018,.034,.065)','vec3(.035,.063,.115)').replaceAll('vec3(.024,.035,.053)','vec3(.022,.041,.080)').replaceAll('vec3(.018,.025,.036)','vec3(.023,.043,.078)').replaceAll('vec3(.012,.019,.027)','vec3(.020,.036,.063)');
 return shader;
}

let qualityRestoreAt=0;
// Colour-only material treatment. No displacement, wave or solar math changes.
function installDayLighting(scene){
 const changes=[
  // Keep forecast geometry; restore wind caps discarded by the rough-surf blend.
  ['froth=mix(froth,sharedFroth,incomingMix());','froth=mix(froth,sharedFroth,incomingMix());froth=max(froth,caps*.72*(1.0-daylight()));'],
  ['vec3 moonFoam=vec3(.035,.048,.063)','vec3 moonFoam=vec3(.035,.048,.063)+vec3(.075,.088,.105)*max(smoothstep(10.0,24.0,uWind),smoothstep(.8,2.3,uSwell))+vec3(.32,.36,.42)*uLightning'],
  ['vec3 c=mix(water,reflected,min(.94,fresnel));','vec3 c=mix(water,reflected,min(.94,fresnel));c+=vec3(.009,.015,.023)*(1.0-day)*max(smoothstep(10.0,24.0,uWind),smoothstep(.8,2.3,uSwell))*(.25+.75*max(n.y,0.0));c+=vec3(.13,.17,.23)*uLightning*(.25+.75*max(n.y,0.0));'],
  ['return col;','return col+vec3(.11,.14,.20)*uLightning*(.3+.7*max(uCloudLayers.x,uCloudLayers.y));'],
  ['float nightFill=.018+.042*uMoonInfo.z*(1.0-uCloud*.75);','float nightFill=.058+.042*uMoonInfo.z*pow(1.0-cloudCover(normalize(uMoon)),2.0)+uLightning*.35;'],
  ['vec3(.23,.32,.41),vec3(.71,.79,.81),daylight()','vec3(.48,.59,.70)+vec3(.3)*uLightning,vec3(.71,.79,.81),daylight()'],
  ['clamp(drops,.0,.46)','clamp(drops*mix(1.85,1.0,daylight()),.0,.55)'],
  // Dim coastal fill keeps sand legible without inventing moonlight.
  ['vec3(.04,.028,.018)*townGlow(rd)*night','(vec3(.052,.040,.028)*townGlow(rd)+vec3(.010,.013,.018)*max(uCloudLayers.x,uCloudLayers.y)*(1.0-smoothstep(.02,.50,rd.y)))*night'],
  // Silver overcast is diffuse daylight, not extra fog. Thin high cloud,
  // rain/storms and astronomical night keep their separate treatments.
  ['vec3 sky(vec3 rd,bool clouds){','float silverDay(){return smoothstep(.50,.97,max(uCloudLayers.x,uCloudLayers.y))*daylight()*(1.0-smoothstep(.2,2.0,uRain));}\nvec3 sky(vec3 rd,bool clouds){'],
  ['vec3 litCloud=mix(vec3(.87,.89,.87),','vec3 silverCloud=mix(vec3(.56,.66,.70),vec3(.30,.40,.48),smoothstep(.02,.85,rd.y));\n    vec3 litCloud=mix(mix(vec3(.87,.89,.87),silverCloud,silverDay()),'],
  ['float low=pow(1.0-clamp(altitude,0.0,1.0),3.5);','float low=pow(1.0-clamp(altitude,0.0,1.0),6.0);'],
  ['float seaHaze(float distanceAlongRay){return 1.0-exp(-min(distanceAlongRay,7500.0)*extinction());}','float seaHaze(float distanceAlongRay){return (1.0-exp(-min(distanceAlongRay,7500.0)*extinction()))*uHazeStrength;}'],
  ['float lowVisibility=1.0-smoothstep(1200.0,16000.0,uVisibility);','float lowVisibility=(1.0-smoothstep(1200.0,16000.0,uVisibility))*uHazeStrength;'],
  ['float haze=max(seaHaze(t),smoothstep(900.0,2000.0,t));','vec3 seaHorizon=mix(vec3(.009,.040,.055)*(.07+.93*daylight()),sky(normalize(vec3(rd.x,.003,rd.z)),false),.55); c=mix(c,seaHorizon,smoothstep(900.0,2000.0,t)); float haze=seaHaze(t);'],
  ['gl_FragColor=vec4(finish(sky(normalize(vec3(rd.x,.003,rd.z)),false)),1.0);return;','vec3 horizonSky=sky(normalize(vec3(rd.x,.003,rd.z)),false); vec3 seaHorizon=mix(vec3(.009,.040,.055)*(.07+.93*daylight()),horizonSky,.55); gl_FragColor=vec4(finish(mix(seaHorizon,horizonSky,uHazeStrength)),1.0);return;'],
  ['float n=cloudNoise(q);','float n=cloudNoise(q*3.1);'],
  ['float edge=layer>1.5?.11:layer>.5?.07:.045;','float edge=layer>1.5?.09:layer>.5?.065:.05;'],
  ['vec3(.055,.22,.39)','vec3(.007,.078,.30)'],
  ['vec3(.38,.55,.64)','vec3(.23,.44,.62)'],
  ['float warm=(1.0-smoothstep(.03,.40,sun.y))*smoothstep(-.16,.035,sun.y);','float warm=(1.0-smoothstep(.10,.56,sun.y))*smoothstep(-.16,.035,sun.y)*mix(.62,1.0,uAfternoon);'],
  ['vec3(.20,.29,.41),warm*.65','mix(vec3(.10,.16,.30),mix(vec3(.055,.13,.29),vec3(.26,.065,.17),1.0-smoothstep(-.015,.20,sun.y)),uAfternoon),warm*.82'],
  ['vec3(.96,.61,.37),warm*.80','mix(vec3(.94,.49,.32),mix(vec3(1.0,.60,.23),vec3(.98,.23,.105),1.0-smoothstep(-.015,.20,sun.y)),uAfternoon),warm*.94'],
  ['vec3(.35,.43,.49),day),uCloud*.55','vec3(.20,.27,.33),day),uCloud*.04'],
  ['vec3(.24,.30,.34),day),min(.72,uRain*.028)','vec3(.085,.115,.15),day),min(.85,uRain*.095)'],
  ['smoothstep(.8,7.0,uRain)','smoothstep(.4,3.0,uRain)'],
  ['vec3(.24,.30,.35),storm','vec3(.08,.105,.14),storm'],
  ['vec3 dry=vec3(.81,.75,.62)','vec3 dry=vec3(.985,.98,.96)'],
  // The "morning shadow" was the flat, 90%-wet strand with very dark sand.
  // Keep the physical wet zone and run-up memory, but blend a softer edge.
  ['smoothstep(wetReach-.55,wetReach+.65,offset))*.90','smoothstep(wetReach-1.15,wetReach+1.2,offset))*.72'],
  ['vec3 moist=vec3(.32,.32,.28)','vec3 moist=vec3(.57,.59,.54)'],
  ['wet*(.025+f*.27)','wet*(.025+f*.27+.055*silverDay())'],
  ['vec3(.007,.155,.150)','vec3(.003,.13,.078)'],
  ['vec3(.002,.036,.072)','vec3(.001,.032,.043)'],
  ['vec3(.025,.20,.14)','vec3(.008,.16,.065)'],
  ['vec3(.53,.52,.43)','vec3(.34,.43,.32)'],
  ['vec3 c=mix(water,reflected,min(.94,fresnel));','float silver=silverDay();\n water=mix(water,water*vec3(.84,1.20,1.04)+vec3(.009,.042,.029),silver*.65);\n reflected=mix(reflected,reflected*vec3(.77,1.02,.92),silver*.48);\n water=mix(water,vec3(dot(water,vec3(.2126,.7152,.0722)))*vec3(.80,.90,1.0),smoothstep(.4,3.0,uRain)*.88);\n vec3 c=mix(water,reflected,min(.94,fresnel));'],
  ['vec3(1.10,.87,.70),warm*.6','vec3(1.12,.73,.47),warm*.8'],
  ['pow(sd,24.0)*.20+pow(sd,200.0)*.20','pow(sd,24.0)*.055+pow(sd,200.0)*.12']
 ];
 scene.traverse(o=>{for(const material of Array.isArray(o.material)?o.material:[o.material]){
  if(!material?.fragmentShader?.includes('vec3 sky(')||material.userData.dayLighting)return;
  let shader='uniform float uAfternoon,uHazeStrength,uLightning;\n'+material.fragmentShader;
  for(const [a,b] of changes)shader=shader.split(a).join(b);
  if(o.renderOrder===-100)shader=shader.replace('col+=sunColor*smoothstep(.99986,.99997,sd)*5.0*visible;','');
  shader=installSoftCloudFallback(shader);
  if(material.vertexShader?.includes('float layerCover('))material.vertexShader=installSoftCloudFallback(material.vertexShader);
  material.fragmentShader=shader;material.uniforms.uLightning=uniforms.uLightning;material.uniforms.uAfternoon=uniforms.uAfternoon;material.uniforms.uHazeStrength=uniforms.uHazeStrength;material.userData.dayLighting=true;material.needsUpdate=true;
 }});
}
