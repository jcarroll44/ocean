import {handleResults} from "../../server/results.js";
import {handleMarine} from "../../server/marine.js";
export default {
 async fetch(request: Request, env: Cloudflare.Env, ctx: ExecutionContext) {
  const result=await handleMarine(request)??await handleResults(request,env);
  if(result)return result;
  return env.ASSETS.fetch(request);
 }
};
