import { useState, useEffect } from 'react'
import api from '../api/axios'
import { useToast } from '../context/ToastContext'
import { PlusIcon, EditIcon, TrashIcon, CalendarIcon } from './Icons'

const EMPTY = { interviewDate: '', round: '', notes: '', questions: '', outcome: '' }
const ROUNDS = ['Phone Screen', 'Technical', 'System Design', 'Behavioral', 'Final', 'HR', 'Other']
const OUTCOMES = ['Pending', 'Passed', 'Rejected', 'Awaiting Feedback']

export default function InterviewModal({ application, onClose }) {
  const [interviews, setInterviews] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { addToast } = useToast()

  useEffect(() => { fetchInterviews() }, [])

  async function fetchInterviews() {
    try {
      const res = await api.get(`/api/applications/${application.id}/interviews`)
      setInterviews(res.data)
    } catch {
      addToast('Failed to load interviews.', 'error')
    } finally {
      setLoading(false)
    }
  }

  function openAdd() { setEditTarget(null); setForm(EMPTY); setShowForm(true) }
  function openEdit(iv) {
    setEditTarget(iv)
    setForm({
      interviewDate: iv.interviewDate ?? '',
      round:         iv.round ?? '',
      notes:         iv.notes ?? '',
      questions:     iv.questions ?? '',
      outcome:       iv.outcome ?? '',
    })
    setShowForm(true)
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    try {
      if (editTarget) {
        const res = await api.put(`/api/applications/${application.id}/interviews/${editTarget.id}`, form)
        setInterviews(prev => prev.map(iv => iv.id === editTarget.id ? res.data : iv))
        addToast('Interview updated.', 'success')
      } else {
        const res = await api.post(`/api/applications/${application.id}/interviews`, form)
        setInterviews(prev => [...prev, res.data])
        addToast('Interview added.', 'success')
      }
      setShowForm(false)
    } catch {
      addToast('Failed to save interview.', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    try {
      await api.delete(`/api/applications/${application.id}/interviews/${id}`)
      setInterviews(prev => prev.filter(iv => iv.id !== id))
      addToast('Interview deleted.', 'success')
    } catch {
      addToast('Failed to delete interview.', 'error')
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 700 }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CalendarIcon size={18} color="var(--indigo-500)" />
            <h2>Interviews — {application.companyName}</h2>
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {!showForm && (
            <button className="btn btn-primary btn-sm" onClick={openAdd} style={{ marginBottom: '1rem' }}>
              <PlusIcon size={14} /> Add Interview
            </button>
          )}

          {showForm && (
            <form onSubmit={handleSave} className="interview-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Date</label>
                  <input type="date" value={form.interviewDate}
                    onChange={e => setForm({ ...form, interviewDate: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Round</label>
                  <select value={form.round} onChange={e => setForm({ ...form, round: e.target.value })}>
                    <option value="">Select round…</option>
                    {ROUNDS.map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Outcome</label>
                  <select value={form.outcome} onChange={e => setForm({ ...form, outcome: e.target.value })}>
                    <option value="">Select outcome…</option>
                    {OUTCOMES.map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Questions Asked</label>
                <textarea rows={3} value={form.questions}
                  onChange={e => setForm({ ...form, questions: e.target.value })}
                  placeholder="What questions were asked?" />
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea rows={3} value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  placeholder="Observations, feedback, follow-up steps…" />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                  {saving ? 'Saving…' : editTarget ? 'Save Changes' : 'Add Interview'}
                </button>
              </div>
            </form>
          )}

          {loading ? (
            <p style={{ color: 'var(--text-3)', fontSize: '0.875rem' }}>Loading…</p>
          ) : interviews.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <CalendarIcon size={40} color="var(--indigo-400)" />
              <p>No interviews recorded yet.</p>
            </div>
          ) : (
            <div className="interview-list">
              {interviews.map(iv => (
                <div key={iv.id} className="interview-card">
                  <div className="interview-card-top">
                    <div>
                      <span className="interview-round">{iv.round || 'Interview'}</span>
                      {iv.interviewDate && <span className="interview-date">{iv.interviewDate}</span>}
                    </div>
                    <div style={{ display: 'flex', gap: '0.375rem' }}>
                      <button className="btn btn-sm btn-outline" onClick={() => openEdit(iv)}>
                        <EditIcon size={12} />
                      </button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(iv.id)}>
                        <TrashIcon size={12} />
                      </button>
                    </div>
                  </div>
                  {iv.outcome && (
                    <span className={`interview-outcome outcome-${iv.outcome.toLowerCase().replace(' ', '-')}`}>
                      {iv.outcome}
                    </span>
                  )}
                  {iv.questions && <p className="interview-field"><strong>Questions:</strong> {iv.questions}</p>}
                  {iv.notes    && <p className="interview-field"><strong>Notes:</strong> {iv.notes}</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}
