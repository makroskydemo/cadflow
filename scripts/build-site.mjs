import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {readPublicConfig} from './public-config.mjs';

const runtimeRoot = fileURLToPath(new URL('..', import.meta.url));
const publicEntries = ['index.html', 'assets', 'runtime', 'drawing-engine', 'manifest.webmanifest', 'sw.js', 'PLMR_CUSTOMER_SETUP_TEMPLATE.xlsx'];
export async function filesIn(root) {
  const result = [];
  async function visit(directory) {
    for (const entry of await fs.readdir(directory, {withFileTypes: true})) {
      const name = path.join(directory, entry.name);
      if (entry.isSymbolicLink()) throw Error('Yayın paketinde sembolik bağlantı bulunamaz.');
      if (entry.isDirectory()) await visit(name);
      else if (entry.isFile()) result.push(name);
    }
  }
  await visit(root);
  return result.sort();
}
export async function buildSite(root = runtimeRoot, destination = path.join(root, '_site'), env = process.env) {
  root = path.resolve(root); destination = path.resolve(destination);
  if (destination === root || root.startsWith(destination + path.sep) || [...publicEntries,'web'].some(name => destination === path.join(root, name) || destination.startsWith(path.join(root, name) + path.sep))) {
    throw Error('Yayın çıktısı uygulama girişinin veya varlıklarının üzerine yazılamaz.');
  }
  const config = await readPublicConfig(root, env);
  // MAKROSKY is a cloud-only customer demo: a deploy without its public-only
  // connection key would build successfully yet fail on first load.
  if (!config.configured) throw Error('MAKROSKY public Supabase URL and publishable key are required for publication.');
  let patchedEntryCount = 0;
  let patchedEntryPath;
  let patchedEntryHash;
  const web=JSON.parse(await fs.readFile(path.join(root,'web/WEB_FILES.json'),'utf8'));
  if(web.release!=='MakroskyCadFlow_FinalProcess_v7'||!web.files?.['index.html']||!web.files?.['sw.js'])throw Error('CadFlow V7 web build is missing or stale.');
  for (const name of publicEntries) await fs.access(path.join(root, name));
  await fs.rm(destination, {recursive: true, force: true});
  await fs.mkdir(destination, {recursive: true});
  for (const name of publicEntries) {
    await fs.cp(path.join(root, name), path.join(destination, name), {
      recursive: true,
      // Node share service and development scaffolding cannot run on GitHub Pages.
      filter: source => !['assets/production','assets/production-v49'].some(old => source===path.join(root,old)||source.startsWith(path.join(root,old)+path.sep)) && source !== path.join(root,'drawing-engine/package.json') && !path.relative(root, source).split(path.sep).some(part => ['server', 'deployment', 'node_modules'].includes(part))
    });
  }
  // Keep the standalone file:// entry in the delivery. Pages uses the Vite
  // entry and only the modules reached by the current web navigation.
  for(const [relative,digest] of Object.entries(web.files)){
    if(!/^(?:index\.html|sw\.js|(?:assets|runtime\/production)\/[A-Za-z0-9_.-]+)$/.test(relative))throw Error('Geçersiz web varlığı: '+relative);
    const content=await fs.readFile(path.join(root,'web',relative));
    if(crypto.createHash('sha256').update(content).digest('hex')!==digest)throw Error('Web varlık hash uyuşmazlığı: '+relative);
    const target=path.join(destination,relative);
    await fs.mkdir(path.dirname(target),{recursive:true});
    let output = content;
    // The V51 client starts with an empty publishable key and normally fetches
    // plmr-public-config.json. GitHub Pages may temporarily serve that request
    // as a 404 (routing or CDN state). Embed this *public* key at build time so
    // application startup cannot be blocked by a separate config fetch.
    if (/^assets\/index-[A-Za-z0-9_-]+\.js$/.test(relative)) {
      const code = content.toString('utf8');
      const oldValue = `supabaseUrl:${JSON.stringify(config.supabaseUrl)},supabasePublishableKey:""`;
      const newValue = `supabaseUrl:${JSON.stringify(config.supabaseUrl)},supabasePublishableKey:${JSON.stringify(config.supabasePublishableKey)}`;
      if (code.split(oldValue).length !== 2) throw Error('CadFlow application entry public config slot missing or ambiguous.');
      output = Buffer.from(code.replace(oldValue, newValue), 'utf8');
      patchedEntryPath = relative;
      patchedEntryHash = crypto.createHash('sha256').update(output).digest('hex');
      patchedEntryCount++;
    }
    await fs.writeFile(target,output);
  }
  if (patchedEntryCount !== 1) throw Error('Exactly one CadFlow entry chunk must receive public cloud configuration.');
  // Standalone recipients also get the public configuration without a separate request.
  const sharingPath='drawing-engine/src/v22-share-config.js';
  const sharingFile=path.join(destination,sharingPath);
  const sharing=await fs.readFile(sharingFile,'utf8');
  const slot='const publishedKey="";';
  if(sharing.split(slot).length!==2)throw Error('CadFlow sharing public config slot missing or ambiguous.');
  const sharingOutput=sharing.replace(slot,`const publishedKey=${JSON.stringify(config.supabasePublishableKey)};`);
  await fs.writeFile(sharingFile,sharingOutput);

  const workerPath=path.join(destination,'sw.js');
  let worker=await fs.readFile(workerPath,'utf8');
  const revised={
    [patchedEntryPath]:patchedEntryHash,
    [sharingPath]:crypto.createHash('sha256').update(sharingOutput).digest('hex'),
  };
  for(const [relative,digest] of Object.entries(revised)){
    const prefix=JSON.stringify(relative)+':"';
    const offset=worker.indexOf(prefix);
    if(offset<0||worker.indexOf(prefix,offset+1)!==-1)throw Error('CadFlow PWA asset revision slot missing or ambiguous: '+relative);
    const start=offset+prefix.length;
    if(!/^[a-f0-9]{64}$/.test(worker.slice(start,start+64))||worker[start+64]!=='"')throw Error('Invalid PWA asset revision.');
    worker=worker.slice(0,start)+digest+worker.slice(start+64);
  }
  const buildIdentity = /const PLMR_ASSET_BUILD="[a-f0-9]{20}";/;
  if (!buildIdentity.test(worker)) throw Error('PWA build identity missing.');
  const newBuild = crypto.createHash('sha256').update(worker).digest('hex').slice(0,20);
  worker = worker.replace(buildIdentity, `const PLMR_ASSET_BUILD="${newBuild}";`);
  await fs.writeFile(workerPath, worker);
  await fs.writeFile(path.join(destination, '.nojekyll'), '');
  await fs.writeFile(path.join(destination, 'plmr-public-config.json'), JSON.stringify(config, null, 2) + '\n');
  const hashes = {};
  for (const file of await filesIn(destination)) {
    const content = await fs.readFile(file);
    if (content.length > 100 * 1024 * 1024) throw Error('Tek yayın dosyası GitHub 100 MiB sınırını aşıyor.');
    hashes[path.relative(destination, file).split(path.sep).join('/')] = crypto.createHash('sha256').update(content).digest('hex');
  }
  await fs.writeFile(path.join(destination, 'deployment-manifest.json'), JSON.stringify({
    release: 'MakroskyCadFlow_FinalProcess_v7', format: 1, selfExcluded: 'deployment-manifest.json',
    businessDataMode: 'supabase', webRuntime:'split', initialEntryRawBytes:web.initialEntryRawBytes, supabaseConnectionConfigured: config.configured, files: hashes
  }, null, 2) + '\n');
  return {fileCount: Object.keys(hashes).length, configured: config.configured};
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { const result = await buildSite(); console.log('Statik yayın hazır:', result.fileCount, 'dosya. Supabase ayarı:', result.configured ? 'girildi' : 'boş'); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
