import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { API_URL } from '../config';
import { useAuth } from '../context/AuthContext';

function ResumeBuilder() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        summary: '',
        education: [{ degree: '', institution: '', year: '', grade: '' }],
        skills: '',
        projects: [{ name: '', description: '', technologies: '' }]
    });
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const { token } = useAuth();

    const authHeaders = {
        headers: { Authorization: `Bearer ${token}` }
    };

    React.useEffect(() => {
        fetchLatestResume();
    }, []);

    const fetchLatestResume = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/resume-builder/latest`, authHeaders);
            if (response.data) {
                setResult(response.data);
            }
        } catch (err) {
            console.error("Failed to fetch latest resume:", err);
        }
    };

    const handleEducationChange = (index, field, value) => {
        const newEducation = [...formData.education];
        newEducation[index][field] = value;
        setFormData({ ...formData, education: newEducation });
    };

    const addEducation = () => {
        setFormData({
            ...formData,
            education: [...formData.education, { degree: '', institution: '', year: '', grade: '' }]
        });
    };

    const handleProjectChange = (index, field, value) => {
        const newProjects = [...formData.projects];
        newProjects[index][field] = value;
        setFormData({ ...formData, projects: newProjects });
    };

    const addProject = () => {
        setFormData({
            ...formData,
            projects: [...formData.projects, { name: '', description: '', technologies: '' }]
        });
    };

    const handleDownload = () => {
        const originalTitle = document.title;
        document.title = `${formData.name}_Resume`;
        window.print();
        document.title = originalTitle;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setResult(null);

        try {
            const skills = formData.skills.split(',').map(s => s.trim()).filter(s => s);

            const response = await axios.post(`${API_URL}/api/resume-builder`, {
                ...formData,
                skills
            }, authHeaders);
            setResult(response.data);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to build resume. Make sure the backend is running.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container section fade-in">
            <Link to="/" className="btn btn-secondary mb-2 no-print">← Back to Dashboard</Link>

            <div className="grid resume-layout" style={{ gridTemplateColumns: result ? '1fr 1fr' : '1fr', gap: '2rem' }}>
                {/* Form Section */}
                <div className="card no-print">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div className="feature-icon" style={{ background: 'var(--gradient-sunset)' }}>📄</div>
                        <div>
                            <h2 style={{ margin: 0 }}>AI Resume Builder</h2>
                            <p style={{ margin: 0 }}>Create ATS-friendly resume</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {/* Personal Information */}
                        <h3>Personal Information</h3>

                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>

                        <div className="grid-2">
                            <div className="form-group">
                                <label className="form-label">Email</label>
                                <input
                                    type="email"
                                    className="form-input"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Phone</label>
                                <input
                                    type="tel"
                                    className="form-input"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Professional Summary</label>
                            <textarea
                                className="form-textarea"
                                rows="3"
                                value={formData.summary}
                                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                                placeholder="Brief summary of your background and goals"
                                required
                            />
                        </div>

                        {/* Education */}
                        <h3 style={{ marginTop: '1.5rem' }}>Education</h3>
                        {formData.education.map((edu, index) => (
                            <div key={index} style={{
                                background: 'var(--color-bg)',
                                padding: '1rem',
                                borderRadius: 'var(--radius-sm)',
                                marginBottom: '1rem'
                            }}>
                                <div className="grid-2">
                                    <div className="form-group">
                                        <label className="form-label">Degree</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={edu.degree}
                                            onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Institution</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={edu.institution}
                                            onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="grid-2">
                                    <div className="form-group">
                                        <label className="form-label">Year</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={edu.year}
                                            onChange={(e) => handleEducationChange(index, 'year', e.target.value)}
                                            placeholder="2020-2024"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Grade/CGPA</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={edu.grade}
                                            onChange={(e) => handleEducationChange(index, 'grade', e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                        <button type="button" className="btn btn-secondary" onClick={addEducation} style={{ marginBottom: '1rem' }}>
                            + Add Education
                        </button>

                        {/* Skills */}
                        <h3>Skills</h3>
                        <div className="form-group">
                            <label className="form-label">Technical Skills (comma-separated)</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.skills}
                                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                                placeholder="e.g., Python, React, Communication"
                                required
                            />
                        </div>

                        {/* Projects */}
                        <h3 style={{ marginTop: '1.5rem' }}>Projects</h3>
                        {formData.projects.map((project, index) => (
                            <div key={index} style={{
                                background: 'var(--color-bg)',
                                padding: '1rem',
                                borderRadius: 'var(--radius-sm)',
                                marginBottom: '1rem'
                            }}>
                                <div className="form-group">
                                    <label className="form-label">Project Name</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={project.name}
                                        onChange={(e) => handleProjectChange(index, 'name', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Description</label>
                                    <textarea
                                        className="form-textarea"
                                        rows="2"
                                        value={project.description}
                                        onChange={(e) => handleProjectChange(index, 'description', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Technologies Used</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={project.technologies}
                                        onChange={(e) => handleProjectChange(index, 'technologies', e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        ))}
                        <button type="button" className="btn btn-secondary" onClick={addProject} style={{ marginBottom: '1rem' }}>
                            + Add Project
                        </button>

                        {error && (
                            <div style={{ background: '#fee', color: '#c33', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                                {error}
                            </div>
                        )}

                        <button type="submit" className="btn btn-primary btn-large" style={{ width: '100%' }} disabled={loading}>
                            {loading ? 'Building...' : '🚀 Build Resume'}
                        </button>
                    </form>
                </div>

                {/* Preview Section */}
                {result && (
                    <div className="fade-in print-container">
                        <div className="result-card no-shadow-print" style={{ position: 'sticky', top: '100px' }}>
                            <div className="result-header no-print">
                                <h2 style={{ margin: 0 }}>Resume Preview</h2>
                                <span className="result-badge">AI Generated</span>
                            </div>

                            {/* ATS Score */}
                            <div className="no-print" style={{
                                background: 'var(--gradient-sunset)',
                                color: 'white',
                                padding: '1rem',
                                borderRadius: 'var(--radius-md)',
                                textAlign: 'center',
                                marginBottom: '1.5rem'
                            }}>
                                <div style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>ATS Compatibility Score</div>
                                <div style={{ fontSize: '2.5rem', fontWeight: '800' }}>{result.ats_score}%</div>
                            </div>

                            {/* Resume HTML */}
                            <div
                                style={{
                                    background: 'white',
                                    color: 'black',
                                    padding: '2rem',
                                    borderRadius: 'var(--radius-sm)',
                                    border: '1px solid #ccc',
                                    minHeight: '400px',
                                    fontSize: '0.9rem',
                                    lineHeight: '1.6',
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                }}
                                className="resume-preview printable-content"
                                dangerouslySetInnerHTML={{ __html: result.resume_html }}
                            />

                            {/* Suggestions */}
                            <div className="no-print" style={{ marginTop: '1.5rem' }}>
                                <h3 style={{ color: 'var(--color-primary)' }}>💡 Suggestions</h3>
                                <ul style={{ paddingLeft: '1.5rem' }}>
                                    {result.suggestions.map((suggestion, index) => (
                                        <li key={index} style={{ marginBottom: '0.5rem', color: 'var(--color-text)' }}>
                                            {suggestion}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <button
                                className="btn btn-primary btn-large no-print"
                                style={{ width: '100%', marginTop: '1rem' }}
                                onClick={handleDownload}
                            >
                                📥 Download as PDF (Print)
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {loading && !result && (
                <div className="loading-container no-print">
                    <div className="loading"></div>
                </div>
            )}

            {/* Resume Preview Styles */}
            <style>{`
        .resume-preview {
          background-color: white !important;
          color: black !important;
          font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
        }
        .resume-preview * {
          color: black !important;
        }
        .resume-preview .resume-container {
          padding: 0;
        }
        .resume-preview .resume-header {
          text-align: center;
          border-bottom: 2px solid #333 !important;
          padding-bottom: 1rem;
          margin-bottom: 1.5rem;
        }
        .resume-preview .resume-header h1 {
          margin: 0 0 0.5rem 0 !important;
          font-size: 2rem !important;
          color: black !important;
          font-weight: 800 !important;
        }
        .resume-preview .resume-header p {
          margin: 0 !important;
          color: #444 !important;
        }
        .resume-preview .resume-section {
          margin-bottom: 1.5rem;
        }
        .resume-preview .resume-section h2 {
          color: black !important;
          font-size: 1.3rem !important;
          border-bottom: 1px solid #666 !important;
          padding-bottom: 0.2rem;
          margin-bottom: 0.75rem !important;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .resume-preview .resume-item {
          margin-bottom: 1rem;
        }
        .resume-preview .resume-item h3 {
          margin: 0 0 0.1rem 0 !important;
          font-size: 1.1rem !important;
          font-weight: 700 !important;
          color: black !important;
        }
        .resume-preview .resume-item p {
          margin: 0.1rem 0 !important;
          color: #333 !important;
          font-size: 0.95rem !important;
        }
        .resume-preview .resume-item strong {
           color: black !important;
        }

        @media print {
          body * {
            visibility: hidden;
          }
          .print-container, .print-container * {
            visibility: visible;
          }
          .print-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
          }
          .no-print {
            display: none !important;
          }
          .printable-content {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
          }
          .no-shadow-print {
             box-shadow: none !important;
             background: transparent !important;
             border: none !important;
             position: static !important;
          }
          .card {
             background: white !important;
             color: black !important;
          }
          @page {
            margin: 1cm;
          }
        }
      `}</style>
        </div>
    );
}

export default ResumeBuilder;
