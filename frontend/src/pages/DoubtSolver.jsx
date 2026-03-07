import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { API_URL } from '../config';
import { useAuth } from '../context/AuthContext';

function DoubtSolver() {
    const navigate = useNavigate();
    const [question, setQuestion] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const { token } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setResult(null);

        try {
            const response = await axios.post(`${API_URL}/api/doubt-solver`,
                { question },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setResult(response.data);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to solve doubt. Make sure the backend is running.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container section fade-in">
            <button onClick={() => navigate(-1)} className="btn btn-secondary mb-2">← Go Back</button>

            <div className="card glass-card glass-card glass-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div className="feature-icon" style={{ background: 'var(--gradient-teal)' }}>🤔</div>
                    <div>
                        <h2 className="glow-text" style={{ margin: 0 }}>AI Doubt Solver</h2>
                        <p style={{ margin: 0 }}>Get instant, simple explanations for any academic question</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Your Question</label>
                        <textarea
                            className="form-textarea"
                            placeholder="Type your question here... (e.g., 'How does quantum entanglement work?')"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            required
                            rows="5"
                        />
                    </div>

                    {error && (
                        <div style={{ background: 'rgba(255, 0, 0, 0.1)', color: '#ff4d4d', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem', border: '1px solid rgba(255, 0, 0, 0.2)' }}>
                            {error}
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary btn-large" style={{ width: '100%' }} disabled={loading}>
                        {loading ? 'Thinking...' : '✨ Solve My Doubt'}
                    </button>
                </form>
            </div>

            {loading && (
                <div className="loading-container">
                    <div className="loading"></div>
                </div>
            )}

            {result && (
                <div className="result-card glass-card animate-fadeIn" style={{ maxWidth: '800px', margin: '2rem auto' }}>
                    <div className="result-header">
                        <h2 className="glow-text" style={{ margin: 0 }}>Solution: {result.topic}</h2>
                        <span className="result-badge">AI Expert Feedback</span>
                    </div>

                    <div className="mb-3">
                        <h3 style={{ color: 'var(--color-accent-teal)' }}>📚 Detailed Explanation</h3>
                        <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '0.5rem', lineHeight: '1.7' }}>
                            {result.explanation}
                        </div>
                    </div>

                    <div className="mb-3">
                        <h3 style={{ color: 'var(--color-accent-blue)' }}>👶 Simple Explanation (ELI5)</h3>
                        <div style={{ padding: '1rem', background: 'rgba(79, 172, 254, 0.1)', borderRadius: '0.5rem', fontStyle: 'italic' }}>
                            {result.simplified_explanation}
                        </div>
                    </div>

                    {result.examples && result.examples.length > 0 && (
                        <div>
                            <h3>💡 Real-world Examples:</h3>
                            <ul style={{ paddingLeft: '1.5rem' }}>
                                {result.examples.map((ex, i) => (
                                    <li key={i} style={{ marginBottom: '0.5rem' }}>{ex}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default DoubtSolver;
