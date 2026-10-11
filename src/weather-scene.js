// App-to-native packet and explanatory detail. All input values come from the
// same selected hour as the visible readings. No fetch or shader build on drag.
const WEATHER_PACKET_KEYS=['swell','period','direction','wind','windDirection','gust','tide','cloud','cloudLow','cloudMid','cloudHigh','rain','humidity','visibility','temperature','weatherCode','thunder',...__mods['weather-data.js'].WEATHER_EXTRAS];
let weatherPacketCache={key:null};
function weatherScenePacket(c){
 if(!['swell','period','direction','wind','windDirection'].every(k=>Number.isFinite(c[k])))return null;
 const field=state.data.weatherField,stamp=Math.floor(state.time/100),key=[state.version,stamp,field?.retrievedAt].join(':');
 if(weatherPacketCache.key!==key){
  const w=__mods['weather-data.js'];
  weatherPacketCache={key,offshore:w.sampledOffshore(field,state.time),drift:['low','mid','high'].map(layer=>field?.series?.[0]?w.integrateCloudWind(field.series[0].rows,state.time,layer):null)};
 }
 return {...Object.fromEntries(WEATHER_PACKET_KEYS.map(k=>[k,c[k]??null])),offshore:weatherPacketCache.offshore,cloudDrift:weatherPacketCache.drift,reducedMotion:reduced,forecastTime:state.time,weatherRetrievedAt:field?.retrievedAt??null,weatherSource:field?.source??null};
}
const weatherEffectsBase=updateWeatherEffects;
updateWeatherEffects=function(){
 if(!engine?.nativeScene){weatherEffectsBase();return;}
 // Native rain/dimples use fixed buffers compiled during load. Keep the solar
 // arc; do not create/dispose legacy rain meshes whenever precipitation changes.
 const c=conditions(),potential=Number.isFinite(c.thunder)?c.thunder:0,t=uniforms.uTime.value;
 uniforms.uLightning.value=reduced?0:potential*(.28*Math.exp(-Math.pow(((t+3.7)%19.7-1.2)/.22,2)));
 state.weatherEffects={rain:Number.isFinite(c.rain)?c.rain:null,thunder:potential,tide:c.tide,stand:false};
};
const weatherMethodBase=forecastMethod;
forecastMethod=function(k){
 const base=weatherMethodBase(k);if(k!=='air')return base;
 const c=conditions(),field=state.data.weatherField,w=__mods['weather-data.js'],thunder=w.thunderPotential(c);
 const val=(n,unit)=>Number.isFinite(n)?Math.round(n)+unit:'Unavailable';
 const status=!field?'Offshore forecast unavailable':state.data.feedStatus?.offshore==='rejected'?'Saved offshore forecast · '+releaseStamp(field.retrievedAt):'Offshore forecast updated '+releaseStamp(field.retrievedAt);
 return base+`<section class="weather-details"><p>Low / mid / high cloud: ${[c.cloudLow,c.cloudMid,c.cloudHigh].map(n=>val(n,'%')).join(' / ')}</p><p>Visibility ${Number.isFinite(c.visibility)?(c.visibility/1609.344).toFixed(1)+' mi':'Unavailable'} · Humidity ${val(c.humidity,'%')}</p><p>Rain ${Number.isFinite(c.rain)?c.rain.toFixed(1)+' mm/h':'Unavailable'} · Solar radiation ${val(c.radiation,' W/m²')}</p><p>${textHTML(status)}</p><p>Weather appearance est. · Open-Meteo. Cloud shapes, layer heights, fog, rain, shimmer and storm placement illustrate the forecast. Offshore samples at 5, 20 and 40 miles show the selected forecast hour; they are not radar or an exact arrival time. ${thunder?textHTML(thunder.method)+'. Flashes illustrate potential, not observed strikes.':'Lightning potential unavailable.'}</p></section>`;
};
