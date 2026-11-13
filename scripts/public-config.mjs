export const CADFLOW_SUPABASE_URL='https://rqstvpmqgkdghrbokbzn.supabase.co';
import fs from 'node:fs/promises';
import path from 'node:path';

/** Public connection metadata only. This is not an authentication or business-data adapter. */
export function validatePublicConfig(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw Error('Bağlantı ayarı bir JSON nesnesi olmalı.');
  const allowed = new Set(['supabaseUrl', 'supabasePublishableKey']);
  if (Object.keys(input).some(key => !allowed.has(key))) throw Error('Bağlantı dosyasında yalnız URL ve publishable key bulunabilir.');
  const url = input.supabaseUrl ?? '', key = input.supabasePublishableKey ?? '';
  if (typeof url !== 'string' || typeof key !== 'string') throw Error('Bağlantı değerleri metin olmalı.');
  if ((!url||url===CADFLOW_SUPABASE_URL)&&!key) return {configured:false,supabaseUrl:CADFLOW_SUPABASE_URL,supabasePublishableKey:''};
  if (!url || !key) throw Error('Supabase URL ve publishable key birlikte girilmeli.');
  let parsed;
  try { parsed = new URL(url); } catch { throw Error('Supabase URL geçersiz.'); }
  if (parsed.origin !== CADFLOW_SUPABASE_URL || parsed.protocol !== 'https:' || parsed.username || parsed.password || parsed.search || parsed.hash || !['', '/'].includes(parsed.pathname)) {
    throw Error('Supabase için yalnız HTTPS proje kök adresini girin.');
  }
  if (!/^sb_publishable_[A-Za-z0-9_-]{16,}$/.test(key)) {
    throw Error('Yalnız sb_publishable_ ile başlayan public anahtar kabul edilir; sunucu anahtarını kullanmayın.');
  }
  return {configured: true, supabaseUrl: parsed.origin, supabasePublishableKey: key};
}

export async function readPublicConfig(root, env = process.env) {
  const url = env.CADFLOW_SUPABASE_URL, key = env.CADFLOW_SUPABASE_PUBLISHABLE_KEY;
  if (url || key) return validatePublicConfig({supabaseUrl: url ?? CADFLOW_SUPABASE_URL, supabasePublishableKey: key ?? ''});
  // Prefer the locally ignored override; in published GitHub builds use the tracked
  // public-only metadata file. Neither source may contain secret/service-role keys.
  for (const filename of ['supabase.public.local.json', 'supabase.public.json']) {
    try {
      return validatePublicConfig(JSON.parse(await fs.readFile(path.join(root, filename), 'utf8')));
    } catch (error) {
      if (error.code !== 'ENOENT') throw Error(filename + ' okunamadı veya geçersiz bağlantı değerleri içeriyor.');
    }
  }
  return validatePublicConfig({});
}
