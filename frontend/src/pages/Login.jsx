import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to login. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container section fade-in">
            <div className="card glass-card glass-card glass-card" style={{ maxWidth: '450px', margin: '2rem auto', padding: '2.5rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div className="feature-icon" style={{ background: 'var(--gradient-blue)', margin: '0 auto 1rem', fontSize: '2.5rem', width: '70px', height: '70px' }}>🔐</div>
                    <h2 style={{ margin: 0 }}>Welcome Back</h2>
                    <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>Log in to your StudySaathi account</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input
                            type="email"
                            className="form-input"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-input"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && (
                        <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', fontSize: '0.9rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                            ⚠️ {error}
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary btn-large" style={{ width: '100%' }} disabled={loading}>
                        {loading ? 'Logging in...' : 'Log In'}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '2rem', borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem' }}>
                    <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>
                        Don't have an account? <Link to="/signup" style={{ color: 'var(--color-primary)', fontWeight: '600' }}>Sign Up</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;
