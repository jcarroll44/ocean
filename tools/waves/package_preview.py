"""Publish a compact, integrity-checked preview from the reviewed source lineage.

Run after build_preview.py and source/shader checks. The published root is
unchanged. Recover the source with recover_candidate.py from the already-public
sun/surf review. No separate compressed candidate archive is published.
"""
from pathlib import Path
import argparse,base64,difflib,gzip,hashlib,json,subprocess

root=Path(__file__).resolve().parents[2]
base=subprocess.check_output(['git','show','bdc3ade:index.html'],cwd=root)
digest=lambda b:hashlib.sha256(b).hexdigest()

def apply(patch):
    assert digest(base)==patch['sha'],'Production base differs from checkpoint'
    result=base
    for start,end,data in reversed(patch['ops']):
        result=result[:start]+base64.b64decode(data)+result[end:]
    assert digest(result)==patch['targetSha'],'Reconstructed candidate hash differs'
    return result

def make(target):
    old=base.splitlines(keepends=True);new=target.splitlines(keepends=True);offsets=[0]
    for line in old:offsets.append(offsets[-1]+len(line))
    patch={'sha':digest(base),'targetSha':digest(target),'ops':[
        [offsets[i],offsets[j],base64.b64encode(b''.join(new[k:l])).decode()]
        for tag,i,j,k,l in difflib.SequenceMatcher(None,old,new).get_opcodes() if tag!='equal']}
    assert apply(patch)==target
    return gzip.compress(json.dumps(patch,separators=(',',':')).encode(),mtime=0)

if __name__=='__main__':
    target=root/'review/wave-lab/app.html';html=target.read_bytes()
    assert b'window.__waveLab' in html,'Run build_preview.py before packaging'
    payload=base64.b64encode(make(html)).decode()
    loader='''<!doctype html><meta charset="utf-8"><title>BoBuoy Wave Lab loading</title><body style="background:#1a435a;color:white;font:16px system-ui">Loading wave preview…<script>
(async()=>{const response=await fetch('../../index.html?waveBase=bdc3ade');if(!response.ok)throw Error('Cannot load published base');let bytes=new Uint8Array(await response.arrayBuffer());const hash=async b=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',b)),x=>x.toString(16).padStart(2,'0')).join('');const patch=JSON.parse(await new Response(new Blob([Uint8Array.from(atob('PAYLOAD'),x=>x.charCodeAt(0))]).stream().pipeThrough(new DecompressionStream('gzip'))).text());if(await hash(bytes)!==patch.sha)throw Error('Preview base changed; rebuild the wave preview');for(const [a,b,data] of patch.ops.reverse()){const chunk=Uint8Array.from(atob(data),x=>x.charCodeAt(0)),next=new Uint8Array(a+chunk.length+bytes.length-b);next.set(bytes.subarray(0,a));next.set(chunk,a);next.set(bytes.subarray(b),a+chunk.length);bytes=next;}if(await hash(bytes)!==patch.targetSha)throw Error('Wave preview integrity check failed');document.open();document.write(new TextDecoder().decode(bytes));document.close();})().catch(e=>document.body.textContent=e.message);
</script>'''.replace('PAYLOAD',payload)
    target.write_text(loader)
    print('Preview bytes:',target.stat().st_size)
