// Consumer data host: no evidence uploader, credentials proxy or test assets.
import {handleForecast} from './forecast.js';
export default {async fetch(request,env){
 try{return await handleForecast(request,env)||new Response('Not found',{status:404});}
 catch{return Response.json({error:'Forecast temporarily unavailable'},{status:503,headers:{'Cache-Control':'no-store'}});}
}};
