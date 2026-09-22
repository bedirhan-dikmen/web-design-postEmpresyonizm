// Launch gate: lists every business-data placeholder still open (lib/site/site.json and the NEXT_PUBLIC_*
// variables in .env), and scans the source for addresses that must never ship (localhost, example domains).
// Exits 1 while anything is open.
//
// Usage: npm run check:launch   (reads .env when present, like `next build`)

import fs from 'node:fs';
import path from 'node:path';
import SITE from '../lib/site/site.json' with { type: 'json' };

if (fs.existsSync('.env')) process.loadEnvFile('.env');
const env = (k) => (process.env[k] ?? '').trim();

const open = [];
const need = (ok, what, where) => { if (!ok) open.push([what, where]); };
need(env('NEXT_PUBLIC_SITE_URL') || SITE.url, 'Kanonik alan adı (QR ve paylaşım bu adrese gider)', 'site.json → url / NEXT_PUBLIC_SITE_URL');
need(env('NEXT_PUBLIC_CONTACT_PHONE'), 'Telefon', '.env → NEXT_PUBLIC_CONTACT_PHONE');
need(env('NEXT_PUBLIC_CONTACT_EMAIL'), 'E-posta', '.env → NEXT_PUBLIC_CONTACT_EMAIL');
need(env('NEXT_PUBLIC_CONTACT_ADDRESS'), 'Adres', '.env → NEXT_PUBLIC_CONTACT_ADDRESS');
need(env('NEXT_PUBLIC_CONTACT_FORM_ENDPOINT'), 'İletişim formu uç noktası (form şu an gönderilemez)', '.env → NEXT_PUBLIC_CONTACT_FORM_ENDPOINT');
need(SITE.social.linkedin, 'LinkedIn (yoksa bilerek null bırakın ve bu satırı kaldırın)', 'site.json → social.linkedin');
need(SITE.legal.kvkk, 'KVKK Aydınlatma Metni sayfası (form kişisel veri topluyor)', 'site.json → legal.kvkk');
need(SITE.legal.privacy, 'Gizlilik Politikası sayfası', 'site.json → legal.privacy');
need(SITE.legal.cookies, 'Çerez Politikası sayfası', 'site.json → legal.cookies');

// source scan: nothing that only works on a developer's machine or points at an example domain
const banned = [/localhost(:\d+)?/i, /127\.0\.0\.1/, /\bexample\.(com|org|net)\b/i];
const roots = ['app', 'components', 'lib'];
const hits = [];
const walk = (dir) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(tsx?|json|css)$/.test(e.name)) {
      fs.readFileSync(p, 'utf8').split('\n').forEach((line, i) => {
        if (/^\s*(\/\/|\*|\/\*)/.test(line) || /"_[a-z]+":/.test(line)) return; // comments and documentation keys
        if (banned.some((re) => re.test(line))) hits.push(`${p}:${i + 1}: ${line.trim().slice(0, 120)}`);
      });
    }
  }
};
roots.forEach(walk);

console.log('Kerinti Soft — yayın kontrolü\n');
if (open.length) {
  console.log('Doldurulması gereken yer tutucular:');
  for (const [what, where] of open) console.log(`  ✗ ${what}\n      ${where}`);
} else console.log('  ✓ Tüm iş verileri girilmiş.');
if (hits.length) {
  console.log('\nKaynakta yayına çıkmaması gereken adresler:');
  hits.forEach((h) => console.log(`  ✗ ${h}`));
} else console.log('  ✓ Kaynakta localhost / example.com yok.');
process.exit(open.length || hits.length ? 1 : 0);
