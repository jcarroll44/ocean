import {Capacitor} from '@capacitor/core';
import {CapacitorUpdater} from '@capgo/capacitor-updater';
import {init,captureMessage,captureException} from '@sentry/capacitor';
const config=__DAYBUOY_NATIVE_CONFIG__;
if(Capacitor.isNativePlatform()){
 // WKWebView sends target=_blank to the system browser. Local legal pages
 // must stay on capacitor://localhost so they also open without a network.
 document.addEventListener('click',event=>{const a=event.target.closest?.('a');if(a&&['/privacy.html','/credits.html'].includes(a.getAttribute('href'))){event.preventDefault();location.assign(a.href);}},{capture:true});
 if(config.sentryDsn)init({dsn:config.sentryDsn,environment:config.channel,release:config.release,
  sendDefaultPii:false,tracesSampleRate:0,enableAutoSessionTracking:false,enableCaptureFailedRequests:false,
  enableNativeLogs:false,enableLogs:false,maxBreadcrumbs:0,
  beforeSend(event){delete event.user;delete event.request;delete event.breadcrumbs;return event;}
 });
 const sent=new Map();
 window.addEventListener('daybuoy:diagnostic',event=>{
  const {source,code}=event.detail||{};
  if(!['forecast','weather','marine','air','tide','tideHiLo','nws-surf','renderer'].includes(source)||code!=='refresh-failed'&&code!=='unavailable')return;
  const key=source+':'+code;if(Date.now()-(sent.get(key)||0)<15*60e3)return;sent.set(key,Date.now());
  if(config.sentryDsn)captureMessage('DayBuoy feed unavailable',{level:'warning',tags:{feed:source,code}});
 });
 window.addEventListener('daybuoy:ready',()=>{
  CapacitorUpdater.notifyAppReady().catch(error=>{if(config.sentryDsn)captureException(error);});
 },{once:true});
 // Widget cold launches start at now by default; warm launches use this event.
 document.addEventListener('visibilitychange',()=>{if(!document.hidden&&window.__daybuoyPendingNow){window.__daybuoyPendingNow=false;window.dispatchEvent(new Event('daybuoy:now'));}});
}
