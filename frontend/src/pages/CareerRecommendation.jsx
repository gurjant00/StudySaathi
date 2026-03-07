import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { API_URL } from '../config';
import { useAuth } from '../context/AuthContext';

// const API_URL = 'http://127.0.0.1:8000';

function CareerRecommendation() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        interests: '',
        skills: '',
        education_level: 'Undergraduate'
    });
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const { token } = useAuth();

    const authHeaders = {
        headers: { Authorization: `Bearer ${token}` }
    };

    React.useEffect(() => {
        fetchLatestRecommendation();
    }, []);

    const fetchLatestRecommendation = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/career-recommendation/latest`, authHeaders);
            if (response.data) {
                setResult(response.data);
            }
        } catch (err) {
            console.error("Failed to fetch latest recommendation:", err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setResult(null);

        try {
            const interests = formData.interests.split(',').map(s => s.trim()).filter(s => s);
            const skills = formData.skills.split(',').map(s => s.trim()).filter(s => s);

            const response = await axios.post(`${API_URL}/api/career-recommendation`, {
                interests,
                skills,
                education_level: formData.education_level
            }, authHeaders);
            setResult(response.data);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to get recommendations. Make sure the backend is running.');
        } finally {
            setLoading(false);
        }
    };

    const growthColors = {
        'Excellent': '#10b981',
        'Very Good': '#3b82f6',
        'Good': '#f59e0b'
    };

    const skillColors = [
        { bg: 'rgba(59, 130, 246, 0.15)', text: '#3b82f6', border: 'rgba(59, 130, 246, 0.3)' }, // Blue
        { bg: 'rgba(16, 185, 129, 0.15)', text: '#10b981', border: 'rgba(16, 185, 129, 0.3)' }, // Emerald
        { bg: 'rgba(139, 92, 246, 0.15)', text: '#8b5cf6', border: 'rgba(139, 92, 246, 0.3)' }, // Violet
        { bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b', border: 'rgba(245, 158, 11, 0.3)' }, // Amber
        { bg: 'rgba(236, 72, 153, 0.15)', text: '#ec4899', border: 'rgba(236, 72, 153, 0.3)' }, // Pink
        { bg: 'rgba(14, 165, 233, 0.15)', text: '#0ea5e9', border: 'rgba(14, 165, 233, 0.3)' }, // Sky
        { bg: 'rgba(244, 63, 94, 0.15)', text: '#f43f5e', border: 'rgba(244, 63, 94, 0.3)' }  // Rose
    ];

    return (
        <div className="container section fade-in">
            <button onClick={() => navigate(-1)} className="btn btn-secondary mb-2">← Go Back</button>

            <div className="card glass-card glass-card glass-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div className="feature-icon" style={{ background: 'var(--gradient-orange)' }}>🎯</div>
                    <div>
                        <h2 style={{ margin: 0 }}>AI Career Advisor</h2>
                        <p style={{ margin: 0 }}>Discover your ideal career path</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Your Interests (comma-separated)</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="e.g., Technology, Design, Marketing"
                            value={formData.interests}
                            onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Your Skills (comma-separated)</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="e.g., Python, Communication, Problem Solving"
                            value={formData.skills}
                            onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Education Level</label>
                        <select
                            className="form-select"
                            value={formData.education_level}
                            onChange={(e) => setFormData({ ...formData, education_level: e.target.value })}
                            required
                        >
                            <option value="High School">High School</option>
                            <option value="Undergraduate">Undergraduate</option>
                            <option value="Graduate">Graduate</option>
                            <option value="Postgraduate">Postgraduate</option>
                        </select>
                    </div>

                    {error && (
                        <div style={{ background: '#fee', color: '#c33', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                            {error}
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary btn-large" style={{ width: '100%' }} disabled={loading}>
                        {loading ? 'Analyzing...' : '🔍 Find Career Paths'}
                    </button>
                </form>
            </div>

            {loading && (
                <div className="loading-container">
                    <div className="loading"></div>
                </div>
            )}

            {result && (
                <div className="card glass-card glass-card glass-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div className="feature-icon" style={{ background: 'var(--gradient-orange)' }}>🎯</div>
                        <div>
                            <h2 className="glow-text" style={{ margin: 0 }}>AI Career Advisor</h2>
                            <p style={{ margin: 0 }}>Design your future with data-driven career paths</p>
                        </div>
                    </div>

                    <div className="grid-2">
                        {result.recommended_careers.map((career, index) => (
                            <div
                                key={index}
                                className="card glass-card glass-card glass-card"
                                style={{
                                    background: `linear-gradient(135deg, ${growthColors[career.growth_potential]}10 0%, ${growthColors[career.growth_potential]}05 100%)`,
                                    border: `2px solid ${growthColors[career.growth_potential]}40`
                                }}
                            >
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'start',
                                    marginBottom: '1rem'
                                }}>
                                    <h3 style={{ margin: 0, color: growthColors[career.growth_potential] }}>
                                        {career.title}
                                    </h3>
                                    <span style={{
                                        background: growthColors[career.growth_potential],
                                        color: 'white',
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '20px',
                                        fontSize: '0.8rem',
                                        fontWeight: '600'
                                    }}>
                                        {career.growth_potential}
                                    </span>
                                </div>

                                <p style={{ color: 'var(--color-text)' }}>{career.description}</p>

                                <div style={{ marginTop: '1rem' }}>
                                    <strong style={{ color: 'var(--color-text)' }}>💰 Salary Range:</strong>
                                    <p style={{ margin: '0.25rem 0' }}>{career.salary_range}</p>
                                </div>

                                <div style={{ marginTop: '1rem' }}>
                                    <strong style={{ color: 'var(--color-text)' }}>Required Skills:</strong>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                                        {career.required_skills.map((skill, idx) => {
                                            const colorTheme = skillColors[idx % skillColors.length];
                                            return (
                                                <span
                                                    key={idx}
                                                    style={{
                                                        background: colorTheme.bg,
                                                        padding: '0.25rem 0.75rem',
                                                        borderRadius: '20px',
                                                        fontSize: '0.85rem',
                                                        color: colorTheme.text,
                                                        border: `1px solid ${colorTheme.border}`,
                                                        fontWeight: '500'
                                                    }}
                                                >
                                                    {skill}
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default CareerRecommendation;
