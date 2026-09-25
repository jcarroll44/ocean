"""Render the exact app background/rig GLSL and dune camera through Mesa EGL.
This is a shader-reference capture, never a browser/iPhone capture.
"""
import argparse,json,math
from pathlib import Path
import moderngl,numpy as np
from PIL import Image,ImageDraw,ImageFont
def lookat(eye,target):
 e=np.array(eye,dtype='f4');f=np.array(target,dtype='f4')-e;f/=np.linalg.norm(f)
 right=np.cross(f,[0,1,0]);right/=np.linalg.norm(right);up=np.cross(right,f)
 m=np.eye(4);m[:3,:3]=np.array([right,up,-f]);m[:3,3]=-m[:3,:3]@e;return m

def source(code,vert):
 head='#version 330\n#define texture2D texture\n#define textureCube texture\n'
 head+=('#define attribute in\n#define varying out\n' if vert else '#define varying in\nout vec4 finalColor;\n#define gl_FragColor finalColor\n')
 head+='uniform mat4 modelMatrix,modelViewMatrix,projectionMatrix,viewMatrix;uniform mat3 normalMatrix;uniform vec3 cameraPosition;\n'
 if vert:head+='in vec3 position,normal;in vec2 uv;\n'
 return head+code

def main():
 ap=argparse.ArgumentParser();ap.add_argument('--times',default='1,2.6,3.5,4.5,5.5,6.5');ap.add_argument('--out',default='/tmp/rig-inlet');ap.add_argument('--height',type=float,default=4);ap.add_argument('--width',type=int,default=960);ap.add_argument('--size-y',type=int,default=640);ap.add_argument('--close',action='store_true');ap.add_argument('--wide',action='store_true');ap.add_argument('--tuning',default='{}');a=ap.parse_args();out=Path(a.out);out.mkdir(parents=True,exist_ok=True)
 ctx=moderngl.create_standalone_context(backend='egl');codes=json.loads(Path('/tmp/rig-programs.json').read_text())
 ps={n:ctx.program(vertex_shader=source(codes[n]['vertex'],True),fragment_shader=source(codes[n]['fragment'],False)) for n in ['background','rig','rigSpray','rigVolume']}
 volumevao=ctx.vertex_array(ps['rigVolume'],[(ctx.buffer(np.array([[-1,-1,0],[1,-1,0],[-1,1,0],[-1,1,0],[1,-1,0],[1,1,0]],dtype='f4').tobytes()),'3f','position')])
 sprayvao=ctx.vertex_array(ps['rigSpray'],[(ctx.buffer(Path('/tmp/rig-particles.bin').read_bytes()),'4f','aParticle')]);ctx.enable(moderngl.PROGRAM_POINT_SIZE)
 vbo=ctx.buffer(Path('/tmp/rig-v.bin').read_bytes());ibo=ctx.buffer(Path('/tmp/rig-i.bin').read_bytes());vao=ctx.vertex_array(ps['rig'],[(vbo,'2f','aRig')],ibo)
 quad=np.array([[-1,-1,0,0,0],[1,-1,0,1,0],[-1,1,0,0,1],[-1,1,0,0,1],[1,-1,0,1,0],[1,1,0,1,1]],dtype='f4');qvao=ctx.vertex_array(ps['background'],[(ctx.buffer(quad.tobytes()),'3f 2f','position','uv')])
 eye=[0,10,26];pitch=math.radians(-11);target=[0,10+108*math.sin(pitch),26-108*math.cos(pitch)];f=.84/.59;shear=.13/.59
 if not a.wide:
  eye=[0,.9 if a.close else 1.2,-.5];target=[0,eye[1]-100*math.tan(math.radians(10)),-100.5];f=1/math.tan(math.radians(50)/2);shear=0
 view=lookat(eye,target);near=.1;far=2500;projection=np.array([[f/(a.width/a.size_y),0,0,0],[0,f,-shear,0],[0,0,(far+near)/(near-far),2*far*near/(near-far)],[0,0,-1,0]],dtype='f4');vp=projection@view
 vals={'uResolution':(a.width,a.size_y),'uTime':30.,'uPhase':5.,'uHour':12.,'uSwell':.1524,'uWind':4.34,'uCloud':.05,'uPeriod':6.,'uRain':0.,'uVisibility':24000.,'uTide':0.,'uDirection':0.,'uWindDirection':-1.93,'uSun':(-.40,.86,-.30),'uCloudLayers':(.025,.01,.02),'uCloudQuality':0.,'uMoon':(0,-1,0),'uMoonInfo':(0,.00454,0,0),'uDark':0.,'uYaw':0.,'uPitch':pitch,'uZoom':.84,'uExposure':1.,'uClarity':.85,'uGlow':.35,'uShear':.13,'uFoamOrigin':(-70,-60),'uBakeOn':0.,'uBakeBounds':(-1,1,-1,1),'uRigTime':0.,'uRigHeight':a.height*.3048,'uRigAngle':0.,'uRigBreakOffset':0.,'uRigEye':eye,'uViewportHeight':a.size_y,'cameraPosition':eye,'uChoppiness':.5,'uSwellK':.3}
 def color(s):
  srgb=[int(s[i:i+2],16)/255 for i in [1,3,5]]
  return tuple(v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4 for v in srgb)
 vals.update({'uRigCurl':1.,'uRigPeel':1.,'uRigFoam':1.,'uRigSpray':1.,'uRigLipGlow':.8,'uRigEvent':0.,'uRigWaterColor':color('#148c90'),'uRigFoamColor':color('#f2f8f5')});vals.update(json.loads(a.tuning))
 zero=ctx.texture((1,1),4,bytes([0,0,0,0]));zero.use(0)
 for p in ps.values():
  for k,v in vals.items():
   if k in p:p[k].value=v
  for k,m in [('modelMatrix',np.eye(4)),('modelViewMatrix',view),('viewMatrix',view),('projectionMatrix',projection),('uRigInvVP',np.linalg.inv(vp)),('uGalactic',np.eye(3)),('normalMatrix',view[:3,:3])]:
   if k in p:p[k].write(m.T.astype('f4').tobytes())
 fbo=ctx.simple_framebuffer((a.width,a.size_y),components=3);fbo.use()
 times=list(map(float,a.times.split(',')))
 for i,t in enumerate(times):
  fbo.clear(0,0,0,1)
  for p in ps.values():
   for k,v in [('uRigTime',t),('uTime',30+t),('uPhase',5+t/6)]:
    if k in p:p[k].value=v
  ctx.disable(moderngl.DEPTH_TEST);qvao.render();ctx.enable(moderngl.DEPTH_TEST|moderngl.BLEND);ctx.blend_func=moderngl.SRC_ALPHA,moderngl.ONE_MINUS_SRC_ALPHA;vao.render();fbo.depth_mask=False;ctx.disable(moderngl.DEPTH_TEST);volumevao.render();ctx.enable(moderngl.DEPTH_TEST);sprayvao.render(moderngl.POINTS);fbo.depth_mask=True;ctx.disable(moderngl.BLEND)
  im=Image.frombytes('RGB',(a.width,a.size_y),fbo.read(components=3)).transpose(Image.Transpose.FLIP_TOP_BOTTOM);im.save(out/f'{i:04d}.png')
  if i%30==0 or len(times)<15:print(f'{i}/{len(times)} {t:.3f}',flush=True)
 (out/'evidence.json').write_text(json.dumps({'source':'Ocean app background + procedural rig GLSL','camera':{'position':eye,'target':target,'verticalFovDegrees':math.degrees(2*math.atan(1/f))},'heightFt':a.height,'backend':ctx.info['GL_RENDERER'],'browserCaptured':False,'iPhoneTested':False},indent=2))
if __name__=='__main__':main()
