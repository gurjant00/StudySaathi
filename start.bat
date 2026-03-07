@echo off
setlocal enabledelayedexpansion
echo ===================================================
echo Starting StudySaathi...
echo ===================================================

echo Starting Backend (Real AI Mode - GPT-OSS-20B)...
start "StudySaathi Backend" cmd /k "cd backend & .\venv\Scripts\python.exe -m uvicorn main:app --reload --host 0.0.0.0"

echo Starting Frontend...
start "StudySaathi Frontend" cmd /k "cd frontend & npm run dev"

echo.
echo ===================================================
echo Servers are launching in separate windows.
echo Backend:   http://localhost:8000
echo Frontend:  http://localhost:3000
echo Network:   http://10.53.1.58.nip.io:3000
echo ===================================================
pause
