// Official NWS Tallahassee Surf Zone Forecast. South Walton is FLZ108.
// The parser only imports rip-risk periods; solar/tide math remains app-owned.
const SURF_ZONE='FLZ108',SURF_URL='https://forecast.weather.gov/product.php?site=TAE&issuedby=TAE&product=SRF&format=CI&version=1&glossary=0';
let surfForecast=null,surfRequestedAt=0;
function parseSurfProduct(product,now=Date.now()){
 const issued=Date.parse(product.issuanceTime),text=product.productText;
 if(product.productCode!=='SRF'||!Number.isFinite(issued)||typeof text!=='string'||issued>now+5*MIN||now-issued>30*HOUR)throw Error('Invalid or expired surf forecast');
 const section=text.replace(/\r/g,'').split(/\n\$\$\s*(?:\n|$)/).find(s=>/^FLZ108(?:-|>)/m.test(s)&&/South Walton/i.test(s));
 if(!section)throw Error('South Walton not found');
 const base=localDayStart(issued),days=['SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'],baseDay=days.indexOf(new Intl.DateTimeFormat('en-US',{timeZone:SITE.zone,weekday:'long'}).format(issued).toUpperCase());
 const headers=[...section.matchAll(/^\.([A-Z][A-Z ]*)\.\.\./gm)],periods=[];
 for(let i=0;i<headers.length;i++){
  const name=headers[i][1],endOfSection=section.indexOf('\n&&',headers[i].index),body=section.slice(headers[i].index+headers[i][0].length,headers[i+1]?.index??(endOfSection>0?endOfSection:section.length));
  const match=body.match(/Rip Current Risk\s*\.*\s*(Low|Moderate|High)\b/i)||body.match(/\b(Low|Moderate|High)\s+rip current risk\b/i);if(!match)continue;
  let offset;if(/^(TODAY|REST OF TODAY|THIS AFTERNOON|THIS MORNING|TONIGHT)$/.test(name))offset=0;else{const index=days.findIndex(d=>name.startsWith(d));if(index<0)continue;offset=(index-baseDay+7)%7;}
  const night=name.includes('NIGHT'),start=base+offset*24*HOUR+(night?18*HOUR:0),end=base+(offset+1)*24*HOUR+(night?6*HOUR:0),risk=match[1][0].toUpperCase()+match[1].slice(1).toLowerCase();
  periods.push({start,end,risk,label:name});
 }
 if(!periods.length)throw Error('No rip-risk periods');
 return{zone:SURF_ZONE,issued,productId:product.id,periods,source:SURF_URL};
}
function ripRiskAt(t){if(!surfForecast||Date.now()-surfForecast.issued>30*HOUR)return null;return surfForecast.periods.filter(p=>t>=p.start&&t<p.end).sort((a,b)=>(a.end-a.start)-(b.end-b.start))[0]??null;}
async function loadRipForecast(){
 if(Date.now()-surfRequestedAt<15*MIN)return;surfRequestedAt=Date.now();
 try{
  const options={headers:{Accept:'application/ld+json'},signal:AbortSignal.timeout(14000)},r=await fetch('https://api.weather.gov/products/types/SRF/locations/TAE',options);if(!r.ok)throw Error('NWS list unavailable');
  const list=await r.json(),latest=(list['@graph']||[]).filter(p=>p.productCode==='SRF').sort((a,b)=>Date.parse(b.issuanceTime)-Date.parse(a.issuanceTime))[0];
  if(!latest||!/^https:\/\/api\.weather\.gov\/products\/[a-f0-9-]+$/.test(latest['@id']))throw Error('Missing product');
  const response=await fetch(latest['@id'],{headers:{Accept:'application/ld+json'},signal:AbortSignal.timeout(14000)});if(!response.ok)throw Error('NWS product unavailable');
  surfForecast=parseSurfProduct(await response.json());
  try{localStorage.setItem('daybuoy.nws-surf',JSON.stringify(surfForecast));}catch{}
 }catch{surfForecast=null;/* Failed/expired feeds do not imply low risk. Hide the row. */}
 state.dirty=true;
}
try{const cached=JSON.parse(localStorage.getItem('daybuoy.nws-surf')||'null');if(cached?.zone===SURF_ZONE&&Date.now()-cached.issued<30*HOUR&&cached.periods?.every(p=>['Low','Moderate','High'].includes(p.risk)))surfForecast=cached;}catch{}
function waterVerdict(){
 const c=conditions(),risk=ripRiskAt(state.time)?.risk;
 if(risk==='High')return 'High rip risk · stay out of the water';
 if(c.weatherCode>=95)return 'Thunderstorms · stay out of the water';
 if(risk==='Moderate')return 'Moderate rip risk · use caution';
 if(c.rain>=1)return 'Rain moving through · plan around it';
 if(c.swell>=3||c.wind>=15)return 'Choppy water · check beach flags';
 const d=localDayStart(state.time),rows=state.data.rows.filter(r=>r.time>=d&&r.time<d+24*HOUR&&sunPosition(r.time).altitude>5),calm=rows.filter(r=>ripRiskAt(r.time)?.risk==='Low'&&Number.isFinite(r.swell)&&r.swell<2&&r.wind<12&&r.rain<.2&&r.rainProbability<35&&r.weatherCode<95);
 let best=[],run=[];for(const r of calm){run=run.length&&r.time-run.at(-1).time<=HOUR*1.1?[...run,r]:[r];if(run.length>best.length)best=run;}
 if(risk==='Low'&&best.length>=2){const a=best[0].time,b=Math.min(best.at(-1).time+HOUR,sunDay(state.time).sunset);return `Calmer water · best ${timeRange(a,b)}`;}
 return risk==='Low'?'Lower rip risk · check beach flags':'Beach conditions · check local flags';
}
function ripRiskRow(){const period=ripRiskAt(state.time);if(!period)return '';return `<a class="rip-row" data-risk="${period.risk.toLowerCase()}" href="${SURF_URL}" target="_blank" rel="noopener"><span>Rip current risk <small>NWS</small></span><strong>${period.risk} ↗</strong></a>`;}
window.__surf={parseSurfProduct,ripRiskAt,waterVerdict,loadRipForecast,get forecast(){return surfForecast;}};
