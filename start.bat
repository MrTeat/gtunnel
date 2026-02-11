@echo off
REM GTunnel Windows Batch Helper
REM This script helps Windows users run gtunnel by automatically using npx if needed

REM Check if gtunnel is available
where gtunnel >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    REM gtunnel is installed, use it directly
    gtunnel start %*
) else (
    REM gtunnel not found, try using npx
    echo gtunnel not found in PATH, using npx...
    echo.
    
    REM Check if npx is available
    where npx >nul 2>&1
    if %ERRORLEVEL% NEQ 0 (
        echo Error: Neither gtunnel nor npx is available.
        echo.
        echo Please install Node.js and npm first:
        echo   Download from: https://nodejs.org/
        echo.
        echo After installing Node.js, you can:
        echo   1. Install gtunnel globally: npm install -g gtunnel
        echo   2. Or use npx directly: npx gtunnel start [options]
        exit /b 1
    )
    
    npx gtunnel start %*
)
