# MAKROSKY CadFlow V13 — RC / PARTIAL

Web yayını `index.html` + Vite fingerprintli `assets/`; offline inceleme `offline.html`. İkisi aynı kanonik TypeScript kaynağından üretilir. `file://index.html`, offline.html'e yönlenir.

Yayın hazırlığı (Node >=22):
```sh
npm run build
npm run verify
npm start
```
`_site/` yeniden üretilir, kaynak ZIP/GitHub yüklemesine dahil edilmez. GitHub Actions yalnız bu hazır runtime'ı paketler; TypeScript derlemesini kullanıcı yüklemeden önce kaynak paketinde yapar.

Kanonik geliştirme: `../04_DOCS_HANDOFF/Development_Protocol/03_DEVELOPMENT_SOURCE/`:
```sh
npm ci
npm run build
npm run verify:release
npm run test:v13
```
Bu komutlar source → split web + standalone offline + motor kimliği/PWA/provenance bağını günceller. Eski sync/deployment/build scriptleri tarihsel yollardır; V13 için giriş `scripts/build_v13.cjs`.

Hedef yalnız `makroskydemo/cadflow/main` ve Supabase `rqstvpmqgkdghrbokbzn`. Push/SQL/migration/Edge deploy yapılmadı. Kullanıcı yayınlar. Kök `DEVIR_NOTU.md`, `TEST_SONUCLARI.md`, `KABUL_MATRISI.md` ve `PERFORMANS_RAPORU.md` geçerli kabul girişleridir. Gerçek oturum/iki kullanıcı/RLS ve15tamE2E kabulü açık; bu paket FINAL-VERIFIED değildir.
