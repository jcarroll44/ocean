import {Group,Mesh,BufferGeometry,BufferAttribute} from '../vendor/tidewater/src/engine/index.js';
import {Material} from '../vendor/tidewater/src/engine/render/Material.js';
import {LAYERS} from '../vendor/tidewater/src/core/SceneRenderer.js';
// Native geometry for the existing approved solar arc and forecast rain rings.
// Share CPU arrays once, then update transforms/uniforms; never copy an image.
export class NativeOverlays{
 constructor(scene){this.root=new Group();this.root.rotation.y=Math.PI;scene.add(this.root);this.objects=new Map();}
 update(sources=[]){
  const retained=new Set(sources);
  for(const [source,item] of this.objects)if(!retained.has(source)){item.mesh.removeFromParent();item.mesh.geometry.dispose();item.mesh.material.dispose();this.objects.delete(source);}
  for(const source of sources){
   let item=this.objects.get(source);
   if(!item){
    const geometry=new BufferGeometry();
    for(const key of ['position','normal','uv','color']){const a=source.geometry.attributes[key];if(a)geometry.setAttribute(key,new BufferAttribute(new Float32Array(a.array),a.itemSize));}
    if(source.geometry.index)geometry.setIndex(new BufferAttribute(new Uint32Array(source.geometry.index.array),1));
    const material=new Material({lit:false,lightingHooks:false,vertexColors:!!source.geometry.attributes.color,transparent:true,opacity:source.material.opacity,side:'double',depthWrite:false,depthTest:source.material.depthTest});
    material.uniforms.color.value.copy(source.material.color);
    const mesh=new Mesh(geometry,material);mesh.layers.set(LAYERS.TRANSPARENT);mesh.renderOrder=source.renderOrder;mesh.frustumCulled=false;this.root.add(mesh);
    item={mesh,versions:{}};this.objects.set(source,item);
   }
   const mesh=item.mesh;mesh.visible=source.visible;mesh.position.copy(source.position);mesh.quaternion.copy(source.quaternion);mesh.scale.copy(source.scale);mesh.material.opacity=source.material.opacity;
   for(const key of ['position','color']){const a=source.geometry.attributes[key],b=mesh.geometry.attributes[key];if(a&&b&&item.versions[key]!==a.version){b.array.set(a.array);b.needsUpdate=true;item.versions[key]=a.version;}}
  }
 }
}
