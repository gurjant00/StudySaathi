#!/bin/bash
# EduMate AI - Quick Start Script for running both servers

echo "========================================="
echo "EduMate AI - Starting Application"
echo "========================================="
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check Python
if ! command_exists python && ! command_exists python3; then
    echo "ERROR: Python is not installed"
    exit 1
fi

# Check Node.js
if ! command_exists node; then
    echo "ERROR: Node.js is not installed"
    exit 1
fi

echo "Starting Backend on port 8000..."
cd backend
if [ -d "venv" ]; then
    source venv/Scripts/activate 2>/dev/null || source venv/bin/activate
fi
python -m uvicorn main:app --reload &
BACKEND_PID=$!
cd ..

echo "Waiting for backend to start..."
sleep 3

echo "Starting Frontend on port 3000..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "========================================="
echo "Application is running!"
echo "========================================="
echo "Backend:  http://localhost:8000"
echo "Frontend: http://localhost:3000"
echo "API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Wait for interrupt
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
