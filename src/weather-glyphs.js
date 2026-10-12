// One custom vector family, with an illuminated spherical lunar terminator.
let weatherGlyphSequence=0;
function weatherCharmGlyph(charm){
 const id='charm-'+(++weatherGlyphSequence),cloud=['partly-cloudy','overcast','rain','lightning'].includes(charm.kind),wet=['rain','lightning'].includes(charm.kind);
 const x=cloud?15:22,y=cloud?15:21,r=cloud?8:10;
 let celestial='';
 if(charm.night){
  const fraction=clamp(charm.fraction,0,1),side=charm.waxing?1:-1,terminator=1-2*fraction,points=[];
  for(let i=0;i<=32;i++){const a=-Math.PI/2+i*Math.PI/32;points.push([x+side*r*Math.cos(a),y+r*Math.sin(a)]);}
  for(let i=32;i>=0;i--){const a=-Math.PI/2+i*Math.PI/32;points.push([x+side*r*terminator*Math.cos(a),y+r*Math.sin(a)]);}
  celestial=`<circle cx="${x}" cy="${y}" r="${r}" fill="#668098" opacity=".35"/><path d="M${points.map(p=>p.map(v=>v.toFixed(2)).join(',')).join('L')}Z" fill="url(#${id}-moon)"/>`;
 }else if(['sun','partly-cloudy'].includes(charm.kind))celestial=`<g stroke="#edb349" stroke-width="1.5" stroke-linecap="round"><circle cx="${x}" cy="${y}" r="${r*.63}" fill="url(#${id}-sun)"/>${Array.from({length:8},(_,i)=>{const a=i*Math.PI/4;return `<path d="M${x+Math.cos(a)*r*.9} ${y+Math.sin(a)*r*.9}l${Math.cos(a)*2} ${Math.sin(a)*2}"/>`;}).join('')}</g>`;
 const cloudPath=cloud?`<path d="M12 30a6 6 0 0 1-.3-12 8.2 8.2 0 0 1 15-2.4A7.2 7.2 0 1 1 32 30Z" fill="url(#${id}-cloud)" stroke="#fff" stroke-opacity=".65" stroke-width=".7"/>`:'';
 const rain=charm.kind==='rain'?'<g stroke="#66b8e6" stroke-width="1.7" stroke-linecap="round"><path d="m16 33-1.6 3.2m9-3.2-1.6 3.2m9-3.2-1.6 3.2"/></g>':charm.kind==='lightning'?'<path d="m24 27-6 8h5l-2 6 9-10h-6l3-4Z" fill="#ffe3a0" stroke="#ffefc8" stroke-width=".5"/>':'';
 const fog=charm.kind==='fog'?'<g stroke="#dae6e9" stroke-width="2" stroke-linecap="round"><path d="M10 18h24M7 24h30M12 30h20"/></g>':'';
 return `<svg class="sky-weather-icon" viewBox="0 0 44 44" aria-hidden="true"><defs><linearGradient id="${id}-sun" x2="0" y2="1"><stop stop-color="#fff1b8"/><stop offset="1" stop-color="#edb447"/></linearGradient><linearGradient id="${id}-moon" x2="0" y2="1"><stop stop-color="#fffdec"/><stop offset="1" stop-color="#c8dfec"/></linearGradient><linearGradient id="${id}-cloud" x2="0" y2="1"><stop stop-color="${wet?'#d1dce1':'#fffefd'}"/><stop offset="1" stop-color="${wet?'#8097a8':'#baceda'}"/></linearGradient></defs>${celestial}${cloudPath}${rain}${fog}${charm.kind==='unknown'?'<circle cx="22" cy="22" r="4" fill="#d4e1e5"/>':''}</svg>`;
}
