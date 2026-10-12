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
 // Private evidence framing only. Same approved night beach position and
 // existing manual-look path; true astronomical phase and bearing are intact.
 if(data.reviewView==='moon-facing'){
  const moon=moonPosition(data.time),yaw=((moon.azimuth-SITE.facing+540)%360-180)*RAD;
  if(moon.altitude>0&&Math.abs(yaw)<Math.PI/2)state.userLook={x:0,y:10,z:28,yaw,pitch:-11*RAD,fov:55,shear:0,anchorYaw:0};
 }
},beginScrub(){
 if(!state.fixture)throw Error('Private fixture required');
 cancelTimeMotion();stopWatch(true);state.scrubbing=true;setDockCompact(true);setSkyView(true);state.dirty=true;
 return selectedDayBounds();
},scrubTo(t){
 if(!state.fixture||!state.scrubbing)throw Error('Fixture scrub must be active');
 setTime(clampDay(t));
 return {time:state.time,conditions:conditions(),charm:skyCharm(conditions(),state.time).kind};
},endScrub(){state.scrubbing=false;setSkyView(false);dockRestoreAt=performance.now()+1500;state.dirty=true;}};
