@echo off
REM GTunnel Windows Batch Helper
REM This script helps Windows users run gtunnel by automatically using npx if needed

REM Check if gtunnel is available
where gtunnel >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    REM gtunnel is installed, use it directly
    gtunnel start %*
    exit /b %ERRORLEVEL%
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
    set NPX_EXIT=%ERRORLEVEL%
    if %NPX_EXIT% NEQ 0 (
        echo.
        echo Error: Failed to run gtunnel via npx (exit code: %NPX_EXIT%).
        echo.
        echo This could be due to:
        echo   - Network connectivity issues
        echo   - npm package registry problems
        echo   - Invalid gtunnel package
        echo.
        echo Try:
        echo   1. Check your internet connection
        echo   2. Install gtunnel globally: npm install -g gtunnel
        echo   3. Clear npm cache: npm cache clean --force
        exit /b %NPX_EXIT%
    )
)
