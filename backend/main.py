from fastapi import FastAPI, HTTPException, Depends, status, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime, timedelta
import os
import json
import re
import io
from openai import OpenAI
from dotenv import load_dotenv
from sqlalchemy.orm import Session
import urllib3
import ssl
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

# --- Development SSL Bypass for Windows --- 
urllib3.disable_warnings()
os.environ["CURL_CA_BUNDLE"] = ""
os.environ["REQUESTS_CA_BUNDLE"] = ""
try:
    _create_unverified_https_context = ssl._create_unverified_context
except AttributeError:
    pass
else:
    ssl._create_default_https_context = _create_unverified_https_context
# ------------------------------------------


# Local imports
import models
from database import engine, get_db
from auth import verify_password, get_password_hash, create_access_token, decode_access_token

# Initialize database
models.Base.metadata.create_all(bind=engine)

load_dotenv()

# Configure Groq API via OpenAI SDK
API_KEY = os.getenv("GROQ_API_KEY")
if not API_KEY:
    print("Warning: GROQ_API_KEY not found in .env file")

try:
    client = OpenAI(
        api_key=API_KEY,
        base_url="https://api.groq.com/openai/v1",
    )
except Exception as e:
    print(f"Failed to initialize OpenAI SDK for Groq: {e}")
    client = None

app = FastAPI(title="StudySaathi API", description="Your Personal AI Study Companion (Powered by Groq)")

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
    if not client:
         raise HTTPException(status_code=500, detail="AI Client not initialized")
    
    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=4000,
            temperature=0.7
        )
        
        return response.choices[0].message.content
    except Exception as e:
        print(f"AI Execution Error: {e}")
        raise HTTPException(status_code=500, detail=f"AI Service Error: {str(e)}")

def parse_json_response(response_text):
    """Clean and parse JSON from AI response"""
    if isinstance(response_text, dict):
        return response_text

    try:
        text = response_text
        
        # Try to extract just the JSON block in case there's markdown or conversational text
        match = re.search(r'\{.*\}', text, re.DOTALL)
        if match:
            text = match.group(0)
            
        # Clean up any leftover markdown block formatting
        cleaned_text = text.replace("```json", "").replace("```", "").strip()
        
        # Fix invalid JSON escape sequences (e.g. \' which AI generates for apostrophes)
        # This removes backslashes that are NOT followed by valid JSON escape chars: " \ / b f n r t u
        cleaned_text = re.sub(r'\\(?!["\\/bfnrtu])', '', cleaned_text)
        
        # strict=False allows unescaped control characters (like actual newlines) inside strings
        parsed = json.loads(cleaned_text, strict=False)
        return parsed
    except AttributeError:
        # If response_text is not a string but also not a dict
        return response_text
    except json.JSONDecodeError as e:
        print(f"================ RAW AI OUTPUT ==================")
        print(response_text)
        print(f"=================================================")
        print(f"JSON Error details: {e}")
        raise HTTPException(status_code=500, detail="Failed to parse AI response. Please try generating again.")

# ==================== Request/Response Models ====================

# Study Planner Models
class StudyPlannerRequest(BaseModel):
    subjects: List[str]
    exam_date: str
    hours_per_day: int
    topic_focus: Optional[str] = None

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
    flashcards: List[dict] # [{"question": "...", "answer": "..."}]
    key_points: int
    topic: str

# Doubt Solver Models
class DoubtSolverRequest(BaseModel):
    question: str
    context: Optional[str] = None

class DoubtSolverResponse(BaseModel):
    explanation: str
    simplified_explanation: str
    examples: List[str]
    topic: str

# Quiz Generator Models
class QuizGeneratorRequest(BaseModel):
    topic: str

class QuizQuestion(BaseModel):
    question: str
    options: List[str]
    correct_answer: str
    explanation: str

class QuizGeneratorResponse(BaseModel):
    questions: List[QuizQuestion]
    topic: str

# Concept Explainer Models
class ConceptExplainerRequest(BaseModel):
    concept: str

class ConceptExplainerResponse(BaseModel):
    concept: str
    simple_explanation: str
    analogy: str
    key_takeaways: List[str]

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
    resume_data: Optional[dict] = None
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

class GoogleAuthRequest(BaseModel):
    credential: str

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

@app.post("/api/auth/google", response_model=Token)
def google_auth(request: GoogleAuthRequest, db: Session = Depends(get_db)):
    try:
        # Verify the Google token securely
        import requests
        if request.credential.startswith("ya29."):
            # It's a Google Access Token (returned by useGoogleLogin implicit flow)
            user_info_resp = requests.get(
                "https://www.googleapis.com/oauth2/v3/userinfo", 
                headers={"Authorization": f"Bearer {request.credential}"}
            )
            if user_info_resp.status_code != 200:
                raise ValueError("Invalid Google Access Token")
            idinfo = user_info_resp.json()
        else:
            # It's a Google ID Token (returned by standard GoogleLogin button)
            idinfo = id_token.verify_oauth2_token(
                request.credential, 
                google_requests.Request(),
                "426984478952-jv9jdv9sks9tfuscv5hfsb4i2e7iq84a.apps.googleusercontent.com",
                clock_skew_in_seconds=60
            )
        
        email = idinfo['email']
        name = idinfo.get('name', 'Google User')
        
        # Check if user exists
        user = db.query(models.User).filter(models.User.email == email).first()
        if not user:
            # Create a new user with a dummy password since they use Google SSO
            dummy_password = get_password_hash("google_oauth_dummy_" + email)
            user = models.User(
                email=email,
                hashed_password=dummy_password,
                full_name=name
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        
        # Generate our FastAPI JWT access token so the React app works identically
        access_token = create_access_token(data={"sub": user.email})
        return {"access_token": access_token, "token_type": "bearer"}
        
    except ValueError as e:
        # Invalid token
        raise HTTPException(status_code=401, detail=f"Invalid Google token: {str(e)}")

# ==================== API Endpoints ====================

@app.get("/")
def read_root():
    return {
        "message": "Welcome to StudySaathi API",
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
    
    topic_context = ""
    if request.topic_focus:
        topic_context = f"\n    SPECIFIC TOPIC FOCUS: The student wants to specifically focus on these topics within their subjects: {request.topic_focus}. Prioritize these topics in the study plan and allocate more time and resources to them.\n"

    # Calculate days between now and exam
    try:
        current_date = datetime.now()
        exam_date_obj = datetime.strptime(request.exam_date, "%Y-%m-%d")
        total_days_between = (exam_date_obj - current_date).days + 1
        days_to_generate = min(max(total_days_between, 1), 14) # Generate at least 1 day, max 14
    except Exception:
        total_days_between = 7
        days_to_generate = 7

    prompt = f"""
    Create a detailed daily study plan for a student preparing for exams.
    Subjects: {', '.join(request.subjects)}
    Exam Date: {request.exam_date} (Total days left: {total_days_between})
    Available Hours per Day: {request.hours_per_day}
    Today's Date: {current_date.strftime("%Y-%m-%d")}
    {topic_context}

    INSTRUCTIONS FOR DATE GENERATION:
    1. Generate a plan for exactly {days_to_generate} days starting from {current_date.strftime("%Y-%m-%d")}.
    2. THE DATES MUST BE SEQUENTIAL AND ACCURATE (e.g., if Day 1 is 2024-03-07, Day 2 MUST be 2024-03-08).
    3. THE "day" NAME (e.g., Monday, Tuesday) MUST MATCH THE "date" PROVIDED.
    
    SPELLING AUTO-CORRECT (VERY IMPORTANT): If the subject names have minor spelling mistakes (e.g., "Mathmatics" instead of "Mathematics", "Phisics" instead of "Physics", "Chemsitry" instead of "Chemistry"), automatically correct them and proceed normally. Only reject if the input is completely unrelated to academics (e.g., a person's name, random gibberish).

    INPUT VALIDATION: If the input is truly NOT academic subjects (e.g., just a person's name, random characters, or completely nonsensical text), return this JSON:
    {{
        "error": true,
        "message": "The input doesn't look like academic subjects. Did you mean to enter subject names like 'Mathematics, Physics, Chemistry'?",
        "suggestion": "Try entering valid subject names separated by commas."
    }}

    If the input IS valid (even with minor typos — auto-correct them), generate the study plan as the following JSON:
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
    
    # Check for input validation error
    if data.get("error"):
        raise HTTPException(status_code=400, detail=data.get("message", "Invalid input") + " 💡 " + data.get("suggestion", ""))
    
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
    Also generate 3-5 high-quality flashcards (question and answer pairs) for active recall.

    SPELLING AUTO-CORRECT (VERY IMPORTANT): If the topic name has minor spelling mistakes (e.g., "Photosynthsis" instead of "Photosynthesis"), automatically correct it and proceed normally. Only reject if the input is completely unrelated to academics.

    INPUT VALIDATION: If the topic is truly NOT academic (e.g., just a person's name, random gibberish), return this JSON:
    {{
        "error": true,
        "message": "The topic '{request.topic}' doesn't seem like an academic topic. Did you mean to enter a subject like 'Photosynthesis' or 'Newton's Laws'?",
        "suggestion": "Please provide a valid academic topic and relevant study notes."
    }}

    If the input IS valid (even with minor typos — auto-correct them), provide the output strictly in valid JSON format:
    {{
        "summary": ["Key point 1", "Key point 2", ...],
        "flashcards": [
            {{"question": "Question 1", "answer": "Answer 1"}},
            ...
        ]
    }}
    
    Notes:
    {request.notes}
    """
    
    response_text = await get_ai_response(prompt)
    data = parse_json_response(response_text)
    
    # Check for input validation error
    if data.get("error"):
        raise HTTPException(status_code=400, detail=data.get("message", "Invalid input") + " 💡 " + data.get("suggestion", ""))
    
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
        flashcards=data.get("flashcards", []),
        key_points=len(data.get("summary", [])),
        topic=request.topic
    )

@app.post("/api/doubt-solver", response_model=DoubtSolverResponse)
async def solve_doubt(
    request: DoubtSolverRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Solve student doubts with simple and detailed explanations"""
    
    prompt = f"""
    You are an expert academic tutor. Solve the following student doubt.
    Question: {request.question}
    Context: {request.context or "No additional context"}

    SPELLING AUTO-CORRECT (VERY IMPORTANT): If the question has minor spelling mistakes, automatically correct them and answer the intended question. Only reject if the input is truly NOT an academic question.

    INPUT VALIDATION: If the input is truly NOT an academic question (e.g., just a person's name, random gibberish), return this JSON:
    {{
        "error": true,
        "message": "This doesn't seem like an academic question. Did you mean to ask something like 'How does gravity work?' or 'Explain recursion'?",
        "suggestion": "Try entering a clear academic question you need help with."
    }}

    If the input IS valid (even with minor typos — auto-correct them), provide the output strictly in valid JSON format:
    {{
        "explanation": "Detailed professional explanation",
        "simplified_explanation": "Explain it like I am 5 years old",
        "examples": ["Example 1", "Example 2"],
        "topic": "The general academic topic"
    }}
    """
    
    response_text = await get_ai_response(prompt)
    data = parse_json_response(response_text)
    
    # Check for input validation error
    if data.get("error"):
        raise HTTPException(status_code=400, detail=data.get("message", "Invalid input") + " 💡 " + data.get("suggestion", ""))
    
    return DoubtSolverResponse(
        explanation=data.get("explanation", ""),
        simplified_explanation=data.get("simplified_explanation", ""),
        examples=data.get("examples", []),
        topic=data.get("topic", "General")
    )

@app.post("/api/quiz-generator", response_model=QuizGeneratorResponse)
async def generate_quiz(
    request: QuizGeneratorRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Generate multiple choice questions based on a topic or notes"""
    
    prompt = f"""
    Generate 5 high-quality multiple choice questions for the following:
    Topic/Notes: {request.topic}

    SPELLING AUTO-CORRECT (VERY IMPORTANT): If the topic has minor spelling mistakes (e.g., "Modrn Phisics" instead of "Modern Physics"), automatically correct it and generate the quiz normally. Only reject if the input is truly NOT an academic topic.

    INPUT VALIDATION: If the input is truly NOT academic (e.g., just a person's name, random gibberish), return this JSON:
    {{
        "error": true,
        "message": "This doesn't look like an academic topic or study notes. Did you mean to enter a topic like 'Modern Physics'?",
        "suggestion": "Try entering a valid subject name or paste your study material."
    }}

    If the input IS valid (even with minor typos — auto-correct them), provide the output strictly in valid JSON format:
    {{
        "questions": [
            {{
                "question": "Question text?",
                "options": ["A", "B", "C", "D"],
                "correct_answer": "Correct option text",
                "explanation": "Brief explanation of why the correct answer is right and why the other options are incorrect."
            }}
        ],
        "topic": "Summarized topic name"
    }}
    """
    
    response_text = await get_ai_response(prompt)
    data = parse_json_response(response_text)
    
    # Check for input validation error
    if data.get("error"):
        raise HTTPException(status_code=400, detail=data.get("message", "Invalid input") + " 💡 " + data.get("suggestion", ""))
    
    return QuizGeneratorResponse(
        questions=data.get("questions", []),
        topic=data.get("topic", "General")
    )

@app.post("/api/concept-explainer", response_model=ConceptExplainerResponse)
async def explain_concept(
    request: ConceptExplainerRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Explain complex concepts in simple language with analogies"""
    
    prompt = f"""
    Explain the following concept like I am 5 years old.
    Concept: {request.concept}

    SPELLING AUTO-CORRECT (VERY IMPORTANT): If the concept name has minor spelling mistakes (e.g., "Blockchayn" instead of "Blockchain", "Recurson" instead of "Recursion"), automatically correct it and explain the intended concept. Only reject if the input is truly NOT a concept.

    INPUT VALIDATION: If the input is truly NOT a concept (e.g., just a person's name, random gibberish), return this JSON:
    {{
        "error": true,
        "message": "This doesn't look like a concept I can explain. Did you mean something like 'Blockchain', 'Photosynthesis', or 'Recursion'?",
        "suggestion": "Try entering a real concept, topic, or technical term."
    }}

    If the input IS valid (even with minor typos — auto-correct them), provide the output strictly in valid JSON format:
    {{
        "concept": "{request.concept}",
        "simple_explanation": "Simplified core idea",
        "analogy": "A clever real-world analogy",
        "key_takeaways": ["Point 1", "Point 2", "Point 3"]
    }}
    """
    
    response_text = await get_ai_response(prompt)
    data = parse_json_response(response_text)
    
    # Check for input validation error
    if data.get("error"):
        raise HTTPException(status_code=400, detail=data.get("message", "Invalid input") + " 💡 " + data.get("suggestion", ""))
    
    return ConceptExplainerResponse(
        concept=data.get("concept", ""),
        simple_explanation=data.get("simple_explanation", ""),
        analogy=data.get("analogy", ""),
        key_takeaways=data.get("key_takeaways", [])
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
    Evaluate this student's answer like a strict but helpful teacher.
    Question: {request.question}
    Student Answer: {request.student_answer}
    Max Marks: {request.max_marks}

    SPELLING AUTO-CORRECT (VERY IMPORTANT): If the question or answer has minor spelling mistakes, automatically correct them and evaluate the intended content. Only reject if the input is truly NOT academic.

    INPUT VALIDATION: If the question is truly NOT academic (e.g., gibberish, a person's name), return this JSON:
    {{
        "error": true,
        "message": "The question or answer doesn't look like valid academic content. Please enter a real exam question and your answer attempt.",
        "suggestion": "Example: Question: 'What is osmosis?' Answer: 'Osmosis is the movement of water...'"
    }}

    If the input IS valid (even with minor typos — auto-correct them), output strictly in valid JSON format:
    {{
        "marks_obtained": integer (out of {request.max_marks}),
        "feedback": "Teacher-style feedback (e.g., 'Good attempt but you missed...', 'Excellent understanding...')",
        "strengths": ["Strength 1", "Strength 2"],
        "improvements": ["Specific step to improve 1", "Specific step to improve 2"]
    }}
    """
    
    response_text = await get_ai_response(prompt)
    data = parse_json_response(response_text)
    
    # Check for input validation error
    if data.get("error"):
        raise HTTPException(status_code=400, detail=data.get("message", "Invalid input") + " 💡 " + data.get("suggestion", ""))
    
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

    SPELLING AUTO-CORRECT (VERY IMPORTANT): If the interests or skills have minor spelling mistakes (e.g., "Techmology" instead of "Technology", "Progamming" instead of "Programming"), automatically correct them and proceed normally. Only reject if the input is completely unrelated or gibberish.

    INPUT VALIDATION: If the input is truly NOT valid interests/skills (e.g., just random characters or nonsensical text), return this JSON:
    {{
        "error": true,
        "message": "The interests or skills you entered don't seem valid. Did you mean to enter things like 'Technology, Design' or 'Python, Communication'?",
        "suggestion": "Try entering your real interests and skills separated by commas."
    }}

    If the input IS valid (even with minor typos — auto-correct them), output strictly in valid JSON format:
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
    
    # Check for input validation error
    if data.get("error"):
        raise HTTPException(status_code=400, detail=data.get("message", "Invalid input") + " 💡 " + data.get("suggestion", ""))
    
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
    """Generate and save resume HTML with AI-enhanced content"""
    
    prompt = f"""
    You are an expert resume writer. Enhance the following resume details for a high-end professional.
    
    Name: {request.name}
    Summary: {request.summary}
    Projects: {[{"name": p.name, "description": p.description} for p in request.projects]}
    
    Instructions:
    1. Expand the summary into a substantive, professional 3-sentence profile.
    2. For each project, write a highly professional, well-written 3-sentence paragraph describing the role and impact.
    
    Return JSON strictly matching this structure:
    {{
        "enhanced_summary": "Expanded professional summary...",
        "enhanced_projects": [
            {{"name": "Original Project Name", "enhanced_description": "Paragraph description..."}}
        ],
        "suggestions": ["Add metrics to Project X", "Include leadership experience"]
    }}
    """

    response_text = await get_ai_response(prompt)
    data = parse_json_response(response_text)
    
    enhanced_projects_dict = {}
    if isinstance(data.get("enhanced_projects"), list):
        for p in data.get("enhanced_projects"):
            if isinstance(p, dict) and 'name' in p and 'enhanced_description' in p:
                enhanced_projects_dict[p['name']] = p['enhanced_description']
    
    projects_html = ""
    for proj in request.projects:
        desc = enhanced_projects_dict.get(proj.name, proj.description)
        projects_html += f"""
        <div style='margin-bottom: 20px;'>
            <div style='display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px;'>
                <h3 style='font-size: 16px; font-weight: 700; color: #222; margin: 0;'>{proj.name}</h3>
                <span style='font-size: 13px; color: #777; font-weight: 600;'>{proj.technologies}</span>
            </div>
            <p style='font-size: 14px; line-height: 1.6; color: #444; margin: 0; text-align: justify;'>{desc}</p>
        </div>
        """

    education_html = ""
    for edu in request.education:
        education_html += f"""
        <div style='margin-bottom: 15px;'>
            <div style='display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px;'>
                <h3 style='font-size: 16px; font-weight: 700; color: #222; margin: 0;'>{edu.institution}</h3>
                <span style='font-size: 13px; color: #777; font-weight: 600;'>{edu.year}</span>
            </div>
            <div style='font-size: 14px; font-weight: 600; color: #333; margin-bottom: 2px;'>{edu.degree}</div>
        </div>
        """
        
    skills_list_html = "".join([f"<li style='margin-bottom: 8px; color: #444; font-size: 14px;'>{skill}</li>" for skill in request.skills])

    enhanced_summary = data.get('enhanced_summary', request.summary)

    final_html = f"""
    <div style='font-family: &quot;Inter&quot;, -apple-system, sans-serif; max-width: 800px; margin: 0 auto; padding: 50px 50px 70px 50px; background: #ffffff; color: #333; position: relative; min-height: 1050px; box-sizing: border-box;'>
        
        <!-- HEADER -->
        <div style='text-align: center; margin-bottom: 35px;'>
            <h1 style='font-size: 44px; font-weight: 800; margin: 0 0 5px 0; color: #111; text-transform: uppercase; letter-spacing: 2px;'>{request.name}</h1>
            <p style='font-size: 18px; color: #555; margin: 0 0 15px 0; font-weight: 500; letter-spacing: 2px; text-transform: uppercase;'>Professional Profile</p>
            <div style='font-size: 14px; color: #666; display: flex; justify-content: center; align-items: center; gap: 20px;'>
                <span>{request.email}</span>
                <span>•</span>
                <span>{request.phone}</span>
            </div>
        </div>
        
        <hr style='border: none; border-top: 2px solid #111; margin-bottom: 30px;'/>

        <!-- ABOUT ME -->
        <div style='margin-bottom: 30px;'>
            <h2 style='font-size: 16px; font-weight: 700; color: #111; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 15px 0; border-bottom: 1px solid #ddd; padding-bottom: 8px;'>About Me</h2>
            <p style='font-size: 14px; line-height: 1.7; color: #444; margin: 0; text-align: justify;'>{enhanced_summary}</p>
        </div>

        <!-- EXPERIENCE / PROJECTS -->
        <div style='margin-bottom: 30px;'>
            <h2 style='font-size: 16px; font-weight: 700; color: #111; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 15px 0; border-bottom: 1px solid #ddd; padding-bottom: 8px;'>Experience &amp; Projects</h2>
            {projects_html}
        </div>

        <!-- EDUCATION -->
        <div style='margin-bottom: 30px;'>
            <h2 style='font-size: 16px; font-weight: 700; color: #111; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 15px 0; border-bottom: 1px solid #ddd; padding-bottom: 8px;'>Education</h2>
            {education_html}
        </div>

        <!-- SKILLS -->
        <div style='margin-bottom: 40px;'>
            <h2 style='font-size: 16px; font-weight: 700; color: #111; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 15px 0; border-bottom: 1px solid #ddd; padding-bottom: 8px;'>Core Competencies</h2>
            <ul style='margin: 0; padding: 0 0 0 15px; list-style-type: square; column-count: 3; column-gap: 40px;'>
                {skills_list_html}
            </ul>
        </div>
        
        <!-- FOOTER BAR -->
        <div style='position: absolute; bottom: 0; left: 0; right: 0; height: 30px; background: #222;'></div>
    </div>
    """
    
    # Save to database
    new_resume = models.Resume(
        user_id=current_user.id,
        resume_html=final_html,
        resume_data=json.dumps(request.dict())
    )
    db.add(new_resume)
    db.commit()

    return ResumeBuilderResponse(
        resume_html=final_html,
        resume_data=request.dict(),
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
        resume_data=json.loads(resume.resume_data) if resume.resume_data else None,
        suggestions=[] # suggestions aren't stored individually
    )

@app.get("/api/resume-builder/history")
async def get_resume_history(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Fetch all resumes for the current user"""
    resumes = db.query(models.Resume).filter(models.Resume.user_id == current_user.id).order_by(models.Resume.created_at.desc()).all()
    return [
        {
            "id": r.id,
            "resume_html": r.resume_html,
            "resume_data": json.loads(r.resume_data) if r.resume_data else None,
            "created_at": r.created_at.isoformat() if r.created_at else ""
        }
        for r in resumes
    ]


@app.delete("/api/resume-builder/{resume_id}")
async def delete_resume(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Delete a specific resume"""
    resume = db.query(models.Resume).filter(models.Resume.id == resume_id, models.Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    db.delete(resume)
    db.commit()
    return {"message": "Resume deleted successfully"}


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
        If this is the 5th question, set is_completed to true.

        SPELLING AUTO-CORRECT (VERY IMPORTANT): If the user's answer has minor spelling mistakes, automatically correct them and evaluate the intended content.

        INPUT VALIDATION: If the user's answer is truly complete gibberish or completely unrelated to the technical question, return this JSON:
        {{
            "error": true,
            "message": "I couldn't understand your answer. Could you please provide a technical response to the question?",
            "suggestion": "Try explaining your thought process clearly."
        }}

        If the input IS valid (even with minor typos), output strictly in valid JSON format:
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
        
        # Check for input validation error
        if data.get("error"):
             raise HTTPException(status_code=400, detail=data.get("message", "Invalid input") + " 💡 " + data.get("suggestion", ""))

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

        SPELLING AUTO-CORRECT (VERY IMPORTANT): If the language has minor spelling mistakes (e.g., "Pyotn" instead of "Python"), automatically correct it and start the interview.

        INPUT VALIDATION: If the language is truly NOT a programming language, return this JSON:
        {{
            "error": true,
            "message": "I don't recognize '{request.language}' as a programming language to interview you on.",
            "suggestion": "Try entering a language like Python, JavaScript, Java, or C++."
        }}

        If valid, output strictly in valid JSON format:
        {{
            "next_question": "First question..."
        }}
        """
        response_text = await get_ai_response(prompt)
        data = parse_json_response(response_text)

        # Check for input validation error
        if data.get("error"):
             raise HTTPException(status_code=400, detail=data.get("message", "Invalid input") + " 💡 " + data.get("suggestion", ""))

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
