# MAKROSKY CadFlow V8

- GitHub target: `makroskydemo/cadflow`, branch `main`.
- Supabase project ref: `rqstvpmqgkdghrbokbzn`.
- Offline: open `index.html`. The local administrator and records are separate from the cloud.
- Local HTTP: run `BASLAT_WINDOWS.bat` or `npm start` with Node.js 22+. The launcher serves the split web build. For a local publishable key override, copy `supabase.public.example.json` to `supabase.public.local.json`.
- GitHub Pages: select GitHub Actions as the Pages source. Run `hizliyukle.bat` with Git for Windows and Windows PowerShell 5.1. The uploader validates the remote and release files, then commits and pushes `main`. The Pages workflow builds and verifies on Node.js 24. Check Actions to confirm publication.
- Deploy the V8 plmr-platform Edge Function before publishing this web build. V8 uses the existing database schema.
