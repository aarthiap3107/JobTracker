import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { MenuIcon, LogOutIcon, SunIcon, MoonIcon } from './Icons'

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth()
  const { dark, toggle } = useTheme()
  const navigate = useNavigate()

  const initial   = user?.name?.charAt(0)?.toUpperCase() ?? '?'
  const firstName = user?.name?.split(' ')[0] ?? user?.name ?? ''

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button className="hamburger" onClick={onMenuClick} aria-label="Open menu">
          <MenuIcon size={20} />
        </button>
        <div>
          <div className="page-title">Dashboard</div>
          <div className="page-subtitle">Track your job search journey</div>
        </div>
      </div>

      <div className="navbar-right">
        <span className="navbar-greeting">
          Hello, <strong>{firstName}!</strong>
        </span>
        <div className="avatar-circle" title={user?.name}>{initial}</div>
        <button className="btn btn-ghost btn-sm theme-toggle" onClick={toggle} title={dark ? 'Switch to light mode' : 'Switch to dark mode'}>
          {dark ? <SunIcon size={16} /> : <MoonIcon size={16} />}
        </button>
        <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
          <LogOutIcon size={15} />
          Logout
        </button>
      </div>
    </header>
  )
}
