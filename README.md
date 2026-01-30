# 🎓 EduMate AI – Smart Assistant for Students

![Hackathon Project](https://img.shields.io/badge/Hackathon-Project-brightgreen)
![React](https://img.shields.io/badge/React-18.2-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109-green)
![Status](https://img.shields.io/badge/Status-Production--Ready-orange)

A visually stunning, AI-powered web platform designed to help students with exam preparation, career planning, and professional development. Built for hackathon demonstration with modern design, smooth UX, and robust backend persistence.

## 🚀 NEW: EduMate AI Core Upgrades
- **🔒 Secure Authentication**: Personal user accounts with JWT-based sessions.
- **💾 Full Data Persistence**: All study plans, resumes, and interview feedback are saved to a local SQLite database.
- **🎤 Voice-Enabled Mock Interviews**: Practice technical interviews with real-time speech synthesis and voice recognition.
- **🕒 User History**: Access your past generates anytime from your dashboard.

## 🌟 Key Features

### 1. **AI Study Planner** 📚
Generate personalized daily study schedules and save them to your account.
- YouTube resource links for every subject.
- Progress tracking and persistent storage.

### 2. **AI Notes Summarizer** 📝
Transform lengthy notes into concise, exam-focused bullet points instantly.

### 3. **AI Answer Evaluator** ✅
Get instant feedback on your exam answers with estimated marks, strengths, and areas for improvement.

### 4. **AI Career Advisor** 🎯
Discover suitable career paths based on interests and skills, including salary ranges and growth potential.

### 5. **AI Resume Builder** 📄
Create professional, ATS-friendly resumes with live preview, ATS scoring, and PDF download support.

### 6. **AI Mock Interview** 🎙️
Practice technical interviews with an AI that speaks to you.
- **Real-time Feedback**: Get scored after every answer.
- **Full History**: Review your total evaluation marks and complete chat transcripts later.

## 🎨 Design Highlights
- **Vibrant Gradients**: Professional color palettes for each feature.
- **Glassmorphism**: Modern cards with subtle shadows and blur effects.
- **Dark Mode Support**: Seamlessly switch between light and dark themes.
- **Interactive UI**: Hover effects, micro-animations, and smooth transitions.

## 🚀 Tech Stack

### Frontend
- **React 18** (Vite)
- **Context API** (State & Auth Management)
- **Web Speech API** (Voice Recognition & TTS)
- **Axios** (API Communication)
- **Vanilla CSS** (Custom Design System)

### Backend
- **FastAPI** (Python High-Performance Backend)
- **SQLAlchemy** (Database ORM)
- **SQLite** (Local Data Storage)
- **PyJWT** (Secure Token Authentication)
- **GPT-4o/Gemini** (Advanced AI Reasoning)

## 📦 Installation & Setup

### Prerequisites
- Node.js (v16+)
- Python (v3.8+)

### The "One-Step" Launch
Run the automated batch file to start both frontend and backend:
```cmd
./start.bat
```

### Manual Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
uvicorn main:app --reload
```

### Manual Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 📁 Project Structure
```
Hackathon-Nirman/
├── backend/
│   ├── main.py              # Main API Endpoints
│   ├── models.py            # Database Schema
│   ├── auth.py              # JWT Authentication Logic
│   ├── database.py          # SQLAlchemy Setup
│   └── edumate.db           # SQLite Database File
└── frontend/
    ├── src/
    │   ├── context/         # Auth & Global State
    │   ├── pages/           # All Feature Pages
    │   ├── components/      # Shared Reusable Components
    │   └── App.jsx          # Route Configuration
```

## 🤖 AI Integration
EduMate AI uses a sophisticated prompt engineering layer to turn raw LLM responses into structured, educational insights. It is configured to work with OpenAI's GPT-4o or Google's Gemini Pro for high-quality student guidance.

## 👥 Team
Built with ❤️ for **Hackathon Nirman** by a team of dedicated student developers.

## 📝 License
MIT License - Created for educational and hackathon purposes.
