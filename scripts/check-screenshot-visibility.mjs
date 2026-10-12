import assert from 'node:assert/strict';
import {captureScreenshot} from '../ocean-proof/proof/results-upload.js';
const document=new EventTarget();document.hidden=false;globalThis.document=document;
const hide=()=>{document.hidden=true;document.dispatchEvent(new Event('visibilitychange'));};
let copied=0,encode;
const original=()=>true,api={draw:original},canvas={width:390,height:844};
const win={__daybuoy:{engine:{getSceneCanvas:()=>canvas}},document:{
 getElementById:()=>({contentWindow:{__daybuoyOcean:api}}),
 createElement:()=>({getContext:()=>({drawImage(){copied++;}}),toBlob:f=>{encode=f;}})
}};
// A hidden page must reject immediately and restore the native draw hook.
let pending=captureScreenshot(win);hide();await assert.rejects(pending,/hidden/);
assert.equal(api.draw,original);assert.equal(copied,0);
document.hidden=false;
pending=captureScreenshot(win);api.draw();await Promise.resolve();
assert.equal(api.draw,original);hide();document.hidden=false;encode(new Blob(['test pixels']));
await assert.rejects(pending,/hidden/,'A hide-return during PNG encoding also invalidates the image');
// Retrying uses a fresh completed draw and produces exactly one file.
pending=captureScreenshot(win);api.draw();await Promise.resolve();encode(new Blob(['fresh capture']));
assert.equal(await (await pending).text(),'fresh capture');assert.equal(api.draw,original);
console.log('PASS: hidden screenshot interrupts immediately; draw hooks/listeners recover; hide-return during encoding rejects; foreground retry succeeds. Mock canvas only.');
