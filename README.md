# MAKROSKY CadFlow

Independent customer demonstration repository for MAKROSKY CadFlow.

## Deployment

The Windows upload package uses **Git for Windows** and **Windows PowerShell 5.1**. It no longer requires Node.js on the local computer.

Use `01_APPLICATION/hizliyukle.bat` from the extracted release package. The uploader validates its target, web-source checksums and public-only credentials, then pushes sources to this repository's `main` branch.

GitHub Actions workflow `Publish MAKROSKY CadFlow` will use Node.js 24 to build, verify, and publish GitHub Pages. GitHub Pages must be configured with **Settings > Pages > Build and deployment > Source: GitHub Actions**.

**Note:** The presence of this README only proves repository write access. The application is not deployed until the source upload and the subsequent Pages workflow succeed.

Target Supabase project: `rqstvpmqgkdghrbokbzn`. Do not upload service-role or secret keys.
