"""CPU reference render of exported geometry; NEVER an in-app/browser capture."""
import argparse,gzip,json,sys
from pathlib import Path
import bpy,numpy as np
from mathutils import Vector

p=argparse.ArgumentParser();p.add_argument('asset');p.add_argument('--frames',default='180,210,240,270');p.add_argument('--out',required=True)
a=p.parse_args(sys.argv[sys.argv.index('--')+1:]);asset=Path(a.asset);out=Path(a.out);out.mkdir(parents=True,exist_ok=True)
m=json.loads((asset/'breaker.json').read_text());assert m['schema']=='BOBVAT2'
pos=np.frombuffer(gzip.decompress((asset/m['files']['positions']['file']).read_bytes()),dtype='<f2').reshape(m['frameCount'],-1,4)
indices=np.frombuffer(gzip.decompress((asset/m['files']['indices']['file']).read_bytes()),dtype='<u2').reshape(m['frameCount'],-1)
bpy.ops.wm.read_factory_settings(use_empty=True);s=bpy.context.scene
s.render.engine='CYCLES';s.cycles.device='CPU';s.cycles.samples=24;s.cycles.use_denoising=True
s.render.resolution_x=960;s.render.resolution_y=640;s.render.resolution_percentage=100;s.render.image_settings.file_format='PNG';s.render.threads_mode='FIXED';s.render.threads=4
s.world=bpy.data.worlds.new('Neutral studio');s.world.use_nodes=True;s.world.node_tree.nodes['Background'].inputs[0].default_value=(.65,.72,.78,1);s.world.node_tree.nodes['Background'].inputs[1].default_value=.5
def material(name,color,roughness):
 mat=bpy.data.materials.new(name);mat.use_nodes=True;bs=mat.node_tree.nodes['Principled BSDF'];bs.inputs['Base Color'].default_value=(*color,1);bs.inputs['Roughness'].default_value=roughness;return mat
gray=material('Shape inspection clay',(.12,.27,.32),.28);sand=material('Idealized bed',(.66,.61,.48),.8)
shore=m['provenance']['shoreY'];slope=m['provenance']['slope']
verts=[(x,y,max(-2.4,slope*(y-shore))) for x in [-8,8] for y in [0,3,shore,36]]
bed=bpy.data.meshes.new('Bed');bed.from_pydata(verts,[],[(i,i+1,i+5,i+4) for i in range(3)]);bed.update();o=bpy.data.objects.new('Bed',bed);s.collection.objects.link(o);bed.materials.append(sand)
bpy.ops.object.light_add(type='AREA',location=(3,19,12));bpy.context.object.data.energy=2300;bpy.context.object.data.shape='DISK';bpy.context.object.data.size=7
bpy.ops.object.camera_add(location=(8,shore+1.5,3.1));cam=bpy.context.object;target=Vector((0,shore-5,.15));cam.rotation_euler=(target-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.lens=40;s.camera=cam
for requested in [int(x) for x in a.frames.split(',')]:
 i=max(0,min(m['frameCount']-1,requested-m['firstFrame']));count=m['frameVertices'][i]
 xyz=pos[i,:,:3].astype(np.float32)+np.array(m['positionCenterM']);xyz=xyz[:,[0,2,1]]
 tris=indices[i,:count].reshape(-1,3)[:,[0,2,1]]
 mesh=bpy.data.meshes.new('Baked geometry');mesh.from_pydata(xyz.tolist(),[],tris.tolist());mesh.update();mesh.materials.append(gray)
 for poly in mesh.polygons:poly.use_smooth=True
 water=bpy.data.objects.new('Actual exported fluid',mesh);s.collection.objects.link(water)
 s.render.filepath=str(out/f'frame-{requested:04}.png');bpy.ops.render.render(write_still=True)
 bpy.data.objects.remove(water,do_unlink=True);bpy.data.meshes.remove(mesh)
 print('REFERENCE_RENDER',requested,flush=True)
