import sys,json,moderngl,numpy as np
sys.path.insert(0,str(__import__('pathlib').Path(__file__).resolve().parent));from render_inlet import source
ctx=moderngl.create_standalone_context(backend='egl');ctx.simple_framebuffer((1,1)).use();code=json.load(open('/tmp/rig-programs.json'))['rig'];p=ctx.program(vertex_shader=source(code['vertex'],True),varyings=['vRigPos']);q=np.linspace(0,1,1001);v=np.array([(0,x) for x in q],dtype='f4');b=ctx.buffer(v.tobytes());o=ctx.buffer(reserve=len(v)*12);vao=ctx.vertex_array(p,[(b,'2f','aRig')]);results=[]
for h in [2,4,6]:
 for t in [2.4,3.6,4.2,5.5]:
  for k,x in {'uRigHeight':h*.3048,'uRigTime':t*np.sqrt(h/4),'uRigAngle':0.,'uRigBreakOffset':0.,'uTide':0.}.items():
   if k in p:p[k].value=x
  for k in ['projectionMatrix','modelViewMatrix']:
   if k in p:p[k].write(np.eye(4,dtype='f4').tobytes())
  vao.transform(o,vertices=len(v));xyz=np.frombuffer(o.read(),dtype='f4').reshape(-1,3)
  if not np.isfinite(xyz).all():raise ValueError('Nonfinite geometry')
  results.append({'heightSettingFt':h,'phaseSecondsAt4ft':t,'profileHeightFt':float(np.ptp(xyz[:,1])/.3048),'hasOverhang':bool((np.diff(xyz[:,2])<-.00001).any()),'lowestLipAboveSeaM':float(xyz[480:511,1].min())})
print(json.dumps(results,indent=2));open('tools/waves/visual-review/profile-check.json','w').write(json.dumps(results,indent=2))
