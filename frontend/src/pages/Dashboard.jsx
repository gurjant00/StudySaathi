import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlowingEffect } from '../components/ui/glowing-effect';

function Dashboard() {
    const navigate = useNavigate();
    const [clickedCard, setClickedCard] = useState(null);

    const features = [
        {
            id: 1,
            title: 'AI Study Planner',
            description: 'Generate personalized study schedules based on your goals and exams.',
            icon: '📅',
            link: '/study-planner',
        },
        {
            id: 2,
            title: 'AI Career Advisor',
            description: 'Discover your ideal career path based on your skills and interests.',
            icon: '🎯',
            link: '/career-recommendation',
        },
        {
            id: 3,
            title: 'AI Answer Evaluator',
            description: 'Get instant feedback and marks on your written answers.',
            icon: '💯',
            link: '/answer-evaluator',
        },
        {
            id: 4,
            title: 'AI Resume Builder',
            description: 'Craft ATS-friendly resumes with smart AI suggestions.',
            icon: '📄',
            link: '/resume-builder',
        },
        {
            id: 5,
            title: 'AI Mock Interview',
            description: 'Practice with an AI interviewer and receive performance analysis.',
            icon: '🎤',
            link: '/mock-interview',
        }
    ];

    const handleCardClick = useCallback((card) => {
        setClickedCard(card.id);
    }, []);

    const handleAnimationComplete = useCallback((link) => {
        navigate(link);
    }, [navigate]);

    return (
        <div className="fade-in" style={{ padding: '0 0.5rem' }}>
            <h1 className="glow-text mb-1">Your Dashboard</h1>
            <p className="mb-3" style={{ fontSize: '1.1rem' }}>Access your top AI tools below to accelerate your learning and career.</p>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gridTemplateRows: 'auto',
                gap: '1rem',
            }}>
                {features.map((card) => (
                    <div
                        key={card.id}
                        onClick={() => handleCardClick(card)}
                        style={{
                            cursor: 'pointer',
                            ...(card.id === 5 ? { gridColumn: '1 / -1' } : {}),
                        }}
                    >
                        <div style={{
                            position: 'relative',
                            height: '100%',
                            borderRadius: '1.25rem',
                            border: '0.75px solid var(--color-border)',
                            padding: '0.5rem',
                        }}>
                            <GlowingEffect
                                spread={30}
                                glow={true}
                                disabled={false}
                                proximity={16}
                                inactiveZone={0.01}
                                borderWidth={1}
                                onClickAnimate={clickedCard === card.id}
                                onAnimationComplete={() => handleAnimationComplete(card.link)}
                            />
                            <div className="glass-card" style={{
                                position: 'relative',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'flex-end',
                                gap: '0.75rem',
                                overflow: 'hidden',
                                borderRadius: '0.75rem',
                                padding: '1.5rem',
                                height: '100%',
                                minHeight: '12rem',
                                transition: 'transform 0.2s ease',
                            }}>
                                <div style={{
                                    width: 'fit-content',
                                    borderRadius: '0.5rem',
                                    border: '0.75px solid rgba(255, 255, 255, 0.2)',
                                    padding: '0.5rem',
                                    fontSize: '1.5rem',
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    color: 'white',
                                    boxShadow: 'inset 0 0 10px rgba(255, 255, 255, 0.05)',
                                }}>
                                    {card.icon}
                                </div>
                                <div>
                                    <h3 style={{
                                        fontSize: '1.25rem',
                                        fontWeight: 600,
                                        letterSpacing: '-0.04em',
                                        color: '#ffffff',
                                        marginBottom: '0.5rem',
                                        textShadow: '0 0 10px rgba(255, 255, 255, 0.4)'
                                    }}>
                                        {card.title}
                                    </h3>
                                    <p style={{
                                        fontSize: '0.9rem',
                                        lineHeight: '1.4',
                                        color: 'rgba(255, 255, 255, 0.7)',
                                        margin: 0,
                                    }}>
                                        {card.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="card glass-card glass-card mt-3 glass-card" style={{ background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)' }}>
                <h3 className="glow-text">💡 Tip</h3>
                <p>
                    You can access all other tools, like the Concept Explainer and Notes Summarizer, from the sidebar on the left.
                </p>
            </div>
        </div>
    );
}

export default Dashboard;
