import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { API_URL } from '../config';
import { useAuth } from '../context/AuthContext';

function QuizGenerator() {
    const navigate = useNavigate();
    const [topic, setTopic] = useState('');
    const [loading, setLoading] = useState(false);
    const [quiz, setQuiz] = useState(null);
    const [error, setError] = useState('');
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [score, setScore] = useState(0);
    const { token } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setQuiz(null);

        try {
            // Reusing a similar prompt/endpoint logic for the hackathon demo
            const response = await axios.post(`${API_URL}/api/quiz-generator`,
                { topic },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setQuiz(response.data);
            setSelectedAnswers({});
            setIsSubmitted(false);
            setScore(0);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to generate quiz. Make sure the backend is running.');
        } finally {
            setLoading(false);
        }
    };

    const handleOptionSelect = (qIndex, option) => {
        if (isSubmitted) return;
        setSelectedAnswers(prev => ({ ...prev, [qIndex]: option }));
    };

    const handleQuizSubmit = () => {
        if (!quiz) return;
        let calculatedScore = 0;
        quiz.questions.forEach((q, idx) => {
            if (selectedAnswers[idx] === q.correct_answer) {
                calculatedScore += 1;
            }
        });
        setScore(calculatedScore);
        setIsSubmitted(true);
    };

    return (
        <div className="container section fade-in">
            <button onClick={() => navigate(-1)} className="btn btn-secondary mb-2">← Go Back</button>

            <div className="card glass-card glass-card glass-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div className="feature-icon" style={{ background: 'var(--gradient-orange)' }}>✍️</div>
                    <div>
                        <h2 className="glow-text" style={{ margin: 0 }}>AI Quiz Generator</h2>
                        <p style={{ margin: 0 }}>Test your knowledge with AI-generated MCQs</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Topic or Paste Notes</label>
                        <textarea
                            className="form-input"
                            placeholder="e.g., 'Modern Physics' or paste your study notes here..."
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            required
                            rows="5"
                        />
                    </div>

                    {error && (
                        <div style={{ background: 'rgba(255, 0, 0, 0.1)', color: '#ff4d4d', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                            {error}
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary btn-large" style={{ width: '100%' }} disabled={loading}>
                        {loading ? 'Generating Quiz...' : '✨ Generate My Quiz'}
                    </button>
                </form>
            </div>

            {loading && <div className="loading-container"><div className="loading"></div></div>}

            {quiz && (
                <div className="mt-3 animate-fadeIn" style={{ maxWidth: '800px', margin: '2rem auto' }}>
                    <h2 className="glow-text text-center mb-2">📝 Practice Quiz: {quiz.topic}</h2>

                    {isSubmitted && (
                        <div className="card glass-card glass-card text-center mb-2" style={{ background: score === quiz.questions.length ? 'rgba(76, 175, 80, 0.1)' : 'var(--gradient-blue)' }}>
                            <h3 style={{ margin: 0 }}>Your Score: {score} / {quiz.questions.length}</h3>
                            <p style={{ margin: '0.5rem 0 0 0' }}>
                                {score === quiz.questions.length ? 'Perfect score! Excellent job. 🌟' : 'Review the explanations below to see where you can improve! 📚'}
                            </p>
                        </div>
                    )}

                    {quiz.questions.map((q, idx) => (
                        <div key={idx} className="card glass-card glass-card glass-card mb-2" style={{ borderLeft: isSubmitted ? `4px solid ${selectedAnswers[idx] === q.correct_answer ? '#4caf50' : '#f44336'}` : 'none' }}>
                            <h4>{idx + 1}. {q.question}</h4>
                            <div className="mt-1 grid grid-2">
                                {q.options.map((opt, oIdx) => {
                                    let btnClass = "btn btn-secondary";
                                    let btnStyle = { textAlign: 'left', justifyContent: 'flex-start', transition: 'all 0.2s ease' };

                                    if (isSubmitted) {
                                        if (opt === q.correct_answer) {
                                            btnClass = "btn";
                                            btnStyle = { ...btnStyle, background: '#4caf50', color: 'white', borderColor: '#4caf50' };
                                        } else if (selectedAnswers[idx] === opt) {
                                            btnClass = "btn";
                                            btnStyle = { ...btnStyle, background: '#f44336', color: 'white', borderColor: '#f44336' };
                                        } else {
                                            btnStyle = { ...btnStyle, opacity: 0.6 };
                                        }
                                    } else {
                                        if (selectedAnswers[idx] === opt) {
                                            btnClass = "btn btn-primary";
                                            btnStyle = { ...btnStyle, boxShadow: 'var(--glow-primary)' };
                                        }
                                    }

                                    return (
                                        <button
                                            key={oIdx}
                                            className={btnClass}
                                            style={btnStyle}
                                            onClick={() => handleOptionSelect(idx, opt)}
                                            disabled={isSubmitted}
                                        >
                                            <span style={{ marginRight: '0.5rem', fontWeight: 'bold' }}>
                                                {String.fromCharCode(65 + oIdx)}.
                                            </span>
                                            {opt}
                                        </button>
                                    );
                                })}
                            </div>

                            {isSubmitted && (
                                <div className="mt-2 p-2" style={{ background: 'rgba(255, 255, 255, 0.05)', borderRadius: '0.5rem', fontSize: '0.95rem', borderLeft: '3px solid var(--color-accent-teal)' }}>
                                    <strong style={{ color: 'var(--color-accent-teal)' }}>Explanation:</strong> {q.explanation}
                                </div>
                            )}
                        </div>
                    ))}

                    {!isSubmitted && (
                        <div className="text-center mt-2">
                            <button
                                className="btn btn-primary btn-large"
                                onClick={handleQuizSubmit}
                                disabled={Object.keys(selectedAnswers).length < quiz.questions.length}
                            >
                                {Object.keys(selectedAnswers).length < quiz.questions.length ? 'Answer All Questions to Submit' : 'Submit Quiz'}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default QuizGenerator;
