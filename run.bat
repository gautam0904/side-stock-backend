@echo off
echo Starting Backend and Frontend silently...

:: Start the Backend in the background using VBS
echo Set WshShell = WScript.CreateObject("WScript.Shell") > run_backend.vbs
echo WshShell.Run "cmd /c cd C:\Users\DRM\OneDrive\Desktop\side stock\side-stock-backend-main && npm run start", 0, False >> run_backend.vbs

:: Start the Frontend in the background using VBS
echo Set WshShell = WScript.CreateObject("WScript.Shell") > run_frontend.vbs
echo WshShell.Run "cmd /c cd C:\Users\DRM\OneDrive\Desktop\side stock\side-stock-frontend && npm run dev", 0, False >> run_frontend.vbs

:: Run the VBS scripts to start both processes silently
cscript //nologo run_backend.vbs
cscript //nologo run_frontend.vbs

:: Clean up the temporary VBS files
del run_backend.vbs
del run_frontend.vbs

echo Backend and Frontend are now running in the background.
pause
