// Quality adapter over the unmodified upstream implementation. Only the
// active ring budget, dispatched slots and drawn instances are changed.
import {Spray} from '../vendor/tidewater/src/fx/Spray.js';
import {UniformBlock,ShaderModule} from '../vendor/tidewater/src/engine/webgpu.js';
export class TunedSpray extends Spray {
 constructor(renderer,options){
  super(renderer,{...options,gpuCapacity:32768,cpuCapacity:256});
  this.maxGPU=this.NG;this.capacity=this.N;
  this.quality=new UniformBlock('SprayQuality',{activeGPU:['u32',32768]},{label:'spray budget'});
  this.module.deps.push(new ShaderModule({name:'sprayQuality',uniforms:this.quality,uniformName:'sprayQuality'}));
  const original='( SPRAY_NG - 1u )';if(!this.module.code.includes(original))throw Error('Pinned spray slot hook changed');
  this.module.code=this.module.code.replace(original,'( sprayQuality.activeGPU - 1u )');
 }
 setBudget(count){
  if(count<64||count>this.maxGPU||(count&(count-1)))throw Error('Spray budget must be a power of two');
  if(this.active===count)return;
  this.active=count;this.quality.fields.activeGPU.value=count;
  this.mesh.count=count;this.mesh.geometry.instanceCount=count;
  // Clear old inactive lifetimes before a manual quality increase.
  this.info.write(new Float32Array(this.capacity*4));
 }
 update(){
  // Compile once with original buffer boundaries. This scene has no CPU emitters.
  if(!this.updateKernel){this.NG=this.maxGPU;this._buildUpdate();}
  this.NG=this.active||this.maxGPU;this.N=this.NG;
  super.update();this.N=this.capacity;
 }
}
