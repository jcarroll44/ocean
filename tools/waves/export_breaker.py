"""Export a baked Mantaflow free surface to a small, documented GPU atlas.

Own BOBVAT1 format, not a copy of an unlicensed third-party exporter.
Dynamic topology is sampled at native FPS. Never interpolate unrelated vertex
indices between remeshed frames. Positions are half-float; normals oct-encoded.
"""
import argparse
import gzip
import hashlib
import json
import math
import sys
from pathlib import Path
import bpy
import numpy as np

def args():
    p=argparse.ArgumentParser()
    p.add_argument('--tank', required=True)
    p.add_argument('--out', required=True)
    p.add_argument('--max-triangles', type=int, default=5000)
    p.add_argument('--first', type=int, default=1)
    p.add_argument('--last', type=int, default=0)
    p.add_argument('--step', type=int, default=1)
    return p.parse_args(sys.argv[sys.argv.index('--')+1:])

def surface_frame(domain, frame, meta, max_triangles):
    bpy.context.scene.frame_set(frame)
    dg=bpy.context.evaluated_depsgraph_get()
    obj=domain.evaluated_get(dg)
    mesh=obj.to_mesh()
    mesh.calc_loop_triangles()
    xyz=np.empty(len(mesh.vertices)*3,dtype=np.float32)
    mesh.vertices.foreach_get('co',xyz)
    xyz=xyz.reshape(-1,3)
    mat=np.array(domain.matrix_world,dtype=np.float32)
    xyz=xyz@mat[:3,:3].T+mat[:3,3]
    ids=np.empty(len(mesh.loop_triangles)*3,dtype=np.int32)
    mesh.loop_triangles.foreach_get('vertices',ids)
    ids=ids.reshape(-1,3)
    center=xyz[ids].mean(axis=1)
    tri_normals=np.empty(len(mesh.loop_triangles)*3,dtype=np.float32)
    mesh.loop_triangles.foreach_get('normal',tri_normals)
    tri_normals=tri_normals.reshape(-1,3)
    bed=np.maximum(-meta['depthM'],meta['slope']*(center[:,1]-meta['shoreY']))
    keep=(center[:,2]>bed+meta['voxelSizeM']*.4)&(center[:,1]>3)&(center[:,1]<meta['tankLengthM']-.5)
    # Collision skin is a mesh underside, not the free surface. Preserve actual
    # overturning lips farther above the bed, including their downward normals.
    keep&=~((tri_normals[:,2]<-.15)&(center[:,2]-bed<3*meta['voxelSizeM']))
    keep&=np.abs(center[:,0])<meta['widthM']/2-max(.18,meta['voxelSizeM']*.7)
    ids=ids[keep]
    obj.to_mesh_clear()
    if not len(ids):
        return np.zeros((0,3),np.float32),np.zeros((0,3),np.float32)
    # Keep only the visible free surface, then simplify that surface as needed.
    used,inverse=np.unique(ids,return_inverse=True)
    surface=bpy.data.meshes.new('Export free surface')
    surface.from_pydata(xyz[used].tolist(),[],inverse.reshape(-1,3).tolist())
    surface.update()
    temp=bpy.data.objects.new('Export surface',surface)
    bpy.context.collection.objects.link(temp)
    if len(ids)>max_triangles:
        dec=temp.modifiers.new('Mobile surface budget','DECIMATE')
        dec.ratio=max_triangles/len(ids)
        dec.use_collapse_triangulate=True
    dg=bpy.context.evaluated_depsgraph_get()
    evaluated=temp.evaluated_get(dg)
    sm=evaluated.to_mesh()
    sm.calc_loop_triangles()
    vertices=np.array([v.co[:] for v in sm.vertices],dtype=np.float32)
    normals=np.array([v.normal[:] for v in sm.vertices],dtype=np.float32)
    tris=np.array([t.vertices[:] for t in sm.loop_triangles],dtype=np.int32)
    # Swap Blender Y/Z into browser Y-up and reverse winding for the reflection.
    tris=tris[:,[0,2,1]]
    pos=vertices[tris].reshape(-1,3)[:,[0,2,1]].copy()
    normal=normals[tris].reshape(-1,3)[:,[0,2,1]].copy()
    evaluated.to_mesh_clear()
    bpy.data.objects.remove(temp,do_unlink=True)
    bpy.data.meshes.remove(surface)
    return pos,normal

def oct_encode(n):
    n=n/np.maximum(np.abs(n).sum(axis=1,keepdims=True),1e-8)
    xy=n[:,:2].copy()
    folded=(1-np.abs(xy[:,::-1]))*np.where(xy>=0,1,-1)
    xy=np.where(n[:,2:3]>=0,xy,folded)
    return np.rint(np.clip(xy*.5+.5,0,1)*255).astype(np.uint8)

def cross_section(pos, x=0):
    """Triangle-plane intersections for visual inspection; preserves overhangs."""
    tris=pos.reshape(-1,3,3)
    segments=[]
    for tri in tris:
        d=tri[:,0]-x
        if d.min()>0 or d.max()<0:
            continue
        points=[]
        for i,j in [(0,1),(1,2),(2,0)]:
            if d[i]*d[j]<0:
                points.append((tri[i]+(tri[j]-tri[i])*d[i]/(d[i]-d[j]))[[2,1]].tolist())
        if len(points)==2:
            segments.append(points)
    return segments

def write_gzip(path, data):
    with gzip.GzipFile(filename=str(path),mode='wb',mtime=0,compresslevel=6) as f:
        f.write(data)
    return {'file':path.name,'bytes':path.stat().st_size,'sha256':hashlib.sha256(path.read_bytes()).hexdigest()}

def main():
    a=args()
    tank=Path(a.tank).resolve();out=Path(a.out).resolve();out.mkdir(parents=True,exist_ok=True)
    meta=json.loads((tank/'tank.json').read_text())
    bpy.ops.wm.open_mainfile(filepath=str(tank/'breaker.blend'))
    domain=bpy.data.objects['Water domain']
    frames=range(a.first,(a.last or meta['frameCount'])+1,a.step)
    samples=[];sections=[];counts=[]
    for frame in frames:
        pos,n=surface_frame(domain,frame,meta,a.max_triangles)
        if not np.isfinite(pos).all() or not np.isfinite(n).all():
            raise ValueError('Nonfinite surface at frame '+str(frame))
        samples.append((pos,n));counts.append(len(pos))
        sections.append({'frame':frame,'time':(frame-1)/meta['fps'],'segments':cross_section(pos)})
        if frame%15==0:
            print('EXPORT_FRAME',frame,'triangles',len(pos)//3,flush=True)
    peak=max(counts)
    if peak==0:
        raise ValueError('The baked mesh is empty; no asset written.')
    width=2048
    rows=math.ceil(peak/width)
    height=rows*len(samples)
    if height>4096:
        raise ValueError(f'Atlas {width}x{height} exceeds the 4096 mobile budget; reduce samples or triangles.')
    positions=np.zeros((height,width,4),dtype=np.float16)
    normals=np.zeros((height,width,4),dtype=np.uint8)
    # Coordinates centered for half-float precision, kept in metres.
    center=np.array([0,0,meta['tankLengthM']/2],dtype=np.float32)
    bounds_min=np.full(3,np.inf);bounds_max=-bounds_min
    worst_error=0
    for i,(pos,n) in enumerate(samples):
        if not len(pos):continue
        p=positions[i*rows:(i+1)*rows].reshape(-1,4)
        p[:len(pos),:3]=pos-center;p[:len(pos),3]=1
        normal=normals[i*rows:(i+1)*rows].reshape(-1,4)
        normal[:len(pos),:2]=oct_encode(n);normal[:len(pos),3]=255
        bounds_min=np.minimum(bounds_min,pos.min(axis=0));bounds_max=np.maximum(bounds_max,pos.max(axis=0))
        worst_error=max(worst_error,float(np.abs(p[:len(pos),:3].astype(np.float32)+center-pos).max()))
    files={
        'positions':write_gzip(out/'positions.f16.gz',positions.astype('<f2').tobytes()),
        'normals':write_gzip(out/'normals.oct8.gz',normals.tobytes()),
    }
    manifest=dict(schema='BOBVAT1',provenance=meta,frameCount=len(samples),fps=meta['fps']/a.step,
                  firstFrame=a.first,durationS=(len(samples)-1)/(meta['fps']/a.step),
                  width=width,height=height,rowsPerFrame=rows,maxVertices=peak,
                  frameVertices=counts,positionCenterM=center.tolist(),
                  boundsMinM=bounds_min.tolist(),boundsMaxM=bounds_max.tolist(),
                  files=files,gpuTextureBytes=int(positions.nbytes+normals.nbytes),
                  downloadBytes=sum(x['bytes'] for x in files.values()),
                  maxPositionQuantizationErrorM=worst_error,
                  interpolation='nearest-native-frame; dynamic topology has no vertex correspondence',
                  acceptance={'heightCalibrated':False,'visualAccepted':False,'iPhoneTested':False})
    (out/'breaker.json').write_text(json.dumps(manifest,indent=2))
    (tank/'sections.json').write_text(json.dumps(sections))
    print('EXPORT_COMPLETE',json.dumps({k:manifest[k] for k in ['frameCount','maxVertices','gpuTextureBytes','downloadBytes','maxPositionQuantizationErrorM']}),flush=True)

if __name__=='__main__':main()
