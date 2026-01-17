import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { 
  Users, 
  BarChart3, 
  UserPlus, 
  LogOut, 
  GraduationCap,
  Activity,
  TrendingUp,
  School
} from 'lucide-react'
import { Bar, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { getGlobalStats, students, classes } = useData()

  const stats = getGlobalStats()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // BMI Distribution Chart Data
  const bmiCategories = {
    underweight: students.filter(s => s.scores?.bmi && s.scores.bmi < 18.5).length,
    normal: students.filter(s => s.scores?.bmi && s.scores.bmi >= 18.5 && s.scores.bmi < 25).length,
    overweight: students.filter(s => s.scores?.bmi && s.scores.bmi >= 25 && s.scores.bmi < 30).length,
    obese: students.filter(s => s.scores?.bmi && s.scores.bmi >= 30).length
  }

  const bmiChartData = {
    labels: ['Underweight', 'Normal', 'Overweight', 'Obese'],
    datasets: [{
      data: [bmiCategories.underweight, bmiCategories.normal, bmiCategories.overweight, bmiCategories.obese],
      backgroundColor: ['#60a5fa', '#34d399', '#fbbf24', '#f87171'],
      borderWidth: 0
    }]
  }

  // Students per class chart
  const classChartData = {
    labels: classes.map(c => c.name),
    datasets: [{
      label: 'Students',
      data: classes.map(c => students.filter(s => s.classId === c.id).length),
      backgroundColor: '#1e3a5f',
      borderRadius: 8
    }]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  }

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
                <p className="text-xs text-scindia-secondary">Admin Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm hidden sm:block">Welcome, {user?.name}</span>
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
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-scindia-primary to-scindia-dark rounded-2xl p-6 text-white mb-6">
          <div className="flex items-center gap-4">
            <School className="w-12 h-12 text-scindia-secondary" />
            <div>
              <h2 className="text-2xl font-bold">THE SCINDIA SCHOOL</h2>
              <p className="text-scindia-secondary">Control Center - Khelo India Fitness Management</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Students</p>
                <p className="text-2xl font-bold text-gray-800">{stats.totalStudents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Tested</p>
                <p className="text-2xl font-bold text-gray-800">{stats.testedStudents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Avg BMI</p>
                <p className="text-2xl font-bold text-gray-800">{stats.avgBMI}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Teachers</p>
                <p className="text-2xl font-bold text-gray-800">{stats.totalTeachers}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => navigate('/admin/teachers')}
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all flex items-center gap-4 text-left"
          >
            <div className="w-14 h-14 bg-scindia-primary rounded-xl flex items-center justify-center">
              <UserPlus className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Manage Teachers</h3>
              <p className="text-sm text-gray-500">Add, edit, or remove PE staff accounts</p>
            </div>
          </button>

          <div className="bg-white rounded-xl p-6 shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 bg-green-600 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Global Analytics</h3>
              <p className="text-sm text-gray-500">View school-wide fitness reports</p>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">BMI Distribution</h3>
            <div className="h-64">
              <Doughnut data={bmiChartData} options={chartOptions} />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Students per Class</h3>
            <div className="h-64">
              <Bar data={classChartData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl p-6 shadow-sm mt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Tests</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b">
                  <th className="pb-3 text-sm font-medium text-gray-500">Student</th>
                  <th className="pb-3 text-sm font-medium text-gray-500">Class</th>
                  <th className="pb-3 text-sm font-medium text-gray-500">BMI</th>
                  <th className="pb-3 text-sm font-medium text-gray-500">Test Date</th>
                </tr>
              </thead>
              <tbody>
                {students.slice(0, 5).map((student) => {
                  const studentClass = classes.find(c => c.id === student.classId)
                  return (
                    <tr key={student.id} className="border-b last:border-0">
                      <td className="py-3">
                        <p className="font-medium text-gray-800">{student.name}</p>
                        <p className="text-xs text-gray-500">Roll: {student.rollNo}</p>
                      </td>
                      <td className="py-3 text-gray-600">{studentClass?.name || '-'}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          student.scores?.bmi < 18.5 ? 'bg-blue-100 text-blue-700' :
                          student.scores?.bmi < 25 ? 'bg-green-100 text-green-700' :
                          student.scores?.bmi < 30 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {student.scores?.bmi || '-'}
                        </span>
                      </td>
                      <td className="py-3 text-gray-600">{student.testDate || '-'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
