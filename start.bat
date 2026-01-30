@echo off
echo ===================================================
echo Starting EduMate AI Demo Mode...
echo ===================================================

echo Starting Backend (Real AI Mode - GPT-4o)...
start "EduMate Backend" cmd /k "cd backend & call venv\Scripts\activate & uvicorn main:app --reload --host 0.0.0.0"

echo Starting Frontend...
start "EduMate Frontend" cmd /k "cd frontend & npm run dev"

echo.
echo ===================================================
echo Servers are launching in separate windows.
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo ===================================================
pause
