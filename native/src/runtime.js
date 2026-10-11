import {Capacitor} from '@capacitor/core';
import {CapacitorUpdater} from '@capgo/capacitor-updater';
import {init,captureMessage,captureException} from '@sentry/capacitor';
import {Share} from '@capacitor/share';
import {Filesystem,Directory} from '@capacitor/filesystem';
const config=__DAYBUOY_NATIVE_CONFIG__;
if(Capacitor.isNativePlatform()){
 // Native share supports generated PNG/ICS files after asynchronous rendering.
 // Cache files are removed when the native share sheet closes.
 Object.defineProperty(navigator,'canShare',{configurable:true,value:({files=[]}={})=>files.length>0&&files.length<=3&&files.every(f=>f.size<=12*1024*1024)});
 Object.defineProperty(navigator,'share',{configurable:true,value:async({files=[],title,text,url}={})=>{
  const paths=[];
  try{const uris=[];for(const [i,file] of files.entries()){
   const path='daybuoy-share-'+Date.now()+'-'+i+(file.type==='text/calendar'?'.ics':'.png');
   const data=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result).split(',')[1]);reader.onerror=reject;reader.readAsDataURL(file);});
   const result=await Filesystem.writeFile({path,data,directory:Directory.Cache});paths.push(path);uris.push(result.uri);
  }await Share.share({title,text,url,files:uris});}
  finally{await Promise.allSettled(paths.map(path=>Filesystem.deleteFile({path,directory:Directory.Cache})));}
 }});
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
  if(!['forecast','weather','offshore','marine','air','tide','tideHiLo','nws-surf','renderer'].includes(source)||code!=='refresh-failed'&&code!=='unavailable')return;
  const key=source+':'+code;if(Date.now()-(sent.get(key)||0)<15*60e3)return;sent.set(key,Date.now());
  if(config.sentryDsn)captureMessage('DayBuoy feed unavailable',{level:'warning',tags:{feed:source,code}});
 });
 window.addEventListener('daybuoy:ready',()=>{
  CapacitorUpdater.notifyAppReady().catch(error=>{if(config.sentryDsn)captureException(error);});
 },{once:true});
 // Widget cold launches start at now by default; warm launches use this event.
 document.addEventListener('visibilitychange',()=>{if(!document.hidden&&window.__daybuoyPendingNow){window.__daybuoyPendingNow=false;window.dispatchEvent(new Event('daybuoy:now'));}});
}
