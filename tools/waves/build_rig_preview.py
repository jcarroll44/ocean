"""Rebuild the isolated procedural-wave preview from the preserved lighting pass."""
from pathlib import Path
import base64,re,subprocess,tempfile
from package_preview import make

root=Path(__file__).resolve().parents[2]
lab=root/'review/wave-lab/app.html';target=root/'review/breaking-wave/app.html'
original=lab.read_bytes();loader=target.read_text()
try:
 with tempfile.TemporaryDirectory(prefix='ocean-rig-') as temp:
  candidate=Path(temp)/'candidate.html'
  subprocess.run(['python3',str(root/'tools/waves/recover_candidate.py'),str(candidate)],check=True)
  subprocess.run(['python3',str(root/'tools/waves/build_preview.py'),'--source',str(candidate)],check=True)
  s=lab.read_text()
finally:
 lab.write_bytes(original)
s=s.replace('<script src="baked-player.js"></script><script src="lab-controls.js"></script>','<script src="rig-player.js?v=shore03"></script><script src="rig-controls.js?v=shore03"></script>')
# Steeper submerged beach face for shorebreak; dry sand and shoreline stay put.
s=s.replace('float bed(vec2 p){return .105*(p.y-baseShore(p.x));}', 'float bed(vec2 p){float d=p.y-baseShore(p.x);return d*mix(.26,.105,smoothstep(-.30,.10,d));}')
s=s.replace('uniform float uBakeOn;','uniform vec3 uRigEye;\nuniform mat4 uRigInvVP;\nuniform float uBakeOn;',1)
a=s.index(' vec2 uv=vUv*2.0-1.0;uv.x*=uResolution.x/uResolution.y;');b=s.index(' vec3 c=sky(rd,true);',a)
s=s[:a]+''' vec4 rayEnd=uRigInvVP*vec4(vUv*2.0-1.0,1.0,1.0);
 vec3 ro=uRigEye,rd=normalize(rayEnd.xyz/rayEnd.w-ro);
'''+s[b:]
s=s.replace(' uniforms.uBakeOn={value:0};',' uniforms.uRigEye={value:new THREE.Vector3(0,10,26)};uniforms.uRigInvVP={value:new THREE.Matrix4()};\n uniforms.uBakeOn={value:0};')
s=s.replace('if(this.beforeRender)this.beforeRender(dt);renderer.render(scene,camera);','if(this.beforeRender)this.beforeRender(dt);renderer.render(scene,camera);if(this.afterRender)this.afterRender();')
payload=base64.b64encode(make(s.encode())).decode()
loader=re.sub(r"atob\('[^']+'\)","atob('"+payload+"')",loader)
target.write_text(loader.replace('BoBuoy Wave Lab loading','Ocean breaking wave loading'))
print('Rebuilt isolated rig preview; production and earlier review preserved.')
