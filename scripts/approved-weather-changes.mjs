// Explicit Oct 11 weather/data/failed-feed authority. Every other adapter byte
// is still compared with the original; camera and gesture files remain exact.
export function applyApprovedWeather(file,source){
 if(file!=='src/native-layer.js')return source;
 return source.replace("Object.fromEntries(['swell','period','direction','wind','windDirection','tide','cloud','rain','cloudLow','cloudMid','cloudHigh'].map(k=>[k,c[k]]))",'weatherScenePacket(c)')
 .replace("badge.hidden=false;badge.textContent='Standard ocean · Tidewater unavailable';","badge.hidden=!debug;badge.textContent=debug?'Standard ocean · Tidewater unavailable':'';")
 .replace('engine.activateFallback();',"releaseReport('renderer','unavailable');engine.activateFallback();");
}
export function applyMissingRain(source){
 return source.replace('rain:w.precip??((w.rainOnly??0)+(w.showers??0))','rain:w.precip??(Number.isFinite(w.rainOnly)&&Number.isFinite(w.showers)?w.rainOnly+w.showers:null)');
}
