(async function(){
 const lab=window.__waveLab,host=parent===window?document:parent.document,$=id=>host.getElementById(id);
 const status=$('status');if(!lab?.engine){status.textContent='This browser cannot start the 3D scene.';return;}
 let rig;try{rig=await createWaveRig(lab);}catch(e){status.textContent=e.message;console.error(e);return;}
 const {state,engine,uniforms:u}=lab;let height=4,time=0,event=0,playing=true,recording=null,auto=false,autoStep=0,recordCanvas=null,recordContext=null;
 engine.buoy.group.visible=false;state.live=false;state.prefs.motion=true;state.detent='peek';state.time=Date.parse('2026-09-25T17:00:00Z');
 // Fixed beach camera across heights; original dune view remains selectable.
 const hide=document.createElement('style');hide.textContent='#app>*:not(#ocean){visibility:hidden!important}';document.head.append(hide);
 const defaults={curl:1,glow:.8,foam:1,spray:1,peel:1,period:6,offset:0,water:'#148c90',white:'#f2f8f5'};let tuning={...defaults};
 try{const saved=JSON.parse(localStorage.getItem('ocean.shorebreak.look.v3')||'{}');for(const key of Object.keys(defaults)){const el=$(key),v=saved[key];if(el.type==='color'){if(/^#[0-9a-f]{6}$/i.test(v||''))tuning[key]=v;}else if(Number.isFinite(v))tuning[key]=Math.min(+el.max,Math.max(+el.min,v));}}catch(e){}
 function applyTuning(){for(const [key,v] of Object.entries(tuning)){const el=$(key);el.value=v;const out=$(key+'-out');if(out)out.textContent=Number(v).toFixed(key==='period'||key==='offset'?1:2)+(key==='curl'||key==='peel'?'×':key==='period'?' s':key==='offset'?' m':'');}rig.tune(tuning);try{localStorage.setItem('ocean.shorebreak.look.v3',JSON.stringify(tuning));}catch(e){}}
 host.querySelectorAll('[data-tune]').forEach(el=>el.oninput=()=>{const oldPeriod=tuning.period;tuning[el.id]=el.type==='color'?el.value:+el.value;if(el.id==='period')time*=tuning.period/oldPeriod;applyTuning();});
 $('reset-look').onclick=()=>{const oldPeriod=tuning.period;tuning={...defaults};time*=tuning.period/oldPeriod;applyTuning();};applyTuning();
 function setHeight(v){height=Math.min(6,Math.max(1,Number(v)||4));time=0;event=0;engine.resetLab();$('height').value=height;$('height-value').textContent=height.toFixed(1)+' ft';host.querySelectorAll('[data-height]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.height===height)));}
 $('height').oninput=e=>{auto=false;setHeight(e.target.value);};host.querySelectorAll('[data-height]').forEach(b=>b.onclick=()=>{auto=false;setHeight(b.dataset.height);});
 $('replay').onclick=()=>{time=0;playing=true;$('play').textContent='Pause';};$('play').onclick=()=>{playing=!playing;$('play').textContent=playing?'Pause':'Play';};
 $('compare').onclick=()=>{auto=true;autoStep=0;setHeight(2);playing=true;$('play').textContent='Pause';};
 $('phase').oninput=e=>{auto=false;playing=false;$('play').textContent='Play';time=+e.target.value*Math.sqrt(height/4)*tuning.period/6;};
 const previous=engine.beforeRender;engine.beforeRender=()=>{if(previous)previous();const cam=engine.camera,mode=$('view').value;
  if(mode==='wide')window.__ocean.setView(0,-11*Math.PI/180,.84);
  else{const eyeY=mode==='close'?.9:1.2;cam.position.set(0,eyeY,-.5);cam.lookAt(0,eyeY-100*Math.tan(10*Math.PI/180),-100.5);cam.fov=50;cam.updateProjectionMatrix();cam.updateMatrixWorld();}
  u.uRigEye.value.copy(cam.position);u.uRigInvVP.value.multiplyMatrices(cam.matrixWorld,cam.projectionMatrixInverse);
 };
 lab.tick=dt=>{
  if(playing)time+=Math.min(dt,.06);
  const duration=9.5*Math.sqrt(height/4)*tuning.period/6;
  if(time>=duration){if(auto&&autoStep<2){autoStep++;setHeight([2,4,6][autoStep]);}else if(recording){playing=false;recording.stop();}else{time=0;event++;if(auto){autoStep=0;setHeight(2);}}}
  state.sim={swell:.5,period:6,direction:201,wind:4.34,windDirection:90,cloud:5,rain:0,visibility:24000,tide:0,clarity:85};lab.applyConditions(60);
  rig.set(time,height,tuning.period,0,tuning.offset,event);u.uTime.value=30+time;u.uPhase.value=5+time/6;
  const phase=time/Math.sqrt(height/4)*6/tuning.period,a=phase-3.2;$('phase').value=phase;status.textContent=a<-.4?'Swell':a<.25?'Standing up':a<.90?'Feathering & pitching':a<1.8?'Shorebreak':a<3.2?'Foam rushing up the beach':'Backwash';
 };
 $('record').disabled=!window.MediaRecorder;
 engine.afterRender=()=>{if(!recording||!recordContext)return;const c=recordContext,w=recordCanvas.width,h=recordCanvas.height;c.drawImage(engine.renderer.domElement,0,0,w,h);const size=Math.max(18,w*.026);c.font='600 '+size+'px system-ui';const x=w*.04,y=h*.86,bw=w*.5,bh=size*2.5;c.fillStyle='rgba(246,249,244,.93)';c.fillRect(x,y,bw,bh);c.fillStyle='#16383d';c.fillText(height.toFixed(1)+' ft',x+size*.6,y+size*1.65);const left=x+size*5,right=x+bw-size;c.strokeStyle='#a8bcb7';c.lineWidth=4;c.beginPath();c.moveTo(left,y+bh*.5);c.lineTo(right,y+bh*.5);c.stroke();c.fillStyle='#126e71';c.beginPath();c.arc(left+(height-2)/4*(right-left),y+bh*.5,size*.3,0,Math.PI*2);c.fill();};
 $('record').onclick=()=>{if(recording){recording.stop();return;}auto=true;autoStep=0;setHeight(2);playing=true;
  const canvas=document.getElementById('ocean');recordCanvas=document.createElement('canvas');recordCanvas.width=canvas.width;recordCanvas.height=canvas.height;recordContext=recordCanvas.getContext('2d');const stream=recordCanvas.captureStream(30),type=['video/mp4;codecs=avc1','video/webm;codecs=vp9','video/webm'].find(v=>MediaRecorder.isTypeSupported(v));
  const chunks=[];try{recording=new MediaRecorder(stream,{...(type?{mimeType:type}:{}),videoBitsPerSecond:7000000});}catch(e){status.textContent=e.message;return;}
  recording.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};recording.onstop=()=>{const mime=recording.mimeType;recording=null;stream.getTracks().forEach(x=>x.stop());const a=$('download');if(a.href.startsWith('blob:'))URL.revokeObjectURL(a.href);a.href=URL.createObjectURL(new Blob(chunks,{type:mime}));a.download='breaking-wave-2-4-6ft.'+(mime.includes('mp4')?'mp4':'webm');a.hidden=false;$('record').textContent='Record clip';};recording.start();$('record').textContent='Stop recording';
 };
 window.__rigReview={setHeight,get height(){return height;},get time(){return time;},get tuning(){return {...tuning};},rig};setHeight(4);status.textContent='Building';
})();
