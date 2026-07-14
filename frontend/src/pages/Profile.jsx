import { useState, useEffect } from 'react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { UserIcon, BriefcaseIcon } from '../components/Icons'

export default function Profile() {
  const { user, login } = useAuth()
  const { addToast } = useToast()

  const [profile, setProfile] = useState({ name: '', email: '', createdAt: '', totalApplications: 0 })
  const [nameForm, setNameForm] = useState({ name: '' })
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [saving, setSaving] = useState(false)
  const [changingPwd, setChangingPwd] = useState(false)

  useEffect(() => {
    api.get('/api/user/profile').then(r => {
      setProfile(r.data)
      setNameForm({ name: r.data.name })
    }).catch(() => addToast('Failed to load profile.', 'error'))
  }, [])

  async function handleNameSave(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await api.put('/api/user/profile', nameForm)
      setProfile(p => ({ ...p, name: res.data.name }))
      const token = localStorage.getItem('token')
      login(token, res.data.name, res.data.email)
      addToast('Name updated successfully!', 'success')
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to update name.', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handlePasswordSave(e) {
    e.preventDefault()
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      addToast('New passwords do not match.', 'error')
      return
    }
    setChangingPwd(true)
    try {
      await api.put('/api/user/password', {
        currentPassword: pwdForm.currentPassword,
        newPassword:     pwdForm.newPassword,
      })
      setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      addToast('Password changed successfully!', 'success')
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to change password.', 'error')
    } finally {
      setChangingPwd(false)
    }
  }

  const joinDate = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : '—'

  return (
    <div className="profile-page">
      <div className="profile-header-card table-card">
        <div className="profile-avatar-lg">
          {profile.name?.charAt(0)?.toUpperCase() ?? '?'}
        </div>
        <div>
          <div className="profile-name">{profile.name}</div>
          <div className="profile-email">{profile.email}</div>
          <div className="profile-meta">Member since {joinDate}</div>
        </div>
        <div className="profile-stats">
          <div className="profile-stat">
            <BriefcaseIcon size={18} color="var(--indigo-500)" />
            <span className="profile-stat-value">{profile.totalApplications}</span>
            <span className="profile-stat-label">Applications</span>
          </div>
        </div>
      </div>

      <div className="profile-forms">
        <div className="table-card profile-form-card">
          <div className="profile-form-title">
            <UserIcon size={18} color="var(--indigo-500)" />
            Update Name
          </div>
          <form onSubmit={handleNameSave}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                value={nameForm.name}
                onChange={e => setNameForm({ name: e.target.value })}
                placeholder="Your full name"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save Name'}
            </button>
          </form>
        </div>

        <div className="table-card profile-form-card">
          <div className="profile-form-title">
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="var(--indigo-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Change Password
          </div>
          <form onSubmit={handlePasswordSave}>
            <div className="form-group">
              <label>Current Password</label>
              <input type="password" value={pwdForm.currentPassword}
                onChange={e => setPwdForm({ ...pwdForm, currentPassword: e.target.value })}
                placeholder="••••••••" required />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input type="password" value={pwdForm.newPassword}
                onChange={e => setPwdForm({ ...pwdForm, newPassword: e.target.value })}
                placeholder="At least 6 characters" minLength={6} required />
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <input type="password" value={pwdForm.confirmPassword}
                onChange={e => setPwdForm({ ...pwdForm, confirmPassword: e.target.value })}
                placeholder="••••••••" required />
            </div>
            <button type="submit" className="btn btn-primary" disabled={changingPwd}>
              {changingPwd ? 'Updating…' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
