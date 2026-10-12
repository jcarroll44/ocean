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
 const sun='<circle cx="12" cy="12" r="5.2" fill="#f7cf7f"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.4 1.4M17.6 17.6L19 19M5 19l1.4-1.4M17.6 6.4L19 5" stroke="#dcad63" stroke-width="1.3" stroke-linecap="round"/>';
 // Lit limb is an astronomical phase mask, not a generic crescent icon.
 const radius=8,terminator=(1-2*phase.fraction)*radius,side=phase.waxing?1:-1;
 const points=[];for(let i=0;i<=24;i++){const a=-Math.PI/2+i*Math.PI/24;points.push([12+side*radius*Math.cos(a),12+radius*Math.sin(a)]);}for(let i=24;i>=0;i--){const a=-Math.PI/2+i*Math.PI/24;points.push([12+side*terminator*Math.cos(a),12+radius*Math.sin(a)]);}
 const moon='<circle cx="12" cy="12" r="8" fill="#354d68"/><path d="M'+points.map(p=>p.map(n=>n.toFixed(2)).join(',')).join('L')+'Z" fill="#edf3eb"/>';
 const cloud='<path d="M5 17c-4 0-4-6 0-6 .6-5 8-6 10-1 5-1 7 7 1 7Z" fill="#e6edf1" stroke="#8ba5b8" stroke-width=".8"/>';
 let drawing=kind==='unknown'?'<path d="M6 12h12" stroke="#688093" stroke-width="2"/>':kind==='sun'?sun:kind==='moon'?moon:kind==='partly-cloudy'?'<g transform="translate(-3 -3) scale(.9)">'+(night?moon:sun)+'</g>'+cloud:cloud;
 if(kind==='rain')drawing+='<path d="m7 19-1 3m6-3-1 3m6-3-1 3" stroke="#599fc6" stroke-width="1.6" stroke-linecap="round"/>';
 if(kind==='lightning')drawing+='<path d="m13 14-4 6h4l-2 4 7-7h-5l2-3Z" fill="#eec878"/>';
 return{kind,fraction:phase.fraction,waxing:phase.waxing,svg:'<svg viewBox="0 0 24 24" aria-hidden="true">'+drawing+'</svg>',label:(kind==='unknown'?'Weather unavailable':kind.replaceAll('-',' '))+(night?' · Moon '+Math.round(phase.fraction*100)+'% illuminated':'')};
}
// Exact current values roll into their existing boxes. There are no fabricated
// intermediate readings, duplicate text layers or per-digit animation loops.
renderHome=function(){
 const old=scrubLastValues;scrubRenderHome();scrubLastValues=new Map();
 for(const el of document.querySelectorAll('#metrics .db-stat b')){
  const key=el.closest('[data-sheet]').dataset.sheet,value=el.textContent;scrubLastValues.set(key,value);
  if(state.scrubbing&&!reduced&&old.has(key)&&old.get(key)!==value){el.animate?.([{transform:'translateY(5px)',opacity:.6},{transform:'translateY(0)',opacity:1}],{duration:95,easing:'ease-out'});}
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
 if(thumb.innerHTML!==charm.svg)thumb.innerHTML=charm.svg;
 track.setAttribute('aria-valuetext',weekday(state.time)+' '+clock(state.time)+' · '+charm.label);
 track.setAttribute('aria-description',state.fixture?'Synthetic fixture. Rain and tide marks are test data.':'Light track: solar position. Rain forecast: Open-Meteo. H and L: tide times est. · NOAA predictions.');
 track.querySelector('.db-line').style.background=model.gradient;
 if(extras.dataset.key!==model.key){
  extras.dataset.key=model.key;
  const source=state.data.feedStatus?.tideHiLo==='fulfilled'?'NOAA':'est. · '+(state.fixture?'synthetic fixture':'NOAA predictions');
  const rainGradient='linear-gradient(90deg,'+model.rain.map(p=>'rgba(55,138,197,'+(p.value===null?0:Math.min(.65,Math.sqrt(p.value/12)*.65)).toFixed(3)+') '+p.position+'%').join(',')+')';
  extras.innerHTML='<span class="sky-rain-track" title="Rain forecast · '+(state.fixture?'synthetic fixture':'Open-Meteo')+'" style="background:'+rainGradient+'"></span>'+model.tides.map(e=>'<span class="sky-tide-mark '+(e.type==='H'?'high':'low')+'" style="left:'+model.pct(e.time)+'%" title="'+(e.type==='H'?'High':'Low')+' tide '+clock(e.time)+' · '+source+'"><i></i>'+e.type+'</span>').join('');
 }
 tooltip.textContent=clock(state.time);tooltip.style.left=clamp(model.pct(state.time),9,91)+'%';
};
