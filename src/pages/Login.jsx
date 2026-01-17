import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff, LogIn, GraduationCap } from 'lucide-react'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = login(username, password)
      if (result.success) {
        navigate(result.user.role === 'admin' ? '/admin' : '/teacher')
      } else {
        setError(result.error || 'Invalid credentials')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-scindia-primary via-scindia-dark to-slate-900 flex flex-col items-center justify-center p-4">
      {/* Logo and Header */}
      <div className="text-center mb-8">
        <div className="w-24 h-24 mx-auto mb-4 bg-white rounded-full p-2 shadow-xl">
          <img 
            src="https://upload.wikimedia.org/wikipedia/en/thumb/8/8e/The_Scindia_School_Logo.svg/1200px-The_Scindia_School_Logo.svg.png"
            alt="Scindia School Logo"
            className="w-full h-full object-contain"
            onError={(e) => {
              e.target.onerror = null
              e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="%231e3a5f"/><text x="50" y="55" font-size="14" fill="white" text-anchor="middle" font-family="serif">SS</text></svg>'
            }}
          />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">THE SCINDIA SCHOOL</h1>
        <p className="text-scindia-secondary text-lg italic mb-1">सा विद्या या विमुक्तये</p>
        <div className="flex items-center justify-center gap-2 text-slate-300">
          <GraduationCap className="w-5 h-5" />
          <span className="text-xl font-semibold">FitSchool Pro</span>
        </div>
        <p className="text-slate-400 text-sm mt-1">Khelo India Fitness Test Platform</p>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        <h2 className="text-2xl font-bold text-scindia-primary text-center mb-6">
          Welcome Back
        </h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-scindia-primary focus:border-transparent transition-all"
              placeholder="Enter your username"
              required
              autoComplete="username"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-scindia-primary focus:border-transparent transition-all pr-12"
                placeholder="Enter your password"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-scindia-primary hover:bg-scindia-dark text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                Sign In
              </>
            )}
          </button>
        </form>

        {/* Demo Credentials */}
        <div className="mt-6 p-4 bg-slate-50 rounded-lg">
          <p className="text-sm font-medium text-gray-700 mb-2">Demo Credentials:</p>
          <div className="space-y-1 text-sm text-gray-600">
            <p><span className="font-medium">Admin:</span> admin / admin123</p>
            <p><span className="font-medium">Teacher:</span> teacher / teacher123</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <p className="text-slate-400 text-sm mt-8">
        © 2026 The Scindia School, Gwalior
      </p>
    </div>
  )
}
