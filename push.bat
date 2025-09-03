@echo off
echo 🚀 Pushing hrbooteh.com to server...
echo.

:: Run PowerShell script
powershell -ExecutionPolicy Bypass -File "push-to-server.ps1"

echo.
echo Press any key to continue...
pause >nul
