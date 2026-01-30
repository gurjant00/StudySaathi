import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { API_URL } from '../config';
import { useAuth } from '../context/AuthContext';

// const API_URL = 'http://127.0.0.1:8000';

function NotesSummarizer() {
    const [formData, setFormData] = useState({
        notes: '',
        topic: ''
    });
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const { token } = useAuth();

    const authHeaders = {
        headers: { Authorization: `Bearer ${token}` }
    };

    React.useEffect(() => {
        fetchLatestSummary();
    }, []);

    const fetchLatestSummary = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/notes-summarizer/latest`, authHeaders);
            if (response.data) {
                setResult(response.data);
            }
        } catch (err) {
            console.error("Failed to fetch latest summary:", err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setResult(null);

        try {
            const response = await axios.post(`${API_URL}/api/notes-summarizer`, formData, authHeaders);
            setResult(response.data);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to summarize notes. Make sure the backend is running.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container section fade-in">
            <Link to="/" className="btn btn-secondary mb-2">← Back to Dashboard</Link>

            <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div className="feature-icon" style={{ background: 'var(--gradient-purple)' }}>📝</div>
                    <div>
                        <h2 style={{ margin: 0 }}>AI Notes Summarizer</h2>
                        <p style={{ margin: 0 }}>Convert long notes to key points</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Topic/Subject</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="e.g., Photosynthesis, Newton's Laws"
                            value={formData.topic}
                            onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Your Notes</label>
                        <textarea
                            className="form-textarea"
                            placeholder="Paste your notes here..."
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            required
                            rows="10"
                        />
                    </div>

                    {error && (
                        <div style={{ background: '#fee', color: '#c33', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                            {error}
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary btn-large" style={{ width: '100%' }} disabled={loading}>
                        {loading ? 'Summarizing...' : '✨ Summarize Notes'}
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
                        <h2 style={{ margin: 0 }}>Summary: {result.topic}</h2>
                        <span className="result-badge">AI Generated</span>
                    </div>

                    <div style={{
                        background: 'var(--gradient-purple)',
                        color: 'white',
                        padding: '0.75rem 1rem',
                        borderRadius: '0.5rem',
                        marginBottom: '1.5rem',
                        display: 'inline-block'
                    }}>
                        📌 {result.key_points} Key Points Identified
                    </div>

                    <div style={{ background: 'rgba(168, 85, 247, 0.05)', padding: '1.5rem', borderRadius: '1rem' }}>
                        <h3>Key Points:</h3>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            {result.summary.map((point, index) => (
                                <li
                                    key={index}
                                    style={{
                                        marginBottom: '1rem',
                                        padding: '1rem',
                                        background: 'white',
                                        borderRadius: '0.5rem',
                                        boxShadow: 'var(--shadow-sm)',
                                        display: 'flex',
                                        gap: '0.75rem',
                                        alignItems: 'start'
                                    }}
                                >
                                    <span style={{
                                        background: 'var(--gradient-purple)',
                                        color: 'white',
                                        width: '28px',
                                        height: '28px',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 'bold',
                                        flexShrink: 0
                                    }}>
                                        {index + 1}
                                    </span>
                                    <span style={{ color: 'var(--color-text)' }}>{point}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
}

export default NotesSummarizer;
