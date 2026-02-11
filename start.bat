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
    npx gtunnel start %*
)
