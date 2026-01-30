from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    study_plans = relationship("StudyPlan", back_populates="owner")
    resumes = relationship("Resume", back_populates="owner")

class StudyPlan(Base):
    __tablename__ = "study_plans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    plan_data = Column(Text) # JSON string
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="study_plans")

class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    resume_html = Column(Text)
    ats_score = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="resumes")

class NoteSummary(Base):
    __tablename__ = "note_summaries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    topic = Column(String)
    summary_data = Column(Text) # JSON string
    created_at = Column(DateTime, default=datetime.utcnow)

class AnswerEvaluation(Base):
    __tablename__ = "answer_evaluations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    question = Column(Text)
    answer = Column(Text)
    feedback_data = Column(Text) # JSON string
    created_at = Column(DateTime, default=datetime.utcnow)

class CareerRecommendation(Base):
    __tablename__ = "career_recommendations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    interests = Column(Text)
    skills = Column(Text)
    recommendation_data = Column(Text) # JSON string
    created_at = Column(DateTime, default=datetime.utcnow)

class MockInterviewSession(Base):
    __tablename__ = "mock_interviews"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    language = Column(String)
    overall_score = Column(Integer)
    chat_history = Column(Text) # JSON string of all messages
    feedback_data = Column(Text) # JSON string of final evaluation
    created_at = Column(DateTime, default=datetime.utcnow)
