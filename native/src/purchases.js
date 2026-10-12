import {Purchases,LOG_LEVEL} from '@revenuecat/purchases-capacitor';
import {LocalNotifications} from '@capacitor/local-notifications';
import {entitlementState,offeringPlans} from '../../src/plus-model.js';
const IDS=Array.from({length:7},(_,i)=>7300+i);
export function installPurchases(config){
 let state={active:false,expires:0},packages=[];
 const publish=async info=>{state=entitlementState(info);window.dispatchEvent(new CustomEvent('daybuoy:entitlement',{detail:state}));window.webkit?.messageHandlers?.daybuoyMembership?.postMessage({expires:state.active?state.expires:0,apiBaseURL:config.apiBaseURL});if(!state.active)await cancelMorning();return state;};
 const ready=(async()=>{
  if(!/^appl_[A-Za-z0-9]+$/.test(config.revenueCatPublicKey||''))throw Error('App Store purchases are not configured');
  await Purchases.setLogLevel({level:LOG_LEVEL.ERROR});await Purchases.configure({apiKey:config.revenueCatPublicKey});
  await Purchases.addCustomerInfoUpdateListener(info=>{void publish(info);});return publish((await Purchases.getCustomerInfo()).customerInfo);
 })();ready.catch(()=>{});
 async function status(){await ready;return publish((await Purchases.getCustomerInfo()).customerInfo);}
 async function cancelMorning(){await LocalNotifications.cancel({notifications:IDS.map(id=>({id}))});}
 async function morning(data,ask=true){
  const member=await status();if(!member.active)throw Error('DayBuoy+ required');
  const permission=ask?await LocalNotifications.requestPermissions():await LocalNotifications.checkPermissions();if(permission.display!=='granted')throw Error('Notification permission unavailable');
  await cancelMorning();const zone=data.profile?.zone||'America/Chicago',stamp=new Intl.DateTimeFormat('en-US',{timeZone:zone,month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}).format(data.retrievedAt);
  const hour=t=>Number(new Intl.DateTimeFormat('en-US',{timeZone:zone,hour:'numeric',hourCycle:'h23'}).format(t)),rows=data.rows.filter(r=>r.time>Date.now()+60000&&r.time<member.expires&&hour(r.time)===7&&Number.isFinite(r.temperature)).slice(0,7);
  if(!rows.length)throw Error('Morning forecast unavailable');
  await LocalNotifications.schedule({notifications:rows.map((r,i)=>({id:IDS[i],title:(data.profile?.name||'Inlet Beach')+' · Morning forecast',body:Math.round(r.temperature)+'° · '+(Number.isFinite(r.swell)?r.swell.toFixed(1)+' ft waves est.':'waves unavailable')+' · '+(Number.isFinite(r.wind)?Math.round(r.wind)+' kt':'wind unavailable')+'. '+(data.weatherSource||'Forecast')+' / Open-Meteo Marine. Updated '+stamp+'.',schedule:{at:new Date(r.time)},extra:{action:'now'}}))});localStorage.setItem('daybuoy.morning','on');
 }
 window.daybuoyPurchases={status,async plans(){await ready;const o=await Purchases.getOfferings(),ids=o.current?.availablePackages.map(p=>p.product.identifier)||[];let e={};try{e=await Purchases.checkTrialOrIntroductoryPriceEligibility({productIdentifiers:ids});}catch{}packages=offeringPlans(o,e);return packages.map(({package:_,...p})=>p);},async purchase(id){await ready;const p=packages.find(p=>p.id===id);if(!p?.package)throw Error('Product unavailable');return publish((await Purchases.purchasePackage({aPackage:p.package})).customerInfo);},async restore(){await ready;return publish((await Purchases.restorePurchases()).customerInfo);},morning,async disableMorning(){localStorage.removeItem('daybuoy.morning');await cancelMorning();}};
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)void status().catch(()=>{});});
 window.addEventListener('daybuoy:forecast',e=>{if(localStorage.getItem('daybuoy.morning')==='on')void morning(e.detail,false).catch(()=>{});});
 LocalNotifications.addListener('localNotificationActionPerformed',()=>window.dispatchEvent(new Event('daybuoy:now')));
}
