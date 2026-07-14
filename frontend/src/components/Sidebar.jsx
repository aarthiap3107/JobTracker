import { NavLink } from 'react-router-dom'
import { BriefcaseIcon, GridIcon, BarChartIcon, UserIcon, UploadIcon } from './Icons'
import { useAuth } from '../context/AuthContext'

const NAV = [
  { label: 'Dashboard',       Icon: GridIcon,    to: '/dashboard' },
  { label: 'Analytics',       Icon: BarChartIcon, to: '/analytics' },
  { label: 'Resume Analyzer', Icon: UploadIcon,   to: '/resume' },
  { label: 'Profile',         Icon: UserIcon,     to: '/profile' },
]

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth()
  const initial = user?.name?.charAt(0)?.toUpperCase() ?? '?'

  return (
    <aside className={`sidebar${isOpen ? ' open' : ''}`}>
      <div className="sidebar-brand">
        <div className="brand-icon-wrap">
          <BriefcaseIcon size={20} color="white" />
        </div>
        <span className="brand-text">JobTracker</span>
      </div>

      <div className="sidebar-section">Main Menu</div>

      <nav className="sidebar-nav">
        {NAV.map(({ label, Icon, to }) => (
          <NavLink
            key={label}
            to={to}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            onClick={onClose}
          >
            <span className="nav-item-icon"><Icon size={18} /></span>
            {label}
          </NavLink>
        ))}
      </nav>

<div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">{initial}</div>
          <span className="sidebar-user-name">{user?.name}</span>
        </div>
      </div>
    </aside>
  )
}
