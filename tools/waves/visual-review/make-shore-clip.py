"""Capture the shipped shorebreak shaders/camera via EGL; never a browser capture."""
import argparse,json,math,subprocess,sys
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont

ROOT=Path(__file__).resolve().parents[3]
ap=argparse.ArgumentParser();ap.add_argument('--out',required=True);ap.add_argument('--fps',type=int,default=30);ap.add_argument('--width',type=int,default=1200);ap.add_argument('--height',type=int,default=600);ap.add_argument('--frames',default='/tmp/shore-movie');ap.add_argument('--reuse',action='store_true');a=ap.parse_args()
out=Path(a.out);out.parent.mkdir(parents=True,exist_ok=True);frames=Path(a.frames);frames.mkdir(parents=True,exist_ok=True)
manifest=[]
for h in [2,4,6]:
 duration=12.3*math.sqrt(h/4);n=math.ceil(duration*a.fps);folder=frames/str(h)
 times=[i/a.fps for i in range(n)]
 if not a.reuse:
  subprocess.run([sys.executable,str(ROOT/'tools/waves/visual-review/render_inlet.py'),'--height',str(h),'--times',','.join(f'{t:.6f}' for t in times),'--out',str(folder),'--width',str(a.width),'--size-y',str(a.height)],check=True)
 manifest.append({'heightFt':h,'durationSeconds':n/a.fps,'frames':n,'folder':str(folder)})
font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',20)
bold=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',28)
total_h=a.height+64
enc=subprocess.Popen(['ffmpeg','-v','error','-y','-f','rawvideo','-pixel_format','rgb24','-video_size',f'{a.width}x{total_h}','-framerate',str(a.fps),'-i','-','-an','-c:v','libx264','-preset','medium','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart',str(out)],stdin=subprocess.PIPE)
for part in manifest:
 for i in range(part['frames']):
  im=Image.new('RGB',(a.width,total_h),'#f5f7f3');im.paste(Image.open(Path(part['folder'])/f'{i:04d}.png'),(0,0));d=ImageDraw.Draw(im)
  d.text((24,a.height+14),f"{part['heightFt']} ft",font=bold,fill='#163e43')
  d.text((125,a.height+21),'Shorebreak · fixed beach camera',font=font,fill='#4b6c6d')
  x0,x1=a.width-310,a.width-40;y=a.height+32;d.line((x0,y,x1,y),fill='#b8cfca',width=3)
  for h in [2,4,6]:
   x=x0+(h-2)/4*(x1-x0);r=7 if h==part['heightFt'] else 4;d.ellipse((x-r,y-r,x+r,y+r),fill='#127b7c' if h==part['heightFt'] else '#b8cfca')
  enc.stdin.write(im.tobytes())
enc.stdin.close();assert enc.wait()==0
data={'source':'exact app shaders rendered in Mesa EGL','browserCapture':False,'phoneTested':False,'fps':a.fps,'camera':'default preview beach camera, fixed across all three heights','segments':manifest,'file':str(out)}
out.with_suffix('.json').write_text(json.dumps(data,indent=2))
# Internal QA sheet: before break, standing face, explosion, swash, drainage.
thumb_w=384;thumb_h=round(a.height*thumb_w/a.width);sheet=Image.new('RGB',(thumb_w*5,(thumb_h+28)*3),'#12333a');d=ImageDraw.Draw(sheet)
for row,part in enumerate(manifest):
 for col,phase in enumerate([2.5,4.7,5.9,7.6,11.8]):
  idx=min(part['frames']-1,round(phase*math.sqrt(part['heightFt']/4)*a.fps));im=Image.open(Path(part['folder'])/f'{idx:04d}.png').resize((thumb_w,thumb_h))
  x,y=col*thumb_w,row*(thumb_h+28);sheet.paste(im,(x,y+28));d.text((x+8,y+6),f"{part['heightFt']} ft · {['Approach','Throw','Impact','Thin wash','Backwash + next'][col]}",fill='white')
sheet.save(frames/'review.jpg',quality=94)
print(json.dumps({'clip':str(out),'seconds':sum(p['durationSeconds'] for p in manifest),'review':str(frames/'review.jpg')}),flush=True)
