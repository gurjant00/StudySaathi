import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import GlassSurface from './components/GlassSurface';
import Home from './pages/Home';
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
import DoubtSolver from './pages/DoubtSolver';
import QuizGenerator from './pages/QuizGenerator';
import ConceptExplainer from './pages/ConceptExplainer';
import FocusTimer from './pages/FocusTimer';
import Sidebar from './components/Sidebar';
import { AuthProvider, useAuth } from './context/AuthContext';

function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) return <div className="loading-container"><div className="loading"></div></div>;

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

function Layout({ children, isSidebarOpen, toggleSidebar }) {
    return (
        <div className="app-layout">
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
            <main className="main-content">
                {children}
            </main>
        </div>
    );
}

function Navbar({ isDarkMode, toggleTheme, isSidebarOpen, toggleSidebar }) {
    const location = useLocation();
    const { user, logout } = useAuth();
    const isHomePage = location.pathname === '/';
    const isTransparentNav = ['/', '/login', '/signup'].includes(location.pathname);

    // Only show the toggle button if we are on a tool page (not Home, About, Login, or Signup)
    const showSidebarToggle = !['/', '/about', '/login', '/signup'].includes(location.pathname);

    return (
        <nav className={`navbar ${isTransparentNav ? 'transparent-nav' : ''}`} style={{ position: isTransparentNav ? 'absolute' : 'relative', width: '100%', zIndex: 100 }}>
            {!isTransparentNav && (
                <GlassSurface
                    width="100%"
                    height="100%"
                    borderRadius={0}
                    borderWidth={0}
                    displace={0.5}
                    distortionScale={-180}
                    redOffset={0}
                    greenOffset={10}
                    blueOffset={20}
                    brightness={50}
                    opacity={0.93}
                    mixBlendMode="screen"
                    style={{ position: 'absolute', top: 0, left: 0, bottom: 0, right: 0 }}
                />
            )}
            <div className="navbar-content" style={{ justifyContent: 'flex-start', gap: '1rem', position: 'relative', zIndex: 1 }}>
                {showSidebarToggle && (
                    <button
                        className="btn btn-secondary"
                        onClick={toggleSidebar}
                        style={{ display: 'inline-flex', alignItems: 'center', padding: '0.4rem 0.8rem', fontSize: '1.2rem', gap: '0.5rem', background: 'transparent', border: 'none', color: 'var(--color-text)' }}
                        title={isSidebarOpen ? "Hide Sidebar" : "Show Sidebar"}
                    >
                        ☰
                    </button>
                )}

                <Link to="/" className="navbar-logo" style={{ marginRight: 'auto' }}>
                    🎓 StudySaathi
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

    // Lifted Sidebar State
    const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth > 768);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth <= 768) {
                setIsSidebarOpen(false);
            } else {
                setIsSidebarOpen(true);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

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
        <GoogleOAuthProvider clientId="426984478952-jv9jdv9sks9tfuscv5hfsb4i2e7iq84a.apps.googleusercontent.com">
            <AuthProvider>
                <Router>
                    <Navbar isDarkMode={isDarkMode} toggleTheme={toggleTheme} isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />
                        <Route path="/about" element={<About />} />

                        {/* Protected Routes wrapped in Layout with Sidebar */}
                        <Route path="/dashboard" element={<ProtectedRoute><Layout isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}><Dashboard /></Layout></ProtectedRoute>} />
                        <Route path="/study-planner" element={<ProtectedRoute><Layout isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}><StudyPlanner /></Layout></ProtectedRoute>} />
                        <Route path="/notes-summarizer" element={<ProtectedRoute><Layout isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}><NotesSummarizer /></Layout></ProtectedRoute>} />
                        <Route path="/answer-evaluator" element={<ProtectedRoute><Layout isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}><AnswerEvaluator /></Layout></ProtectedRoute>} />
                        <Route path="/career-recommendation" element={<ProtectedRoute><Layout isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}><CareerRecommendation /></Layout></ProtectedRoute>} />
                        <Route path="/resume-builder" element={<ProtectedRoute><Layout isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}><ResumeBuilder /></Layout></ProtectedRoute>} />
                        <Route path="/mock-interview" element={<ProtectedRoute><Layout isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}><MockInterview /></Layout></ProtectedRoute>} />
                        <Route path="/doubt-solver" element={<ProtectedRoute><Layout isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}><DoubtSolver /></Layout></ProtectedRoute>} />
                        <Route path="/quiz-generator" element={<ProtectedRoute><Layout isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}><QuizGenerator /></Layout></ProtectedRoute>} />
                        <Route path="/concept-explainer" element={<ProtectedRoute><Layout isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}><ConceptExplainer /></Layout></ProtectedRoute>} />
                        <Route path="/focus-timer" element={<ProtectedRoute><Layout isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}><FocusTimer /></Layout></ProtectedRoute>} />
                    </Routes>
                </Router>
            </AuthProvider>
        </GoogleOAuthProvider>
    );
}

export default App;
