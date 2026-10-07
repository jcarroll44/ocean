// Preview-only composition choices; no camera or interaction decisions.
const nightHeader=q.get('header')==='scene'?'scene':'verdict';
$('#app').dataset.header=nightHeader;
const nightLocation=document.createElement('p');nightLocation.id='night-location';$('#hero').prepend(nightLocation);
const nightOriginalPresentation=renderPresentation;
renderPresentation=function(){
 nightOriginalPresentation();const a=beachAnswer(),available=realForecast(),live=state.live&&state.data.source==='live'&&navigator.onLine!==false&&available;
 nightLocation.textContent=state.live?'Inlet Beach':`${weekday(state.time)} · ${clock(state.time)}`;nightLocation.dataset.live=String(live);
 const now=$('#back-to-now');now.textContent='Back to now';now.hidden=state.live;now.setAttribute('aria-label','Back to now');
 $('#source-label').hidden=true;
 const button=$('#moment-action');button.querySelector('.action-main').textContent=a.title;
 button.querySelector('.action-hint').textContent=state.refreshing?'Updating forecast…':a.detail;
 if(!available){
  $('#hero-temp').textContent='—';$('#hero-temp').setAttribute('aria-label','Temperature not available');
  for(const el of document.querySelectorAll('.metric strong,.metric .meaning,#days button small'))el.textContent='—';
  $('#headline').textContent='Your beach. Forecast on its way.';
  button.querySelector('.action-main').textContent='Reconnect for your beach outlook';
  $('#story-detail').textContent='Forecast readings will appear when connected.';
 }
 // State previews use real stored timestamps when available, never sample figures.
 const preview=q.get('state');
 if(preview==='offline'){$('#forecast-status').hidden=false;$('#forecast-status').textContent=available?`Offline preview · forecast from ${clock(state.data.retrievedAt)}`:'Offline preview · no saved forecast';}
 if(preview==='no-data'){
  $('#hero-temp').textContent='—';$('#headline').textContent='Forecast not available';$('#story-detail').textContent='Connect to load your beach outlook.';
  for(const el of document.querySelectorAll('.metric strong,.metric .meaning,#days button small'))el.textContent='—';
  button.querySelector('.action-main').textContent='Try the forecast again';button.querySelector('.action-hint').textContent='No readings are being shown';button.dataset.action='retry';
 }
};
renderPresentation();
window.addEventListener('message',e=>{if(e.origin===location.origin&&e.source===parent&&e.data?.type==='header-preview'&&['verdict','scene'].includes(e.data.value))$('#app').dataset.header=e.data.value;});
