// Home direction 03: quiet corner header; the solar path is world-space only.
const homeIcons={
 air:'<path d="M10 14V5a2 2 0 1 1 4 0v9a4 4 0 1 1-4 0z"/>',
 water:'<path d="M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11z"/>',
 waves:'<path d="M2 9c2.5 2 5 2 7.5 0s5-2 7.5 0 3.5 2 5 0M2 15c2.5 2 5 2 7.5 0s5-2 7.5 0 3.5 2 5 0"/>',
 wind:'<path d="M7 20L17 4M8 6l9-2 2 9"/>',
 sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5"/>',
 arrow:'<path d="M7 17L17 7M9 7h8v8"/>',
 share:'<path d="M12 3v12M7 8l5-5 5 5M5 14v5h14v-5"/>'
};
function homeIcon(k){return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${homeIcons[k]||''}</svg>`;}
function homeDayRows(){const d=localDayStart(state.time);return state.data.rows.filter(r=>r.time>=d&&r.time<d+24*HOUR);}
const homeBrandMark='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="5.5" r="3.2" fill="currentColor"/><path d="M8.5 10h7l1.5 6h-10z" fill="currentColor"/><path d="M3 18.5c2 1.3 4 1.3 6 0s4-1.3 6 0 4 1.3 6 0" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round"/></svg>';
let homeInitialized=false,timeExploreUntil=0,timeExploreWasActive=false,timeExploreOpacity=0;
function holdTimeExploration(){timeExploreUntil=performance.now()+2000;}
function updateTimeExploration(){
 const active=!!state.playing||!!state.skyView||exploreGesture?.kind==='arc',now=performance.now();
 if(active||timeExploreWasActive)timeExploreUntil=now+2000;
 timeExploreWasActive=active;
 const opacity=active||now<timeExploreUntil?1:Math.max(0,1-(now-timeExploreUntil)/350);
 timeExploreOpacity=timeExploreUntil?opacity:0;
 const visible=timeExploreOpacity>0,app=$('#app');app.style.setProperty('--time-explore-opacity',timeExploreOpacity);app.dataset.timeExplore=String(visible);
 for(const object of [pathLine,pathTrail,tickGroup,groundRing,dropLine])if(object){object.visible=visible&&(object===pathLine||object===pathTrail||object===tickGroup||object===uvArcTube||object.visible);if(object.material)object.material.opacity*=timeExploreOpacity;}
 for(const m of uvArcGlow){m.visible=visible;m.material.opacity=m.userData.opacity*timeExploreOpacity;}
 for(const tick of tickGroup?.children||[])tick.material.opacity=.8*timeExploreOpacity;
}
function initHome(){
 if(homeInitialized)return;homeInitialized=true;
 state.uiFontsReady=!document.fonts;
 if(document.fonts)Promise.all([200,300,400,500,600].map(w=>document.fonts.load(`${w} 16px Poppins`))).then(()=>{state.uiFontsReady=true;state.dirty=true;},()=>{state.uiFontsReady=true;state.dirty=true;});
 $('#share-scene').innerHTML=referenceIcons.share;
 $('#share-scene').addEventListener('click',shareHome);
 $('#loading').hidden=true;
}
function renderHome(){
 initHome();const c=conditions(),available=realForecast(),uv=forecastUV(state.time),day=localDayStart(state.time),today=localDayStart(review?reviewNow:Date.now());
 const value=(n,suffix='')=>available&&Number.isFinite(n)?Math.round(n)+suffix:'—';
 const wave=available&&Number.isFinite(c.swell)?(c.swell<1?c.swell.toFixed(1):`${Math.floor(c.swell)}–${Math.floor(c.swell)+1}`)+'<small>ft</small>':'—';
 const dot=uv===0?'#9fb3c8':uv>=8&&uv<11?'#e5484d':uvColour(uv);
 const readings=[['air','Air',value(c.temperature,'°')],['water','Water',value(Number.isFinite(c.sst)?cToF(c.sst):NaN,'°')],['waves','Waves',wave],['wind','Wind',available&&Number.isFinite(c.wind)?Math.round(c.wind)+'<small>kt</small>':'—'],['sun','UV',available&&Number.isFinite(uv)?`<i class="db-uv" style="background:${dot}"></i>${Math.round(uv)}`:'—']];
 $('#metrics').innerHTML=readings.map(([key,label,text])=>`<div class="db-stat metric" data-sheet="${key}" role="button" tabindex="0" aria-label="${label}, ${text.replace(/<[^>]+>/g,' ')}. Open details"><b>${text}</b><span>${label}</span></div>`).join('');
 $('#days').innerHTML=Array.from({length:7},(_,i)=>{const t=localDayStart(today+(i*24+12)*HOUR),key=new Intl.DateTimeFormat('en-CA',{timeZone:SITE.zone,year:'numeric',month:'2-digit',day:'2-digit'}).format(t+12*HOUR),high=Date.now()-dailyHighs.retrievedAt<24*HOUR?dailyHighs.values[key]:null;return `<div class="db-day${day===t?' on':''}" data-day="${t}" role="button" tabindex="0" aria-pressed="${day===t}" aria-disabled="${t>state.data.last}">${i===0?'Today':weekday(t+12*HOUR)}<small>${Number.isFinite(high)?Math.round(high)+'°':'—'}</small></div>`;}).join('');
 $('#moment-action').innerHTML=`<span class="action-copy"></span><span class="go">${referenceIcons.go}</span>`;
}

async function shareHome(){
 try{await document.fonts.ready;engine.render(0);const canvas=document.createElement('canvas');canvas.width=canvas.height=1080;const ctx=canvas.getContext('2d'),src=$('#ocean'),scale=1080/src.width;ctx.fillStyle='#4987A4';ctx.fillRect(0,0,1080,1080);ctx.drawImage(src,0,-Math.max(0,src.height*scale-1080)*.45,1080,src.height*scale);const scrim=ctx.createLinearGradient(0,0,0,470);scrim.addColorStop(0,'#1a435ad9');scrim.addColorStop(1,'#1a435a00');ctx.fillStyle=scrim;ctx.fillRect(0,0,1080,470);ctx.fillStyle='white';ctx.font='500 42px Poppins';const mark=new Image();mark.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(homeBrandMark.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" style="color:white" '));await mark.decode();ctx.drawImage(mark,58,47,52,52);ctx.fillText('DayBuoy',126,90);ctx.font='400 25px Poppins';ctx.fillText('Inlet Beach',64,133);ctx.font='200 144px Poppins';ctx.fillText(Math.round(conditions().temperature)+'°',56,260);ctx.font='400 38px Poppins';ctx.fillText($('#headline').getAttribute('aria-label')||$('#headline').textContent,62,330);ctx.font='400 24px Poppins';ctx.fillText(`${weekday(state.time)} · ${clock(state.time)}${review?' · Demo forecast':''}`,62,390);const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw Error('Image unavailable');const file=new File([blob],'DayBuoy-Inlet-Beach.png',{type:'image/png'});if(navigator.canShare?.({files:[file]}))await navigator.share({files:[file],title:'DayBuoy · Inlet Beach'});else{const a=document.createElement('a'),url=URL.createObjectURL(blob);a.href=url;a.download=file.name;a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);notice('Beach forecast image downloaded.');}}catch(e){if(e.name!=='AbortError')notice('Could not share this scene. Please try again.');}
}
