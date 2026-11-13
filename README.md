MAKROSKY CadFlow V3
===================

GitHub target: https://github.com/makroskydemo/cadflow.git (main).
Supabase project: https://rqstvpmqgkdghrbokbzn.supabase.co.

Open index.html from this folder for a clean offline review. The first screen
creates a local administrator. Local records are separate from the cloud.

For local HTTP/cloud use, copy supabase.public.example.json to
supabase.public.local.json, set supabasePublishableKey to the MAKROSKY project
publishable key, then run BASLAT_WINDOWS.bat or npm start.

On GitHub, select Actions as the GitHub Pages source and set the repository
MAKROSKY public key in supabase.public.json to that same publishable key.
Run hizliyukle.bat from this folder with Git for Windows (Node.js NOT required locally).
It validates the web source hashes and public-only config, scans publication
files, commits and pushes main. GitHub Actions runs Node.js 24 build/verify
before Pages publishing. Confirm publication separately in GitHub Actions.


### V5 Windows GitHub deployment

Local Node.js is no longer required for `hizliyukle.bat`. Git for Windows and Windows PowerShell 5.1 are sufficient to stage and push validated sources. The GitHub Actions workflow runs Node.js 24, `npm run build`, and `npm run verify` before publishing to GitHub Pages.
