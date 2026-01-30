import React from 'react';
import { Link } from 'react-router-dom';

function About() {
    const team = [
        {
            name: "Sahil Kumar",
            role: "Team Lead & Developer",
            color: "blue"
        },
        {
            name: "Gurjant Singh",
            role: "Developer",
            color: "purple"
        },
        {
            name: "Sourav",
            role: "Developer",
            color: "teal"
        },
        {
            name: "Rohit Kharnotia",
            role: "Developer",
            color: "orange",
            image: "/team/rohit.jpg"
        }
    ];

    return (
        <div className="container section fade-in">
            <div className="hero">
                <h1 className="text-gradient">Meet Our Team</h1>
                <p className="hero-subtitle">
                    The innovative minds behind EduMate AI. We're dedicated to transforming the way students learn using the power of Artificial Intelligence.
                </p>
            </div>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '2rem',
                    maxWidth: '900px',
                    margin: '0 auto'
                }}
            >
                {team.map((member, index) => (
                    <div
                        key={index}
                        className="card text-center"
                        style={{ padding: '3rem 2rem' }}
                    >
                        {/* Profile Photo */}
                        <div
                            style={{
                                width: '120px',
                                height: '120px',
                                borderRadius: '50%',
                                background: member.image ? 'none' : `var(--gradient-${member.color})`,
                                margin: '0 auto 1.5rem auto',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '3rem',
                                color: 'white',
                                boxShadow: 'var(--shadow-lg)',
                                overflow: 'hidden',
                                border: '3px solid var(--color-bg-secondary)'
                            }}
                        >
                            {member.image ? (
                                <img
                                    src={member.image}
                                    alt={member.name}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover'
                                    }}
                                />
                            ) : (
                                member.name.charAt(0)
                            )}
                        </div>

                        <h3 className="mb-1">{member.name}</h3>
                        <p className="mb-2" style={{ fontWeight: '600', color: 'var(--color-primary)' }}>{member.role}</p>

                        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1.5rem' }}>
                            {/* Placeholder Social Icons */}
                            {['linkedin', 'github', 'twitter'].map(platform => (
                                <div
                                    key={platform}
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        background: 'var(--color-bg)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        border: '1px solid var(--color-border)',
                                        transition: 'all 0.3s ease'
                                    }}
                                    className="hover-card"
                                >
                                    <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>🔗</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="text-center mt-3">
                <Link to="/" className="btn btn-primary">
                    Go Back Home
                </Link>
            </div>
        </div>
    );
}

export default About;
