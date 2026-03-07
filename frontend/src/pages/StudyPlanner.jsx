import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { API_URL } from '../config';
import { useAuth } from '../context/AuthContext';

// const API_URL = 'http://127.0.0.1:8000';

function StudyPlanner() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        subjects: '',
        exam_date: '',
        hours_per_day: 4
    });
    const [topicFocus, setTopicFocus] = useState('');
    const [showTopicInput, setShowTopicInput] = useState(false);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const { token } = useAuth();

    const authHeaders = {
        headers: { Authorization: `Bearer ${token}` }
    };

    React.useEffect(() => {
        fetchLatestPlan();
    }, []);

    const fetchLatestPlan = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/study-planner/latest`, authHeaders);
            if (response.data) {
                setResult(response.data);
            }
        } catch (err) {
            console.error("Failed to fetch latest plan:", err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setResult(null);

        try {
            const subjects = formData.subjects.split(',').map(s => s.trim()).filter(s => s);

            if (subjects.length === 0) {
                setError('Please enter at least one subject');
                setLoading(false);
                return;
            }

            const response = await axios.post(`${API_URL}/api/study-planner`, {
                subjects,
                exam_date: formData.exam_date,
                hours_per_day: parseInt(formData.hours_per_day),
                ...(topicFocus.trim() ? { topic_focus: topicFocus.trim() } : {})
            }, authHeaders);

            setResult(response.data);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to generate study plan. Make sure the backend is running.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container section fade-in">
            <button onClick={() => navigate(-1)} className="btn btn-secondary mb-2">← Go Back</button>

            <div className="card glass-card glass-card glass-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div className="feature-icon" style={{ background: 'var(--gradient-blue)' }}>📚</div>
                    <div>
                        <h2 style={{ margin: 0 }}>AI Study Planner</h2>
                        <p style={{ margin: 0 }}>Get a personalized study schedule</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Subjects (comma-separated)</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="e.g., Mathematics, Physics, Chemistry"
                            value={formData.subjects}
                            onChange={(e) => setFormData({ ...formData, subjects: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Exam Date</label>
                        <input
                            type="date"
                            className="form-input"
                            value={formData.exam_date}
                            onChange={(e) => setFormData({ ...formData, exam_date: e.target.value })}
                            required
                            min={new Date().toISOString().split('T')[0]}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Hours Available Per Day</label>
                        <input
                            type="number"
                            className="form-input"
                            value={formData.hours_per_day}
                            onChange={(e) => setFormData({ ...formData, hours_per_day: e.target.value })}
                            required
                            min="1"
                            max="12"
                        />
                    </div>

                    {/* Optional Topic Focus */}
                    <div style={{ marginBottom: '1rem' }}>
                        <button
                            type="button"
                            onClick={() => setShowTopicInput(!showTopicInput)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                background: showTopicInput ? 'rgba(102, 126, 234, 0.15)' : 'transparent',
                                border: '1px dashed var(--color-border)',
                                borderRadius: 'var(--radius-sm)',
                                padding: '0.6rem 1rem',
                                color: 'var(--color-primary)',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                fontWeight: '500',
                                transition: 'all 0.2s ease',
                                width: '100%'
                            }}
                        >
                            <span style={{ fontSize: '1.2rem' }}>{showTopicInput ? '📌' : '➕'}</span>
                            {showTopicInput ? 'Topic Focus Added (optional)' : 'Add Specific Topic Focus (optional)'}
                        </button>

                        {showTopicInput && (
                            <div className="form-group" style={{ marginTop: '0.75rem', animation: 'fadeIn 0.3s ease' }}>
                                <label className="form-label">Specific Topics to Focus On</label>
                                <textarea
                                    className="form-textarea"
                                    rows="2"
                                    placeholder="e.g., Thermodynamics in Physics, Calculus in Math, Organic Chemistry..."
                                    value={topicFocus}
                                    onChange={(e) => setTopicFocus(e.target.value)}
                                    style={{ resize: 'vertical' }}
                                />
                                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                                    💡 This helps the AI create a more targeted and efficient study plan.
                                </p>
                            </div>
                        )}
                    </div>

                    {error && (
                        <div style={{ background: '#fee', color: '#c33', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                            {error}
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary btn-large" style={{ width: '100%' }} disabled={loading}>
                        {loading ? 'Generating...' : '🚀 Generate Study Plan'}
                    </button>
                </form>
            </div>

            {loading && (
                <div className="loading-container">
                    <div className="loading"></div>
                </div>
            )}

            {result && (
                <div className="animate-fadeIn" style={{ maxWidth: '1000px', margin: '2rem auto' }}>
                    <div className="result-card glass-card mb-2">
                        <div className="result-header">
                            <h2 className="glow-text" style={{ margin: 0 }}>Your Specialized Study Roadmap</h2>
                            <span className="result-badge">AI Strategy</span>
                        </div>
                        <p style={{ fontSize: '1.1rem', color: 'var(--color-text)', textAlign: 'center' }}>
                            <strong>{result.message}</strong>
                        </p>
                    </div>

                    <div className="grid grid-2 mt-2">
                        {result.plan.map((day, index) => (
                            <div
                                key={index}
                                className="card glass-card glass-card glass-card"
                                style={{
                                    borderTop: '5px solid var(--color-primary)',
                                    animationDelay: `${index * 0.1}s`
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <h3 style={{ margin: 0, color: 'var(--color-primary)' }}>{day.day}</h3>
                                    <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', background: 'rgba(0,0,0,0.2)', padding: '2px 8px', borderRadius: '10px' }}>{day.date}</span>
                                </div>

                                <div style={{
                                    background: 'var(--gradient-blue)',
                                    color: 'white',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '0.5rem',
                                    marginBottom: '1rem',
                                    fontWeight: '700',
                                    boxShadow: 'var(--glow-primary)'
                                }}>
                                    🎯 Focus: {day.focus_subject}
                                </div>

                                <ul style={{ listStyle: 'none', padding: 0 }}>
                                    {day.tasks.map((task, taskIndex) => (
                                        <li key={taskIndex} style={{ marginBottom: '0.6rem', display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
                                            <span style={{ color: 'var(--color-accent-teal)' }}>⚡</span>
                                            <span style={{ color: 'var(--color-text)' }}>{task}</span>
                                        </li>
                                    ))}
                                </ul>

                                {day.resources && day.resources.length > 0 && (
                                    <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
                                        <h4 style={{ margin: '0 0 0.75rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem', color: 'var(--color-accent-blue)' }}>
                                            📺 Curated Learning Resources:
                                        </h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            {day.resources.map((res, resIndex) => (
                                                <a
                                                    key={resIndex}
                                                    href={res.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="btn btn-secondary"
                                                    style={{
                                                        padding: '0.5rem',
                                                        fontSize: '0.85rem',
                                                        textAlign: 'left',
                                                        display: 'block',
                                                        textDecoration: 'none',
                                                        background: 'rgba(255,255,255,0.05)',
                                                        borderColor: 'rgba(255,255,255,0.1)'
                                                    }}
                                                >
                                                    ▶ {res.title}
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default StudyPlanner;
