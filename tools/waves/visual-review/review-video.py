"""Decode the delivered MP4, sample its actual frames and flag temporal jumps.

This is evidence for visual review, not an automatic aesthetic acceptance test.
"""
import argparse,json,subprocess
from pathlib import Path
import numpy as np
from PIL import Image,ImageDraw,ImageFont

ap=argparse.ArgumentParser();ap.add_argument('video');ap.add_argument('--out',default='/tmp/shore-encoded-review');a=ap.parse_args()
video=Path(a.video);out=Path(a.out);out.mkdir(parents=True,exist_ok=True)
meta=json.loads(video.with_suffix('.json').read_text());fps=meta['fps'];cuts=[];total=0
for segment in meta['segments']:
 cuts.append(total);total+=segment['frames']
decoder=subprocess.Popen(['ffmpeg','-v','error','-i',str(video),'-vf','scale=300:166','-f','rawvideo','-pix_fmt','rgb24','-'],stdout=subprocess.PIPE)
previous=None;deltas=[];count=0
while True:
 raw=decoder.stdout.read(300*166*3)
 if not raw:break
 assert len(raw)==300*166*3
 frame=np.frombuffer(raw,dtype='u1').reshape(166,300,3).astype('i2')
 if previous is not None and count not in cuts:
  deltas.append((float(np.mean(np.abs(frame[:150]-previous[:150]))),count))
 previous=frame;count+=1
assert decoder.wait()==0 and count==total,(count,total)
largest=sorted(deltas,reverse=True)[:12]
(out/'temporal.json').write_text(json.dumps({'decodedFrames':count,'durationSeconds':count/fps,'segmentStarts':cuts,'largestFrameMeanPixelChanges':[{'frame':i,'timeSeconds':i/fps,'meanChangeOutOf255':d} for d,i in largest],'note':'Segment cuts excluded. Statistics flag candidates; manual frame review is required.'},indent=2))
sample_step=round(fps/2)
subprocess.run(['ffmpeg','-v','error','-y','-i',str(video),'-vf',f"select='not(mod(n,{sample_step}))',scale=480:-1",'-fps_mode','vfr',str(out/'sample-%03d.jpg')],check=True)
images=sorted(out.glob('sample-*.jpg'));font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',15)
for page in range((len(images)+17)//18):
 selected=images[page*18:(page+1)*18];sheet=Image.new('RGB',(480*3,(266+25)*((len(selected)+2)//3)),'#15353d');draw=ImageDraw.Draw(sheet)
 for j,path in enumerate(selected):
  im=Image.open(path);x=(j%3)*480;y=(j//3)*291;sheet.paste(im,(x,y+25));draw.text((x+8,y+3),f'{(page*18+j)*sample_step/fps:.1f} s',font=font,fill='white')
 sheet.save(out/f'contact-{page+1}.jpg',quality=94)
print(json.dumps({'decodedFrames':count,'seconds':count/fps,'largestChanges':largest[:6],'reviewFolder':str(out)}))
