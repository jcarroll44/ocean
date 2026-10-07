// Tidewater draws only the ocean into DayBuoy's unchanged scene.
// The upstream FFT, ShoreWaves, Breakers, SurfFoam and ShoreSim are unmodified.
import {GPU} from '../vendor/tidewater/src/engine/gpu/GPU.js';
import {Texture} from '../vendor/tidewater/src/engine/gpu/Texture.js';
import {FullscreenPass} from '../vendor/tidewater/src/engine/render/FullscreenPass.js';
import {SCENE_FORMATS,DEPTH_FORMAT} from '../vendor/tidewater/src/engine/render/SceneRenderer.js';

export class OceanComposite {
 constructor(app){
  this.app=app;
  this.atlas=app.profileConfig?.pass==='atlas';
  this.base=new Texture({label:'DayBuoy unchanged beach and sky',format:'rgba8unorm',usage:['sample','copyDst','render']});
  this.overlay=this.atlas?this.base:new Texture({label:'DayBuoy rain and sun path',format:'rgba8unorm',usage:['sample','copyDst','render']});
  // Clamp inside each half, not across the atlas seam. At every output pixel
  // center this addresses the same source texel as the two-texture path.
  const uv=(name,half)=>this.atlas?`dbAtlasUV(in.uv,${half}.0)`:'in.uv';
  const atlasCode=this.atlas?`fn dbAtlasUV(uv:vec2f,half:f32)->vec2f {
   let dims=vec2f(textureDimensions(dbBase));let edge=0.5/dims;
   return clamp(vec2f((uv.x+half)*0.5,uv.y),vec2f(half*0.5,0.0)+edge,vec2f((half+1.0)*0.5,1.0)-edge);
  }`:'';
  this.water=new Texture({label:'Tidewater ocean output',format:GPU.format,usage:['sample','render','copySrc']});
  // Ocean quality may fall to DPR 1; the existing sky/land keep their original
  // output resolution. Only the ocean texture is scaled in the final pass.
  if(GPU.context){
   this.canvas=document.createElement('canvas');this.canvas.style.cssText='position:absolute;inset:0;width:100%;height:100%';
   app.engine.container.appendChild(this.canvas);app.engine.canvas.style.visibility='hidden';
   this.context=this.canvas.getContext('webgpu');this.context.configure({device:GPU.device,format:GPU.format,alphaMode:'opaque',usage:GPUTextureUsage.RENDER_ATTACHMENT|GPUTextureUsage.COPY_DST});
  }
  // Preserve native opaque terrain DEPTH for refraction and shore occlusion;
  // replace its colour and background with the actual DayBuoy scene pixels.
  this.background=new FullscreenPass({label:'DayBuoy scene background',colorFormats:SCENE_FORMATS,depthFormat:DEPTH_FORMAT,depthCompare:'always',writeMasks:[15,0,0],bindings:{dbBase:{texture:this.base}},code:`
   ${atlasCode}
   struct DBOut { @location(0) color:vec4f, @location(1) velocity:vec4f, @location(2) mask:vec4f };
   @fragment fn fs(in:FSIn)->DBOut {
    let c=textureSampleLevel(dbBase,smpLinearClamp,${uv('base',0)},0.0).rgb;
    var o:DBOut; o.color=vec4f(srgbToLinear(c),1.0); o.velocity=vec4f(0.0); o.mask=vec4f(0.0); return o;
   }`});
  app.sceneRenderer.background=this.background;
  // Native transparent lips and spray contribute coverage to the water mask.
  // No change to vertex positions, curl, simulation or shading.
  for(const m of [app.breakers.material,app.spray.material]){
   m.output+='\n r.mask=vec4f(0.0,0.0,1.0,r.color.a);';m.needsUpdate=true;
  }
  this.final=new FullscreenPass({label:'Ocean only over approved DayBuoy scene',colorFormats:[GPU.format],bindings:{dbBase:{texture:this.base},dbOverlay:{texture:this.overlay},dbWater:{texture:this.water},dbMask:{texture:app.sceneRenderer.waterMaskTexture}},code:`
   ${atlasCode}
   fn fragment(in:FSIn)->vec4f {
    let base=textureSampleLevel(dbBase,smpLinearClamp,${uv('base',0)},0.0);
    let sea=textureSampleLevel(dbWater,smpLinearClamp,in.uv,0.0);
    let mask=textureSampleLevel(dbMask,smpLinearClamp,in.uv,0.0);
    let coverage=smoothstep(0.001,0.04,max(mask.g,mask.b));
    let over=textureSampleLevel(dbOverlay,smpLinearClamp,${uv('overlay',1)},0.0);
    return vec4f(mix(base.rgb,sea.rgb,coverage)*(1.0-over.a)+over.rgb*over.a,1.0);
   }`});
  app.post.outputTexture=this.water;
  // Screen-space mask and imported scene must use the same unjittered camera.
  app.post.aaMode='fxaa';
  app.post.flare=null; // the existing app owns the one real sun/glow
  const postRender=app.post.render.bind(app.post);
  app.post.render=()=>{postRender();if(this.context)this.final.render({colorViews:[this.context.getCurrentTexture().createView()],clear:[0,0,0,1]});};
 }
 copyBase(canvas){const width=canvas.width/(this.atlas?2:1);if(this.canvas&&(this.canvas.width!==width||this.canvas.height!==canvas.height)){this.canvas.width=width;this.canvas.height=canvas.height;}this.copy(canvas,this.base);}
 copyOverlay(canvas){if(!this.atlas)this.copy(canvas,this.overlay);}
 copy(canvas,texture){
  texture.resize(canvas.width,canvas.height);
  GPU.queue.copyExternalImageToTexture({source:canvas},{texture:texture.getGPU(),premultipliedAlpha:false},{width:canvas.width,height:canvas.height});
 }
 resize(){this.water.resize(this.app.engine.width,this.app.engine.height);}
}
