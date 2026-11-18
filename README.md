# MAKROSKY CadFlow V18 — hazır uygulama

Node >=22. `BASLAT_WINDOWS.bat` veya `npm start` mevcut yayın builder'ını çalıştırıp
yerel HTTP üzerinden uygulamayı açar. Hazır uygulama için npm kurulumu gerekmez.
`npm run build` → `_site`; `npm run verify` hash/provenance kontrolü yapar.

GitHub: özgün `hizliyukle.bat` → `hizli-yukle.ps1`. Yalnız bu klasörün içeriğini
`makroskydemo/cadflow/main` için kullanın. Yerel ön kontrol:
`powershell -NoProfile -ExecutionPolicy Bypass -File .\hizli-yukle.ps1 -CheckOnly`
Bu seçenek GitHub'a bağlanmadan döner. Seçeneksiz BAT özgün canlı yükleme akışıdır.

Asıl kaynak kardeş `04_DOCS_HANDOFF/Development_Protocol/03_DEVELOPMENT_SOURCE/`
klasöründedir. Derlenmiş assets kaynak yerine düzenlenmez.

V17 Supabase paketi hedef ortamda kurulmuşsa V18 yalnız uygulama yayını gerektirir.
V17 kurulmadıysa önce kardeş `02_SUPABASE/hizliyukle.bat` komutunu parametresiz
çalıştırın. Supabase proje ref'i `rqstvpmqgkdghrbokbzn`.
İzole V18 testleri kardeş `03_TESTS_REPORTS/V18/` altındadır.

Güncel paket devir ve kabul belgeleri paket kökündedir. Canlı dağıtım bu teslim
hazırlanırken yapılmadı. Offline dosyasının file:// kabulü ortam politikası nedeniyle açıktır.
