import { useState } from 'react'

const EMPTY = {
  companyName: '', jobTitle: '', status: 'APPLIED',
  appliedDate: '', deadline: '', jobUrl: '', salary: '', contactPerson: '', notes: '',
}

export default function ApplicationForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState(
    initial
      ? {
          companyName:   initial.companyName   ?? '',
          jobTitle:      initial.jobTitle      ?? '',
          status:        initial.status        ?? 'APPLIED',
          appliedDate:   initial.appliedDate   ?? '',
          deadline:      initial.deadline      ?? '',
          jobUrl:        initial.jobUrl        ?? '',
          salary:        initial.salary        ?? '',
          contactPerson: initial.contactPerson ?? '',
          notes:         initial.notes         ?? '',
        }
      : EMPTY
  )
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const payload = {
        ...form,
        appliedDate:   form.appliedDate   || null,
        deadline:      form.deadline      || null,
        jobUrl:        form.jobUrl        || null,
        salary:        form.salary        || null,
        contactPerson: form.contactPerson || null,
        notes:         form.notes         || null,
      }
      await onSave(payload)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2>{initial ? 'Edit Application' : 'New Application'}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>

        {error && (
          <div style={{ padding: '0 1.5rem', marginTop: '1rem' }}>
            <div className="alert alert-error">{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              <div className="form-group">
                <label>Company <span className="required">*</span></label>
                <input name="companyName" value={form.companyName} onChange={handleChange} placeholder="Acme Corp" required />
              </div>
              <div className="form-group">
                <label>Job Title <span className="required">*</span></label>
                <input name="jobTitle" value={form.jobTitle} onChange={handleChange} placeholder="Software Engineer" required />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select name="status" value={form.status} onChange={handleChange}>
                  <option value="APPLIED">Applied</option>
                  <option value="INTERVIEW">Interview</option>
                  <option value="OFFER">Offer</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
              <div className="form-group">
                <label>Applied Date</label>
                <input type="date" name="appliedDate" value={form.appliedDate} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Deadline</label>
                <input type="date" name="deadline" value={form.deadline} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Job URL</label>
                <input type="url" name="jobUrl" value={form.jobUrl} onChange={handleChange} placeholder="https://..." />
              </div>
              <div className="form-group">
                <label>Salary / Range</label>
                <input name="salary" value={form.salary} onChange={handleChange} placeholder="e.g. ₹8 LPA or $80k–$100k" />
              </div>
              <div className="form-group">
                <label>Contact Person</label>
                <input name="contactPerson" value={form.contactPerson} onChange={handleChange} placeholder="Recruiter name or email" />
              </div>
            </div>
            <div className="form-group" style={{ marginTop: '0.25rem' }}>
              <label>Notes</label>
              <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} placeholder="Referral, remote-friendly, salary range…" />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving…' : initial ? 'Save Changes' : 'Add Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
