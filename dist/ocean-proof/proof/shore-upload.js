import {Texture} from '../vendor/tidewater/src/engine/gpu/Texture.js';
// Fill an unbound back texture, at most 256 KiB per submitted frame. Keep the
// old coherent field visible until BOTH replacement textures are complete.
export class ShoreUpload{
 constructor(field,direction){
  this.field=field;this.direction=direction;this.row=0;this.phase=0;
  this.texture=new Texture({label:'terrainShoreField',width:field.res,height:field.res,format:'rgba32float'});
  this.dirTexture=new Texture({label:'shoreDir',width:128,height:128,format:'rgba32float'});
 }
 step(){
  const width=this.phase?128:this.field.res,height=width;
  const rows=Math.min(height-this.row,Math.max(1,Math.floor(262144/(width*16))));
  const data=this.phase?this.direction:this.field.data,texture=this.phase?this.dirTexture:this.texture;
  texture.upload(data.subarray(this.row*width*4,(this.row+rows)*width*4),{width,height:rows,y:this.row});
  this.row+=rows;if(this.row<height)return false;
  this.row=0;return this.phase++===1;
 }
 commit(app,GPU){
  const terrain=app.terrainGPU,shore=app.shore,old=[terrain.shoreTexture,shore.dirTexture];
  app.shoreField=terrain.shoreField=this.field;terrain.shoreTexture=this.texture;
  terrain.shoreRes=this.field.res;terrain.uniforms.fields.shoreRes.value=this.field.res;
  shore.dirTexture=this.dirTexture;shore.dirMin.value.set(-190,-170);shore.dirSize.value=380;
  shore.uniforms.fields.dirOn.value=1;shore.dirRes=128;
  // Previously submitted commands remain valid; retirement follows this frame.
  GPU.onSubmit(null,()=>old.forEach(t=>t?.destroy()));
 }
}
