import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { API_URL } from '../config';
import { useAuth } from '../context/AuthContext';

function ConceptExplainer() {
    const navigate = useNavigate();
    const [concept, setConcept] = useState('');
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
            const response = await axios.post(`${API_URL}/api/concept-explainer`,
                { concept },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setResult(response.data);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to explain concept. Make sure the backend is running.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container section fade-in">
            <button onClick={() => navigate(-1)} className="btn btn-secondary mb-2">← Go Back</button>

            <div className="card glass-card glass-card glass-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div className="feature-icon" style={{ background: 'var(--gradient-purple)' }}>💡</div>
                    <div>
                        <h2 className="glow-text" style={{ margin: 0 }}>AI Concept Explainer</h2>
                        <p style={{ margin: 0 }}>Complex ideas simplified with easy analogies</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Concept to Explain</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="e.g., 'Blockchain', 'Photosynthesis', 'Recursion'"
                            value={concept}
                            onChange={(e) => setConcept(e.target.value)}
                            required
                        />
                    </div>

                    {error && (
                        <div style={{ background: 'rgba(255, 0, 0, 0.1)', color: '#ff4d4d', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                            {error}
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary btn-large" style={{ width: '100%' }} disabled={loading}>
                        {loading ? 'Simpifying...' : '✨ Explain It Simply'}
                    </button>
                </form>
            </div>

            {loading && <div className="loading-container"><div className="loading"></div></div>}

            {result && (
                <div className="mt-3 animate-fadeIn" style={{ maxWidth: '800px', margin: '2rem auto' }}>
                    <div className="card glass-card glass-card glass-card mb-2">
                        <h2 className="glow-text mb-1">Concept: {result.concept}</h2>

                        <div className="mb-2">
                            <h3 style={{ color: 'var(--color-accent-purple)' }}>🧠 The Core Idea</h3>
                            <p style={{ lineHeight: '1.7' }}>{result.simple_explanation}</p>
                        </div>

                        <div className="mb-2" style={{ background: 'rgba(168, 85, 247, 0.1)', padding: '1rem', borderRadius: '0.5rem', borderLeft: '4px solid var(--color-accent-purple)' }}>
                            <h3 style={{ color: 'var(--color-accent-purple)' }}>🏎️ Analogy</h3>
                            <p style={{ fontStyle: 'italic' }}>{result.analogy}</p>
                        </div>

                        <div>
                            <h3 style={{ color: 'var(--color-accent-teal)' }}>✅ Key Takeaways</h3>
                            <ul style={{ paddingLeft: '1.5rem' }}>
                                {result.key_takeaways.map((item, i) => (
                                    <li key={i} style={{ marginBottom: '0.5rem' }}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ConceptExplainer;
