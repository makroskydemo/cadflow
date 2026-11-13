import fs from 'node:fs/promises';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {filesIn} from './build-site.mjs';
import {CADFLOW_SUPABASE_URL,validatePublicConfig} from './public-config.mjs';

const root=path.resolve(process.argv[2]||'_site');
const mode=process.argv[3];
const git=(...args)=>execFileSync('git',['-C',root,...args],{maxBuffer:110*1024*1024});
const files=mode==='--staged'?git('ls-files','-z').toString().split('\0').filter(Boolean):
  mode==='--head'?git('ls-tree','-r','--name-only','-z','HEAD').toString().split('\0').filter(Boolean):
  (await filesIn(root)).map(file=>path.relative(root,file).split(path.sep).join('/'));
const oldProject=['yackwdx','dyajejtdxvncu'].join('');
const oldRepo=['plmrpulumur','plmr-demo'].join('/');
for(const file of files){
  if(/(^|\/)(\.env(?:[./]|$)|supabase\.public\.local\.json$|\.cadflow-upload\/)|\.(?:zip|pem|pfx|key|log)$/i.test(file))
    throw Error('Private or unsupported publication file: '+file);
  if(!/\.(?:html?|[cm]?js|[jt]sx?|json|css|ya?ml|md|txt|svg|webmanifest|ps1|bat)$/i.test(file))continue;
  const data=(mode==='--head'?git('show','HEAD:'+file):mode==='--staged'?git('show',':'+file):
    await fs.readFile(path.join(root,file))).toString('utf8');
  if(data.includes(oldProject)||data.includes(oldRepo)||
      /sb_secret_[A-Za-z0-9_-]{16,}|-----BEGIN [A-Z ]*PRIVATE KEY-----|gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{40,}/.test(data))
    throw Error('A forbidden deployment target or private credential was detected in '+file);
  for(const token of data.matchAll(/eyJ[A-Za-z0-9_-]{8,}\.([A-Za-z0-9_-]{15,})\.[A-Za-z0-9_-]{16,}/g)){
    try{
      const claims=JSON.parse(Buffer.from(token[1],'base64url').toString());
      if(claims.role!=='anon')throw Error('A non-public token was detected in '+file);
    }catch(error){if(!(error instanceof SyntaxError))throw error}
  }
  if(/(?:^|\/)supabase\.public(?:\.example)?\.json$/.test(file))
    validatePublicConfig(JSON.parse(data));
  if(file==='plmr-public-config.json'){
    const config=JSON.parse(data);
    if(config.supabaseUrl!==CADFLOW_SUPABASE_URL)throw Error('Invalid CadFlow cloud target.');
    validatePublicConfig({supabaseUrl:config.supabaseUrl,supabasePublishableKey:config.supabasePublishableKey});
  }
}
console.log('CadFlow publication target and credential scan passed for '+files.length+' files.');
