import assert from 'node:assert/strict';
import {isIPhone,screenAwake} from '../ocean-proof/proof/diagnostic-device.js';
assert(isIPhone({userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0)',maxTouchPoints:5}));
for(const [userAgent,maxTouchPoints] of [['iPhone',0],['iPad',5],['Macintosh',5],['Android Mobile',5],['iPod',5]])assert(!isIPhone({userAgent,maxTouchPoints}));
for(const mode of ['success','denied','unsupported']){
 const listeners=new Map(),events=[];let requests=0,releases=0,current;
 const doc={hidden:false,addEventListener:(k,v)=>listeners.set(k,v),removeEventListener:k=>listeners.delete(k)};
 const nav=mode==='unsupported'?{}:{wakeLock:{async request(kind){
  assert.equal(kind,'screen');requests++;if(mode==='denied')throw Error('OS policy');
  let released;current={released:false,addEventListener(k,fn){assert.equal(k,'release');released=fn;},async release(){this.released=true;releases++;released?.();}};return current;
 }}};
 const awake=screenAwake(nav,doc,()=>{},e=>events.push(e));
 await awake.start();
 if(mode==='success'){
  assert.equal(events.at(-1).state,'held');
  // Brightness changes have no visibility event and no cancellation path.
  await awake.retry();assert.equal(requests,1);
  doc.hidden=true;await current.release();listeners.get('visibilitychange')();assert.equal(requests,1);
  doc.hidden=false;listeners.get('visibilitychange')();await awake.retry();assert.equal(requests,2);assert.equal(events.at(-1).state,'held');
  await awake.stop();assert.equal(releases,2);await awake.retry();assert.equal(requests,2);
 }else assert.equal(events.at(-1).state,mode);
 await awake.dispose();assert.equal(listeners.size,0);
}
// Stop while an OS request is unresolved must not leak a subsequently granted lock.
let resolveRequest,released=0;
const awake=screenAwake({wakeLock:{request:()=>new Promise(resolve=>{resolveRequest=resolve;})}},{hidden:false,addEventListener(){},removeEventListener(){}});
const pending=awake.start();await awake.stop();resolveRequest({release:async()=>{released++;}});await pending;assert.equal(released,1);
console.log('PASS: strict iPhone gate; wake-lock grant, denial, unsupported API, foreground reacquire, release and pending-stop cleanup. Mock OS APIs, not a physical phone.');
