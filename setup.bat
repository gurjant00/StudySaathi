@echo off
REM EduMate AI - Quick Setup Script for Windows
REM This script helps set up the project on Windows

echo ========================================
echo EduMate AI - Quick Setup
echo ========================================
echo.

REM Check Python installation
echo [1/4] Checking Python installation...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python from https://www.python.org/
    pause
    exit /b 1
)
python --version
echo.

REM Check Node.js installation
echo [2/4] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
node --version
npm --version
echo.

REM Setup Backend
echo [3/4] Setting up Backend...
cd backend
echo Creating virtual environment...
python -m venv venv
echo.
echo Activating virtual environment...
call venv\Scripts\activate.bat
echo.
echo Installing Python packages...
echo NOTE: If this fails with pydantic-core errors, try:
echo   pip install fastapi uvicorn pydantic python-multipart --only-binary=:all:
echo.
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to install Python packages
    echo Trying alternative installation with pre-built wheels...
    pip install fastapi uvicorn pydantic python-multipart --only-binary=:all:
)
cd ..
echo.

REM Setup Frontend
echo [4/4] Setting up Frontend...
cd frontend
echo Installing npm packages...
call npm install
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to install npm packages
    echo This might be due to PowerShell execution policy
    echo Please run PowerShell as Administrator and execute:
    echo   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
    pause
    exit /b 1
)
cd ..
echo.

echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo To run the application:
echo.
echo 1. Start Backend (in one terminal):
echo    cd backend
echo    venv\Scripts\activate
echo    python -m uvicorn main:app --reload
echo.
echo 2. Start Frontend (in another terminal):
echo    cd frontend
echo    npm run dev
echo.
echo Then open http://localhost:3000 in your browser
echo.
pause
