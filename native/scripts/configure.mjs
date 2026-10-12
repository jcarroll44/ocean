import fs from 'node:fs';import readline from 'node:readline/promises';import {stdin,stdout} from 'node:process';
const q=readline.createInterface({input:stdin,output:stdout});
try{
 const apiBaseURL=(await q.question('Public HTTPS forecast API origin (no keys or query string): ')).trim(),url=new URL(apiBaseURL);
 if(url.protocol!=='https:'||url.username||url.password||url.search||url.hash||url.pathname!=='/')throw Error('Expected a plain HTTPS origin.');
 const revenueCatPublicKey=(await q.question('RevenueCat Apple PUBLIC SDK key (appl_…; never a secret key): ')).trim();
 if(!/^appl_[A-Za-z0-9]+$/.test(revenueCatPublicKey))throw Error('Expected the Apple public SDK key.');
 const sentryDsn=(await q.question('Sentry client DSN (optional; Enter to skip): ')).trim();
 if(sentryDsn&&!/^https:\/\/[a-zA-Z0-9]+@[a-zA-Z0-9.-]+\/[0-9]+$/.test(sentryDsn))throw Error('Expected a client DSN, not an auth token.');
 fs.writeFileSync('release.local.json',JSON.stringify({sentryDsn,revenueCatPublicKey,apiBaseURL:url.origin,channel:'beta'},null,2)+'\n',{mode:0o600});
 console.log('Local public configuration saved. Next: npm run prepare:ios -- --testflight');
}finally{q.close();}
