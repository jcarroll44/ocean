// Diagnostic presentation only. The ordinary app never calls this adapter.
import {GPU} from '../vendor/tidewater/src/engine/gpu/GPU.js';
import {FullscreenPass} from '../vendor/tidewater/src/engine/render/FullscreenPass.js';
import {ACES_WGSL} from '../vendor/tidewater/src/post/PostFX.js';
export function installPostBypass(app,composite){
 const pass=new FullscreenPass({label:'Profile direct scene presentation',colorFormats:[GPU.format],
  bindings:{profileScene:{texture:()=>app.sceneRenderer.sceneRT.texture}},
  code:ACES_WGSL+`\nfn fragment(in:FSIn)->vec4f {
   let c=textureSampleLevel(profileScene,smpLinearClamp,in.uv,0.0).rgb;
   return vec4f(linearToSrgb(acesFilmicToneMapping(c,frame.exposure)),1.0);
  }`});
 // Keep beginFrame/endFrame (target sizes, camera uniforms, history bookkeeping).
 // This replaces the wrapper too, so neither full PostFX nor final mask/overlay
 // composition runs. A single tone-map draw still presents real ocean pixels.
 app.post.render=()=>pass.render({colorViews:[composite.context?composite.context.getCurrentTexture().createView():composite.water],clear:[0,0,0,1]});
 return pass;
}
