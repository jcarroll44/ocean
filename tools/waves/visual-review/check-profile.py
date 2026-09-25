"""Read back actual shader geometry, break patterns and runup/return positions."""
import json,sys
from pathlib import Path
import moderngl,numpy as np
sys.path.insert(0,str(Path(__file__).resolve().parent));from render_inlet import source
root=Path(__file__).resolve().parents[3]
ctx=moderngl.create_standalone_context(backend='egl');ctx.simple_framebuffer((1,1)).use()
code=json.load(open('/tmp/rig-programs.json'))['rig']
p=ctx.program(vertex_shader=source(code['vertex'],True),varyings=['vRigPos'])
def set_values(program,values):
 for k,v in values.items():
  if k in program:program[k].value=v
set_values(p,{'uRigAngle':0.,'uRigBreakOffset':0.,'uTide':0.,'uRigCurl':1.,'uRigPeel':1.,'uRigEvent':0.})
for k in ['projectionMatrix','modelViewMatrix']:
 if k in p:p[k].write(np.eye(4,dtype='f4').tobytes())
v=np.array([(0,q) for q in np.linspace(0,.80,1001)],dtype='f4');b=ctx.buffer(v.tobytes());o=ctx.buffer(reserve=len(v)*12);vao=ctx.vertex_array(p,[(b,'2f','aRig')]);measurements=[]
for h in [1,2,4,6]:
 set_values(p,{'uRigHeight':h*.3048,'uRigTime':4.2*np.sqrt(h/4)})
 vao.transform(o,vertices=len(v));xyz=np.frombuffer(o.read(),dtype='f4').reshape(-1,3)
 height=float(np.ptp(xyz[:,1])/.3048);assert abs(height/h-1)<.07,(h,height)
 measurements.append({'nominalHeightFt':h,'standingHeightFt':height})
v=np.array([(x,q) for x in np.linspace(-40,40,41) for q in np.linspace(-.1,1.1,281)],dtype='f4');b=ctx.buffer(v.tobytes());o=ctx.buffer(reserve=len(v)*12);vao=ctx.vertex_array(p,[(b,'2f','aRig')]);checks=0
for h in [1,2,4,6]:
 for curl in [.65,1.5]:
  for event in [0,1,2,3,4,5]:
   for t in [0,2.5,4.2,4.7,5.,5.3,5.6,6.,7.6,9.4]:
    set_values(p,{'uRigHeight':h*.3048,'uRigTime':t*np.sqrt(h/4),'uRigCurl':curl,'uRigEvent':event})
    vao.transform(o,vertices=len(v));xyz=np.frombuffer(o.read(),dtype='f4').reshape(-1,3)
    assert np.isfinite(xyz).all(),(h,curl,event,t)
    checks+=1
common=(root/'review/breaking-wave/surface.glsl').read_text()
probe=ctx.program(vertex_shader='#version 330\n'+common+'\nin float aX;out vec3 result;void main(){result=vec3(rig_mode(),rig_ageAt(aX),rig_frontAt(aX,rig_ageAt(aX)));}',varyings=['result'])
v=np.array([-10,0,10],dtype='f4');buf=ctx.buffer(v.tobytes());out=ctx.buffer(reserve=36);probe_vao=ctx.vertex_array(probe,[(buf,'1f','aX')]);set_values(probe,{'uRigHeight':1.2192,'uRigTime':4.2,'uRigPeel':1.,'uRigBreakOffset':0.})
patterns={0:0,1:0,2:0,3:0};closeout_spread=[]
for event in range(100):
 set_values(probe,{'uRigEvent':event});probe_vao.transform(out,vertices=3);r=np.frombuffer(out.read(),dtype='f4').reshape(-1,3);mode=int(r[0,0]);patterns[mode]+=1
 if mode==0:closeout_spread.append(float(np.ptp(r[:,1])))
assert patterns[0]>50 and min(patterns.values())>0,patterns
assert .20<max(closeout_spread)<.60
fronts=[]
for age in [1.2,2.,3.4,5.3,7.8]:
 set_values(probe,{'uRigTime':age+4.2,'uRigEvent':0.});probe_vao.transform(out,vertices=3);r=np.frombuffer(out.read(),dtype='f4').reshape(-1,3);fronts.append(float(r[1,2]))
assert max(fronts)>-1.7 and fronts[-1]<fronts[2]-4.,fronts
v=np.array([(0,.485),(0,.34)],dtype='f4');buf=ctx.buffer(v.tobytes());out=ctx.buffer(reserve=24);lip_vao=ctx.vertex_array(p,[(buf,'2f','aRig')]);throw=[]
for age in [.30,.55,.80,1.10,1.15]:
 set_values(p,{'uRigHeight':1.2192,'uRigCurl':1.,'uRigEvent':0.,'uRigTime':age+4.41})
 lip_vao.transform(out,vertices=2);xyz=np.frombuffer(out.read(),dtype='f4').reshape(-1,3)
 throw.append({'localAge':age,'lipHeightM':float(xyz[0,1]),'lipForwardZ':float(xyz[0,2]),'crestHeightM':float(xyz[1,1])})
assert throw[1]['lipHeightM']>.75*1.2192 and throw[3]['lipHeightM']<.2*1.2192,throw
assert throw[3]['lipForwardZ']-throw[1]['lipForwardZ']>.25*1.2192,throw
assert min(t['crestHeightM'] for t in throw)>.85*1.2192,throw
seam=ctx.program(vertex_shader='#version 330\n'+common+'\nin float aX;out vec2 result;void main(){float a=rig_washAge(aX);result=vec2(a,rig_frontAt(aX,a));}',varyings=['result'])
v=np.array([-10,0,10],dtype='f4');buf=ctx.buffer(v.tobytes());out=ctx.buffer(reserve=24);seam_vao=ctx.vertex_array(seam,[(buf,'1f','aX')]);set_values(seam,{'uRigHeight':1.2192,'uRigPeel':1.,'uRigBreakOffset':0.})
seams=[]
for time,event in [(9.5,0),(0,1)]:
 set_values(seam,{'uRigTime':time,'uRigEvent':event});seam_vao.transform(out,vertices=3);seams.append(np.frombuffer(out.read(),dtype='f4').copy())
seam_error=float(np.max(np.abs(seams[0]-seams[1])));assert seam_error<.0001,seam_error
report={'standingHeightChecks':measurements,'finiteGeometryCombinations':checks,'breakPatternCountsIn100':patterns,'maxCloseoutTimingSpreadSeconds':max(closeout_spread),'runupFrontZ':fronts,'actualVertexThrowSamples':throw,'backwashLoopContinuityError':seam_error,'passed':True}
(root/'tools/waves/visual-review/profile-check.json').write_text(json.dumps(report,indent=2));print(json.dumps(report,indent=2))
