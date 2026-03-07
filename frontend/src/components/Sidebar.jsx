import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Sidebar({ isOpen, toggleSidebar }) {
    const location = useLocation();

    const tools = [
        { name: 'Dashboard', path: '/dashboard', icon: '🏠' },
        { name: 'AI Study Planner', path: '/study-planner', icon: '📅' },
        { name: 'Notes Summarizer', path: '/notes-summarizer', icon: '📑' },
        { name: 'AI Concept Explainer', path: '/concept-explainer', icon: '💡' },
        { name: 'AI Doubt Solver', path: '/doubt-solver', icon: '🤔' },
        { name: 'Quiz Generator', path: '/quiz-generator', icon: '✍️' },
        { name: 'Answer Evaluator', path: '/answer-evaluator', icon: '💯' },
        { name: 'Career Advisor', path: '/career-recommendation', icon: '🚀' },
        { name: 'Resume Builder', path: '/resume-builder', icon: '📄' },
        { name: 'Mock Interview', path: '/mock-interview', icon: '🎤' },
        { name: 'Focus Timer', path: '/focus-timer', icon: '⏱️' },
    ];

    return (
        <aside className={`sidebar ${isOpen ? 'open' : ''} glass-card`}>
            <div className="sidebar-header">
                <h3>🛠️ All Tools</h3>
                <button className="close-btn" onClick={toggleSidebar}>×</button>
            </div>
            <nav className="sidebar-nav">
                {tools.map(tool => (
                    <Link
                        key={tool.path}
                        to={tool.path}
                        className={`sidebar-link ${location.pathname === tool.path ? 'active' : ''}`}
                        onClick={() => { if (window.innerWidth <= 768) toggleSidebar(); }}
                    >
                        <span className="sidebar-icon">{tool.icon}</span>
                        {tool.name}
                    </Link>
                ))}
            </nav>
        </aside>
    );
}

export default Sidebar;
