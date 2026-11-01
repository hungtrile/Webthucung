@echo off
setlocal
cd /d "%~dp0"
echo =============================================
echo PET PHET - BUILD STATIC SITE FOR LIVE SERVER
echo =============================================
where npm >nul 2>nul
if errorlevel 1 (
  echo Khong tim thay npm. Hay cai Node.js LTS truoc.
  pause
  exit /b 1
)
echo [1/2] Cai dependencies...
npm install
if errorlevel 1 (
  echo npm install that bai. Hay kiem tra ket noi Internet va package.json.
  pause
  exit /b 1
)
echo [2/2] Build website tinh...
npm run build:live-server
if errorlevel 1 (
  echo Build that bai. Kiem tra loi phia tren.
  pause
  exit /b 1
)
echo.
echo HOAN TAT! Hay mo rieng thu muc live-server trong VS Code,
echo sau do click phai index.html va chon Open with Live Server.
pause
