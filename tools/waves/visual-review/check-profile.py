import sys,json,moderngl,numpy as np
sys.path.insert(0,str(__import__('pathlib').Path(__file__).resolve().parent));from render_inlet import source
ctx=moderngl.create_standalone_context(backend='egl');ctx.simple_framebuffer((1,1)).use();code=json.load(open('/tmp/rig-programs.json'))['rig'];p=ctx.program(vertex_shader=source(code['vertex'],True),varyings=['vRigPos']);q=np.linspace(0,1,1001);v=np.array([(0,x) for x in q],dtype='f4');b=ctx.buffer(v.tobytes());o=ctx.buffer(reserve=len(v)*12);vao=ctx.vertex_array(p,[(b,'2f','aRig')]);results=[]
for h in [2,4,6]:
 for t in [2.4,3.6,4.2,5.5]:
  for k,x in {'uRigHeight':h*.3048,'uRigTime':t*np.sqrt(h/4),'uRigAngle':0.,'uRigBreakOffset':0.,'uTide':0.,'uRigCurl':1.1,'uRigPeel':1.}.items():
   if k in p:p[k].value=x
  for k in ['projectionMatrix','modelViewMatrix']:
   if k in p:p[k].write(np.eye(4,dtype='f4').tobytes())
  vao.transform(o,vertices=len(v));xyz=np.frombuffer(o.read(),dtype='f4').reshape(-1,3)
  if not np.isfinite(xyz).all():raise ValueError('Nonfinite geometry')
  results.append({'heightSettingFt':h,'phaseSecondsAt4ft':t,'profileHeightFt':float(np.ptp(xyz[:,1])/.3048),'hasOverhang':bool((np.diff(xyz[:,2])<-.00001).any()),'lowestLipAboveSeaM':float(xyz[480:511,1].min())})
print(json.dumps(results,indent=2));open('tools/waves/visual-review/profile-check.json','w').write(json.dumps(results,indent=2))
for r in results:
 if r['phaseSecondsAt4ft']==2.4:assert abs(r['profileHeightFt']/r['heightSettingFt']-1)<.06
 if r['phaseSecondsAt4ft']==3.6:assert r['hasOverhang']
 if r['phaseSecondsAt4ft']==5.5:assert not r['hasOverhang'] and r['profileHeightFt']<r['heightSettingFt']*.5
v=np.array([(x,q) for x in np.linspace(-22,22,45) for q in np.linspace(-.1,1.1,281)],dtype='f4');b=ctx.buffer(v.tobytes());o=ctx.buffer(reserve=len(v)*12);vao=ctx.vertex_array(p,[(b,'2f','aRig')]);checks=0
for h in [2,4,6]:
 for curl in [.65,1.1,1.5]:
  for peel in [.5,1,2]:
   for t in [0,2.4,3.6,4.15,4.45,5.5,8.9]:
    for k,x in {'uRigHeight':h*.3048,'uRigTime':t*np.sqrt(h/4),'uRigCurl':curl,'uRigPeel':peel}.items():
     if k in p:p[k].value=x
    vao.transform(o,vertices=len(v));xyz=np.frombuffer(o.read(),dtype='f4').reshape(-1,3)
    assert np.isfinite(xyz).all(),(h,curl,peel,t)
    assert np.abs(xyz[:,1]).max()<h*.3048*1.5,(h,curl,peel,t)
    checks+=1
print(f'PASS: {checks} height/curl/peel/phase combinations; nominal scale, geometric overhang and post-impact collapse.')
