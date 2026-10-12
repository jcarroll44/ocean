// Additive presentation only. The pinned pointer/camera handlers still own time.
const scrubPresentation=renderPresentation,scrubRenderHome=renderHome;
let scrubDayCache=null,scrubLastTime=null,scrubHapticAt=-Infinity,scrubLastValues=new Map(),scrubCompactValue=null;
function scrubDayModel(){
 const b=selectedDayBounds(),key=[b.start,b.end,state.version,state.data.retrievedAt,realForecast()].join(':');
 if(scrubDayCache?.key===key)return scrubDayCache;
 const pct=t=>clamp((t-b.start)/(b.end-b.start)*100,0,100),sun=sunDay(b.start+12*HOUR);
 const colour=t=>{const a=sunPosition(t).altitude;return a< -6?'#243b59':a<0?'#927589':a<8?'#e5b979':'#74afce';};
 const times=[b.start,b.end,...Array.from({length:23},(_,i)=>b.start+(i+1)*(b.end-b.start)/24),sun.sunrise-25*MIN,sun.sunrise,sun.sunrise+45*MIN,sun.sunset-45*MIN,sun.sunset,sun.sunset+25*MIN].filter(t=>Number.isFinite(t)&&t>=b.start&&t<=b.end).sort((a,b)=>a-b);
 const tides=realForecast()?(state.data.tideEvents||[]).filter(e=>['H','L'].includes(e.type)&&Number.isFinite(e.time)&&Number.isFinite(e.level)&&e.time>=b.start&&e.time<b.end):[];
 const rain=Array.from({length:25},(_,i)=>{const time=b.start+i*(b.end-b.start)/24,c=sampleAt(state.data.rows,time);return{position:pct(time),value:realForecast()&&Number.isFinite(c?.rain)?Math.max(0,c.rain):null};});
 const moments=[{time:sun.sunrise,kind:'sunrise'},{time:sun.sunset,kind:'sunset'},...tides.filter(e=>e.type==='H').map(e=>({time:e.time,kind:'high-tide'}))].filter(e=>Number.isFinite(e.time));
 return scrubDayCache={key,...b,pct,tides,rain,moments,gradient:'linear-gradient(90deg,'+times.map(t=>colour(t)+' '+pct(t).toFixed(3)+'%').join(',')+')'};
}
function skyCharm(c,t){
 const night=sunPosition(t).altitude<0,phase=moonPhase(t),rain=Number.isFinite(c.rain)&&c.rain>.05,storm=Number.isFinite(c.thunder)&&c.thunder>.12||c.weatherCode>=95;
 const kind=storm?'lightning':rain?'rain':!Number.isFinite(c.cloud)?'unknown':c.cloud>=85?'overcast':c.cloud>=10?'partly-cloudy':night?'moon':'sun';
 return{kind,fraction:phase.fraction,waxing:phase.waxing,label:(kind==='unknown'?'Weather unavailable':kind.replaceAll('-',' '))+(night?' · Moon '+Math.round(phase.fraction*100)+'% illuminated':'')};
}
// Exact current values roll into their existing boxes. There are no fabricated
// intermediate readings, duplicate text layers or per-digit animation loops.
renderHome=function(){
 const old=scrubLastValues;scrubRenderHome();scrubLastValues=new Map();
 for(const el of document.querySelectorAll('#metrics .db-stat b')){
  const key=el.closest('[data-sheet]').dataset.sheet,value=el.textContent;scrubLastValues.set(key,value);
  if(state.scrubbing&&!reduced&&old.has(key)&&old.get(key)!==value){el.getAnimations?.().forEach(a=>a.cancel());el.animate?.([{transform:'translateY(5px)',opacity:.6},{transform:'translateY(0)',opacity:1}],{duration:95,easing:'ease-out'});}
 }
};
hapticTime=function(t){
 const previous=scrubLastTime;scrubLastTime=t;if(previous===null||previous===t)return;
 // A day selection is not a dragged traversal of all intervening hours.
 if(localDayStart(previous)!==localDayStart(t)||Math.abs(t-previous)>4*HOUR)return;
 const model=scrubDayModel(),crossed=model.moments.find(e=>t>previous?e.time>previous&&e.time<=t:e.time<previous&&e.time>=t);
 const hourly=Math.floor(previous/HOUR)!==Math.floor(t/HOUR),now=performance.now();
 if((crossed||hourly)&&now-scrubHapticAt>=100){scrubHapticAt=now;timeHaptic(crossed?'moment':'hour');}
};
renderPresentation=function(){
 scrubPresentation();const track=$('#week-scrubber'),thumb=track.querySelector('.db-thumb'),available=realForecast()&&track.getAttribute('aria-disabled')!=='true';
 const compact=$('#compact-values');
 if(compact){const value=compact.textContent;if(state.scrubbing&&!reduced&&scrubCompactValue!==null&&scrubCompactValue!==value){compact.getAnimations?.().forEach(a=>a.cancel());compact.animate?.([{transform:'translateY(4px)',opacity:.7},{transform:'translateY(0)',opacity:1}],{duration:95,easing:'ease-out'});}scrubCompactValue=value;}
 let extras=track.querySelector('.sky-track-extras'),tooltip=track.querySelector('.sky-time-label');
 if(!extras){extras=document.createElement('span');extras.className='sky-track-extras';extras.setAttribute('aria-hidden','true');track.append(extras);tooltip=document.createElement('span');tooltip.className='sky-time-label';tooltip.setAttribute('aria-hidden','true');track.append(tooltip);}
 extras.hidden=!available;tooltip.hidden=!available||!state.scrubbing;
 if(!available){thumb.innerHTML='';thumb.classList.remove('sky-charm');track.removeAttribute('aria-description');track.querySelector('.db-line').style.background='';return;}
 const model=scrubDayModel(),c=conditions(),charm=skyCharm(c,state.time);
 thumb.classList.add('sky-charm');thumb.dataset.sky=charm.kind;thumb.dataset.moonFraction=String(charm.fraction);
 thumb.classList.toggle('is-dragging',state.scrubbing);
 const altitude=sunPosition(state.time).altitude;
 thumb.style.setProperty('--orb-glow',altitude< -6?'#c4d9ee70':altitude<8?'#f4c78299':'#a4dafa66');
 thumb.style.setProperty('--orb-base',altitude< -6?'#172b48':c.cloud>=85?'#737e86':altitude<8?'#cba775':'#729fba');
 if(!thumb.querySelector('canvas')){thumb.innerHTML='<canvas class="sky-orb-pixels" width="64" height="64" aria-hidden="true"></canvas>';if(scrubOrbPixels)paintSkyOrb(scrubOrbPixels);}
 track.setAttribute('aria-valuetext',weekday(state.time)+' '+clock(state.time)+' · '+charm.label);
 track.setAttribute('aria-description',state.fixture?'Synthetic fixture. Rain and tide marks are test data.':'Light track: solar position. Rain forecast: Open-Meteo. H and L: tide times est. · NOAA predictions.');
 track.querySelector('.db-line').style.background=model.gradient;
 if(extras.dataset.key!==model.key){
  extras.dataset.key=model.key;
  const source=state.data.feedStatus?.tideHiLo==='fulfilled'?'NOAA':'est. · '+(state.fixture?'synthetic fixture':'NOAA predictions');
  const rainGradient='linear-gradient(90deg,'+model.rain.map(p=>'rgba(55,138,197,'+(p.value===null?0:Math.min(.65,Math.sqrt(p.value/12)*.65)).toFixed(3)+') '+p.position+'%').join(',')+')';
  extras.innerHTML='<span class="sky-rain-track" title="Rain forecast · '+(state.fixture?'synthetic fixture':'Open-Meteo')+'" style="background:'+rainGradient+'"></span>'+model.tides.map(e=>'<span class="sky-tide-mark '+(e.type==='H'?'high':'low')+'" style="left:'+model.pct(e.time)+'%" title="'+(e.type==='H'?'High':'Low')+' tide '+clock(e.time)+' · '+source+'"><i></i>'+e.type+'</span>').join('');
 }
 tooltip.textContent=weekday(state.time)+' '+clock(state.time);tooltip.style.left=clamp(model.pct(state.time),9,91)+'%';
};

// A 64px readback from the existing WebGPU device, at most one in flight.
// Cache it across UI state changes; never substitute an icon or weather picture.
let scrubOrbPixels=null;
function paintSkyOrb(data){
 const canvas=document.querySelector('.sky-orb-pixels');if(!canvas||typeof ImageData==='undefined')return;
 const ctx=canvas.getContext('2d');if(!ctx)return;
 ctx.putImageData(new ImageData(new Uint8ClampedArray(data.bytes),data.width,data.height),0,0);
 canvas.dataset.sequence=String(data.sequence);canvas.parentElement.dataset.ready='true';
}
window.__daybuoySkyOrb=data=>{scrubOrbPixels=data;paintSkyOrb(data);};
