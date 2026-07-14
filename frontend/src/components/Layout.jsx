import { useState } from 'react'
import Sidebar from './Sidebar'
import Navbar from './Navbar'

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="app-shell">
      <div
        className={`sidebar-overlay${sidebarOpen ? ' open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-area">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <div className="content-area">{children}</div>
      </div>
    </div>
  )
}
