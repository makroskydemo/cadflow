# MAKROSKY CadFlow V16 — hazır uygulama

Node >=22. `BASLAT_WINDOWS.bat` veya `npm start` mevcut yayın builder'ını çalıştırıp
yerel HTTP üzerinden uygulamayı açar. Hazır uygulama için npm kurulumu gerekmez.
`npm run build` → `_site`; `npm run verify` hash/provenance kontrolü yapar.

GitHub: özgün `hizliyukle.bat` → `hizli-yukle.ps1`. Yalnız bu klasörün içeriğini
`makroskydemo/cadflow/main` için kullanın. Yerel ön kontrol:
`powershell -NoProfile -ExecutionPolicy Bypass -File .\hizli-yukle.ps1 -CheckOnly`
Bu seçenek GitHub'a bağlanmadan döner. Seçeneksiz BAT özgün canlı yükleme akışıdır.

Asıl kaynak kardeş `04_DOCS_HANDOFF/Development_Protocol/03_DEVELOPMENT_SOURCE/`
klasöründedir. Derlenmiş assets kaynak yerine düzenlenmez.

Bu uygulama üretim MAKROSKY bağlantı ayarlarını korur. Kendi hesabınızla girişten
sonraki işlemler bulut verinizi etkileyebilir. V16 test hesapları/hook'ları bu
yayında bulunmaz. Testler kardeş `03_TESTS_REPORTS/V16/` altında izole çalışır.

Güncel paket devir ve kabul belgeleri paket kökündedir. Canlı dağıtım bu teslim
hazırlanırken yapılmadı. Offline dosyasının file:// kabulü ortam politikası nedeniyle açıktır.
