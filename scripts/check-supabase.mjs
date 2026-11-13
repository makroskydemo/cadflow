import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {readPublicConfig} from './public-config.mjs';

export async function checkConnection(config, fetchImpl = fetch) {
  if (!config.configured) throw Error('Supabase URL ve publishable key henüz girilmedi.');
  const response = await fetchImpl(config.supabaseUrl + '/auth/v1/settings', {
    method: 'GET', headers: {apikey: config.supabasePublishableKey, Accept: 'application/json'},
    redirect: 'error', signal: AbortSignal.timeout(10000)
  });
  if (!response.ok) throw Error('Supabase bağlantı kontrolü başarısız. HTTP ' + response.status);
  let settings;
  try { settings = await response.json(); } catch { throw Error('Supabase geçerli JSON yanıtı vermedi.'); }
  if (!settings || typeof settings !== 'object' || Array.isArray(settings) || settings.error) throw Error('Supabase ayar yanıtı geçersiz.');
  return {reachable: true, endpoint: new URL(config.supabaseUrl).hostname};
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const root = fileURLToPath(new URL('..', import.meta.url));
    const result = await checkConnection(await readPublicConfig(root));
    console.log('Supabase public bağlantısı erişilebilir:', result.endpoint);
    console.log('Bu salt okunur kontrol; firma/proje/teklif verisi senkronize etmez.');
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
