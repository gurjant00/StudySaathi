# Windows Setup Guide for EduMate AI

This guide helps you set up the EduMate AI platform on Windows, addressing common issues.

## 🔧 Prerequisites

Before starting, ensure you have:
- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **Python** (v3.8 to 3.10) - [Download](https://www.python.org/)
- **Git Bash** or **Windows Terminal** (optional, recommended)

## ⚠️ Common Windows Issues & Solutions

### Issue 1: PowerShell Execution Policy

**Error:**
```
npm : File C:\Program Files\nodejs\npm.ps1 cannot be loaded because running scripts is disabled on this system.
```

**Solution 1: Change Execution Policy (Recommended)**
1. Open **PowerShell as Administrator**
2. Run this command:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```
3. Press `Y` to confirm
4. Close and reopen PowerShell

**Solution 2: Use Command Prompt**
- Use `cmd` instead of PowerShell
- Or use Git Bash if installed

**Solution 3: Bypass for Single Command**
```powershell
powershell -ExecutionPolicy Bypass -Command "npm install"
```

### Issue 2: Python Build Tools for pydantic-core

**Error:**
```
error: metadata-generation-failed
pydantic-core requires Rust and Cargo to compile
```

**Solution 1: Use Anaconda/Miniconda (RECOMMENDED)**

1. Install [Miniconda](https://docs.conda.io/en/latest/miniconda.html)
2. Create environment:
```bash
conda create -n edumate python=3.10
conda activate edumate
```
3. Install dependencies:
```bash
conda install -c conda-forge fastapi uvicorn pydantic python-multipart
```

**Solution 2: Install Pre-built Wheels**
```bash
pip install fastapi==0.109.0 uvicorn==0.27.0 pydantic==2.5.3 python-multipart==0.0.6 --only-binary=:all:
```

**Solution 3: Install Build Tools**
1. Download [Microsoft C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)
2. Install "Desktop development with C++"
3. Then run `pip install -r requirements.txt`

## 📦 Step-by-Step Installation

### Backend Setup

#### Option A: Using Conda (Easiest for Windows)

```bash
# Navigate to backend folder
cd backend

# Create and activate environment
conda create -n edumate python=3.10 -y
conda activate edumate

# Install dependencies
conda install -c conda-forge fastapi uvicorn pydantic python-multipart -y

# Run the server
python -m uvicorn main:app --reload
```

#### Option B: Using pip with venv

```bash
# Navigate to backend folder
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# For PowerShell:
venv\Scripts\Activate.ps1
# For Command Prompt:
venv\Scripts\activate.bat

# Install dependencies
pip install -r requirements.txt

# If that fails, try:
pip install fastapi uvicorn pydantic python-multipart --only-binary=:all:

# Run the server
python -m uvicorn main:app --reload
```

**Backend should now be running at:** `http://localhost:8000`

Visit `http://localhost:8000/docs` to see the API documentation.

---

### Frontend Setup

#### Fix PowerShell if needed:
```powershell
# Run PowerShell as Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### Install and Run:

**Option A: PowerShell/Terminal**
```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

**Option B: Command Prompt (if PowerShell issues persist)**
```cmd
cd frontend
npm install
npm run dev
```

**Option C: Use npx directly without npm**
```bash
cd frontend
npx vite
```

**Frontend should now be running at:** `http://localhost:3000`

## 🚀 Quick Start Commands

Once setup is complete, use these commands to run the application:

### Terminal 1 (Backend):
```bash
cd backend
conda activate edumate  # or venv\Scripts\activate
python -m uvicorn main:app --reload
```

### Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

Then open `http://localhost:3000` in your browser!

## 🧪 Verify Installation

### Backend Verification:
```bash
# Navigate to backend folder
cd backend

# Test if Python packages are installed
python -c "import fastapi; print('FastAPI OK')"
```

Expected output: `FastAPI OK`

### Frontend Verification:
```bash
# Navigate to frontend folder
cd frontend

# Check if node_modules exists
dir node_modules
```

You should see folders like `react`, `vite`, etc.

## 🔍 Troubleshooting

### Backend won't start

**Check Python version:**
```bash
python --version
```
Should be 3.8 or higher, but preferably 3.10.

**Check if port 8000 is already in use:**
```bash
netstat -ano | findstr :8000
```

If something is using it, change the port:
```bash
python -m uvicorn main:app --reload --port 8001
```

Update the frontend API_URL in all page files to `http://localhost:8001`

### Frontend won't start

**Clear npm cache:**
```bash
npm cache clean --force
rm -rf node_modules
rm package-lock.json
npm install
```

**Use different port if 3000 is busy:**
Edit `vite.config.js`:
```javascript
server: {
  port: 3001,  // Change this
  open: true
}
```

### "Module not found" errors

Make sure you're in the correct directory:
- Backend commands should be run from `backend/` folder
- Frontend commands should be run from `frontend/` folder

## 📚 Additional Resources

- [Node.js Download](https://nodejs.org/)
- [Python Download](https://www.python.org/)
- [Miniconda Download](https://docs.conda.io/en/latest/miniconda.html)
- [PowerShell Execution Policies](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_execution_policies)

## 💡 Pro Tips

1. **Use Windows Terminal**: Modern, tabbed terminal experience
2. **Use Conda**: Easier dependency management on Windows
3. **Use VS Code**: Built-in terminal and better PowerShell support
4. **Keep terminals open**: Don't close terminals while servers are running
5. **Use Git Bash**: Alternative to PowerShell with Unix-like commands

---

Need help? Check the main [README.md](file:///c:/Users/Sahil%20Kumar/OneDrive/Desktop/Documents/Hackathon-Nirman/README.md) or the [walkthrough.md](file:///C:/Users/Sahil%20Kumar/.gemini/antigravity/brain/8c3acc66-f3ed-40fb-bbd1-823f271dd650/walkthrough.md) for more information!
