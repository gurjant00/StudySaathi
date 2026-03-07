import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { API_URL } from '../config';
import { useAuth } from '../context/AuthContext';

// const API_URL = 'http://127.0.0.1:8000';

function MockInterview() {
    const navigate = useNavigate();
    const [step, setStep] = useState('setup'); // setup | interview | result | history
    const [language, setLanguage] = useState('');
    const [messages, setMessages] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userInput, setUserInput] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [score, setScore] = useState(0);
    const [history, setHistory] = useState([]);
    const [error, setError] = useState('');
    const { token } = useAuth();

    // Helper for authenticated requests
    const authHeaders = {
        headers: { Authorization: `Bearer ${token}` }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/mock-interview/history`, authHeaders);
            setHistory(response.data);
        } catch (err) {
            console.error("Failed to fetch history:", err);
        }
    };

    const fetchSessionDetail = async (id) => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/api/mock-interview/session/${id}`, authHeaders);
            const data = response.data;
            setMessages(data.chat_history);
            setScore(data.overall_score);
            setFeedback(data.feedback_data.feedback);
            setLanguage(data.language);
            setStep('result'); // Use result step to show summary
        } catch (err) {
            console.error("Failed to fetch session detail:", err);
        } finally {
            setLoading(false);
        }
    };

    // Speech Recognition Reference
    const recognitionRef = useRef(null);

    useEffect(() => {
        // Initialize Speech Recognition
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setUserInput(transcript);
                setIsRecording(false);
            };

            recognitionRef.current.onerror = (event) => {
                console.error('Speech recognition error', event.error);
                setIsRecording(false);
            };

            recognitionRef.current.onend = () => {
                setIsRecording(false);
            };
        } else {
            console.warn("Speech Recognition API not supported in this browser.");
        }
    }, []);

    const speakText = (text) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel(); // Stop any previous speech
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1.0;
            utterance.pitch = 1.0;
            window.speechSynthesis.speak(utterance);
        }
    };

    const startInterview = async (selectedLang) => {
        setLanguage(selectedLang);
        setLoading(true);
        setMessages([]);
        setCurrentQuestionIndex(0);
        setScore(0);
        setFeedback(null);

        try {
            // Fetch first question
            const response = await axios.post(`${API_URL}/api/mock-interview`, {
                language: selectedLang,
                current_question_index: 0
            }, authHeaders);

            setStep('interview');
            const question = response.data.next_question;
            setMessages([{ sender: 'ai', text: question }]);
            speakText(question);
        } catch (err) {
            console.error("Error starting interview:", err);
            alert(err.response?.data?.detail || "Failed to start interview. Is the backend running?");
        } finally {
            setLoading(false);
        }
    };

    const toggleRecording = () => {
        if (isRecording) {
            recognitionRef.current.stop();
        } else {
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.start();
                    setIsRecording(true);
                } catch (e) {
                    console.error("Mic error:", e); // Check if mic is already active
                }
            } else {
                alert("Voice input not supported in this browser.");
            }
        }
    };

    const submitAnswer = async (e) => {
        e.preventDefault();
        if (!userInput.trim()) return;

        // Add user message
        const newMessages = [...messages, { sender: 'user', text: userInput }];
        setMessages(newMessages);
        setLoading(true);
        setError('');
        const inputToSubmit = userInput;
        setUserInput('');

        try {
            const response = await axios.post(`${API_URL}/api/mock-interview`, {
                language: language,
                user_response: inputToSubmit,
                current_question_index: currentQuestionIndex + 1,
                full_history: messages, // Send the conversation so far
                cumulative_score: score
            }, authHeaders);

            // Handle Response
            const data = response.data;
            let finalMessages = [...newMessages];

            // 1. Show Feedback
            if (data.feedback) {
                finalMessages.push({
                    sender: 'system',
                    text: `Feedback: ${data.feedback} (Score: ${data.score}/10)`,
                    isFeedback: true
                });
                setScore(prev => prev + (data.score || 0));
            }

            // 2. Show Next Question or Completion
            if (data.is_completed) {
                setStep('result');
                fetchHistory(); // Refresh history list
            } else {
                finalMessages.push({ sender: 'ai', text: data.next_question });
                speakText(data.next_question);
                setCurrentQuestionIndex(prev => prev + 1);
            }

            setMessages(finalMessages);

        } catch (err) {
            console.error("Error submitting answer:", err);
            setError(err.response?.data?.detail || 'Failed to submit answer. Make sure the backend is running.');
            // Remove the user's message so they can try again if the API failed
            setMessages(messages);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container section fade-in">
            <button onClick={() => navigate(-1)} className="btn btn-secondary mb-2">← Go Back</button>

            <div className="card glass-card glass-card glass-card" style={{ maxWidth: '800px', margin: '0 auto', minHeight: '600px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
                    <div className="feature-icon" style={{ background: 'var(--gradient-purple)', fontSize: '2rem' }}>🎤</div>
                    <div>
                        <h2 className="glow-text" style={{ margin: 0 }}>AI Mock Interview</h2>
                        <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>Master your technical skills with Voice AI</p>
                    </div>
                </div>

                {step === 'setup' && (
                    <div style={{ textAlign: 'center', padding: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
                            <button
                                className={`btn ${step === 'setup' ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => setStep('setup')}
                            >
                                New Interview
                            </button>
                            <button
                                className="btn btn-secondary"
                                onClick={() => setStep('history')}
                            >
                                View History
                            </button>
                        </div>

                        <h3>Select Your Tech Stack</h3>
                        <p className="mb-2">Choose a programming language to start the interview.</p>

                        <div className="grid-2" style={{ gap: '1rem', maxWidth: '500px', margin: '2rem auto' }}>
                            {['Python', 'Java', 'C++', 'C'].map(lang => (
                                <button
                                    key={lang}
                                    className="card glass-card glass-card hover-card"
                                    style={{ textAlign: 'center', cursor: 'pointer', border: '2px solid transparent', color: 'var(--color-text)' }}
                                    onClick={() => startInterview(lang)}
                                    disabled={loading}
                                >
                                    <h3 style={{ margin: '0.5rem 0' }}>{lang}</h3>
                                </button>
                            ))}
                        </div>
                        {loading && <div className="loading"></div>}
                    </div>
                )}

                {step === 'history' && (
                    <div style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
                            <button
                                className="btn btn-secondary"
                                onClick={() => setStep('setup')}
                            >
                                New Interview
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={() => setStep('history')}
                            >
                                View History
                            </button>
                        </div>

                        <h3>Past Interview Sessions</h3>
                        {history.length === 0 ? (
                            <p>No past interviews found. Start your first one!</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                                {history.map(item => (
                                    <div
                                        key={item.id}
                                        className="card glass-card glass-card hover-card"
                                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                                        onClick={() => fetchSessionDetail(item.id)}
                                    >
                                        <div>
                                            <h4 style={{ margin: 0 }}>{item.language} Interview</h4>
                                            <small style={{ color: '#666' }}>{new Date(item.created_at).toLocaleDateString()}</small>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>Score: {item.overall_score}/50</div>
                                            <small>Click to review</small>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {step === 'interview' && (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <div className="chat-container mb-2" style={{ flex: 1, overflowY: 'auto', padding: '1rem', background: 'var(--color-bg)', borderRadius: '1rem', maxHeight: '400px' }}>
                            {messages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`message ${msg.sender}`}
                                    style={{
                                        alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                        background: msg.sender === 'user' ? 'var(--color-primary)' : (msg.isFeedback ? 'var(--color-bg-secondary)' : 'var(--color-bg-secondary)'),
                                        color: msg.sender === 'user' ? 'white' : 'var(--color-text)',
                                        padding: '1rem',
                                        borderRadius: '1rem',
                                        marginBottom: '1rem',
                                        maxWidth: '80%',
                                        boxShadow: 'var(--shadow-sm)',
                                        border: msg.isFeedback ? '1px solid var(--color-primary)' : '1px solid var(--color-border)'
                                    }}
                                >
                                    {msg.sender === 'ai' && <strong style={{ display: 'block', marginBottom: '0.5rem' }}>AI Interviewer:</strong>}
                                    {msg.sender === 'user' && <strong style={{ display: 'block', marginBottom: '0.5rem' }}>You:</strong>}
                                    {msg.text}
                                </div>
                            ))}
                            {loading && <div className="message ai" style={{ background: 'var(--color-bg-secondary)', padding: '1rem', borderRadius: '1rem', border: '1px solid var(--color-border)' }}>Analyzing answer...</div>}
                        </div>

                        {error && (
                            <div style={{ background: 'rgba(255, 0, 0, 0.1)', color: '#ff4d4d', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                                {error}
                            </div>
                        )}

                        <form onSubmit={submitAnswer} style={{ display: 'flex', gap: '1rem', marginTop: 'auto' }}>
                            <button
                                type="button"
                                onClick={toggleRecording}
                                className={`btn ${isRecording ? 'btn-danger' : 'btn-secondary'}`}
                                style={{ borderRadius: '50%', width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}
                                title="Click to Speak"
                            >
                                {isRecording ? '⏹' : '🎙️'}
                            </button>

                            <input
                                type="text"
                                className="form-input"
                                placeholder="Type your answer here (or use voice)..."
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                style={{ flex: 1, margin: 0 }}
                                disabled={loading}
                            />

                            <button type="submit" className="btn btn-primary" disabled={loading || (!userInput.trim())}>
                                Send ➤
                            </button>
                        </form>
                    </div>
                )}

                {step === 'result' && (
                    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <h2 style={{ margin: 0 }}>Interview Summary 🎊</h2>
                            <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--color-primary)', margin: '0.5rem 0' }}>
                                {score} <span style={{ fontSize: '1.2rem', color: '#666' }}>/ 50</span>
                            </div>
                            <div style={{ background: 'var(--color-bg-secondary)', padding: '1rem', borderRadius: '1rem', border: '1px solid var(--color-border)', marginBottom: '1.5rem' }}>
                                <strong>Feedback:</strong> {feedback}
                            </div>
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', background: 'var(--color-bg)', borderRadius: '1rem', maxHeight: '300px', marginBottom: '1.5rem', border: '1px solid var(--color-border)' }}>
                            <h4 style={{ marginTop: 0 }}>Chat Transcript</h4>
                            {messages.map((msg, index) => (
                                <div
                                    key={index}
                                    style={{
                                        alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                        background: msg.sender === 'user' ? 'rgba(79, 172, 254, 0.1)' : (msg.isFeedback ? 'rgba(16, 185, 129, 0.1)' : 'white'),
                                        color: 'var(--color-text)',
                                        padding: '0.75rem',
                                        borderRadius: '0.5rem',
                                        marginBottom: '0.5rem',
                                        fontSize: '0.9rem',
                                        border: msg.isFeedback ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--color-border)',
                                        marginLeft: msg.sender === 'user' ? '20%' : '0',
                                        marginRight: msg.sender === 'user' ? '0' : '20%'
                                    }}
                                >
                                    <strong>{msg.sender === 'ai' ? 'AI' : (msg.sender === 'user' ? 'You' : 'System')}:</strong> {msg.text}
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setStep('history')}>Back to History</button>
                            <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => setStep('setup')}>Start Fresh Interview</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default MockInterview;
