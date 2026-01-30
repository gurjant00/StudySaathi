from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime, timedelta
import os
import json
from bytez import Bytez
from dotenv import load_dotenv
from sqlalchemy.orm import Session

# Local imports
import models
from database import engine, get_db
from auth import verify_password, get_password_hash, create_access_token, decode_access_token

# Initialize database
models.Base.metadata.create_all(bind=engine)

load_dotenv()

# Configure Bytez API
API_KEY = os.getenv("BYTEZ_API_KEY")
if not API_KEY:
    print("Warning: BYTEZ_API_KEY not found in .env file")

try:
    sdk = Bytez(API_KEY)
    model = sdk.model("openai/gpt-4o")
except Exception as e:
    print(f"Failed to initialize Bytez SDK: {e}")
    model = None

app = FastAPI(title="EduMate AI API", description="Smart Assistant for Students (Powered by GPT-4o via Bytez)")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== Helper Functions ====================
async def get_ai_response(prompt: str):
    if not model:
         raise HTTPException(status_code=500, detail="AI Model not initialized")
    
    try:
        results = model.run([
          {
            "role": "user",
            "content": prompt
          }
        ])
        
        if results.error:
             raise HTTPException(status_code=500, detail=f"AI Service Error: {results.error}")
             
        output = results.output
        
        # Extract content if it's in the wrapper format {'role': 'assistant', 'content': '...'}
        if isinstance(output, dict) and 'content' in output:
            output = output['content']
            
        return output
    except Exception as e:
        print(f"AI Execution Error: {e}")
        raise HTTPException(status_code=500, detail=f"AI Service Error: {str(e)}")

def parse_json_response(response_text):
    """Clean and parse JSON from AI response"""
    if isinstance(response_text, dict):
        return response_text

    try:
        # Remove any Markdown cleanup (```json ... ```)
        cleaned_text = response_text.replace("```json", "").replace("```", "").strip()
        parsed = json.loads(cleaned_text)
        return parsed
    except AttributeError:
        # If response_text is not a string but also not a dict
        return response_text
    except json.JSONDecodeError:
        print(f"Failed to parse JSON: {response_text}")
        raise HTTPException(status_code=500, detail="Failed to parse AI response")

# ==================== Request/Response Models ====================

# Study Planner Models
class StudyPlannerRequest(BaseModel):
    subjects: List[str]
    exam_date: str
    hours_per_day: int

class Resource(BaseModel):
    title: str
    url: str

class DayPlan(BaseModel):
    day: str
    date: str
    tasks: List[str]
    focus_subject: str
    resources: List[Resource] = []

class StudyPlannerResponse(BaseModel):
    plan: List[DayPlan]
    total_days: int
    message: str

# Notes Summarizer Models
class NotesSummarizerRequest(BaseModel):
    notes: str
    topic: str

class NotesSummarizerResponse(BaseModel):
    summary: List[str]
    key_points: int
    topic: str

# Answer Evaluator Models
class AnswerEvaluatorRequest(BaseModel):
    question: str
    student_answer: str
    max_marks: int

class AnswerEvaluatorResponse(BaseModel):
    marks_obtained: int
    max_marks: int
    percentage: float
    feedback: str
    strengths: List[str]
    improvements: List[str]

# Career Recommendation Models
class CareerRecommendationRequest(BaseModel):
    interests: List[str]
    skills: List[str]
    education_level: str

class CareerPath(BaseModel):
    title: str
    description: str
    required_skills: List[str]
    salary_range: str
    growth_potential: str

class CareerRecommendationResponse(BaseModel):
    recommended_careers: List[CareerPath]
    skills_to_develop: List[str]

# Resume Builder Models
class Education(BaseModel):
    degree: str
    institution: str
    year: str
    grade: str

class Project(BaseModel):
    name: str
    description: str
    technologies: str

class ResumeBuilderRequest(BaseModel):
    name: str
    email: str
    phone: str
    education: List[Education]
    skills: List[str]
    projects: List[Project]
    summary: str

class ResumeBuilderResponse(BaseModel):
    resume_html: str
    ats_score: int
    suggestions: List[str]


# Auth Models
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    class Config:
        from_attributes = True

# Security
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    
    email: str = payload.get("sub")
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user

# Mock Interview Models
class MockInterviewRequest(BaseModel):
    language: str
    user_response: Optional[str] = None
    current_question_index: int = 0
    previous_question: Optional[str] = None
    full_history: Optional[List[dict]] = None
    cumulative_score: Optional[int] = 0

class MockInterviewResponse(BaseModel):
    next_question: Optional[str] = None
    feedback: Optional[str] = None
    score: Optional[int] = None
    is_completed: bool = False
    correct_answer_preview: Optional[str] = None

class MockInterviewHistoryItem(BaseModel):
    id: int
    language: str
    overall_score: int
    created_at: datetime
    class Config:
        from_attributes = True

class MockInterviewDetail(MockInterviewHistoryItem):
    chat_history: List[dict]
    feedback_data: dict

# ==================== Auth Endpoints ====================

@app.post("/api/auth/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    new_user = models.User(
        email=user.email,
        hashed_password=hashed_password,
        full_name=user.full_name
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/api/auth/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/auth/me", response_model=UserResponse)
def get_me(current_user: models.User = Depends(get_current_user)):
    return current_user

# ==================== API Endpoints ====================

@app.get("/")
def read_root():
    return {
        "message": "Welcome to EduMate AI API",
        "version": "2.0.0",
        "mode": "Real AI Mode (GPT-4o)",
        "features": [
            "Study Planner",
            "Notes Summarizer",
            "Answer Evaluator",
            "Career Recommendation",
            "Resume Builder",
            "AI Mock Interview"
        ]
    }

@app.post("/api/study-planner", response_model=StudyPlannerResponse)
async def generate_study_plan(
    request: StudyPlannerRequest, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Generate and save a personalized study schedule"""
    
    prompt = f"""
    Create a detailed daily study plan for a student preparing for exams.
    Subjects: {', '.join(request.subjects)}
    Exam Date: {request.exam_date}
    Available Hours per Day: {request.hours_per_day}
    Today's Date: {datetime.now().strftime("%Y-%m-%d")}

    The response MUST be a JSON object with the following structure:
    {{
        "plan": [
            {{
                "day": "Day Name",
                "date": "YYYY-MM-DD",
                "focus_subject": "Subject Name",
                "tasks": ["Task 1", "Task 2", "Task 3"],
                "resources": [
                    {{
                        "title": "Topic Video Name",
                        "url": "https://www.youtube.com/results?search_query=topic+name+explanation"
                    }}
                ]
            }}
        ],
        "message": "Encouraging message"
    }}

    IMPORTANT: For each day, provide 2-3 relevant YouTube search links in the "resources" field that directly correspond to the topics being studied that day. Use the format "https://www.youtube.com/results?search_query=..." for the URLs.
    Generate a plan for upcoming days (max 7 days detailed).
    """

    response_text = await get_ai_response(prompt)
    data = parse_json_response(response_text)
    
    # Save to database
    new_plan = models.StudyPlan(
        user_id=current_user.id,
        plan_data=json.dumps(data)
    )
    db.add(new_plan)
    db.commit()
    
    return StudyPlannerResponse(
        plan=data.get("plan", []),
        total_days=len(data.get("plan", [])),
        message=data.get("message", "Good luck with your studies!")
    )

@app.get("/api/study-planner/latest", response_model=Optional[StudyPlannerResponse])
async def get_latest_study_plan(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Fetch the most recent study plan for the user"""
    plan = db.query(models.StudyPlan).filter(models.StudyPlan.user_id == current_user.id).order_by(models.StudyPlan.created_at.desc()).first()
    if not plan:
        return None
    
    data = json.loads(plan.plan_data)
    return StudyPlannerResponse(
        plan=data.get("plan", []),
        total_days=len(data.get("plan", [])),
        message=data.get("message", "")
    )

@app.post("/api/notes-summarizer", response_model=NotesSummarizerResponse)
async def summarize_notes(
    request: NotesSummarizerRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Summarize and save text"""
    
    prompt = f"""
    Summarize the following notes on the topic "{request.topic}".
    Provide the output strictly in valid JSON format:
    {{
        "summary": ["Key point 1", "Key point 2", "Key point 3", ...]
    }}
    
    Notes:
    {request.notes}
    """
    
    response_text = await get_ai_response(prompt)
    data = parse_json_response(response_text)
    
    # Save to database
    new_summary = models.NoteSummary(
        user_id=current_user.id,
        topic=request.topic,
        summary_data=json.dumps(data)
    )
    db.add(new_summary)
    db.commit()
    
    return NotesSummarizerResponse(
        summary=data.get("summary", []),
        key_points=len(data.get("summary", [])),
        topic=request.topic
    )

@app.get("/api/notes-summarizer/latest", response_model=Optional[NotesSummarizerResponse])
async def get_latest_summary(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Fetch the most recent notes summary"""
    summary = db.query(models.NoteSummary).filter(models.NoteSummary.user_id == current_user.id).order_by(models.NoteSummary.created_at.desc()).first()
    if not summary:
        return None
    
    data = json.loads(summary.summary_data)
    return NotesSummarizerResponse(
        summary=data.get("summary", []),
        key_points=len(data.get("summary", [])),
        topic=summary.topic
    )

@app.post("/api/answer-evaluator", response_model=AnswerEvaluatorResponse)
async def evaluate_answer(
    request: AnswerEvaluatorRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Evaluate and save student answer"""
    
    prompt = f"""
    Evaluate this student's answer.
    Question: {request.question}
    Student Answer: {request.student_answer}
    Max Marks: {request.max_marks}

    Output strictly in valid JSON format:
    {{
        "marks_obtained": integer,
        "feedback": "Detailed feedback string",
        "strengths": ["Strength 1", "Strength 2"],
        "improvements": ["Improvement 1", "Improvement 2"]
    }}
    """
    
    response_text = await get_ai_response(prompt)
    data = parse_json_response(response_text)
    
    marks = data.get("marks_obtained", 0)
    percentage = (marks / request.max_marks) * 100
    
    # Save to database
    new_eval = models.AnswerEvaluation(
        user_id=current_user.id,
        question=request.question,
        answer=request.student_answer,
        feedback_data=json.dumps(data)
    )
    db.add(new_eval)
    db.commit()

    return AnswerEvaluatorResponse(
        marks_obtained=marks,
        max_marks=request.max_marks,
        percentage=round(percentage, 2),
        feedback=data.get("feedback", ""),
        strengths=data.get("strengths", []),
        improvements=data.get("improvements", [])
    )

@app.get("/api/answer-evaluator/latest", response_model=Optional[AnswerEvaluatorResponse])
async def get_latest_evaluation(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Fetch the most recent answer evaluation"""
    eval_item = db.query(models.AnswerEvaluation).filter(models.AnswerEvaluation.user_id == current_user.id).order_by(models.AnswerEvaluation.created_at.desc()).first()
    if not eval_item:
        return None
    
    data = json.loads(eval_item.feedback_data)
    marks = data.get("marks_obtained", 0)
    # We don't store max_marks in the model currently, let's assume 100 or handle it
    # Ideally models.py should have been updated. For now, let's return what we have.
    return AnswerEvaluatorResponse(
        marks_obtained=marks,
        max_marks=100, # Fallback
        percentage=0.0,
        feedback=data.get("feedback", ""),
        strengths=data.get("strengths", []),
        improvements=data.get("improvements", [])
    )

@app.post("/api/career-recommendation", response_model=CareerRecommendationResponse)
async def recommend_careers(
    request: CareerRecommendationRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Recommend and save careers"""
    
    prompt = f"""
    Recommend careers for a student with:
    Interests: {', '.join(request.interests)}
    Skills: {', '.join(request.skills)}
    Education Level: {request.education_level}

    Output strictly in valid JSON format:
    {{
        "recommended_careers": [
            {{
                "title": "Job Title",
                "description": "Brief description",
                "required_skills": ["Skill 1", "Skill 2"],
                "salary_range": "e.g., $50k-80k",
                "growth_potential": "High/Medium"
            }}
        ],
        "skills_to_develop": ["Skill A", "Skill B"]
    }}
    """
    
    response_text = await get_ai_response(prompt)
    data = parse_json_response(response_text)
    
    # Save to database
    new_rec = models.CareerRecommendation(
        user_id=current_user.id,
        interests=", ".join(request.interests),
        skills=", ".join(request.skills),
        recommendation_data=json.dumps(data)
    )
    db.add(new_rec)
    db.commit()

    return CareerRecommendationResponse(
        recommended_careers=data.get("recommended_careers", []),
        skills_to_develop=data.get("skills_to_develop", [])
    )

@app.get("/api/career-recommendation/latest", response_model=Optional[CareerRecommendationResponse])
async def get_latest_recommendation(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Fetch recent career recommendations"""
    rec = db.query(models.CareerRecommendation).filter(models.CareerRecommendation.user_id == current_user.id).order_by(models.CareerRecommendation.created_at.desc()).first()
    if not rec:
        return None
    
    data = json.loads(rec.recommendation_data)
    return CareerRecommendationResponse(
        recommended_careers=data.get("recommended_careers", []),
        skills_to_develop=data.get("skills_to_develop", [])
    )

@app.post("/api/resume-builder", response_model=ResumeBuilderResponse)
async def generate_resume(
    request: ResumeBuilderRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Generate and save resume HTML and ATS score"""
    
    prompt = f"""
    Generate an HTML resume for:
    Name: {request.name}
    Summary: {request.summary}
    Education: {[f"{e.degree} from {e.institution}" for e in request.education]}
    Skills: {', '.join(request.skills)}
    Projects: {[f"{p.name}: {p.description}" for p in request.projects]}

    Return ONLY a JSON object:
    {{
        "resume_html": "Professional modern HTML white resume with CSS (no tailwind)",
        "ats_score": 85,
        "suggestions": ["Add more keywords", "Quantify results"]
    }}
    """

    response_text = await get_ai_response(prompt)
    data = parse_json_response(response_text)
    
    # Save to database
    new_resume = models.Resume(
        user_id=current_user.id,
        resume_html=data.get("resume_html", ""),
        ats_score=data.get("ats_score", 0)
    )
    db.add(new_resume)
    db.commit()

    return ResumeBuilderResponse(
        resume_html=data.get("resume_html", ""),
        ats_score=data.get("ats_score", 0),
        suggestions=data.get("suggestions", [])
    )

@app.get("/api/resume-builder/latest", response_model=Optional[ResumeBuilderResponse])
async def get_latest_resume(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Fetch the most recent resume"""
    resume = db.query(models.Resume).filter(models.Resume.user_id == current_user.id).order_by(models.Resume.created_at.desc()).first()
    if not resume:
        return None
    
    return ResumeBuilderResponse(
        resume_html=resume.resume_html,
        ats_score=resume.ats_score,
        suggestions=[] # suggestions aren't stored individually
    )


@app.post("/api/mock-interview", response_model=MockInterviewResponse)
async def mock_interview(
    request: MockInterviewRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """AI Technical Mock Interview with specific user support"""
    
    # (keeping simplified logic but adding DB save on completion)
    
    if request.user_response:
        # Evaluate previous answer and provide next question
        prompt = f"""
        You are an expert technical interviewer for {request.language}.
        
        Previous Question: {request.previous_question or "Start of interview"}
        User Answer: {request.user_response}
        
        Evaluate the answer (score 0-10) and provide the next technical question.
        If this was the 5th question, set is_completed to true.

        Output strictly in valid JSON format:
        {{
            "score": 8,
            "feedback": "Reasoning for score",
            "next_question": "Explain...",
            "is_completed": false,
            "correct_answer_preview": "Brief explanation"
        }}
        """
        
        response_text = await get_ai_response(prompt)
        data = parse_json_response(response_text)
        
        # If completed, save summary to DB (simplified for demo)
        if data.get("is_completed"):
             history = request.full_history or []
             if request.user_response:
                 history.append({"sender": "user", "text": request.user_response})
             history.append({"sender": "system", "text": f"Final Feedback: {data.get('feedback')} (Score: {data.get('score')}/10)"})
             
             new_interview = models.MockInterviewSession(
                 user_id=current_user.id,
                 language=request.language,
                 overall_score=request.cumulative_score + data.get("score", 0),
                 chat_history=json.dumps(history),
                 feedback_data=json.dumps(data)
             )
             db.add(new_interview)
             db.commit()

        return MockInterviewResponse(**data)
    else:
        # Start new interview
        prompt = f"""
        You are an expert technical interviewer. Start a mock interview for the {request.language} programming language. 
        Ask the first fundamental question.

        Output strictly in valid JSON format:
        {{
            "next_question": "First question..."
        }}
        """
        response_text = await get_ai_response(prompt)
        data = parse_json_response(response_text)
        return MockInterviewResponse(next_question=data.get("next_question"))

@app.get("/api/mock-interview/latest", response_model=Optional[MockInterviewResponse])
async def get_latest_interview(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Fetch the most recent mock interview session results"""
    interview = db.query(models.MockInterviewSession).filter(models.MockInterviewSession.user_id == current_user.id).order_by(models.MockInterviewSession.created_at.desc()).first()
    if not interview:
        return None
    
    data = json.loads(interview.feedback_data)
    return MockInterviewResponse(
        next_question=None,
        feedback=data.get("feedback"),
        score=interview.overall_score,
        is_completed=True,
        correct_answer_preview=data.get("correct_answer_preview")
    )

@app.get("/api/mock-interview/history", response_model=List[MockInterviewHistoryItem])
async def get_interview_history(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get all past interview sessions for the current user"""
    interviews = db.query(models.MockInterviewSession).filter(models.MockInterviewSession.user_id == current_user.id).order_by(models.MockInterviewSession.created_at.desc()).all()
    return interviews

@app.get("/api/mock-interview/session/{session_id}", response_model=MockInterviewDetail)
async def get_interview_detail(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get detailed chat history for a specific interview session"""
    interview = db.query(models.MockInterviewSession).filter(models.MockInterviewSession.id == session_id, models.MockInterviewSession.user_id == current_user.id).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview session not found")
    
    return MockInterviewDetail(
        id=interview.id,
        language=interview.language,
        overall_score=interview.overall_score,
        created_at=interview.created_at,
        chat_history=json.loads(interview.chat_history or "[]"),
        feedback_data=json.loads(interview.feedback_data or "{}")
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
