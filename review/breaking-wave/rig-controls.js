(async function(){
 const lab=window.__waveLab,host=parent===window?document:parent.document,$=id=>host.getElementById(id);
 const status=$('status');if(!lab?.engine){status.textContent='This browser cannot start the 3D scene.';return;}
 let rig;try{rig=await createWaveRig(lab);}catch(e){status.textContent=e.message;console.error(e);return;}
 const {state,engine,uniforms:u}=lab;let height=4,time=0,playing=true,recording=null,auto=false,autoStep=0,recordCanvas=null,recordContext=null;
 engine.buoy.group.visible=false;state.live=false;state.prefs.motion=true;state.detent='peek';state.time=Date.parse('2026-09-25T17:00:00Z');
 // Isolated review: same scene and fixed dune camera, with one wave in focus.
 const hide=document.createElement('style');hide.textContent='#app>*:not(#ocean){visibility:hidden!important}';document.head.append(hide);
 window.__ocean.setView(0,-11*Math.PI/180,.84);
 function setHeight(v){height=Number(v);time=0;engine.resetLab();$('height').value=height;$('height-value').textContent=height.toFixed(1)+' ft';host.querySelectorAll('[data-height]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.height===height)));}
 $('height').oninput=e=>{auto=false;setHeight(e.target.value);};host.querySelectorAll('[data-height]').forEach(b=>b.onclick=()=>{auto=false;setHeight(b.dataset.height);});
 $('replay').onclick=()=>{time=0;playing=true;$('play').textContent='Pause';};$('play').onclick=()=>{playing=!playing;$('play').textContent=playing?'Pause':'Play';};
 $('compare').onclick=()=>{auto=true;autoStep=0;setHeight(2);playing=true;$('play').textContent='Pause';};
 let close=false;$('view').onclick=()=>{close=!close;$('view').textContent=close?'Beach camera':'Closer view';};
 const previous=engine.beforeRender;engine.beforeRender=()=>{if(previous)previous();if(close){const cam=engine.camera;cam.position.set(-9,1.1,-3.5);cam.lookAt(0,.5,-3.5-5.2*height*.3048);cam.fov=44;cam.updateProjectionMatrix();cam.updateMatrixWorld();}else{window.__ocean.setView(0,-11*Math.PI/180,.84);}u.uRigEye.value.copy(engine.camera.position);u.uRigInvVP.value.multiplyMatrices(engine.camera.matrixWorld,engine.camera.projectionMatrixInverse); };
 lab.tick=dt=>{
  if(playing)time+=Math.min(dt,.06);
  const duration=9.0*Math.sqrt(height/4);
  if(time>=duration){if(auto&&autoStep<2){autoStep++;setHeight([2,4,6][autoStep]);}else if(recording){playing=false;recording.stop();}else{time=0;if(auto){autoStep=0;setHeight(2);}}}
  state.sim={swell:.5,period:6,direction:201,wind:4.34,windDirection:90,cloud:5,rain:0,visibility:24000,tide:0,clarity:85};lab.applyConditions(60);
  rig.set(time,height);u.uTime.value=30+time;u.uPhase.value=5+time/6;
  const a=time/Math.sqrt(height/4)-2.7;status.textContent=a<-.2?'Building':a<.65?'Lip pitching forward':a<1.5?'Barrel':a<2.5?'Impact':a<4.5?'Whitewater & runup':'Backwash';
 };
 $('record').disabled=!window.MediaRecorder;
 engine.afterRender=()=>{if(!recording||!recordContext)return;const c=recordContext,w=recordCanvas.width,h=recordCanvas.height;c.drawImage(engine.renderer.domElement,0,0,w,h);const size=Math.max(18,w*.026);c.font='600 '+size+'px system-ui';const x=w*.04,y=h*.86,bw=w*.5,bh=size*2.5;c.fillStyle='rgba(246,249,244,.93)';c.fillRect(x,y,bw,bh);c.fillStyle='#16383d';c.fillText(height.toFixed(1)+' ft',x+size*.6,y+size*1.65);const left=x+size*5,right=x+bw-size;c.strokeStyle='#a8bcb7';c.lineWidth=4;c.beginPath();c.moveTo(left,y+bh*.5);c.lineTo(right,y+bh*.5);c.stroke();c.fillStyle='#126e71';c.beginPath();c.arc(left+(height-2)/4*(right-left),y+bh*.5,size*.3,0,Math.PI*2);c.fill();};
 $('record').onclick=()=>{if(recording){recording.stop();return;}auto=true;autoStep=0;setHeight(2);playing=true;
  const canvas=document.getElementById('ocean');recordCanvas=document.createElement('canvas');recordCanvas.width=canvas.width;recordCanvas.height=canvas.height;recordContext=recordCanvas.getContext('2d');const stream=recordCanvas.captureStream(30),type=['video/mp4;codecs=avc1','video/webm;codecs=vp9','video/webm'].find(v=>MediaRecorder.isTypeSupported(v));
  const chunks=[];try{recording=new MediaRecorder(stream,{...(type?{mimeType:type}:{}),videoBitsPerSecond:7000000});}catch(e){status.textContent=e.message;return;}
  recording.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};recording.onstop=()=>{const mime=recording.mimeType;recording=null;stream.getTracks().forEach(x=>x.stop());const a=$('download');a.href=URL.createObjectURL(new Blob(chunks,{type:mime}));a.download='breaking-wave-2-4-6ft.'+(mime.includes('mp4')?'mp4':'webm');a.hidden=false;$('record').textContent='Record 2 / 4 / 6 ft';};recording.start();$('record').textContent='Stop recording';
 };
 window.__rigReview={setHeight,get height(){return height;},get time(){return time;},rig};setHeight(4);status.textContent='Building';
})();
