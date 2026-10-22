@echo off
cd /d "%~dp0"
echo ============================================
echo          PLAY ARENA - STARTUP
echo ============================================
if not exist node_modules (
  echo Installing dependencies for first run...
  call npm install --legacy-peer-deps
  if errorlevel 1 (echo Dependency installation failed. Check internet and Node.js. & pause & exit /b 1)
)
if not exist .env.local (
  echo NOTE: .env.local not found. Copy .env.example to .env.local and configure Supabase for real login/database.
)
call npm run dev
pause
