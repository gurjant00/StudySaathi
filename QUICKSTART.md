# Quick Start Commands

## Windows (Command Prompt or PowerShell)

### Option 1: Automated Setup
```cmd
setup.bat
```

### Option 2: Manual Setup

**Terminal 1 - Backend:**
```cmd
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn main:app --reload
```

**Terminal 2 - Frontend:**
```cmd
cd frontend
npm install
npm run dev
```

## If PowerShell gives errors:

Run PowerShell as Administrator and execute:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## If Python packages fail to install:

Try this instead:
```cmd
pip install fastapi uvicorn pydantic python-multipart --only-binary=:all:
```

Or use Conda:
```cmd
conda create -n edumate python=3.10
conda activate edumate
conda install -c conda-forge fastapi uvicorn pydantic python-multipart
```

## Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## For Demo

1. Open http://localhost:3000
2. Click on any feature card
3. Fill in the form with sample data
4. See beautiful AI-generated results!

## Troubleshooting

See [WINDOWS_SETUP.md](WINDOWS_SETUP.md) for detailed troubleshooting guide.
