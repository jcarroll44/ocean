// Additive product boundary; the accepted gesture handlers remain unchanged.
let plusState={active:false,expires:0},plusPlans=null,plusChoice='annual',plusBusy=false,paywallFocus=null;
const plusActive=()=>plusState.active&&plusState.expires>Date.now();
const plusNative=()=>window.daybuoyPurchases;
const plusToday=t=>{const d=localDayStart(Date.now());return t>=d&&t<localDayStart(d+36*HOUR);};
const plusTime=setTime,plusDay=selectForecastDay,plusSheet=renderSheet;
setTime=function(t,options){if(!state.fixture&&!plusActive()&&!plusToday(t)){openPaywall('The whole week, in motion.');return;}return plusTime(t,options);};
selectForecastDay=function(day){if(!state.fixture&&!plusActive()&&!plusToday(day)){openPaywall('The whole week, in motion.');return;}return plusDay(day);};
renderSheet=function(){plusSheet();const area=$('#sheet-content');if(!area.querySelector('[data-plus]'))area.insertAdjacentHTML('beforeend',`<div class="plus-sheet-actions"><button data-plus>${plusActive()?'DayBuoy+ settings':'Explore DayBuoy+'}</button><button data-forecast-data>Forecast data</button><button data-share-clip>Share a clip</button></div>`);};
function plusEntitlement(value){plusState=value||{active:false,expires:0};if(!plusActive()&&!plusToday(state.time)&&!state.fixture)backToNow();state.dirty=true;if($('#plus-modal')&&!$('#plus-modal').hidden)drawPaywall();}
window.addEventListener('daybuoy:entitlement',e=>plusEntitlement(e.detail));
function paywallStatus(message){const el=$('#plus-status');if(el)el.textContent=message;}
function closePaywall(){const el=$('#plus-modal');if(el)el.hidden=true;paywallFocus?.focus?.({preventScroll:true});}
function drawPaywall(){
 let modal=$('#plus-modal');if(!modal){modal=document.createElement('section');modal.id='plus-modal';modal.className='plus-overlay';modal.hidden=true;modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-labelledby','plus-title');$('#app').append(modal);}
 const plan=plusPlans?.find(p=>p.id===plusChoice),active=plusActive();
 modal.innerHTML=`<div class="plus-panel"><button class="plus-close" aria-label="Close DayBuoy+">×</button><div class="plus-mark">${homeIcon('water')}</div><p class="plus-kicker">DAYBUOY<span>+</span></p><h2 id="plus-title">${active?'Your beach, all week.':'Stay a little longer.'}</h2><p class="plus-intro">The whole week, in motion.</p><ul class="plus-features"><li>Seven days of ocean, sky & tide</li><li>Conditions on your Home Screen</li><li>A morning conditions notification</li><li>Share clips without the watermark</li></ul>${active?`<div class="plus-member">DayBuoy+ is active</div><button class="plus-primary" data-morning>Turn on morning forecast</button><button class="plus-secondary" data-morning-off>Turn off morning forecast</button><p class="plus-fine">Add DayBuoy from your iPhone’s widget gallery. Morning forecasts are prepared from the latest download; opening the app refreshes them.</p><a class="plus-secondary" href="https://apps.apple.com/account/subscriptions" target="_blank" rel="noopener">Manage subscription</a>`:`<div class="plus-plans">${['annual','monthly'].map(id=>{const p=plusPlans?.find(p=>p.id===id),price=p?.price||(id==='annual'?'$19.99':'$2.99');return `<button class="plus-plan" data-plan="${id}" aria-pressed="${plusChoice===id}"><span>${id==='annual'?'Yearly':'Monthly'}<small>${p?.trial?'7 days free':p?.available?'Auto-renewing':'US pricing · App Store confirmation'}</small></span><strong>${textHTML(price)}<small>/${id==='annual'?'year':'month'}</small></strong></button>`;}).join('')}</div><button class="plus-primary" data-purchase ${plusBusy||!plan?.available?'disabled':''}>${plusBusy?'Connecting…':plan?.trial?'Start 7-day free trial':'Continue with '+(plusChoice==='annual'?'yearly':'monthly')}</button><p class="plus-fine">${plan?.trial?'7 days free, then ':''}${textHTML(plan?.price||(plusChoice==='annual'?'$19.99':'$2.99'))} per ${plusChoice==='annual'?'year':'month'}. Automatically renews unless cancelled in App Store settings. Trial available to eligible new subscribers only. Today is always free.</p>`}<p id="plus-status" class="plus-status" role="status">${!plusNative()?'Purchases open in the iPhone app. This preview does not charge you.':''}</p><footer><button data-restore ${plusBusy?'disabled':''}>Restore purchases</button><a href="/terms.html" target="_blank" rel="noopener">Terms</a><a href="/privacy.html" target="_blank" rel="noopener">Privacy</a></footer></div>`;
}
async function openPaywall(){paywallFocus=document.activeElement;cancelTimeMotion();drawPaywall();$('#plus-modal').hidden=false;$('#plus-modal .plus-close').focus({preventScroll:true});
 if(plusNative())try{plusPlans=await plusNative().plans();plusEntitlement(await plusNative().status());drawPaywall();}catch{paywallStatus('Subscriptions are temporarily unavailable. Today remains free.');}
}
async function runPurchase(restore=false){
 if(plusBusy)return;if(!plusNative()){paywallStatus('Restore and purchases are available in the iPhone app.');return;}
 plusBusy=true;drawPaywall();try{plusEntitlement(await (restore?plusNative().restore():plusNative().purchase(plusChoice)));paywallStatus(plusActive()?'DayBuoy+ is ready.':restore?'No active DayBuoy+ subscription was found.':'Purchase is awaiting App Store confirmation.');}catch(e){paywallStatus(e?.userCancelled?'Purchase cancelled.':e?.pending?'Purchase is awaiting approval.':'The App Store could not finish. Please try again.');}finally{plusBusy=false;$('#plus-modal')?.querySelectorAll('[disabled]').forEach(b=>b.disabled=false);}
}
function showForecastData(){
 openSheet('air');const rows=state.data.rows.filter(r=>r.time>=localDayStart(Date.now()));
 $('#sheet-content').innerHTML=`<h2 class="sheet-title">Forecast data</h2><p class="sheet-source">${textHTML(state.data.weatherSource||'Forecast')} · Updated ${textHTML(clock(state.data.retrievedAt))}. Weather readings remain free. DayBuoy+ adds the week’s animated scene and native features.</p><div class="raw-forecast"><table><thead><tr><th>Local time</th><th>Air</th><th>Wind</th><th>UV</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${textHTML(weekday(r.time)+' '+clock(r.time))}</td><td>${statNumber(r.temperature)}°</td><td>${statNumber(r.wind)} kt</td><td>${statNumber(r.uv,1)}</td></tr>`).join('')}</tbody></table></div>${forecastMethod('air')}`;
}
document.addEventListener('click',e=>{
 if(e.target.closest('[data-plus]'))openPaywall();if(e.target.closest('.plus-close'))closePaywall();
 const plan=e.target.closest('[data-plan]');if(plan&&!plusBusy){plusChoice=plan.dataset.plan;drawPaywall();}
 if(e.target.closest('[data-purchase]'))runPurchase();if(e.target.closest('[data-restore]'))runPurchase(true);
 if(e.target.closest('[data-forecast-data]'))showForecastData();
 if(e.target.closest('[data-morning]')&&plusActive())plusNative()?.morning(state.data).then(()=>paywallStatus('Morning forecast enabled for 7:00 AM, beach local time.')).catch(()=>paywallStatus('Notification permission is off. Change it in iPhone Settings.'));
 if(e.target.closest('[data-morning-off]'))plusNative()?.disableMorning().then(()=>paywallStatus('Morning forecast is off.'));
 if(e.target.closest('[data-share-clip]'))shareBeachClip();
});
document.addEventListener('keydown',e=>{const m=$('#plus-modal');if(!m||m.hidden)return;if(e.key==='Escape'){e.preventDefault();closePaywall();}if(e.key==='Tab'){const a=[...m.querySelectorAll('button:not([disabled]),a[href]')],i=a.indexOf(document.activeElement);if(e.shiftKey&&i<=0){e.preventDefault();a.at(-1)?.focus();}else if(!e.shiftKey&&i===a.length-1){e.preventDefault();a[0]?.focus();}}});
plusNative()?.status().then(plusEntitlement).catch(()=>{});
// Shared time links cannot bypass today's boundary before this layer loads.
if(!plusToday(state.time)&&!state.fixture&&state.data.source!=='review')backToNow();
