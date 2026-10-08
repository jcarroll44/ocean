import {captureScreenshot,nativeCanvas} from './results-upload.js';
import {recordLiveCanvas} from './live-evidence.js';
export async function collectScreenshot(win,files,name,report){
 try{files.push({name,blob:await captureScreenshot(win)});}catch(error){(report.captureErrors??=[]).push({file:name,error:error.message});}
}
export async function collectClip(win,files,report,validate=()=>{}){
 try{const clip=await recordLiveCanvas(nativeCanvas(win),{validate,duration:10});files.push({name:'clip.'+clip.extension,blob:clip.blob});report.clip={...clip,blob:undefined,scope:'Displayed scene canvas from this device, recorded after all FPS measurements; browser chrome and HTML controls are not included.'};}
 catch(error){(report.captureErrors??=[]).push({file:'clip',error:error.message});}
}
