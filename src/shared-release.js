function surfSectionHasZone(section,zone){
 if(!/^[A-Z]{2}Z\d{3}$/.test(zone||''))return false;
 const prefix=zone.slice(0,3),wanted=Number(zone.slice(3));
 const lines=section.split('\n').filter(l=>/^[A-Z]{2}Z\d|^\d{3}(?:[- >])/.test(l)).join('');let current=null;
 for(const token of lines.split('-')){if(/^[A-Z]{2}Z/.test(token))current=token.slice(0,3);const value=token.replace(/^[A-Z]{2}Z/,'');const [lo,hi]=value.split('>').map(Number);if(current===prefix&&value.length<8&&wanted>=lo&&wanted<=(hi||lo))return true;}return false;
}
loadRipForecast=async function(){
 const data=__mods['shared-forecast.js'].data;
 try{if(!data?.surfProduct)throw Error('Surf unavailable');surfForecast=parseSurfProduct(data.surfProduct);ripFeedFailed=data.cache?.stale===true;}catch{ripFeedFailed=true;releaseReport('nws-surf','refresh-failed');}
 state.dirty=true;
};
const sharedRefresh=refresh;
refresh=async function(){await sharedRefresh();await loadRipForecast();if(state.data.schema===3)window.dispatchEvent(new CustomEvent('daybuoy:forecast',{detail:state.data}));};
const sharedMethod=forecastMethod;
forecastMethod=function(kind){
 const source=state.data.weatherSource||'unavailable',stamp=releaseStamp(state.data.retrievedAt);
 if(['air','sun','wind','temperature','uv'].includes(kind))return `<details class="forecast-method"><summary>Sources & estimates</summary><p>Weather · ${textHTML(source)}. Retrieved ${textHTML(stamp)}. Times in ${textHTML(SITE.zone)}.</p><p>Cloud layers and cloud movement est. from total cloud and surface wind. Scene appearance modifies the source weather data. Offshore sampling is hourly forecast data, not radar. Missing UV, radiation or visibility remain unavailable.</p><p>Sun and Moon: positional astronomy at ${SITE.lat.toFixed(4)}°, ${SITE.lon.toFixed(4)}°. Sea-facing bearing ${SITE.facing}°.</p>${state.data.attribution?'<p><span aria-label="Apple Weather"> Weather</span> · <a href="https://weatherkit.apple.com/legal-attribution.html" target="_blank" rel="noopener">Other data sources</a></p>':''}</details>`;
 return sharedMethod(kind).replaceAll('typical Gulf two-bar profile',textHTML(SITE.bars.source)).replaceAll('NWS FLZ108','NWS '+textHTML(SITE.surfZone||'unavailable')).replaceAll('NOAA predictions at station 8729210','NOAA predictions at station '+textHTML(SITE.tideStation||'unavailable')).replaceAll('South Walton',textHTML(SITE.surfName||SITE.name));
};
