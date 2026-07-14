import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const name = localStorage.getItem('name')
    const email = localStorage.getItem('email')
    return name ? { name, email } : null
  })

  function login(token, name, email) {
    localStorage.setItem('token', token)
    localStorage.setItem('name', name)
    localStorage.setItem('email', email)
    setUser({ name, email })
  }

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('name')
    localStorage.removeItem('email')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
