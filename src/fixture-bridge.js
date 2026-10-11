// Private test build only. Removed in its entirety by build-production.mjs.
const fixtureRealForecast=realForecast,fixtureAdopt=adopt,fixtureRefresh=refresh,fixturePresentation=renderPresentation;
realForecast=function(){return state.data?.source==='fixture'&&state.fixture===true||fixtureRealForecast();};
adopt=function(data){if(state.fixture)return;fixtureAdopt(data);};
refresh=async function(){if(state.fixture)return;return fixtureRefresh();};
renderPresentation=function(){fixturePresentation();if(state.fixture){$('#source-label').textContent='FIXTURE · '+state.fixtureTitle;const b=$('#reference-banner');b.hidden=false;b.textContent='Synthetic weather fixture · not a live forecast';}};
window.__daybuoyFixture={apply(data){
 if(data?.source!=='fixture'||data.fixture!==true||!Array.isArray(data.rows)||data.rows.length!==193||!Number.isFinite(data.time))throw Error('Invalid private fixture');
 state.fixture=true;state.fixtureTitle=data.title;state.fixtureId=data.id;state.live=false;state.review=false;state.forecastFailed=false;state.forecastLoaded=true;
 state.data=finalize(data);state.data.version=++state.version;state.time=data.time;state.sheet=null;state.dirty=true;weatherPacketCache.key=null;
 stopWatch(true);resetBeach();
}};
