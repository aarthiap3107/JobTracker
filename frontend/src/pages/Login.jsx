import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { BriefcaseIcon } from '../components/Icons'

export default function Login() {
  const [form,       setForm]       = useState({ email: '', password: '' })
  const [error,      setError]      = useState('')
  const [loading,    setLoading]    = useState(false)
  const [serverWarm, setServerWarm] = useState(true)
  const { login } = useAuth()
  const navigate   = useNavigate()

  useEffect(() => {
    // Ping backend; if it takes >2s the server is still waking up — show a notice
    const timer = setTimeout(() => setServerWarm(false), 2000)
    const base = import.meta.env.VITE_API_URL || 'http://localhost:8080'
    fetch(`${base}/api/health`)
      .then(() => setServerWarm(true))
      .catch(() => setServerWarm(true))
      .finally(() => clearTimeout(timer))
    return () => clearTimeout(timer)
  }, [])

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/api/auth/login', form)
      login(res.data.token, res.data.name, res.data.email)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.')
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
          Land your <span>dream job</span> with organized, focused job tracking.
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

          <h2>Welcome back</h2>
          <p className="auth-sub">Sign in to continue your job search journey.</p>

          {!serverWarm && (
            <div className="alert" style={{
              marginBottom: '1.25rem',
              background: '#fffbeb',
              border: '1px solid #f59e0b',
              color: '#92400e',
              borderRadius: 8,
              padding: '0.75rem 1rem',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span style={{ fontSize: '1rem' }}>⏳</span>
              Server is starting up — this may take up to 60 seconds on first load.
            </div>
          )}

          {error && <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>{error}</div>}

          <form onSubmit={handleSubmit}>
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
                placeholder="••••••••" required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="auth-link" style={{ marginTop: '0.75rem' }}>
            <Link to="/forgot-password">Forgot your password?</Link>
          </p>
          <p className="auth-link">
            Don&apos;t have an account?{' '}
            <Link to="/register">Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
