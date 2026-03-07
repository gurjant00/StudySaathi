import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { API_URL } from '../config';
import { useAuth } from '../context/AuthContext';

// const API_URL = 'http://127.0.0.1:8000';

function AnswerEvaluator() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        question: '',
        student_answer: '',
        max_marks: 10
    });
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const { token } = useAuth();

    const authHeaders = {
        headers: { Authorization: `Bearer ${token}` }
    };

    React.useEffect(() => {
        fetchLatestEvaluation();
    }, []);

    const fetchLatestEvaluation = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/answer-evaluator/latest`, authHeaders);
            if (response.data) {
                setResult(response.data);
            }
        } catch (err) {
            console.error("Failed to fetch latest evaluation:", err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setResult(null);

        try {
            const response = await axios.post(`${API_URL}/api/answer-evaluator`, {
                ...formData,
                max_marks: parseInt(formData.max_marks)
            }, authHeaders);
            setResult(response.data);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to evaluate answer. Make sure the backend is running.');
        } finally {
            setLoading(false);
        }
    };

    const getScoreColor = (percentage) => {
        if (percentage >= 75) return '#10b981';
        if (percentage >= 60) return '#3b82f6';
        if (percentage >= 40) return '#f59e0b';
        return '#ef4444';
    };

    return (
        <div className="container section fade-in">
            <button onClick={() => navigate(-1)} className="btn btn-secondary mb-2">← Go Back</button>

            <div className="card glass-card glass-card glass-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div className="feature-icon" style={{ background: 'var(--gradient-teal)' }}>✅</div>
                    <div>
                        <h2 style={{ margin: 0 }}>AI Answer Evaluator</h2>
                        <p style={{ margin: 0 }}>Get instant feedback on your answers</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Question</label>
                        <textarea
                            className="form-textarea"
                            placeholder="Enter the exam question..."
                            value={formData.question}
                            onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                            required
                            rows="3"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Your Answer</label>
                        <textarea
                            className="form-textarea"
                            placeholder="Type your answer here..."
                            value={formData.student_answer}
                            onChange={(e) => setFormData({ ...formData, student_answer: e.target.value })}
                            required
                            rows="6"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Maximum Marks</label>
                        <input
                            type="number"
                            className="form-input"
                            value={formData.max_marks}
                            onChange={(e) => setFormData({ ...formData, max_marks: e.target.value })}
                            required
                            min="1"
                            max="100"
                        />
                    </div>

                    {error && (
                        <div style={{ background: '#fee', color: '#c33', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                            {error}
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary btn-large" style={{ width: '100%' }} disabled={loading}>
                        {loading ? 'Evaluating...' : '🎯 Evaluate Answer'}
                    </button>
                </form>
            </div>

            {loading && (
                <div className="loading-container">
                    <div className="loading"></div>
                </div>
            )}

            {result && (
                <div className="result-card" style={{ maxWidth: '800px', margin: '2rem auto' }}>
                    <div className="result-header">
                        <h2 style={{ margin: 0 }}>Evaluation Results</h2>
                        <span className="result-badge">AI Generated</span>
                    </div>

                    {/* Score Display */}
                    <div style={{
                        background: `linear-gradient(135deg, ${getScoreColor(result.percentage)}15 0%, ${getScoreColor(result.percentage)}05 100%)`,
                        padding: '2rem',
                        borderRadius: '1rem',
                        textAlign: 'center',
                        marginBottom: '2rem',
                        border: `2px solid ${getScoreColor(result.percentage)}40`
                    }}>
                        <div style={{ fontSize: '3rem', fontWeight: '800', color: getScoreColor(result.percentage), marginBottom: '0.5rem' }}>
                            {result.marks_obtained} / {result.max_marks}
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '600', color: getScoreColor(result.percentage) }}>
                            {result.percentage}%
                        </div>
                    </div>

                    {/* Feedback */}
                    <div style={{ background: 'rgba(20, 184, 166, 0.05)', padding: '1.5rem', borderRadius: '1rem', marginBottom: '1.5rem' }}>
                        <h3 style={{ color: 'var(--color-teal)' }}>💬 Feedback</h3>
                        <p style={{ fontSize: '1.1rem', color: 'var(--color-text)' }}>{result.feedback}</p>
                    </div>

                    <div className="grid-2">
                        {/* Strengths */}
                        <div style={{ background: 'rgba(16, 185, 129, 0.05)', padding: '1.5rem', borderRadius: '1rem' }}>
                            <h3 style={{ color: '#10b981' }}>✨ Strengths</h3>
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                {result.strengths.map((strength, index) => (
                                    <li key={index} style={{ marginBottom: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                                        <span>✓</span>
                                        <span>{strength}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Improvements */}
                        <div style={{ background: 'rgba(251, 146, 60, 0.05)', padding: '1.5rem', borderRadius: '1rem' }}>
                            <h3 style={{ color: '#fb923c' }}>🚀 Areas to Improve</h3>
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                {result.improvements.map((improvement, index) => (
                                    <li key={index} style={{ marginBottom: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                                        <span>→</span>
                                        <span>{improvement}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AnswerEvaluator;
