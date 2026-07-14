import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import { ThemeProvider } from './context/ThemeContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Dashboard from './pages/Dashboard'
import Analytics from './pages/Analytics'
import ResumeAnalyzer from './pages/ResumeAnalyzer'
import Profile from './pages/Profile'

function ProtectedRoute({ children }) {
  const { user } = useAuth()
  return user ? <Layout>{children}</Layout> : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const { user } = useAuth()
  return user ? <Navigate to="/dashboard" replace /> : children
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/login"            element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/register"        element={<PublicRoute><Register /></PublicRoute>} />
              <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
              <Route path="/reset-password"  element={<ResetPassword />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
              <Route path="/resume"    element={<ProtectedRoute><ResumeAnalyzer /></ProtectedRoute>} />
              <Route path="/profile"   element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            </Routes>
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}
