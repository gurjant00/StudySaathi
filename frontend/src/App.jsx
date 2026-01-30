import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import StudyPlanner from './pages/StudyPlanner';
import NotesSummarizer from './pages/NotesSummarizer';
import AnswerEvaluator from './pages/AnswerEvaluator';
import CareerRecommendation from './pages/CareerRecommendation';
import ResumeBuilder from './pages/ResumeBuilder';
import MockInterview from './pages/MockInterview';
import About from './pages/About';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { AuthProvider, useAuth } from './context/AuthContext';

function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) return <div className="loading-container"><div className="loading"></div></div>;

    if (!user) {
        return <Login />;
    }

    return children;
}


function Navbar({ isDarkMode, toggleTheme }) {
    const location = useLocation();
    const { user, logout } = useAuth();

    return (
        <nav className="navbar">
            <div className="navbar-content">
                <Link to="/" className="navbar-logo">
                    🎓 EduMate AI
                </Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <ul className="navbar-nav">
                        <li>
                            <Link
                                to="/"
                                className={`navbar-link ${location.pathname === '/' ? 'active' : ''}`}
                            >
                                Home
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/about"
                                className={`navbar-link ${location.pathname === '/about' ? 'active' : ''}`}
                            >
                                About Us
                            </Link>
                        </li>
                        {user ? (
                            <>
                                <li style={{ marginLeft: '1rem', color: 'var(--color-text)', fontWeight: '600' }}>
                                    Hi, {user.full_name.split(' ')[0]}
                                </li>
                                <li>
                                    <button onClick={logout} className="btn btn-secondary" style={{ padding: '0.4rem 1rem' }}>
                                        Logout
                                    </button>
                                </li>
                            </>
                        ) : (
                            <li>
                                <Link to="/login" className="btn btn-primary" style={{ padding: '0.4rem 1.5rem', color: 'white' }}>
                                    Login
                                </Link>
                            </li>
                        )}
                    </ul>
                    <button
                        onClick={toggleTheme}
                        className="btn"
                        style={{
                            background: 'transparent',
                            fontSize: '1.2rem',
                            padding: '0.5rem',
                            border: '1px solid var(--color-border)',
                            color: 'var(--color-text)'
                        }}
                        title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                    >
                        {isDarkMode ? '🌞' : '🌙'}
                    </button>
                </div>
            </div>
        </nav>
    );
}

function App() {
    // Check system preference or localStorage
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        return savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    });

    useEffect(() => {
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    const toggleTheme = () => {
        setIsDarkMode(prev => !prev);
    };

    return (
        <AuthProvider>
            <Router>
                <Navbar isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/study-planner" element={<ProtectedRoute><StudyPlanner /></ProtectedRoute>} />
                    <Route path="/notes-summarizer" element={<ProtectedRoute><NotesSummarizer /></ProtectedRoute>} />
                    <Route path="/answer-evaluator" element={<ProtectedRoute><AnswerEvaluator /></ProtectedRoute>} />
                    <Route path="/career-recommendation" element={<ProtectedRoute><CareerRecommendation /></ProtectedRoute>} />
                    <Route path="/resume-builder" element={<ProtectedRoute><ResumeBuilder /></ProtectedRoute>} />
                    <Route path="/mock-interview" element={<ProtectedRoute><MockInterview /></ProtectedRoute>} />
                    <Route path="/about" element={<About />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
