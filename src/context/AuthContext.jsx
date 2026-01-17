import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

// Predefined users
const USERS = {
  admin: {
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    name: 'Principal Singh',
    email: 'principal@scindia.edu'
  },
  teacher: {
    username: 'teacher',
    password: 'teacher123',
    role: 'teacher',
    name: 'Mr. Sharma',
    email: 'sharma@scindia.edu'
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [hasSeenInstructions, setHasSeenInstructions] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for stored auth on mount
    const storedUser = localStorage.getItem('fitschool_user')
    const instructionsSeen = localStorage.getItem('fitschool_instructions_seen')
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser)
      setUser(parsedUser)
      setIsAuthenticated(true)
      setHasSeenInstructions(instructionsSeen === 'true')
    }
    setLoading(false)
  }, [])

  const login = (username, password) => {
    // Check predefined users
    const foundUser = Object.values(USERS).find(
      u => u.username === username && u.password === password
    )

    if (foundUser) {
      const userWithoutPassword = { ...foundUser }
      delete userWithoutPassword.password
      setUser(userWithoutPassword)
      setIsAuthenticated(true)
      setHasSeenInstructions(false)
      localStorage.setItem('fitschool_user', JSON.stringify(userWithoutPassword))
      localStorage.removeItem('fitschool_instructions_seen')
      return { success: true, user: userWithoutPassword }
    }

    // Check teacher list from localStorage (added by admin)
    const teachers = JSON.parse(localStorage.getItem('fitschool_teachers') || '[]')
    const teacherUser = teachers.find(
      t => t.username === username && t.password === password
    )

    if (teacherUser) {
      const userWithoutPassword = { ...teacherUser, role: 'teacher' }
      delete userWithoutPassword.password
      setUser(userWithoutPassword)
      setIsAuthenticated(true)
      setHasSeenInstructions(false)
      localStorage.setItem('fitschool_user', JSON.stringify(userWithoutPassword))
      localStorage.removeItem('fitschool_instructions_seen')
      return { success: true, user: userWithoutPassword }
    }

    return { success: false, error: 'Invalid credentials' }
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    setHasSeenInstructions(false)
    localStorage.removeItem('fitschool_user')
    localStorage.removeItem('fitschool_instructions_seen')
  }

  const markInstructionsSeen = () => {
    setHasSeenInstructions(true)
    localStorage.setItem('fitschool_instructions_seen', 'true')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-scindia-primary">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, hasSeenInstructions, login, logout, markInstructionsSeen }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
