"""Validate and retain a completed specimen without asserting visual acceptance."""
import argparse,datetime,gzip,hashlib,json,os,shutil
from pathlib import Path

p=argparse.ArgumentParser();p.add_argument('tank');a=p.parse_args()
tank=Path(a.tank);root=Path(__file__).resolve().parents[2];source=tank/'indexed'
m=json.loads((source/'breaker.json').read_text());assert m['schema']=='BOBVAT2'
assert max(m['width'],m['height'],m['indexWidth'],m['indexHeight'])<=4096
assert m['gpuTextureBytes']<=32*1024*1024,'Single specimen exceeds its texture budget'
assert m['downloadBytes']<=15*1024*1024,'Single specimen exceeds its download guard'
for info in m['files'].values():
    packed=(source/info['file']).read_bytes()
    assert len(packed)==info['bytes']
    assert hashlib.sha256(packed).hexdigest()==info['sha256']
    assert len(gzip.decompress(packed))==info['decodedBytes']
m['measurements']=json.loads((tank/'measurements.json').read_text())
m['acceptance']={'heightCalibrated':False,'visualAccepted':False,'iPhoneTested':False}
run=os.getenv('GITHUB_RUN_ID');repo=os.getenv('GITHUB_REPOSITORY','jcarroll44/ocean')
m['buildRunUrl']=f'https://github.com/{repo}/actions/runs/{run}' if run else None
destination=root/'review/wave-lab/assets';destination.mkdir(parents=True,exist_ok=True)
for info in m['files'].values():shutil.copyfile(source/info['file'],destination/info['file'])
(destination/'breaker.json').write_text(json.dumps(m,indent=2)+'\n')
status={
 'updatedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),
 'stage':'specimen_exported_for_review','buildRunUrl':m['buildRunUrl'],
 'directionAndWindCodeChecked':True,'retainedBakeAvailable':True,
 'downloadBytes':m['downloadBytes'],'gpuTextureBytes':m['gpuTextureBytes'],
 'inAppClipRecorded':False,'visualAccepted':False,'physicalIPhoneTested':False,
 'productionRootChanged':False,'expandWaveLibrary':False,
 'remaining':['Inspect the breaking face and ocean seam in the app','Resolve foam and swash handoff','Record an in-app clip','Profile a physical iPhone'],
 'warning':'Measured approach height is not proof of breaking-face realism or significant wave height.'
}
(root/'tools/waves/STATUS.json').write_text(json.dumps(status,indent=2)+'\n')
print(json.dumps(status,indent=2))
