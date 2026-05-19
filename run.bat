@echo off
setlocal enabledelayedexpansion

echo  =========================================
echo       OpenLLM - Neural Startup Matrix
echo  =========================================

REM 1. Check for Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed.
    pause
    exit /b 1
)

REM 2. Setup .env if missing
if not exist ".env" (
    echo [INIT] Creating .env...
    copy .env.example .env >nul
    node -e "console.log('ENCRYPTION_KEY=' + require('crypto').randomBytes(32).toString('hex'))" >> .env
)

REM 3. Automatic Browser Open
echo [INFO] Opening Dashboard in your browser...
start http://localhost:5173

REM 4. Start the project
echo [START] Launching Server and Client...
echo [INFO] Keep this window open while using the app.
echo ---------------------------------------------------
echo.

call npm run dev

REM 5. Keep window open on crash
if %errorlevel% neq 0 (
    echo.
    echo ---------------------------------------------------
    echo [CRITICAL ERROR] The server has stopped unexpectedly.
    echo Please read the messages above to see what went wrong.
    echo.
    pause
)
