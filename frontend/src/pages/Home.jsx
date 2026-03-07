import React from 'react';
import { Link } from 'react-router-dom';
import GradientText from '../components/GradientText';
import { Plasma } from '../components/Plasma';

function Home() {
    return (
        <div className="home-container" style={{ position: 'relative' }}>
            <Plasma
                color="#8a2be2" // Deep purple for aesthetic
                speed={0.5}
                direction="forward"
                scale={1.5}
                opacity={0.6} // Reduced opacity so it doesn't overpower text
                mouseInteractive={false}
            />
            {/* Animated Background Elements */}
            <div className="bg-shape shape-1"></div>
            <div className="bg-shape shape-2"></div>
            <div className="bg-shape shape-3"></div>

            <div className="home-content fade-in">
                <div className="badge-glow mb-2 slide-in" style={{ animationDelay: '0.2s' }}>
                    <span className="sparkle">✨</span> Welcome to the Future of Learning
                </div>

                <h1 className="hero-title slide-in" style={{ animationDelay: '0.4s' }}>
                    <GradientText
                        colors={['#5227FF', '#FF9FFC', '#B19EEF', '#5227FF']}
                        animationSpeed={6}
                        showBorder={false}
                    >
                        StudySaathi
                    </GradientText>
                    <br />
                    <span className="text-gradient">Your AI Study Companion</span>
                </h1>

                <p className="hero-subtitle slide-in" style={{ animationDelay: '0.6s' }}>
                    Elevate your academic journey with personalized study plans, instant note summaries, AI-driven mock interviews, and smart career guidance.
                </p>

                <div className="home-actions slide-in" style={{ animationDelay: '0.8s' }}>
                    <Link to="/dashboard" className="btn btn-primary btn-large glow-btn">
                        Get Started <span className="arrow">→</span>
                    </Link>
                    <Link to="/about" className="btn btn-secondary btn-large">
                        Learn More
                    </Link>
                </div>

                <div className="home-features-preview fade-in" style={{ animationDelay: '1s' }}>
                    <div className="feature-pill glass-card">🚀 Fast</div>
                    <div className="feature-pill glass-card">🧠 Smart</div>
                    <div className="feature-pill glass-card">🎯 Personalized</div>
                </div>
            </div>
        </div>
    );
}

export default Home;
