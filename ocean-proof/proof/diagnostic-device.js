// Strict browser-reported iPhone gate; this is not hardware attestation.
export const isIPhone=nav=>/\biPhone\b/i.test(nav.userAgent||'')&&nav.maxTouchPoints>0&&!/iPad|iPod|Android/i.test(nav.userAgent||'');

export function screenAwake(nav,doc,onStatus=()=>{},onEvent=()=>{}){
 let wanted=false,lock=null,pending=null;
 const note=(state,detail)=>{onStatus(detail);onEvent({state,detail,at:new Date().toISOString()});};
 const acquire=()=>{
  if(!wanted||doc.hidden||lock&&!lock.released)return Promise.resolve();
  if(pending)return pending;
  if(!nav.wakeLock?.request){note('unsupported','Auto-awake unavailable. Keep Safari visible and Auto-Lock off.');return Promise.resolve();}
  pending=(async()=>{
   try{
    const next=await nav.wakeLock.request('screen');
    if(!wanted||doc.hidden){await next.release();return;}
    lock=next;note('held','Screen kept awake · keep Safari visible.');
    next.addEventListener('release',()=>{if(lock===next){lock=null;if(wanted)note('released','Auto-awake released. Tap here to retry; keep Safari visible.');}});
   }catch(error){note('denied','Auto-awake unavailable. Tap here to retry or turn Auto-Lock off.');}
   finally{pending=null;}
  })();return pending;
 };
 const visible=()=>{if(!doc.hidden)void acquire();};
 doc.addEventListener('visibilitychange',visible);
 return {
  start(){wanted=true;return acquire();},retry:acquire,
  async stop(){wanted=false;const old=lock;lock=null;await old?.release();},
  async dispose(){doc.removeEventListener('visibilitychange',visible);await this.stop();}
 };
}
