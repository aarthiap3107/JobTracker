import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { BriefcaseIcon } from '../components/Icons'

export default function Register() {
  const [form,    setForm]    = useState({ name: '', email: '', password: '' })
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate   = useNavigate()

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/api/auth/register', form)
      login(res.data.token, res.data.name, res.data.email)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      {/* Left panel */}
      <div className="auth-left">
        <div className="auth-left-brand">
          <div className="auth-brand-icon">
            <BriefcaseIcon size={26} color="white" />
          </div>
          <span className="auth-brand-name">JobTracker</span>
        </div>
        <p className="auth-tagline">
          Every great career starts with a <span>smart plan</span>.
        </p>
        <div className="auth-dots">
          <div className="auth-dot" />
          <div className="auth-dot" />
          <div className="auth-dot" />
        </div>
      </div>

      {/* Right panel */}
      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-logo">
            <div className="auth-logo-icon">
              <BriefcaseIcon size={20} color="white" />
            </div>
            <span className="auth-logo-name">JobTracker</span>
          </div>

          <h2>Create account</h2>
          <p className="auth-sub">Start tracking your job applications today — it&apos;s free.</p>

          {error && <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full name</label>
              <input
                name="name"
                value={form.name} onChange={handleChange}
                placeholder="Jane Smith" required
              />
            </div>
            <div className="form-group">
              <label>Email address</label>
              <input
                type="email" name="email"
                value={form.email} onChange={handleChange}
                placeholder="you@example.com" required
              />
            </div>
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label>Password</label>
              <input
                type="password" name="password"
                value={form.password} onChange={handleChange}
                placeholder="At least 6 characters"
                required minLength={6}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="auth-link">
            Already have an account?{' '}
            <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
