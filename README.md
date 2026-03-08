# 🎓 StudySaathi – Your Personal AI Study Companion

![Hackathon Project](https://img.shields.io/badge/Hackathon-Project-brightgreen)
![React](https://img.shields.io/badge/React-18.2-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109-green)
![Status](https://img.shields.io/badge/Status-Production--Ready-orange)

A visually stunning, AI-powered web platform designed to help students with exam preparation, career planning, and professional development. Built for hackathon demonstration with modern design, smooth UX, and robust backend persistence.

## � The Problem It Solves

Students today face a profoundly fragmented, expensive, and stressful educational landscape. They juggle different tools for taking notes, creating study schedules, building resumes, and practicing for interviews—often relying on expensive human tutors for personalized feedback. When studying for critical exams or preparing for their first big job interview, this disjointed workflow leads to lost time, overwhelming anxiety, and a lack of cohesive progress tracking.

**StudySaathi** solves this by consolidating the entire student journey into a single, unified AI ecosystem. It acts as a personal, 24/7 digital mentor that:
- **Accelerates Learning:** Automates the busywork of summarizing notes (`Notes Summarizer`), building schedules (`Study Planner`), and understanding complex topics (`Concept Explainer`).
- **Validates Knowledge:** Provides instant, judgment-free, and objective grading on practice tests and subjective answers (`Quiz Generator`, `Answer Evaluator`), mimicking real-world grading standards.
- **Launches Careers:** Effortlessly transitions a student into the workforce with intelligent, ATS-optimized (`Resume Builder`) and real-time, voice-interactive technical practice (`Mock Interview`).

By putting state-of-the-art AI directly into the hands of students in a beautiful, distraction-free interface, StudySaathi makes elite, personalized education radically more accessible, efficient, and engaging.

## 🧗 Challenges We Ran Into

Building a full-stack, AI-driven platform over a weekend came with several distinct, mind-bending technical hurdles:

1. **Google Auth JWT vs. Access Token Mismatch:** 
   When we overhauled the rigid default Google Login iframe to match our custom Glassmorphic UI using the headless `useGoogleLogin` React hook, the OAuth payload silently changed. The backend was expecting a standard JWT ID Token, but the new hook was passing an implicit Access Token. This caused silent login failures. We solved it by upgrading the FastAPI backend to detect the token signature (checking for `ya29.`) and dynamically routing it through Google's `userinfo` verification endpoint instead of the standard JWT validator.

2. **Cross-Device Local Network Testing Restrictions:**
   We wanted to test the mobile responsiveness of the React app on actual phones. We bound the Vite server to the local network (`0.0.0.0`), but ran into two massive security blockers: Vite's DNS rebinding protection blocked the Host header, and Google Cloud's strict OAuth policies outright reject raw IP addresses as authorized origins. We overcame both by discovering and implementing `nip.io` (a wildcard DNS service that resolves back to local IPs). By adding `10.x.x.x.nip.io` to Vite's `allowedHosts` and Google's authorized origins, we seamlessly tricked the systems into accepting local network traffic as fully qualified domain names!

3. **Unifying the Aesthetic (Glassmorphism):**
   Upgrading the entire app to a cohesive Glassmorphism theme was incredibly difficult. The browser's default unordered list margins were breaking horizontal flexbox alignments across the Navbar, and applying backdrop-filters cleanly across completely different AI tools without tanking frame rates was tough. We solved this by centralizing our CSS utility classes (e.g., `.fade-in`, `.glass-card`) and ripping out component-specific margin quirks to mathematically align elements on a single axis.

## �🚀 NEW: StudySaathi Core Upgrades
- **🎨 Immersive Glassmorphism UI**: Fully overhauled aesthetic featuring dynamic WebGL Plasma backgrounds, transparent navbars, and sleek frosted glass tool cards.
- **🔐 Google Auth SSO**: 1-click "Continue with Google" integration using `@react-oauth/google`, automatically provisioning native JWT backend sessions.
- **🌐 Local Network Routing**: Out-of-the-box support for accessing the app on mobile devices via `.nip.io` DNS routing, bypassing strict OAuth IP restrictions.
- **🧠 Advanced Open-Source AI**: Backend upgraded to utilize `GPT-OSS-20B` alongside traditional APIs for state-of-the-art reasoning at blazing speeds.
- **💾 Full Data Persistence**: All study plans, resumes, and interview histories are securely saved to a local SQLite database.

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
- **PyJWT & Google Auth** (Secure Token Authentication & SSO)
- **GPT-OSS-20B / Groq** (Advanced AI Reasoning)

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
```text
StudySaathi/
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
StudySaathi uses a sophisticated prompt engineering layer to turn raw LLM responses into structured, educational insights. It is configured to support lightning-fast open-source models like `GPT-OSS-20B` alongside traditional APIs for high-quality student guidance.

## 👥 Team
Built with ❤️ for **Hackathon Hack-n-Win-3.0** by a team of dedicated student developers.

## 📝 License
MIT License - Created for educational and hackathon purposes.
