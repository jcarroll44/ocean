"""Losslessly deduplicate BOBVAT1 triangle corners into BOBVAT2 GPU textures.

Positions and oct normals retain their exact exported bytes. Each native frame
has its own vertex and index table; no cross-frame correspondence is implied.
"""
import argparse,gzip,hashlib,json,math
from pathlib import Path
import numpy as np

p=argparse.ArgumentParser();p.add_argument('source');p.add_argument('destination');a=p.parse_args()
source=Path(a.source);out=Path(a.destination);out.mkdir(parents=True,exist_ok=True)
m=json.loads((source/'breaker.json').read_text());assert m['schema']=='BOBVAT1'
positions=np.frombuffer(gzip.decompress((source/m['files']['positions']['file']).read_bytes()),np.uint8).reshape(m['frameCount'],-1,8)
normals=np.frombuffer(gzip.decompress((source/m['files']['normals']['file']).read_bytes()),np.uint8).reshape(m['frameCount'],-1,4)
frames=[];peak=0
for i,count in enumerate(m['frameVertices']):
    original=np.concatenate((positions[i,:count],normals[i,:count]),axis=1)
    unique,first,indices=np.unique(original,axis=0,return_index=True,return_inverse=True)
    # First-use numbering preserves nearby triangle references and compresses
    # better than lexicographic ordering of half-float bytes.
    order=np.argsort(first);remap=np.empty_like(order);remap[order]=np.arange(len(order))
    unique=unique[order];indices=remap[indices]
    assert np.array_equal(unique[indices],original),'Index packing changed geometry'
    assert len(unique)<65536,'Vertex index overflow'
    frames.append((unique,indices));peak=max(peak,len(unique))
width=256
while math.ceil(peak/width)*m['frameCount']>4096:width*=2
rows=math.ceil(peak/width);height=rows*m['frameCount']
assert max(width,height)<=4096
iw=2048;ir=math.ceil(m['maxVertices']/2/iw);ih=ir*m['frameCount']
assert ih<=4096
pp=np.zeros((m['frameCount'],rows*width,8),np.uint8)
nn=np.zeros((m['frameCount'],rows*width,4),np.uint8)
ii=np.zeros((m['frameCount'],ir*iw*2),dtype='<u2')
for i,(unique,indices) in enumerate(frames):
    pp[i,:len(unique)]=unique[:,:8];nn[i,:len(unique)]=unique[:,8:]
    ii[i,:len(indices)]=indices
files={}
for key,name,data in [('positions','positions.f16.gz',pp),('normals','normals.oct8.gz',nn),('indices','indices.u16x2.gz',ii)]:
    raw=data.tobytes();packed=gzip.compress(raw,compresslevel=9,mtime=0);(out/name).write_bytes(packed)
    files[key]={'file':name,'bytes':len(packed),'decodedBytes':len(raw),'sha256':hashlib.sha256(packed).hexdigest()}
m.update(schema='BOBVAT2',width=width,height=height,rowsPerFrame=rows,maxUniqueVertices=peak,
         indexWidth=iw,indexHeight=ih,indexRowsPerFrame=ir,files=files,
         gpuTextureBytes=pp.nbytes+nn.nbytes+ii.nbytes,downloadBytes=sum(f['bytes'] for f in files.values()),
         indexPacking='RGBA8: RG = first little-endian uint16 index, BA = second')
(out/'breaker.json').write_text(json.dumps(m,indent=2))
print(json.dumps({k:m[k] for k in ['schema','frameCount','maxUniqueVertices','gpuTextureBytes','downloadBytes']},indent=2))
