import fs from 'node:fs';import readline from 'node:readline/promises';import {stdin,stdout} from 'node:process';
const q=readline.createInterface({input:stdin,output:stdout});
try{
 const sentryDsn=(await q.question('Sentry → Settings → Projects → DayBuoy → Client Keys (DSN). Paste the DSN: ')).trim();
 if(!/^https:\/\/[a-zA-Z0-9]+@[a-zA-Z0-9.-]+\/[0-9]+$/.test(sentryDsn))throw Error('Expected a client DSN, not an auth token. Nothing saved.');
 const capgoPublicKeyFile=(await q.question('Capgo PUBLIC key path [./.capgo_key_v2.pub]: ')).trim()||'./.capgo_key_v2.pub';
 const key=fs.readFileSync(capgoPublicKeyFile,'utf8');if(!key.includes('BEGIN PUBLIC KEY')||key.includes('PRIVATE'))throw Error('Expected a public key. Nothing saved.');
 fs.writeFileSync('release.local.json',JSON.stringify({sentryDsn,capgoEnabled:true,capgoPublicKeyFile,channel:'beta'},null,2)+'\n',{mode:0o600});
 console.log('Saved local release configuration. No account token goes in the app. Next: npm run prepare:ios -- --testflight');
}finally{q.close();}
