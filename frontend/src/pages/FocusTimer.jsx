import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function FocusTimer() {
    const navigate = useNavigate();
    const [workDuration, setWorkDuration] = useState(25);
    const [breakDuration, setBreakDuration] = useState(5);
    const [minutes, setMinutes] = useState(workDuration);
    const [seconds, setSeconds] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState('work'); // work, break
    const [showSettings, setShowSettings] = useState(false);

    useEffect(() => {
        let interval = null;
        if (isActive) {
            interval = setInterval(() => {
                if (seconds > 0) {
                    setSeconds(seconds - 1);
                } else if (minutes > 0) {
                    setMinutes(minutes - 1);
                    setSeconds(59);
                } else {
                    clearInterval(interval);
                    setIsActive(false);
                    // Play a sound or notify if possible
                    alert(mode === 'work' ? "Time for a break!" : "Back to work!");
                }
            }, 1000);
        } else {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isActive, minutes, seconds, mode]);

    const toggleTimer = () => setIsActive(!isActive);

    const resetTimer = () => {
        setIsActive(false);
        setMinutes(mode === 'work' ? workDuration : breakDuration);
        setSeconds(0);
    };

    const switchMode = (newMode) => {
        setMode(newMode);
        setIsActive(false);
        setMinutes(newMode === 'work' ? workDuration : breakDuration);
        setSeconds(0);
    };

    // Update current timer if settings change and timer is not active
    useEffect(() => {
        if (!isActive) {
            setMinutes(mode === 'work' ? workDuration : breakDuration);
            setSeconds(0);
        }
    }, [workDuration, breakDuration]);

    return (
        <div className="container section fade-in">
            <button onClick={() => navigate(-1)} className="btn btn-secondary mb-2">← Go Back</button>

            <div className="card glass-card glass-card glass-card text-center" style={{ maxWidth: '500px', margin: '0 auto' }}>
                <h2 className="glow-text mb-2">⏱️ Study Focus Timer</h2>

                <div className="flex justify-center gap-1 mb-2">
                    <button
                        className={`btn ${mode === 'work' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => switchMode('work')}
                    >
                        Focus Session
                    </button>
                    <button
                        className={`btn ${mode === 'break' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => switchMode('break')}
                    >
                        Short Break
                    </button>
                </div>

                <div style={{ fontSize: '5rem', fontWeight: '800', margin: '2rem 0', color: 'var(--color-primary)' }}>
                    {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </div>

                <div className="flex gap-1 justify-center">
                    <button className="btn btn-primary btn-large" onClick={toggleTimer} style={{ minWidth: '150px' }}>
                        {isActive ? 'Pause' : 'Start Focus'}
                    </button>
                    <button className="btn btn-secondary btn-large" onClick={resetTimer}>
                        Reset
                    </button>
                </div>

                <div className="mt-3" style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                    <p>Tip: Focus for a set time, then take a short break. This Pomodoro technique helps keep your brain fresh!</p>
                </div>

                {/* Settings Toggle */}
                <div className="mt-4 border-t pt-3" style={{ borderTop: '1px solid var(--color-border)', marginTop: '2rem', paddingTop: '1rem' }}>
                    <button
                        className="btn btn-secondary"
                        onClick={() => setShowSettings(!showSettings)}
                        style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}
                    >
                        ⚙️ {showSettings ? 'Hide Timer Settings' : 'Adjust Timer Length'}
                    </button>

                    {showSettings && (
                        <div className="mt-3 grid-2" style={{ animation: 'fadeIn 0.3s ease', textAlign: 'left', gap: '1rem', display: 'flex', justifyContent: 'center' }}>
                            <div className="form-group" style={{ width: '120px' }}>
                                <label className="form-label" style={{ fontSize: '0.85rem' }}>Focus (mins)</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={workDuration}
                                    onChange={(e) => setWorkDuration(Math.max(1, parseInt(e.target.value) || 1))}
                                    min="1"
                                    max="120"
                                />
                            </div>
                            <div className="form-group" style={{ width: '120px' }}>
                                <label className="form-label" style={{ fontSize: '0.85rem' }}>Break (mins)</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={breakDuration}
                                    onChange={(e) => setBreakDuration(Math.max(1, parseInt(e.target.value) || 1))}
                                    min="1"
                                    max="60"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default FocusTimer;
