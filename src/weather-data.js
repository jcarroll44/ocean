// Enrich the existing providers without altering their pinned parser/astronomy.
(()=>{
 /* WEATHER_MODEL */
 const api=__mods['weather-data.js']={weatherURL,parseWeatherField,sampleWeather,sampledOffshore,thunderPotential,weatherBracket,weatherValue,integrateCloudWind,WEATHER_EXTRAS};
 const forecast=__mods['forecast.js'],baseLoad=forecast.loadForecast,baseSaved=forecast.savedForecast,baseSample=__mods['conditions.js'].sampleAt;
 const key='daybuoy.weather-field.v1';let field=null,inFlight=null;
 try{const c=JSON.parse(localStorage.getItem(key)||'null');if(c?.schema===1&&c.series?.length===22&&c.series.every(p=>Array.isArray(p.rows)&&p.rows.length>=6)&&Number.isFinite(c.retrievedAt)&&Date.now()-c.retrievedAt<24*WEATHER_HOUR&&c.retrievedAt<=Date.now()+300000)field=c;}catch{}
 function attach(data){if(field&&Date.now()-field.retrievedAt>=24*WEATHER_HOUR)field=null;if(data&&field){data.weatherField=field;for(const r of data.rows){const w=sampleWeather(field.series[0].rows,r.time);for(const k of WEATHER_EXTRAS)r[k]=w?.[k]??null;}}return data;}
 api.loadField=async()=>{
  if(inFlight)return inFlight;
  inFlight=(async()=>{const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),16000);
   try{const res=await fetch(weatherURL(__mods['config.js'].SITE),{signal:controller.signal,cache:'no-store'});if(!res.ok)throw Error('Weather field HTTP '+res.status);
    field=parseWeatherField(await res.json(),__mods['config.js'].SITE);try{localStorage.setItem(key,JSON.stringify(field));}catch{}return field;
   }finally{clearTimeout(timer);inFlight=null;}
  })();return inFlight;
 };
 forecast.loadForecast=async options=>{const [base,extra]=await Promise.allSettled([baseLoad(options),api.loadField()]);if(base.status==='rejected')throw base.reason;const data=attach(base.value);data.feedStatus={...data.feedStatus,offshore:extra.status};return data;};
 forecast.savedForecast=(...args)=>attach(baseSaved(...args));
 __mods['conditions.js'].sampleAt=(rows,time)=>{
  const out=baseSample(rows,time);if(!out)return out;const v=weatherBracket(rows,time);
  for(const k of [...Object.keys(WEATHER_FIELDS),'swell','period','direction','sst','tide','uv','uvClear','apparent','rainProbability','aod'])out[k]=v?weatherValue(v.a,v.b,v.f,k):null;
  // Probability/categorical code changes never drive a discontinuous visual flash.
  if(v){const ta=thunderPotential(v.a),tb=thunderPotential(v.b);out.thunder=ta&&tb?ta.value+(tb.value-ta.value)*v.f:null;}
  return out;
 };
})();
