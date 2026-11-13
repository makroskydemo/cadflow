import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {filesIn} from './build-site.mjs';

const runtimeRoot = fileURLToPath(new URL('..', import.meta.url));
export async function verifySite(root = path.join(runtimeRoot, '_site')) {
  const manifest = JSON.parse(await fs.readFile(path.join(root, 'deployment-manifest.json'), 'utf8'));
  const entry=await fs.readFile(path.join(root,'index.html'),'utf8');
  const cloudConfig=JSON.parse(await fs.readFile(path.join(root,'plmr-public-config.json'),'utf8'));
  if (!manifest.supabaseConnectionConfigured || !cloudConfig.configured ||
      cloudConfig.supabaseUrl!=='https://rqstvpmqgkdghrbokbzn.supabase.co' ||
      !/^sb_publishable_[A-Za-z0-9_-]{16,}$/.test(cloudConfig.supabasePublishableKey)) {
    throw Error('CadFlow cloud config missing or invalid in publication.');
  }
  const mainEntries=Object.keys(manifest.files).filter(name=>/^assets\/index-[A-Za-z0-9_-]+\.js$/.test(name));
  if(mainEntries.length!==1)throw Error('Cloud-configured CadFlow entry script was not found.');
  const builtEntry=await fs.readFile(path.join(root,mainEntries[0]),'utf8');
  const expectedCloudConfig=`supabaseUrl:${JSON.stringify(cloudConfig.supabaseUrl)},supabasePublishableKey:${JSON.stringify(cloudConfig.supabasePublishableKey)}`;
  if(!builtEntry.includes(expectedCloudConfig))throw Error('Public cloud key was not embedded in the browser entry script.');
  const worker=await fs.readFile(path.join(root,'sw.js'),'utf8');
  const expectedRevision=`${JSON.stringify(mainEntries[0])}:${JSON.stringify(crypto.createHash('sha256').update(builtEntry).digest('hex'))}`;
  if(!worker.includes(expectedRevision))throw Error('PWA cache revision does not match the public-configured JS entry.');
  if(manifest.webRuntime!=='split'||entry.length>5000||!/<script\s+type="module"[^>]+src=/.test(entry))throw Error('Parçalı web girişi yayınlanmadı.');
  const names = (await filesIn(root)).map(file => path.relative(root, file).split(path.sep).join('/'));
  const expected = new Set([...Object.keys(manifest.files), manifest.selfExcluded]);
  if (names.length !== expected.size || names.some(name => !expected.has(name))) throw Error('Yayın manifesti dosya listesiyle eşleşmiyor.');
  for (const [relative, hash] of Object.entries(manifest.files)) {
    if (relative.startsWith('/') || relative.split('/').includes('..')) throw Error('Geçersiz manifest yolu.');
    const content = await fs.readFile(path.join(root, relative));
    if (crypto.createHash('sha256').update(content).digest('hex') !== hash) throw Error('Yayın dosyası hash ile eşleşmiyor: ' + relative);
  }
  for (const required of ['index.html', 'manifest.webmanifest', 'sw.js', 'assets/pwa/icon-192.png', 'assets/pwa/icon-512.png', 'assets/pwa/favicon.ico', 'assets/pwa/icon-180.png', 'drawing-engine/embedded.html', 'drawing-engine/src/app.js', '.nojekyll', 'plmr-public-config.json']) {
    if (!expected.has(required)) throw Error('Eksik yayın girişi: ' + required);
  }
  const prohibited = names.filter(name => name.split('/').some(part => ['supabase', '.github', 'scripts', 'server', 'node_modules'].includes(part)) || /(^|\/)\.env|\.local\.json$/.test(name));
  if (prohibited.length) throw Error('Yayın çıktısına yalnız repo/yerel kurulum dosyası girmiş.');
  for (const relative of names.filter(name => name.endsWith('.html'))) {
    const html = await fs.readFile(path.join(root, relative), 'utf8');
    for (const match of html.matchAll(/\b(?:src|href)\s*=\s*["']([^"']+)["']/gi)) {
      const link = match[1];
      if (/^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(link) || link.includes('${') || link.includes('{{')) continue;
      const clean = decodeURIComponent(link.split(/[?#]/)[0]);
      if (!clean) continue;
      const target = path.resolve(path.dirname(path.join(root, relative)), clean);
      if (!target.startsWith(path.resolve(root) + path.sep)) throw Error('Alt yolda çalışmayan mutlak varlık adresi: ' + relative);
      try { await fs.access(target); } catch { throw Error('Eksik HTML varlığı: ' + relative + ' -> ' + clean); }
    }
  }
  return {files: names.length, businessDataMode: manifest.businessDataMode};
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { const result = await verifySite(); console.log('Yayın dosyaları doğrulandı:', result.files); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
