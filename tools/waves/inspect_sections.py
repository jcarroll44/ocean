"""Plot measured fluid-surface sections, including overturning geometry."""
import argparse,json
from pathlib import Path
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.collections import LineCollection
import numpy as np

p=argparse.ArgumentParser();p.add_argument('tank');p.add_argument('--output',required=True)
a=p.parse_args();tank=Path(a.tank);meta=json.loads((tank/'tank.json').read_text())
sections=json.loads((tank/'sections.json').read_text())
indices=np.linspace(0,len(sections)-1,9).astype(int)
fig,axes=plt.subplots(3,3,figsize=(16,8),sharex=True,sharey=True)
for ax,idx in zip(axes.flat,indices):
    s=sections[idx]
    ax.add_collection(LineCollection(s['segments'],colors='#167e97',linewidths=1.5))
    y=np.linspace(0,meta['tankLengthM'],300);z=np.maximum(-meta['depthM'],meta['slope']*(y-meta['shoreY']))
    ax.fill_between(y,-3,z,color='#e8dfcf');ax.axhline(0,color='#a9b9bf',lw=.5)
    ax.set_title(f"{s['time']:.2f} s · frame {s['frame']}",fontsize=11)
    ax.set_xlim(3,meta['shoreY']+4);ax.set_ylim(-1,2.5);ax.set_aspect('equal',adjustable='box');ax.grid(alpha=.15)
for ax in axes[-1]:ax.set_xlabel('Toward shore (m)')
for ax in axes[:,0]:ax.set_ylabel('Elevation (m)')
fig.suptitle('Actual Mantaflow mesh: center section · uncalibrated 4 ft target',fontsize=15)
fig.tight_layout();fig.savefig(a.output,dpi=150);plt.close(fig)
