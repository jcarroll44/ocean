"""Build an isolated app preview from the complete current candidate.

The local candidate receives the independent direction/wind fixes. Experimental
mesh hooks and fixed conditions exist in this preview. Production waits for review.
"""
from pathlib import Path
import re,argparse

root=Path(__file__).resolve().parents[2]
p=argparse.ArgumentParser();p.add_argument('--source');a=p.parse_args()
source=Path(a.source).read_text() if a.source else (root/'index.html').read_text()

def replace(old,new,count=1):
    global source
    assert source.count(old)>=count,old[:100]
    source=source.replace(old,new,count)

replace('const environment = `','''const environment = `
uniform float uBakeOn;
uniform vec4 uBakeBounds;
''')
replace('vec3 sunDir(){','''float bakeMask(vec2 p){
 vec2 q=vec2(p.x,p.y-baseShore(p.x));
 float x=smoothstep(uBakeBounds.x,uBakeBounds.x+.6,q.x)*(1.0-smoothstep(uBakeBounds.y-.6,uBakeBounds.y,q.x));
 float z=smoothstep(uBakeBounds.z,uBakeBounds.z+1.0,q.y)*(1.0-smoothstep(uBakeBounds.w-.8,uBakeBounds.w,q.y));
 return x*z*uBakeOn;
}
vec3 sunDir(){''')
replace(' uniforms.uShoreMemory={value:null};',''' uniforms.uBakeOn={value:0};
 uniforms.uBakeBounds={value:new THREE.Vector4(-1,1,-1,1)};
 uniforms.uShoreMemory={value:null};''')
replace(' float depth=vWorld.y-bed(vWorld.xz);',''' if(bakeMask(vWorld.xz)>.55)discard;
 float depth=vWorld.y-bed(vWorld.xz);''')
replace('  renderer,camera,sky,buoy,','''  renderer,camera,sky,buoy,scene,ocean,spray,labPrograms:{environment,waves,waterLight},
  resetLab(){renderer.setRenderTarget(foamA);renderer.clear();renderer.setRenderTarget(foamB);renderer.clear();renderer.setRenderTarget(null);breakingEvents.events=[];breakingEvents.serial=0;breakingEvents.scan=0;initialized=false;},''')
replace("__e['shaderPrograms'] = shaderPrograms;","__e['labPrograms']={environment,waves,waterLight};\n__e['shaderPrograms'] = shaderPrograms;")
replace('renderer.setRenderTarget(null);renderer.clear();renderer.render(scene,camera);','''renderer.setRenderTarget(null);renderer.clear();if(this.beforeRender)this.beforeRender(dt);renderer.render(scene,camera);''')
replace('async function loadForecast({allowSample=true}={}){','''async function loadForecast({allowSample=true}={}){
 const fixture=finalize(__mods['sample.js'].sampleForecast(Date.parse('2026-09-24T17:00:00Z')));
 fixture.source='Wave Lab fixture';fixture.provisional=false;return fixture;
''')
replace('stepLapse(now,dt);stepView(dt);stepTimeDrag(dt);applyConditions(dt);applySky();frameHorizon(dt);',
        'stepLapse(now,dt);stepView(dt);stepTimeDrag(dt);applyConditions(dt);applySky();frameHorizon(dt);if(window.__waveLab?.tick)window.__waveLab.tick(dt);')
replace('window.__ocean={','window.__waveLab={THREE,uniforms,current,applyConditions,applySky,engine,state};window.__ocean={')
replace('<title>','<title>Wave Lab · ')
replace('</body>','<script src="baked-player.js"></script><script src="lab-controls.js"></script></body>')
(root/'review/wave-lab/app.html').write_text(source)
print('Built isolated Wave Lab app. Fixed inputs are explicitly labelled by its controls.')
