import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useData } from '../context/DataContext'
import { ArrowLeft, UserPlus, Trash2, Mail, User } from 'lucide-react'

export default function TeacherManagement() {
  const navigate = useNavigate()
  const { teachers, addTeacher, deleteTeacher } = useData()
  const [showAddModal, setShowAddModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    addTeacher(formData)
    setFormData({ name: '', email: '', username: '', password: '' })
    setShowAddModal(false)
  }

  const handleDelete = (teacherId) => {
    if (window.confirm('Are you sure you want to remove this teacher?')) {
      deleteTeacher(teacherId)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-scindia-primary text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin')}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold">Teacher Management</h1>
              <p className="text-xs text-scindia-secondary">Manage PE Staff Accounts</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Add Teacher Button */}
        <button
          onClick={() => setShowAddModal(true)}
          className="w-full bg-scindia-primary hover:bg-scindia-dark text-white rounded-xl p-4 mb-6 flex items-center justify-center gap-2 transition-colors"
        >
          <UserPlus className="w-5 h-5" />
          Add New Teacher
        </button>

        {/* Default Teacher */}
        <div className="bg-white rounded-xl shadow-sm mb-4 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-scindia-primary rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-800">Mr. Sharma</p>
                <p className="text-sm text-gray-500">sharma@scindia.edu</p>
                <p className="text-xs text-gray-400">Username: teacher (Default)</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
              Active
            </span>
          </div>
        </div>

        {/* Teacher List */}
        {teachers.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <UserPlus className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No additional teachers added yet.</p>
            <p className="text-sm text-gray-400">Click "Add New Teacher" to get started.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {teachers.map((teacher) => (
              <div key={teacher.id} className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{teacher.name}</p>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Mail className="w-3 h-3" />
                        {teacher.email}
                      </div>
                      <p className="text-xs text-gray-400">Username: {teacher.username}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(teacher.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add Teacher Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Add New Teacher</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-scindia-primary focus:border-transparent"
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-scindia-primary focus:border-transparent"
                  placeholder="teacher@scindia.edu"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-scindia-primary focus:border-transparent"
                  placeholder="Enter username"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-scindia-primary focus:border-transparent"
                  placeholder="Enter password"
                  required
                  minLength={6}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-scindia-primary text-white rounded-lg hover:bg-scindia-dark transition-colors"
                >
                  Add Teacher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
