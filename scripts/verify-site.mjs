import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {filesIn} from './build-site.mjs';
import {validatePublicConfig,CADFLOW_SUPABASE_URL} from './public-config.mjs';
const runtimeRoot=fileURLToPath(new URL('..',import.meta.url));
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
export async function verifySite(root=path.join(runtimeRoot,'_site')){
  const manifest=JSON.parse(await fs.readFile(path.join(root,'deployment-manifest.json'),'utf8'));
  const provenance=JSON.parse(await fs.readFile(path.join(root,'SOURCE_RUNTIME_PROVENANCE.json'),'utf8'));
  const entry=await fs.readFile(path.join(root,'index.html'));
  const config=JSON.parse(await fs.readFile(path.join(root,'plmr-public-config.json'),'utf8'));
  if(manifest.release!=='MakroskyCadFlow_FinalProcess_v13' || manifest.format!==3 ||
     manifest.webRuntime!=='vite-split-and-offline-source-build' || provenance.v9WebReused!==false ||
     sha(entry)!==provenance.entrySha256 || manifest.entrySha256!==sha(entry) ||
     manifest.sourceManifestHash!==provenance.sourceManifestHash ||
     !entry.includes(provenance.sourceManifestHash) || !entry.includes('window.__PLMR_RUNTIME_MANIFEST_HASH__'))
    throw Error('V13 kaynak/run-time kanıtı veya HTML uyuşmuyor.');
  if(!manifest.supabaseConnectionConfigured||!config.configured||config.supabaseUrl!==CADFLOW_SUPABASE_URL)
    throw Error('MAKROSKY Supabase public bağlantı ayarı eksik.');
  validatePublicConfig({supabaseUrl:config.supabaseUrl,supabasePublishableKey:config.supabasePublishableKey});
  const names=(await filesIn(root)).map(f=>path.relative(root,f).split(path.sep).join('/'));
  const expected=new Set([...Object.keys(manifest.files),manifest.selfExcluded]);
  if(names.length!==expected.size||names.some(n=>!expected.has(n)))throw Error('Dosya listesi manifest ile uyuşmuyor.');
  for(const [relative,hash] of Object.entries(manifest.files)){
    if(relative.startsWith('/')||relative.split('/').includes('..'))throw Error('Geçersiz yol.');
    if(sha(await fs.readFile(path.join(root,relative)))!==hash)throw Error('Hash eşleşmedi: '+relative);
  }
  for(const [rel,hash] of Object.entries(provenance.runtimeFiles)){
    if(rel.startsWith('/')||rel.split('/').includes('..')||sha(await fs.readFile(path.join(root,rel)))!==hash)throw Error('Generated runtime hash mismatch: '+rel);
  }
  const mandatory=['index.html','offline.html','BUNDLE_REPORT.json','manifest.webmanifest','sw.js','.nojekyll','plmr-public-config.json',
    'drawing-engine/embedded.html','drawing-engine/src/app.js','assets/pwa/favicon.ico','assets/pwa/icon-192.png','assets/pwa/icon-512.png'];
  if(mandatory.some(file=>!expected.has(file)))throw Error('Gerekli yayın dosyası eksik.');
  const prohibited=names.filter(name=>name.split('/').some(part=>['supabase','scripts','server','node_modules','web'].includes(part))||
    /(^|\/)\.env|\.local\.json$|(?:^|\/)production(?:-v49)?\//i.test(name));
  if(prohibited.length)throw Error('Yayın kaynaklarına istenmeyen dosya girdi: '+prohibited.slice(0,5).join(','));
  // Check PWA revision integrity for the new graphics and runtime.
  const worker=await fs.readFile(path.join(root,'sw.js'),'utf8');
  const hit=/const PLMR_ASSET_REVISIONS=(\{.*?\});/.exec(worker);
  if(!hit)throw Error('PWA revision manifest bulunamadı.');
  const revisions=JSON.parse(hit[1]);
  for(const [file,hash] of Object.entries(revisions)){
    if(!expected.has(file)||sha(await fs.readFile(path.join(root,file)))!==hash)throw Error('PWA revision eşleşmedi: '+file);
  }
  for(const rel of names.filter(name=>name.endsWith('.html'))){
    const html=await fs.readFile(path.join(root,rel),'utf8');
    for(const match of html.matchAll(/\b(?:src|href)\s*=\s*["']([^"']+)["']/gi)){
      const link=match[1];if(/^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(link)||link.includes('${')||link.includes('{{'))continue;
      const clean=decodeURIComponent(link.split(/[?#]/)[0]);if(!clean)continue;
      const target=path.resolve(path.dirname(path.join(root,rel)),clean);
      if(!target.startsWith(path.resolve(root)+path.sep))throw Error('Mutlak varlık yolu: '+rel);
      await fs.access(target).catch(()=>{throw Error('HTML varlığı eksik: '+rel+' -> '+clean)});
    }
  }
  return {files:names.length,release:manifest.release,entryBytes:entry.length};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{console.log('V13 yayın dosyaları doğrulandı:',await verifySite());}
  catch(e){console.error(e.message);process.exitCode=1;}
}
