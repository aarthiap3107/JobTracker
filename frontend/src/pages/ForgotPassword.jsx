import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import { BriefcaseIcon } from '../components/Icons'

export default function ForgotPassword() {
  const [email,   setEmail]   = useState('')
  const [message, setMessage] = useState('')
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)
    try {
      const res = await api.post('/api/auth/forgot-password', { email })
      if (res.data.error) {
        setError(res.data.error)
      } else {
        setMessage(res.data.message)
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
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
          Reset your password and get back to <span>tracking your career.</span>
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

          <h2>Forgot password?</h2>
          <p className="auth-sub">
            Enter your email and we'll send you a reset link valid for 15 minutes.
          </p>

          {message && (
            <div className="alert" style={{ background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', marginBottom: '1.25rem' }}>
              {message}
            </div>
          )}
          {error && (
            <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>{error}</div>
          )}

          {!message && (
            <form onSubmit={handleSubmit}>
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label>Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                {loading ? 'Sending…' : 'Send Reset Link'}
              </button>
            </form>
          )}

          <p className="auth-link">
            Remember your password? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
