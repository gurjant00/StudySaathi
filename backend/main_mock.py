from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta
import random

app = FastAPI(title="EduMate AI API", description="Smart Assistant for Students")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== Request/Response Models ====================

# Study Planner Models
class StudyPlannerRequest(BaseModel):
    subjects: List[str]
    exam_date: str
    hours_per_day: int

class DayPlan(BaseModel):
    day: str
    date: str
    tasks: List[str]
    focus_subject: str

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

# ==================== API Endpoints ====================

@app.get("/")
def read_root():
    return {
        "message": "Welcome to EduMate AI API",
        "version": "1.0.0",
        "features": [
            "Study Planner",
            "Notes Summarizer",
            "Answer Evaluator",
            "Career Recommendation",
            "Resume Builder"
        ]
    }

@app.post("/api/study-planner", response_model=StudyPlannerResponse)
def generate_study_plan(request: StudyPlannerRequest):
    """Generate a personalized study schedule"""
    try:
        # Calculate days until exam
        exam_date = datetime.strptime(request.exam_date, "%Y-%m-%d")
        today = datetime.now()
        days_until_exam = (exam_date - today).days
        
        if days_until_exam < 1:
            raise HTTPException(status_code=400, detail="Exam date must be in the future")
        
        # Generate mock study plan
        plan = []
        subjects_cycle = request.subjects * ((days_until_exam // len(request.subjects)) + 1)
        
        for i in range(min(days_until_exam, 14)):  # Show up to 14 days
            day_date = today + timedelta(days=i)
            subject = subjects_cycle[i % len(request.subjects)]
            
            tasks = [
                f"Review {subject} concepts ({request.hours_per_day // 2} hours)",
                f"Solve {subject} practice problems ({request.hours_per_day // 3} hours)",
                f"Take short quiz on {subject} ({request.hours_per_day // 6} hours)",
                "Revision and note-making"
            ]
            
            plan.append(DayPlan(
                day=day_date.strftime("%A"),
                date=day_date.strftime("%Y-%m-%d"),
                tasks=tasks,
                focus_subject=subject
            ))
        
        return StudyPlannerResponse(
            plan=plan,
            total_days=len(plan),
            message=f"AI-generated study plan for {days_until_exam} days with {request.hours_per_day}h daily study time"
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")

@app.post("/api/notes-summarizer", response_model=NotesSummarizerResponse)
def summarize_notes(request: NotesSummarizerRequest):
    """Summarize long notes into key points"""
    
    # Mock AI summarization
    words = request.notes.split()
    
    if len(words) < 10:
        raise HTTPException(status_code=400, detail="Notes are too short to summarize")
    
    # Generate mock summary points
    summary_points = [
        f"{request.topic} involves understanding fundamental principles and their applications",
        "Key concepts include theoretical foundations and practical implementations",
        "Important formulas and definitions must be memorized for exam success",
        "Practice problems help reinforce understanding of core concepts",
        "Real-world applications demonstrate the relevance of theoretical knowledge",
        "Common mistakes to avoid include misinterpreting key terms and rushing through problems",
        "Exam tips: Focus on understanding rather than rote memorization",
        "Review previous years' questions for pattern recognition"
    ]
    
    # Select random relevant points
    num_points = min(6, max(4, len(words) // 20))
    selected_points = random.sample(summary_points, num_points)
    
    return NotesSummarizerResponse(
        summary=selected_points,
        key_points=len(selected_points),
        topic=request.topic
    )

@app.post("/api/answer-evaluator", response_model=AnswerEvaluatorResponse)
def evaluate_answer(request: AnswerEvaluatorRequest):
    """Evaluate student answer and provide feedback"""
    
    if not request.student_answer.strip():
        raise HTTPException(status_code=400, detail="Student answer cannot be empty")
    
    # Mock AI evaluation
    answer_length = len(request.student_answer.split())
    
    # Calculate marks based on answer length and complexity
    if answer_length < 20:
        marks_obtained = int(request.max_marks * 0.4)
    elif answer_length < 50:
        marks_obtained = int(request.max_marks * 0.6)
    elif answer_length < 100:
        marks_obtained = int(request.max_marks * 0.75)
    else:
        marks_obtained = int(request.max_marks * 0.85)
    
    percentage = (marks_obtained / request.max_marks) * 100
    
    strengths = [
        "Good understanding of basic concepts",
        "Clear explanation provided",
        "Relevant examples mentioned"
    ]
    
    improvements = [
        "Add more specific details and examples",
        "Include relevant formulas or theories",
        "Improve structure with proper paragraphs",
        "Connect concepts to real-world applications"
    ]
    
    if percentage >= 75:
        feedback = "Excellent answer! You demonstrate strong understanding of the topic."
    elif percentage >= 60:
        feedback = "Good attempt! With minor improvements, this can be an excellent answer."
    elif percentage >= 40:
        feedback = "Satisfactory answer. Focus on adding more depth and clarity."
    else:
        feedback = "Needs improvement. Review the topic thoroughly and practice more."
    
    return AnswerEvaluatorResponse(
        marks_obtained=marks_obtained,
        max_marks=request.max_marks,
        percentage=round(percentage, 2),
        feedback=feedback,
        strengths=strengths[:2] if percentage < 60 else strengths,
        improvements=random.sample(improvements, 2)
    )

@app.post("/api/career-recommendation", response_model=CareerRecommendationResponse)
def recommend_careers(request: CareerRecommendationRequest):
    """Recommend career paths based on interests and skills"""
    
    # Mock career database
    all_careers = [
        CareerPath(
            title="Software Developer",
            description="Design and develop software applications using programming languages",
            required_skills=["Programming", "Problem Solving", "Algorithms", "Data Structures"],
            salary_range="₹6-25 LPA",
            growth_potential="Excellent"
        ),
        CareerPath(
            title="Data Scientist",
            description="Analyze complex data to help companies make better decisions",
            required_skills=["Python", "Statistics", "Machine Learning", "Data Analysis"],
            salary_range="₹8-30 LPA",
            growth_potential="Excellent"
        ),
        CareerPath(
            title="UI/UX Designer",
            description="Create user-friendly and visually appealing digital interfaces",
            required_skills=["Design Tools", "User Research", "Prototyping", "Creativity"],
            salary_range="₹5-20 LPA",
            growth_potential="Very Good"
        ),
        CareerPath(
            title="Digital Marketing Specialist",
            description="Promote products and services through digital channels",
            required_skills=["SEO", "Content Marketing", "Social Media", "Analytics"],
            salary_range="₹4-15 LPA",
            growth_potential="Very Good"
        ),
        CareerPath(
            title="AI/ML Engineer",
            description="Build intelligent systems using artificial intelligence and machine learning",
            required_skills=["Python", "Deep Learning", "TensorFlow", "Mathematics"],
            salary_range="₹10-35 LPA",
            growth_potential="Excellent"
        ),
        CareerPath(
            title="Business Analyst",
            description="Bridge the gap between IT and business to improve processes",
            required_skills=["Analysis", "Communication", "SQL", "Business Strategy"],
            salary_range="₹6-18 LPA",
            growth_potential="Good"
        )
    ]
    
    # Simple matching based on interests/skills
    recommended = random.sample(all_careers, min(4, len(all_careers)))
    
    skills_to_develop = [
        "Communication and Presentation Skills",
        "Project Management",
        "Critical Thinking",
        "Cloud Technologies (AWS/Azure)",
        "Version Control (Git)",
        "Agile Methodologies"
    ]
    
    return CareerRecommendationResponse(
        recommended_careers=recommended,
        skills_to_develop=random.sample(skills_to_develop, 4)
    )

@app.post("/api/resume-builder", response_model=ResumeBuilderResponse)
def build_resume(request: ResumeBuilderRequest):
    """Generate ATS-friendly resume"""
    
    # Generate HTML resume
    education_html = ""
    for edu in request.education:
        education_html += f"""
        <div class="resume-item">
            <h3>{edu.degree}</h3>
            <p><strong>{edu.institution}</strong> | {edu.year}</p>
            <p>Grade: {edu.grade}</p>
        </div>
        """
    
    projects_html = ""
    for proj in request.projects:
        projects_html += f"""
        <div class="resume-item">
            <h3>{proj.name}</h3>
            <p>{proj.description}</p>
            <p><em>Technologies: {proj.technologies}</em></p>
        </div>
        """
    
    skills_html = ", ".join(request.skills)
    
    resume_html = f"""
    <div class="resume-container">
        <div class="resume-header">
            <h1>{request.name}</h1>
            <p>{request.email} | {request.phone}</p>
        </div>
        
        <div class="resume-section">
            <h2>Professional Summary</h2>
            <p>{request.summary}</p>
        </div>
        
        <div class="resume-section">
            <h2>Education</h2>
            {education_html}
        </div>
        
        <div class="resume-section">
            <h2>Technical Skills</h2>
            <p>{skills_html}</p>
        </div>
        
        <div class="resume-section">
            <h2>Projects</h2>
            {projects_html}
        </div>
    </div>
    """
    
    # Mock ATS score
    ats_score = random.randint(75, 95)
    
    suggestions = [
        "Add quantifiable achievements to education section",
        "Include relevant certifications if available",
        "Use action verbs in project descriptions",
        "Consider adding a Skills section with proficiency levels"
    ]
    
    return ResumeBuilderResponse(
        resume_html=resume_html,
        ats_score=ats_score,
        suggestions=random.sample(suggestions, 2)
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
