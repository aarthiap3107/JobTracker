import { useState } from 'react'
import api from '../api/axios'
import { useToast } from '../context/ToastContext'
import { SparkleIcon, CopyIcon } from './Icons'

export default function CoverLetterModal({ application, onClose }) {
  const [jobDescription, setJobDescription] = useState('')
  const [letter, setLetter] = useState('')
  const [loading, setLoading] = useState(false)
  const { addToast } = useToast()

  async function generate() {
    setLoading(true)
    try {
      const res = await api.post('/api/ai/cover-letter', {
        companyName: application.companyName,
        jobTitle: application.jobTitle,
        jobDescription,
      })
      setLetter(res.data.letter)
    } catch (err) {
      addToast(err.response?.data?.error || 'Generation failed.', 'error')
    } finally {
      setLoading(false)
    }
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(letter)
    addToast('Cover letter copied to clipboard!', 'success')
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 680 }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <SparkleIcon size={18} color="var(--indigo-500)" />
            <h2>AI Cover Letter</h2>
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div style={{ marginBottom: '1rem' }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-2)', marginBottom: '0.75rem' }}>
              Generating for <strong style={{ color: 'var(--text-1)' }}>{application.jobTitle}</strong> at{' '}
              <strong style={{ color: 'var(--text-1)' }}>{application.companyName}</strong>
            </p>
            <div className="form-group">
              <label>Job Description <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>(optional — improves quality)</span></label>
              <textarea
                value={jobDescription}
                onChange={e => setJobDescription(e.target.value)}
                rows={4}
                placeholder="Paste the job description here…"
              />
            </div>
          </div>

          {letter && (
            <div className="cover-letter-output">
              <div className="cover-letter-toolbar">
                <span style={{ fontSize: '0.78rem', color: 'var(--text-3)', fontWeight: 600 }}>GENERATED LETTER</span>
                <button className="btn btn-sm btn-outline" onClick={copyToClipboard}>
                  <CopyIcon size={13} /> Copy
                </button>
              </div>
              <pre className="cover-letter-text">{letter}</pre>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Close</button>
          <button className="btn btn-primary" onClick={generate} disabled={loading}>
            <SparkleIcon size={15} />
            {loading ? 'Generating…' : letter ? 'Regenerate' : 'Generate'}
          </button>
        </div>
      </div>
    </div>
  )
}
