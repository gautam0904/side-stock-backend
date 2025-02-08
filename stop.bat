@echo off
echo Stopping Backend and Frontend...

:: Stop the Backend Node.js process
echo Killing the Backend process...
taskkill /F /IM node.exe /T > nul 2>&1

:: Stop the Frontend Node.js process
echo Killing the Frontend process...
taskkill /F /IM node.exe /T > nul 2>&1

echo Backend and Frontend have been stopped.
pause
