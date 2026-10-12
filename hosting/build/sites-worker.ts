import {handleResults} from "../../server/results.js";
import {handleForecast,resolveProfile} from "../../server/forecast.js";
export default {
 async fetch(request: Request, env: Cloudflare.Env, ctx: ExecutionContext) {
  const result=await handleForecast(request,env)??await handleResults(request,env);
  if(result)return result;
  const url=new URL(request.url);
  if((url.pathname==='/'||url.pathname==='/index.html')&&url.searchParams.has('beach')){
   const profile=await resolveProfile(url.searchParams.get('beach'),env);
   if(!profile)return new Response('Beach unavailable',{status:404});
   const response=await env.ASSETS.fetch(request),html=await response.text();
   const config=JSON.stringify(profile).replaceAll('<','\\u003c');
   return new Response(html.replace('<head>','<head><script>globalThis.__DAYBUOY_PROFILE__='+config+';</script>'),{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'private, no-store'}});
  }
  return env.ASSETS.fetch(request);
 }
};
