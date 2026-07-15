import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Wake up Render backend immediately on app load (free tier sleeps after inactivity)
fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/health`).catch(() => {})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
