import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { 
  LogOut, 
  FolderOpen, 
  Timer, 
  FileText, 
  Trophy, 
  Medal,
  Users,
  ClipboardList,
  Zap,
  Activity,
  FileDown
} from 'lucide-react'

export default function TeacherDashboard() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { classes, students, getStudentsByClass } = useData()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const quickActions = [
    {
      title: 'Manage Classes',
      description: 'Create classes & import students',
      icon: FolderOpen,
      color: 'bg-blue-500',
      path: '/teacher/classes'
    },
    {
      title: 'Export Data',
      description: 'Download student data as CSV',
      icon: FileDown,
      color: 'bg-green-500',
      path: '/teacher/export'
    },
    {
      title: 'Talent Scout',
      description: 'Find top performers',
      icon: Trophy,
      color: 'bg-amber-500',
      path: '/teacher/talent-scout'
    },
    {
      title: 'Sports Day',
      description: 'Generate competition lists',
      icon: Medal,
      color: 'bg-purple-500',
      path: '/teacher/sports-day'
    }
  ]

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-scindia-primary text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full p-1">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/en/thumb/8/8e/The_Scindia_School_Logo.svg/1200px-The_Scindia_School_Logo.svg.png"
                  alt="Logo"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.target.onerror = null
                    e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="%231e3a5f"/><text x="50" y="55" font-size="14" fill="white" text-anchor="middle">SS</text></svg>'
                  }}
                />
              </div>
              <div>
                <h1 className="text-xl font-bold">FitSchool Pro</h1>
                <p className="text-xs text-scindia-secondary">Teacher Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm hidden sm:block">{user?.name}</span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:block">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-scindia-primary to-scindia-dark rounded-2xl p-6 text-white mb-6">
          <h2 className="text-2xl font-bold mb-1">Welcome, {user?.name}!</h2>
          <p className="text-slate-300">Ready to conduct Khelo India fitness assessments?</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {quickActions.map((action) => (
            <button
              key={action.path}
              onClick={() => navigate(action.path)}
              className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all text-left"
            >
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{action.title}</h3>
                  <p className="text-sm text-gray-500">{action.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Classes Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">My Classes</h2>
            <button
              onClick={() => navigate('/teacher/classes')}
              className="text-scindia-primary text-sm font-medium hover:underline"
            >
              Manage All →
            </button>
          </div>

          {classes.length === 0 ? (
            <div className="bg-white rounded-xl p-8 shadow-sm text-center">
              <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No classes created yet.</p>
              <button
                onClick={() => navigate('/teacher/classes')}
                className="mt-4 px-4 py-2 bg-scindia-primary text-white rounded-lg hover:bg-scindia-dark transition-colors"
              >
                Create First Class
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {classes.map((cls) => {
                const classStudents = getStudentsByClass(cls.id)
                const testedCount = classStudents.filter(s => s.scores?.height).length

                return (
                  <div key={cls.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-bold text-gray-800">{cls.name}</h3>
                        <span className="text-xs text-gray-500">{cls.academicYear}</span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{classStudents.length} students</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Activity className="w-4 h-4" />
                          <span>{testedCount} tested</span>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all"
                          style={{ width: `${classStudents.length > 0 ? (testedCount / classStudents.length) * 100 : 0}%` }}
                        />
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => navigate(`/teacher/test/${cls.id}`)}
                          className="flex items-center justify-center gap-1 px-3 py-2 bg-scindia-primary text-white rounded-lg text-sm hover:bg-scindia-dark transition-colors"
                        >
                          <ClipboardList className="w-4 h-4" />
                          Test Entry
                        </button>
                        <button
                          onClick={() => navigate(`/teacher/stopwatch/${cls.id}`)}
                          className="flex items-center justify-center gap-1 px-3 py-2 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600 transition-colors"
                        >
                          <Timer className="w-4 h-4" />
                          Stopwatch
                        </button>
                        <button
                          onClick={() => navigate(`/teacher/rapid-entry/${cls.id}`)}
                          className="flex items-center justify-center gap-1 px-3 py-2 bg-purple-500 text-white rounded-lg text-sm hover:bg-purple-600 transition-colors"
                        >
                          <Zap className="w-4 h-4" />
                          Rapid Fire
                        </button>
                        <button
                          onClick={() => navigate(`/teacher/reports/${cls.id}`)}
                          className="flex items-center justify-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors"
                        >
                          <FileText className="w-4 h-4" />
                          Reports
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Stats Overview */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Today's Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <p className="text-3xl font-bold text-scindia-primary">{students.length}</p>
              <p className="text-sm text-gray-500">Total Students</p>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <p className="text-3xl font-bold text-green-600">
                {students.filter(s => s.scores?.height).length}
              </p>
              <p className="text-sm text-gray-500">Tests Completed</p>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <p className="text-3xl font-bold text-amber-600">{classes.length}</p>
              <p className="text-sm text-gray-500">Active Classes</p>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <p className="text-3xl font-bold text-purple-600">
                {students.length > 0 
                  ? Math.round((students.filter(s => s.scores?.height).length / students.length) * 100)
                  : 0}%
              </p>
              <p className="text-sm text-gray-500">Completion Rate</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
