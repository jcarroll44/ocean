(async function(){
  const lab=window.__waveLab;
  const host=window.parent!==window?window.parent.document:document;
  const $=id=>host.getElementById(id);
  const status=$('lab-status');
  if(!status)return;
  if(!lab?.engine){status.textContent='This browser could not start WebGL. Open this preview in Safari or Chrome on your phone or computer to test the scene.';return;}
  const {state,uniforms:u,engine}=lab,o=window.__ocean;
  let player=null,mode='small',time=0,playing=true,view='beach',scale=1,gray=true;
  let recording=null,lastFrame=performance.now(),frameTimes=[],lastReport=0,downloadURL=null;
  let sideVisibility=null,savedBackground=null;
  const sideBackground=new lab.THREE.Color('#e5e7e5');
  const fixedTime=Date.parse('2026-09-24T17:00:00Z');
  state.live=false;state.time=fixedTime;state.prefs.motion=true;state.detent='peek';
  function restart(){time=0;engine.resetLab();u.uTime.value=30;u.uPhase.value=5;}
  function setMode(m){if(m==='bake'&&!player)return;if(recording?.state==='recording')recording.stop();mode=m;if(m!=='bake'){view='beach';o.setView(0,-11*Math.PI/180,.84);}restart();playing=true;$('play').textContent='Pause';host.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===m)));}
  host.querySelectorAll('[data-mode]').forEach(button=>button.onclick=()=>setMode(button.dataset.mode));
  $('play').onclick=()=>{playing=!playing;$('play').textContent=playing?'Pause':'Play';};
  $('restart').onclick=restart;
  $('beach').onclick=()=>{view='beach';o.setView(0,-11*Math.PI/180,.84);};
  $('side').onclick=()=>{if(player){setMode('bake');view='side';}};
  $('time').oninput=e=>{time=Number(e.target.value);playing=false;$('play').textContent='Play';engine.resetLab();};
  $('scale').oninput=e=>{scale=Number(e.target.value);$('scale-value').textContent=scale.toFixed(3)+' ×';};
  $('gray').onchange=e=>{gray=e.target.checked;};
  engine.beforeRender=()=>{
    if(view==='side'){
      if(!sideVisibility){sideVisibility=new Map(engine.scene.children.filter(x=>x!==player?.mesh).map(x=>[x,x.visible]));savedBackground=engine.scene.background;}
      for(const object of sideVisibility.keys())object.visible=false;
      engine.scene.background=sideBackground;
      const cam=engine.camera;cam.position.set(26,4,-15);cam.lookAt(0,.1,-15);
      cam.fov=48;cam.updateProjectionMatrix();cam.updateMatrixWorld();
    }else if(sideVisibility){
      for(const [object,visible] of sideVisibility)object.visible=visible;
      sideVisibility=null;engine.scene.background=savedBackground;
    }
  };
  lab.tick=dt=>{
    const now=performance.now();
    if(now-lastFrame<1000)frameTimes.push(now-lastFrame);
    lastFrame=now;if(frameTimes.length>180)frameTimes.shift();
    const duration=player?.manifest.durationS||12;
    if(playing){time+=dt/(mode==='bake'?Math.sqrt(scale):1);if(time>duration&&mode==='bake'){
      if(recording){time=duration;playing=false;recording.stop();}
      else restart();
    }}
    state.live=false;state.time=fixedTime;
    state.sim={swell:mode==='large'?2:mode==='small'?1.5:.6,period:6,direction:124,wind:5*.8689762419,windDirection:90,
      cloud:10,rain:0,visibility:24000,tide:0,clarity:85};
    lab.applyConditions(60);
    const waveLabel=document.querySelector('#peek-metrics [data-focus="waves"] .label');
    if(waveLabel)waveLabel.textContent=mode==='bake'?'Base sea':'Waves';
    u.uTime.value=30+time;u.uPhase.value=5+time/6;
    if(player)player.set(time,scale,gray,mode==='bake');
    $('time').value=time;$('time-value').textContent=time.toFixed(2)+' s';
    if(now-lastReport>700){lastReport=now;
      const sorted=[...frameTimes].sort((a,b)=>a-b),median=sorted[Math.floor(sorted.length*.5)]||0;
      const p95=sorted[Math.floor(sorted.length*.95)]||0;
      $('metrics').textContent=`Browser render cadence: ${median?(1000/median).toFixed(1):'—'} fps median\n95th-percentile frame: ${p95.toFixed(1)} ms`+
        (player?`\nBake download: ${(player.manifest.downloadBytes/1e6).toFixed(2)} MB\nBake texture memory: ${(player.manifest.gpuTextureBytes/1048576).toFixed(1)} MiB\nNative samples: ${player.manifest.fps} fps`:'');
    }
  };
  status.textContent='Direction and light-wind fixes active. Loading the fluid geometry…';
  try{
    player=await window.createBakedPlayer(lab,'https://raw.githubusercontent.com/jcarroll44/ocean/wave-prototype-checkpoint/review/wave-lab/assets/breaker.json');
    $('time').max=player.manifest.durationS;
    const gauge=player.manifest.measurements?.gauges?.find(g=>g.gaugeYM===8);
    status.textContent='Fluid geometry loaded. '+(gauge?`Approach gauge: ${gauge.heightFt.toFixed(2)} ft crest to trough. `:'')+'Breaking-face quality and iPhone acceptance are pending. The app’s “Base sea” value describes the surrounding ocean.';
    $('bake-controls').disabled=false;$('side').disabled=false;
    const bakeButton=host.querySelector('[data-mode="bake"]');bakeButton.disabled=false;bakeButton.textContent='Baked breaker';
    $('record').disabled=typeof MediaRecorder==='undefined';
    setMode('bake');
  }catch(error){status.textContent='1.5 ft / 2 ft comparisons are ready. The baked breaker is not available yet. Refresh after the bake job finishes.';console.warn(error);setMode('small');}
  $('record').onclick=()=>{
    if(recording?.state==='recording'){recording.stop();return;}
    if(!player||recording)return;
    mode='bake';restart();playing=true;$('play').textContent='Pause';
    const canvas=document.getElementById('ocean');
    const type=['video/mp4;codecs=avc1','video/webm;codecs=vp9','video/webm'].find(t=>MediaRecorder.isTypeSupported(t));
    try{
      const stream=canvas.captureStream(30);
      recording=new MediaRecorder(stream,{...(type?{mimeType:type}:{}),videoBitsPerSecond:6000000});
      const chunks=[];
      recording.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
      recording.onstop=()=>{
        const mime=recording.mimeType;recording=null;stream.getTracks().forEach(track=>track.stop());
        if(downloadURL)URL.revokeObjectURL(downloadURL);
        downloadURL=URL.createObjectURL(new Blob(chunks,{type:mime}));
        const link=$('capture-link');link.href=downloadURL;link.download='bobuoy-breaker-prototype.'+(mime.includes('mp4')?'mp4':'webm');
        link.className='ready';$('record').disabled=false;$('record').textContent='Record this wave';$('play').textContent='Play';
      };
      recording.start();$('record').disabled=false;$('record').textContent='Stop recording';
    }catch(error){recording=null;status.textContent='Recording could not start: '+error.message;}
  };
})();
