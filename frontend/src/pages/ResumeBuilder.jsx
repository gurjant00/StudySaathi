import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { API_URL } from '../config';
import { useAuth } from '../context/AuthContext';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

function ResumeBuilder() {
    const navigate = useNavigate();
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
    const [resumeHistory, setResumeHistory] = useState([]);
    const { token } = useAuth();
    const resumeRef = React.useRef(null);

    const authHeaders = {
        headers: { Authorization: `Bearer ${token}` }
    };

    React.useEffect(() => {
        fetchLatestResume();
        fetchHistory();
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

    const fetchHistory = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/resume-builder/history`, authHeaders);
            setResumeHistory(response.data || []);
        } catch (err) {
            console.error("Failed to fetch resume history:", err);
        }
    };

    const handleEducationChange = (index, field, value) => {
        const newEducation = [...formData.education];
        newEducation[index][field] = value;
        setFormData({ ...formData, education: newEducation });
    };

    const handleEdit = () => {
        if (result && result.resume_data) {
            setFormData(result.resume_data);
        }
        setResult(null);
        setError('');
    };

    const handleCreateNew = () => {
        setFormData({
            name: '',
            email: '',
            phone: '',
            summary: '',
            education: [{ degree: '', institution: '', year: '', grade: '' }],
            skills: '',
            projects: [{ name: '', description: '', technologies: '' }]
        });
        setResult(null);
        setError('');
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

    const handleDownloadPDF = async () => {
        const element = resumeRef.current;
        if (!element) {
            console.error("Resume preview element not found via Ref");
            return;
        }

        setLoading(true);
        setError('');
        try {
            console.log("Starting high-fidelity PDF capture...");

            // 1. Temporarily append an exact 800px clone off-screen
            // This guarantees the resume aspect ratio is perfect regardless of the user's screen size.
            const captureContainer = document.createElement('div');
            captureContainer.style.position = 'absolute';
            captureContainer.style.left = '-9999px';
            captureContainer.style.top = '-9999px';
            captureContainer.style.width = '800px';

            const clone = element.cloneNode(true);
            clone.style.width = '800px';
            clone.style.maxWidth = '800px';
            clone.style.margin = '0';
            clone.style.boxShadow = 'none';
            clone.style.border = 'none';
            clone.style.borderRadius = '0';

            captureContainer.appendChild(clone);
            document.body.appendChild(captureContainer);

            // 2. High-fidelity capture settings on the fixed clone
            const canvas = await html2canvas(clone, {
                scale: 3, // Increased scale for pristine text quality
                useCORS: true,
                backgroundColor: '#ffffff',
                logging: false,
                imageTimeout: 0,
                width: 800,
                windowWidth: 800
            });

            // 3. Clean up the temporary clone
            document.body.removeChild(captureContainer);

            console.log("Canvas generated, creating PDF...");
            const imgData = canvas.toDataURL('image/jpeg', 1.0);

            // 4. PDF is A4 portrait (210mm width)
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
            pdf.save(`${formData.name.replace(/\s+/g, '_') || 'Resume'}.pdf`);
            console.log("PDF saved successfully.");
        } catch (err) {
            console.error("High-fidelity PDF generation failed:", err);
            setError("The direct download had an issue. Please use '🖨️ Print Resume' and select 'Save as PDF' for a perfect result.");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteResume = async (id) => {
        if (!window.confirm("Are you sure you want to delete this resume?")) return;
        try {
            await axios.delete(`${API_URL}/api/resume-builder/${id}`, authHeaders);
            fetchHistory();
        } catch (err) {
            console.error("Failed to delete resume:", err);
            setError("Failed to delete resume.");
        }
    };

    const handleViewResume = (item) => {
        setResult({
            resume_html: item.resume_html,
            resume_data: item.resume_data,
            suggestions: []
        });
        if (item.resume_data) {
            setFormData(item.resume_data);
        }
    };

    const handlePrint = () => {
        if (!result || !result.resume_html) return;

        const printWindow = window.open('', '_blank', 'width=850,height=1100');
        if (!printWindow) {
            alert("Please allow popups to print or download your resume.");
            return;
        }

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>${formData.name || 'Resume'}_Resume</title>
                <style>
                    body {
                        font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
                        margin: 0;
                        padding: 20mm;
                        background: white;
                        color: black;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    * {
                        color: black !important;
                    }
                    @media print {
                        body { padding: 0; margin: 0; }
                        @page { margin: 1cm; size: A4 portrait; }
                    }
                </style>
            </head>
            <body>
                ${result.resume_html}
                <script>
                    window.onload = function() {
                        setTimeout(function() {
                            window.print();
                            window.close();
                        }, 500);
                    };
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    };

    const loadExampleData = () => {
        setFormData({
            name: 'Alex Johnson',
            email: 'alex.johnson@example.com',
            phone: '+1 (555) 123-4567',
            summary: 'Passionate Software Engineer with 3+ years of experience building scalable web applications. Strong focus on React, Node.js, and cloud technologies. Eager to solve complex problems and deliver high-quality, user-centric software.',
            education: [{ degree: "Bachelor's Degree", institution: 'Tech University', year: '2018-2022', grade: '3.8/4.0 GPA' }],
            skills: 'JavaScript, TypeScript, React, Node.js, Python, SQL, Git, AWS',
            projects: [
                { name: 'E-commerce Platform Refactoring', description: 'Migrated legacy PHP monolith to a modern React/Node.js microservices architecture, improving load times by 40%.', technologies: 'React, Node.js, Express, MongoDB' },
                { name: 'AI Task Manager', description: 'Built an AI-powered to-do app that categorizes and prioritizes tasks automatically using NLP.', technologies: 'Python, FastAPI, React, OpenAI API' }
            ]
        });
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
            fetchHistory();
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to build resume. Make sure the backend is running.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container section fade-in">
            <button onClick={() => navigate(-1)} className="btn btn-secondary mb-2 no-print">← Go Back</button>

            <div>
                {/* Form Section */}
                <div className="card glass-card glass-card glass-card no-print" style={{ display: result ? 'none' : 'block' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div className="feature-icon" style={{ background: 'var(--gradient-sunset)' }}>📄</div>
                        <div>
                            <h2 className="glow-text" style={{ margin: 0 }}>AI Resume Builder</h2>
                            <p style={{ margin: 0 }}>Craft a high-impact, ATS-friendly resume</p>
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                        <button type="button" className="btn btn-secondary" onClick={loadExampleData} style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}>
                            ✨ Load Example Data
                        </button>
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
                                        <select
                                            className="form-input"
                                            value={edu.degree}
                                            onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                                            required
                                            style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}
                                        >
                                            <option value="" disabled>Select Degree</option>
                                            <option value="High School Diploma">High School Diploma</option>
                                            <option value="Associate Degree">Associate Degree</option>
                                            <option value="Bachelor's Degree">Bachelor's Degree</option>
                                            <option value="Master's Degree">Master's Degree</option>
                                            <option value="Ph.D. / Doctorate">Ph.D. / Doctorate</option>
                                            <option value="Bootcamp/Certificate">Bootcamp/Certificate</option>
                                            <option value="Other">Other</option>
                                        </select>
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
                        <div className="result-card no-shadow-print">
                            <div className="result-header no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h2 style={{ margin: 0 }}>Resume Preview</h2>
                                    <span className="result-badge">AI Generated</span>
                                </div>
                                <div style={{ display: 'flex', gap: '0.8rem' }}>
                                    <button
                                        className="btn btn-secondary"
                                        onClick={handleEdit}
                                        style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}
                                    >✏️ Edit Resume</button>
                                    <button
                                        className="btn btn-primary"
                                        onClick={handleCreateNew}
                                        style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}
                                    >✨ Create New</button>
                                </div>
                            </div>


                            {/* Resume HTML */}
                            <div
                                ref={resumeRef}
                                style={{
                                    background: 'white',
                                    color: 'black',
                                    borderRadius: 'var(--radius-sm)',
                                    border: '1px solid #ddd',
                                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                                    overflow: 'hidden'
                                }}
                                className="resume-preview printable-content"
                                dangerouslySetInnerHTML={{ __html: result.resume_html }}
                            />

                            {/* Suggestions */}
                            {result.suggestions && result.suggestions.length > 0 && (
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
                            )}

                            {/* Action Buttons */}
                            <div className="no-print" style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                                <button
                                    className="btn btn-primary"
                                    style={{ flex: 1 }}
                                    onClick={handleDownloadPDF}
                                    disabled={loading}
                                >
                                    {loading ? 'Generating PDF...' : '📥 Download PDF'}
                                </button>
                                <button
                                    className="btn btn-secondary"
                                    style={{ flex: 1 }}
                                    onClick={handlePrint}
                                >
                                    🖨️ Print Resume
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {loading && !result && (
                <div className="loading-container no-print">
                    <div className="loading"></div>
                </div>
            )}

            {/* Resume History */}
            {resumeHistory.length > 0 && (
                <div className="card glass-card glass-card glass-card no-print" style={{ marginTop: '2rem' }}>
                    <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        📋 Resume History
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: 'normal' }}>
                            ({resumeHistory.length} resume{resumeHistory.length !== 1 ? 's' : ''})
                        </span>
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {resumeHistory.map((item) => (
                            <div key={item.id} style={{
                                background: 'var(--color-bg)',
                                padding: '1rem',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--color-border)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: '0.5rem'
                            }}>
                                <div>
                                    <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>
                                        Resume #{item.id}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                                        {new Date(item.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        className="btn btn-secondary"
                                        style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem' }}
                                        onClick={() => handleViewResume(item)}
                                    >
                                        👁️ View
                                    </button>
                                    <button
                                        className="btn btn-secondary"
                                        style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem', color: '#ff4444' }}
                                        onClick={() => handleDeleteResume(item.id)}
                                    >
                                        🗑️ Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
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
