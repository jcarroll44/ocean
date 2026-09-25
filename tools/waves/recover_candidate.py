"""Recover the candidate from the already-public sun/surf review plus wave fixes.

No separate compressed candidate backup needs to be published. The existing
review contains the earlier lighting/time pass. Remove only its review hooks,
then apply the independently authorized direction/wind corrections.
"""
import argparse,base64,gzip,hashlib,json,re,subprocess
from pathlib import Path
root=Path(__file__).resolve().parents[2]
p=argparse.ArgumentParser();p.add_argument('output');p.add_argument('--preview');a=p.parse_args()
preview=Path(a.preview) if a.preview else root/'review/sun-surf/app.html'
html=preview.read_text();patch=json.loads(gzip.decompress(base64.b64decode(re.search(r"atob\('([^']+)'\)",html)[1])))
b=subprocess.check_output(['git','show','bdc3ade:index.html'],cwd=root)
assert hashlib.sha256(b).hexdigest()==patch['sha']
for start,end,data in reversed(patch['ops']):b=b[:start]+base64.b64decode(data)+b[end:]
s=b.decode().replace('<title>Preview · BoBuoy','<title>BoBuoy',1)
s=s.replace('reviewReset(){renderer.setRenderTarget(foamA);renderer.clear();renderer.setRenderTarget(foamB);renderer.clear();renderer.setRenderTarget(null);breakingEvents.events=[];breakingEvents.serial=0;breakingEvents.scan=0;initialized=false;},','',1)
lines=s.splitlines(keepends=True)
for i,line in enumerate(lines):
    if line.startswith('async function loadForecast({allowSample=true}={}){return finalize('):
        lines[i]='async function loadForecast({allowSample=true}={}){\n'
    elif line.startswith('window.__review='):
        lines[i]='window.__ocean='+line.split('window.__ocean=',1)[1]
s=''.join(lines).replace('if(!new URLSearchParams(location.search).has("static"))requestAnimationFrame(frame);','requestAnimationFrame(frame);',1)
with Path(a.output).open('x') as f:f.write(s)
subprocess.run(['python3',str(root/'tools/waves/fix-input-response.py'),'--input',a.output],check=True)
print('Recovered source SHA-256:',hashlib.sha256(Path(a.output).read_bytes()).hexdigest())
