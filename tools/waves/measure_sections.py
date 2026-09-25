"""Measure a passing crest and following trough at fixed centerline gauges.

These are individual-wave gauge measurements, not significant wave height and
not a substitute for a measured breaker face or visual acceptance.
"""
import argparse,json
from pathlib import Path

p=argparse.ArgumentParser();p.add_argument('tank');a=p.parse_args();tank=Path(a.tank)
sections=json.loads((tank/'sections.json').read_text());meta=json.loads((tank/'tank.json').read_text())
rows=[]
for gauge in [6,8,10,12]:
    samples=[]
    for frame in sections:
        t=frame['time']
        if not 0<=t<=9:continue
        heights=[]
        for (x,z),(xx,zz) in frame['segments']:
            if min(x,xx)<=gauge<=max(x,xx) and x!=xx:
                heights.append(z+(zz-z)*(gauge-x)/(xx-x))
        if heights:samples.append((t,max(heights)))
    crest=max(samples,key=lambda s:s[1]);following=[s for s in samples if s[0]>crest[0]]
    if not following:continue
    trough=min(following,key=lambda s:s[1]);height=crest[1]-trough[1]
    rows.append(dict(gaugeYM=gauge,windowS=[0,9],crestTimeS=crest[0],crestM=crest[1],
                     followingTroughTimeS=trough[0],followingTroughM=trough[1],heightM=height,heightFt=height/.3048))
result=dict(targetIndividualHeightM=meta['targetIndividualHeightM'],gauges=rows,
    method='Top free-surface intersection at x=0 in exported simplified mesh; crest followed by trough within first 9 seconds.',
    limitations='Fixed-gauge individual height, not Hs or breaking-face height. Grid and decimation convergence, offshore reflections, and visual acceptance remain unvalidated.')
(tank/'measurements.json').write_text(json.dumps(result,indent=2));print(json.dumps(result,indent=2))
