@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
 echo Node.js bulunamadi. Offline acilis icin index.html dosyasini acin.
 pause
 exit /b 1
)
set PLMR_OPEN_BROWSER=1
node start-local.cjs
pause
