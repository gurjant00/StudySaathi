# EduMate AI – Smart Assistant for Students

![Hackathon Project](https://img.shields.io/badge/Hackathon-Project-brightgreen)
![React](https://img.shields.io/badge/React-18.2-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109-green)

A visually stunning, AI-powered web platform designed to help students with exam preparation, career planning, and professional development. Built for hackathon demonstration with modern design, smooth UX, and practical AI features.

## 🌟 Features

### 1. **AI Study Planner** 📚
Generate personalized daily study schedules based on:
- Your subjects
- Exam dates
- Available study hours per day

### 2. **AI Notes Summarizer** 📝
Transform lengthy notes into concise, exam-focused bullet points instantly.

### 3. **AI Answer Evaluator** ✅
Get instant feedback on your exam answers with:
- Estimated marks
- Detailed feedback
- Strengths and areas for improvement

### 4. **AI Career Advisor** 🎯
Discover suitable career paths based on:
- Your interests
- Current skills
- Education level

Includes salary ranges, growth potential, and required skills.

### 5. **AI Resume Builder** 📄
Create professional, ATS-friendly resumes with:
- Live preview
- ATS compatibility score
- Optimization suggestions
- Professional formatting

## 🎨 Design Highlights

- **Vibrant Gradients**: Blue, purple, teal, and orange color scheme
- **Modern Card Layouts**: Rounded corners, soft shadows, smooth transitions
- **Responsive Design**: Works on all screen sizes
- **Smooth Animations**: Fade-in effects and hover interactions
- **Student-Friendly**: Energetic yet professional interface

## 🚀 Tech Stack

### Frontend
- **React 18** - Modern UI library
- **Vite** - Fast build tool
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Vanilla CSS** - Custom design system

### Backend
- **FastAPI** - Modern Python web framework
- **Pydantic** - Data validation
- **Uvicorn** - ASGI server

## 📦 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- Python (v3.8 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment (optional but recommended):
```bash
python -m venv venv
venv\Scripts\activate  # On Windows
# source venv/bin/activate  # On macOS/Linux
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run the FastAPI server:
```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The app will open at `http://localhost:3000`

## 🎯 Usage

1. **Start Both Servers**: Make sure both backend (port 8000) and frontend (port 3000) are running

2. **Open the App**: Navigate to `http://localhost:3000` in your browser

3. **Explore Features**: Click on any feature card on the dashboard to try it out

4. **Demo Flow**:
   - Fill in the form for any feature
   - Click the action button (e.g., "Generate Plan")
   - View AI-generated results in beautiful, colorful layouts

## 📁 Project Structure

```
Hackathon-Nirman/
├── backend/
│   ├── main.py              # FastAPI application
│   └── requirements.txt     # Python dependencies
└── frontend/
    ├── index.html           # HTML entry point
    ├── package.json         # npm dependencies
    ├── vite.config.js       # Vite configuration
    └── src/
        ├── main.jsx         # React entry point
        ├── App.jsx          # Main app component
        ├── index.css        # Design system & styles
        └── pages/
            ├── Dashboard.jsx
            ├── StudyPlanner.jsx
            ├── NotesSummarizer.jsx
            ├── AnswerEvaluator.jsx
            ├── CareerRecommendation.jsx
            └── ResumeBuilder.jsx
```

## 🎭 Demo Tips for Judges

1. **Visual Impact**: The landing page immediately showcases all 5 features with colorful cards
2. **Simple Workflow**: Form-based inputs (no complex prompts needed)
3. **Instant Results**: AI responses displayed in visually appealing formats
4. **Complete Solution**: Covers student journey from exam prep to career readiness
5. **Production-Ready Design**: Modern, professional UI that feels like a real product

## 🤖 AI Responses

Currently using **mock AI responses** suitable for hackathon demonstrations. The backend generates realistic, contextual responses that showcase the platform's capabilities.

For production deployment, these can be easily replaced with actual AI model integrations (OpenAI, Gemini, etc.).

## 👥 Team

Built by a team of 4 students for a hackathon demonstration.

## 📝 License

This project is created for educational and hackathon purposes.

## 🙏 Acknowledgments

- Google Fonts (Inter)
- React & FastAPI communities
- All open-source contributors

---

**Made with ❤️ for students, by students**
