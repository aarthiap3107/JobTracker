import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import api from '../api/axios'
import { BriefcaseIcon } from '../components/Icons'

export default function ResetPassword() {
  const [searchParams]   = useSearchParams()
  const token            = searchParams.get('token')
  const navigate         = useNavigate()

  const [form,    setForm]    = useState({ newPassword: '', confirm: '' })
  const [message, setMessage] = useState('')
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (form.newPassword !== form.confirm) {
      setError('Passwords do not match.')
      return
    }
    if (form.newPassword.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    try {
      const res = await api.post('/api/auth/reset-password', {
        token,
        newPassword: form.newPassword,
      })
      setMessage(res.data.message)
      setTimeout(() => navigate('/login'), 2500)
    } catch (err) {
      setError(err.response?.data?.error || 'Reset failed. The link may have expired.')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="auth-page">
        <div className="auth-right" style={{ width: '100%' }}>
          <div className="auth-card">
            <p className="auth-sub">Invalid reset link.</p>
            <p className="auth-link"><Link to="/forgot-password">Request a new one</Link></p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left-brand">
          <div className="auth-brand-icon">
            <BriefcaseIcon size={26} color="white" />
          </div>
          <span className="auth-brand-name">JobTracker</span>
        </div>
        <p className="auth-tagline">
          Set a new password and get back to <span>your job search.</span>
        </p>
        <div className="auth-dots">
          <div className="auth-dot" />
          <div className="auth-dot" />
          <div className="auth-dot" />
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-logo">
            <div className="auth-logo-icon">
              <BriefcaseIcon size={20} color="white" />
            </div>
            <span className="auth-logo-name">JobTracker</span>
          </div>

          <h2>Set new password</h2>
          <p className="auth-sub">Choose a strong password for your account.</p>

          {message && (
            <div className="alert" style={{ background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', marginBottom: '1.25rem' }}>
              {message} Redirecting to login…
            </div>
          )}
          {error && (
            <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>{error}</div>
          )}

          {!message && (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>New password</label>
                <input
                  type="password"
                  value={form.newPassword}
                  onChange={e => setForm({ ...form, newPassword: e.target.value })}
                  placeholder="••••••••"
                  required
                />
              </div>
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label>Confirm password</label>
                <input
                  type="password"
                  value={form.confirm}
                  onChange={e => setForm({ ...form, confirm: e.target.value })}
                  placeholder="••••••••"
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                {loading ? 'Resetting…' : 'Reset Password'}
              </button>
            </form>
          )}

          <p className="auth-link">
            <Link to="/login">Back to sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
