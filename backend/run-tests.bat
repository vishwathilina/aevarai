@echo off
REM Quick Test Runner for Auction Platform APIs
REM Windows Batch Script

echo ================================================
echo    Auction Platform - Quick API Test Runner
echo ================================================
echo.

REM Check if PowerShell is available
where powershell >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: PowerShell not found!
    echo Please install PowerShell to run this script.
    pause
    exit /b 1
)

echo Starting API tests...
echo.

REM Run the PowerShell test script
powershell -ExecutionPolicy Bypass -File "test-apis.ps1"

echo.
echo ================================================
echo Test execution completed!
echo ================================================
echo.
echo Check the output above for results.
echo Tokens have been saved to: api-tokens.json
echo.

pause
