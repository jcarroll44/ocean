// Syntax/semantic compilation only. Dawn null does not render an image.
import assert from 'node:assert/strict';
const {create,globals}=await import('/workspace/sites/daybuoy-app-v2-preview/node_modules/webgpu/index.js');Object.assign(globalThis,globals);
Object.defineProperty(globalThis,'navigator',{value:{gpu:create(['backend=null'])},configurable:true});
const {GPU}=await import('../vendor/tidewater/src/engine/gpu/GPU.js');await GPU.init({headless:true});
const {Texture}=await import('../vendor/tidewater/src/engine/gpu/Texture.js');const {setShadowMap}=await import('../vendor/tidewater/src/engine/render/wgsl/lighting.js');setShadowMap(new Texture({width:1,height:1,depth:4,dimension:'2d-array',format:'depth32float'}));
await import('../vendor/tidewater/src/engine/render/Frame.js');
const {Scene}=await import('../vendor/tidewater/src/engine/index.js');
const {createLandward}=await import('../proof/landward.js');
const {composeShader}=await import('../vendor/tidewater/src/engine/gpu/Shader.js');
const {buildMeshShader}=await import('../vendor/tidewater/src/engine/render/MeshShader.js');
const root=createLandward({scene:new Scene(),terrainData:{heightAt:()=>3}});
const unique=[...new Set(root.children.map(x=>x.material))];
for(const material of unique){
 const layout=[{name:'position',wgsl:'vec3f',location:0},{name:'normal',wgsl:'vec3f',location:1},...[0,1,2,3].map((n)=>({name:'instanceMatrix'+n,wgsl:'vec4f',location:2+n,instanced:true}))];
 const src=buildMeshShader(material,layout,{kind:'main'});
 const composed=composeShader({...src,stage:'render'});
 const module=GPU.device.createShaderModule({code:composed.code});const info=await module.getCompilationInfo();
 assert.equal(info.messages.filter(x=>x.type==='error').length,0,JSON.stringify(info.messages));
}
console.log('PASS: six coastal material shaders compile, including instanced wind and fog, on Dawn null. No rendered claim.');process.exit(0);
