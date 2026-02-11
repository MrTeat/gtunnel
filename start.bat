@echo off
REM GTunnel Windows Batch Helper
REM This script helps Windows users avoid the "The system cannot find the file -u" error
REM by ensuring the gtunnel command is properly invoked.

REM Check if gtunnel is available
where gtunnel >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Error: gtunnel is not installed or not in PATH
    echo.
    echo Please install gtunnel first:
    echo   npm install -g gtunnel
    echo.
    echo Or use npx to run it without installation:
    echo   npx gtunnel start %*
    exit /b 1
)

REM Forward all arguments to gtunnel start
gtunnel start %*
