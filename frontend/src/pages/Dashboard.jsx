import React from 'react';
import { Link } from 'react-router-dom';

function Dashboard() {
    const features = [
        {
            id: 1,
            title: 'AI Study Planner',
            description: 'Generate personalized daily study schedules based on your subjects, exam dates, and available time.',
            icon: '📚',
            color: 'blue',
            link: '/study-planner'
        },
        {
            id: 2,
            title: 'AI Notes Summarizer',
            description: 'Transform lengthy notes into concise, exam-focused bullet points instantly.',
            icon: '📝',
            color: 'purple',
            link: '/notes-summarizer'
        },
        {
            id: 3,
            title: 'AI Answer Evaluator',
            description: 'Get instant feedback on your exam answers with marks and improvement suggestions.',
            icon: '✅',
            color: 'teal',
            link: '/answer-evaluator'
        },
        {
            id: 4,
            title: 'AI Career Advisor',
            description: 'Discover suitable career paths and skills based on your interests and education.',
            icon: '🎯',
            color: 'orange',
            link: '/career-recommendation'
        },
        {
            id: 5,
            title: 'AI Resume Builder',
            description: 'Create professional, ATS-friendly resumes with live preview and optimization tips.',
            icon: '📄',
            color: 'sunset',
            link: '/resume-builder'
        },
        {
            id: 6,
            title: 'AI Mock Interview',
            description: 'Practice technical interviews with voice-based AI interaction and instant feedback.',
            icon: '🎤',
            color: 'purple',
            link: '/mock-interview'
        }
    ];

    return (
        <div className="container section fade-in">
            <div className="hero">
                <h1 className="text-gradient">
                    EduMate AI – Smart Assistant for Students
                </h1>
                <p className="hero-subtitle">
                    Your AI-powered companion for exam preparation, career planning, and professional growth.
                    Built by students, for students. 🚀
                </p>
            </div>

            <div className="text-center mb-3">
                <h2>Explore Our AI-Powered Tools</h2>
                <p style={{ maxWidth: '700px', margin: '0 auto', fontSize: '1.1rem' }}>
                    Choose any feature below to experience intelligent assistance tailored for your academic and career success.
                </p>
            </div>

            <div className="feature-grid">
                {features.map((feature, index) => (
                    <Link
                        to={feature.link}
                        key={feature.id}
                        className={`feature-card ${feature.color}`}
                        style={{ animationDelay: `${index * 0.1}s` }}
                    >
                        <div className="feature-icon">{feature.icon}</div>
                        <h3 className="feature-title">{feature.title}</h3>
                        <p className="feature-description">{feature.description}</p>
                        <button className="btn btn-primary mt-2" style={{ width: '100%' }}>
                            Try Now →
                        </button>
                    </Link>
                ))}
            </div>

            <div className="card mt-3" style={{ background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)' }}>
                <h3>✨ Why EduMate AI?</h3>
                <div className="grid-3 mt-2">
                    <div>
                        <h4>🤖 AI-Powered</h4>
                        <p>Intelligent algorithms provide personalized recommendations and insights</p>
                    </div>
                    <div>
                        <h4>⚡ Fast & Easy</h4>
                        <p>Simple forms instead of complex prompts - just fill and generate</p>
                    </div>
                    <div>
                        <h4>🎨 Beautiful UI</h4>
                        <p>Modern, colorful design that makes learning and planning enjoyable</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
