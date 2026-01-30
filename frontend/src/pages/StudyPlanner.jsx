import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { API_URL } from '../config';
import { useAuth } from '../context/AuthContext';

// const API_URL = 'http://127.0.0.1:8000';

function StudyPlanner() {
    const [formData, setFormData] = useState({
        subjects: '',
        exam_date: '',
        hours_per_day: 4
    });
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
                hours_per_day: parseInt(formData.hours_per_day)
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
            <Link to="/" className="btn btn-secondary mb-2">← Back to Dashboard</Link>

            <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
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
                <div className="result-card" style={{ maxWidth: '900px', margin: '2rem auto' }}>
                    <div className="result-header">
                        <h2 style={{ margin: 0 }}>Your Personalized Study Plan</h2>
                        <span className="result-badge">AI Generated</span>
                    </div>

                    <p style={{ fontSize: '1.1rem', color: 'var(--color-text)' }}>
                        <strong>{result.message}</strong>
                    </p>

                    <div className="grid-2 mt-2">
                        {result.plan.map((day, index) => (
                            <div
                                key={index}
                                className="card"
                                style={{
                                    background: `linear-gradient(135deg, rgba(79, 172, 254, 0.1) 0%, rgba(0, 242, 254, 0.1) 100%)`,
                                    border: '2px solid rgba(79, 172, 254, 0.3)'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <h3 style={{ margin: 0, color: 'var(--color-primary)' }}>{day.day}</h3>
                                    <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>{day.date}</span>
                                </div>

                                <div style={{
                                    background: 'var(--gradient-blue)',
                                    color: 'white',
                                    padding: '0.5rem',
                                    borderRadius: '0.5rem',
                                    marginBottom: '1rem',
                                    fontWeight: '600'
                                }}>
                                    Focus: {day.focus_subject}
                                </div>

                                <ul style={{ listStyle: 'none', padding: 0 }}>
                                    {day.tasks.map((task, taskIndex) => (
                                        <li key={taskIndex} style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'start', gap: '0.5rem' }}>
                                            <span>✓</span>
                                            <span>{task}</span>
                                        </li>
                                    ))}
                                </ul>

                                {day.resources && day.resources.length > 0 && (
                                    <div style={{ marginTop: '1rem', borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: '0.5rem' }}>
                                        <h4 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                                            📺 Video Resources:
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
                                                        padding: '0.3rem 0.5rem',
                                                        fontSize: '0.8rem',
                                                        textAlign: 'left',
                                                        display: 'block',
                                                        textDecoration: 'none',
                                                        background: 'rgba(255,255,255,0.5)'
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
