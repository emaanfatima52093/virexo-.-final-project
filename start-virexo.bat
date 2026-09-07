@echo off
title Virexo Innovations - Local Server
cd /d "%~dp0"
echo.
echo ==========================================
echo   VIREXO INNOVATIONS - LOCAL MARKETPLACE
echo ==========================================
echo.
if not exist node_modules (
  echo Installing dependencies for the first run...
  call npm install
  if errorlevel 1 (
    echo.
    echo Dependency installation failed.
    pause
    exit /b 1
  )
)
if not exist .env if exist .env.example copy .env.example .env >nul
echo Starting Virexo...
echo.
echo Open the website at: http://localhost:3000
echo Login page: http://localhost:3000/auth.html
echo.
start "" "http://localhost:3000"
call npm start
pause
