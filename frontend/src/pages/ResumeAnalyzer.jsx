import { useState, useRef } from 'react'
import api from '../api/axios'
import { useToast } from '../context/ToastContext'
import { UploadIcon, SparkleIcon } from '../components/Icons'

export default function ResumeAnalyzer() {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const fileRef = useRef()
  const { addToast } = useToast()

  function handleDrop(e) {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (f?.type === 'application/pdf') setFile(f)
    else addToast('Please drop a PDF file.', 'error')
  }

  async function analyze() {
    if (!file) return
    setLoading(true)
    setResult(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await api.post('/api/ai/analyze-resume', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setResult(res.data)
    } catch (err) {
      addToast(err.response?.data?.error || 'Analysis failed. Try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const score = result?.score ?? 0
  const ring = `${score}, 100`
  const scoreColor = score >= 75 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#f43f5e'

  return (
    <div className="resume-page">
      <div className="table-card resume-upload-card">
        <div className="resume-card-header">
          <SparkleIcon size={22} color="var(--indigo-500)" />
          <div>
            <div className="table-card-title">AI Resume Analyzer</div>
            <div className="table-card-meta">Upload your resume PDF and get instant AI feedback</div>
          </div>
        </div>

        <div
          className={`drop-zone${file ? ' has-file' : ''}`}
          onDragOver={e => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileRef.current.click()}
        >
          <UploadIcon size={36} color={file ? 'var(--indigo-500)' : 'var(--text-3)'} />
          <p className="drop-zone-text">
            {file ? file.name : 'Drag & drop your resume PDF here, or click to browse'}
          </p>
          {!file && <p className="drop-zone-hint">PDF files only · Max 10 MB</p>}
          <input ref={fileRef} type="file" accept=".pdf" style={{ display: 'none' }}
            onChange={e => { if (e.target.files[0]) setFile(e.target.files[0]) }} />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {file && (
            <button className="btn btn-outline btn-sm" onClick={() => { setFile(null); setResult(null) }}>
              Remove
            </button>
          )}
          <button className="btn btn-primary" onClick={analyze} disabled={!file || loading}>
            <SparkleIcon size={15} />
            {loading ? 'Analyzing…' : 'Analyze Resume'}
          </button>
        </div>
      </div>

      {loading && (
        <div className="table-card" style={{ padding: '3rem', textAlign: 'center' }}>
          <div className="ai-spinner" />
          <p style={{ marginTop: '1rem', color: 'var(--text-2)', fontSize: '0.875rem' }}>
            Analyzing your resume…
          </p>
        </div>
      )}

      {result && !loading && (
        <div className="resume-results">
          <div className="table-card score-card">
            <div className="score-circle-wrap">
              <svg viewBox="0 0 36 36" className="score-ring">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#eef2ff" strokeWidth="3" />
                <circle cx="18" cy="18" r="15.9" fill="none"
                  stroke={scoreColor} strokeWidth="3"
                  strokeDasharray={ring}
                  strokeDashoffset="25"
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dasharray 1s ease' }}
                />
              </svg>
              <div className="score-number" style={{ color: scoreColor }}>{score}</div>
            </div>
            <div className="score-label">Resume Score</div>
            <p className="score-summary">{result.summary}</p>
          </div>

          <div className="resume-feedback-grid">
            <div className="table-card feedback-card">
              <div className="feedback-title feedback-strengths">Strengths</div>
              <ul className="feedback-list">
                {(result.strengths || []).map((s, i) => (
                  <li key={i} className="feedback-item feedback-item-green">
                    <span className="feedback-dot" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            <div className="table-card feedback-card">
              <div className="feedback-title feedback-weaknesses">Weaknesses</div>
              <ul className="feedback-list">
                {(result.weaknesses || []).map((w, i) => (
                  <li key={i} className="feedback-item feedback-item-red">
                    <span className="feedback-dot" />
                    {w}
                  </li>
                ))}
              </ul>
            </div>

            <div className="table-card feedback-card feedback-card-wide">
              <div className="feedback-title feedback-suggestions">Suggestions</div>
              <ul className="feedback-list">
                {(result.suggestions || []).map((s, i) => (
                  <li key={i} className="feedback-item feedback-item-indigo">
                    <span className="feedback-dot" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
