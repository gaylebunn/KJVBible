@echo off
title KJV Bible App Launcher
echo ===================================================
echo   KJV BIBLE APP LAUNCHER (Inspired by Jesus Christ)
echo ===================================================
echo.
echo Stopping any existing app instances on port 3000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do (
    taskkill /f /pid %%a 2>nul
)

echo Launching browser to http://localhost:3000...
start "" "http://localhost:3000"

echo Starting local web server...
call npm run dev
pause
