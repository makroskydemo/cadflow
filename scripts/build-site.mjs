import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {readPublicConfig} from './public-config.mjs';

const release='MakroskyCadFlow_FinalProcess_v13';
const runtimeRoot=fileURLToPath(new URL('..',import.meta.url));
const sha256=buf=>crypto.createHash('sha256').update(buf).digest('hex');
const entries=['index.html','offline.html','BUNDLE_REPORT.json','assets','runtime','drawing-engine','manifest.webmanifest','sw.js','PLMR_CUSTOMER_SETUP_TEMPLATE.xlsx'];
export async function filesIn(root){
  const result=[];
  async function visit(dir){
    for(const entry of await fs.readdir(dir,{withFileTypes:true})){
      const name=path.join(dir,entry.name);
      if(entry.isSymbolicLink())throw Error('Yayın paketinde sembolik bağlantı bulunamaz.');
      if(entry.isDirectory())await visit(name);
      else if(entry.isFile())result.push(name);
    }
  }
  await visit(root);
  return result.sort();
}

/** Publish only source-compiled V13 standalone runtime, never the stale V9
 * Vite chunks. This path needs only Node.js and public MAKROSKY configuration. */
export async function buildSite(root=runtimeRoot,destination=path.join(root,'_site'),env=process.env){
  root=path.resolve(root);destination=path.resolve(destination);
  if(destination===root || root.startsWith(destination+path.sep) ||
     entries.some(name=>destination===path.join(root,name)||destination.startsWith(path.join(root,name)+path.sep)))
    throw Error('Yayın çıktısı uygulama kaynaklarını ezemez.');
  const provenance=JSON.parse(await fs.readFile(path.join(root,'SOURCE_RUNTIME_PROVENANCE.json'),'utf8'));
  if(provenance.release!==release||provenance.v9WebReused!==false||provenance.buildMode!=='canonical-source-vite-and-offline-runtime')
    throw Error('V13 kaynak/çalışma sürümü bilgisi hatalı.');
  const entry=await fs.readFile(path.join(root,'index.html'));
  if(sha256(entry)!==provenance.entrySha256 ||
     !entry.includes('window.__PLMR_RUNTIME_MANIFEST_HASH__') ||
     !entry.includes(provenance.sourceManifestHash))
    throw Error('Derlenmiş kaynak ile V13 index.html eşleşmiyor.');
  for(const [rel,expected] of Object.entries(provenance.runtimeFiles)){
    if(rel.startsWith('/')||rel.split('/').includes('..')||sha256(await fs.readFile(path.join(root,rel)))!==expected)throw Error('V13 generated runtime hash mismatch: '+rel);
  }
  const config=await readPublicConfig(root,env);
  if(!config.configured)throw Error('MAKROSKY public Supabase bağlantı bilgileri gerekli.');
  const published=JSON.parse(await fs.readFile(path.join(root,'plmr-public-config.json'),'utf8'));
  if(published.supabaseUrl!==config.supabaseUrl||published.supabasePublishableKey!==config.supabasePublishableKey)
    throw Error('Runtime bulut yapılandırmasıyla yayının public anahtarı uyuşmuyor.');
  for(const name of entries)await fs.access(path.join(root,name));
  await fs.rm(destination,{recursive:true,force:true});await fs.mkdir(destination,{recursive:true});
  const excluded=['assets/production','assets/production-v49','runtime/production','drawing-engine/server','drawing-engine/deployment'];
  for(const name of entries){
    await fs.cp(path.join(root,name),path.join(destination,name),{
      recursive:true,
      filter:source=>{
        const rel=path.relative(root,source).split(path.sep).join('/');
        if(excluded.some(ex=>rel===ex||rel.startsWith(ex+'/')))return false;
        return !rel.split('/').some(part=>['node_modules','server','deployment'].includes(part)) &&
          rel!=='drawing-engine/package.json';
      }
    });
  }
  await fs.writeFile(path.join(destination,'.nojekyll'),'');
  await fs.writeFile(path.join(destination,'plmr-public-config.json'),JSON.stringify(config,null,2)+'\n');
  await fs.writeFile(path.join(destination,'SOURCE_RUNTIME_PROVENANCE.json'),JSON.stringify(provenance,null,2)+'\n');
  const hashes={};
  for(const file of await filesIn(destination)){
    const rel=path.relative(destination,file).split(path.sep).join('/');
    const bytes=await fs.readFile(file);
    if(bytes.length>100*1024*1024)throw Error('GitHub 100 MB dosya sınırını aşan çıktı var: '+rel);
    hashes[rel]=sha256(bytes);
  }
  await fs.writeFile(path.join(destination,'deployment-manifest.json'),JSON.stringify({
    release,format:3,webRuntime:'vite-split-and-offline-source-build',selfExcluded:'deployment-manifest.json',
    sourceManifestHash:provenance.sourceManifestHash,entrySha256:provenance.entrySha256,
    supabaseConnectionConfigured:true,businessDataMode:'supabase',files:hashes
  },null,2)+'\n');
  return {fileCount:Object.keys(hashes).length,entryBytes:entry.length,release};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{console.log('V13 statik yayın hazır:',await buildSite());}
  catch(e){console.error(e.message);process.exitCode=1;}
}
