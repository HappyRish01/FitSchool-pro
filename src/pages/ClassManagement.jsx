import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useData } from '../context/DataContext'
import Papa from 'papaparse'
import { 
  ArrowLeft, 
  Plus, 
  Upload, 
  Users, 
  Trash2,
  FileSpreadsheet,
  X
} from 'lucide-react'

export default function ClassManagement() {
  const navigate = useNavigate()
  const { classes, students, addClass, addStudent, addStudentsBulk, getStudentsByClass } = useData()
  const [showAddClass, setShowAddClass] = useState(false)
  const [showAddStudent, setShowAddStudent] = useState(false)
  const [selectedClass, setSelectedClass] = useState(null)
  const [classForm, setClassForm] = useState({ name: '', grade: '', section: '', academicYear: '2025-26' })
  const [studentForm, setStudentForm] = useState({ name: '', rollNo: '', age: '', gender: 'Male', house: '' })
  const fileInputRef = useRef(null)

  const houses = ['Jayaji', 'Madhav', 'Shivaji', 'Ranoji']

  const handleAddClass = (e) => {
    e.preventDefault()
    addClass(classForm)
    setClassForm({ name: '', grade: '', section: '', academicYear: '2025-26' })
    setShowAddClass(false)
  }

  const handleAddStudent = (e) => {
    e.preventDefault()
    if (selectedClass) {
      addStudent({
        ...studentForm,
        classId: selectedClass.id,
        age: parseInt(studentForm.age)
      })
      setStudentForm({ name: '', rollNo: '', age: '', gender: 'Male', house: '' })
      setShowAddStudent(false)
    }
  }

  const handleCSVUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file || !selectedClass) return

    Papa.parse(file, {
      header: true,
      complete: (results) => {
        const studentsData = results.data
          .filter(row => row.name && row.rollNo)
          .map(row => ({
            name: row.name,
            rollNo: row.rollNo,
            age: parseInt(row.age) || 14,
            gender: row.gender || 'Male',
            house: row.house || houses[Math.floor(Math.random() * houses.length)]
          }))
        
        if (studentsData.length > 0) {
          addStudentsBulk(studentsData, selectedClass.id)
          alert(`Successfully imported ${studentsData.length} students!`)
        }
      },
      error: (error) => {
        alert('Error parsing CSV: ' + error.message)
      }
    })

    e.target.value = ''
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-scindia-primary text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/teacher')}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold">Class Management</h1>
              <p className="text-xs text-scindia-secondary">Create & manage student classes</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Classes List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
              <button
                onClick={() => setShowAddClass(true)}
                className="w-full flex items-center justify-center gap-2 bg-scindia-primary hover:bg-scindia-dark text-white py-3 rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5" />
                Create New Class
              </button>
            </div>

            <div className="space-y-3">
              {classes.map((cls) => {
                const count = getStudentsByClass(cls.id).length
                return (
                  <button
                    key={cls.id}
                    onClick={() => setSelectedClass(cls)}
                    className={`w-full text-left bg-white rounded-xl shadow-sm p-4 transition-all ${
                      selectedClass?.id === cls.id 
                        ? 'ring-2 ring-scindia-primary' 
                        : 'hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-800">{cls.name}</h3>
                        <p className="text-sm text-gray-500">{cls.academicYear}</p>
                      </div>
                      <div className="flex items-center gap-1 text-gray-500">
                        <Users className="w-4 h-4" />
                        <span className="text-sm">{count}</span>
                      </div>
                    </div>
                  </button>
                )
              })}

              {classes.length === 0 && (
                <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                  <p className="text-gray-500">No classes yet. Create one to get started!</p>
                </div>
              )}
            </div>
          </div>

          {/* Students List */}
          <div className="lg:col-span-2">
            {selectedClass ? (
              <div className="bg-white rounded-xl shadow-sm">
                <div className="p-4 border-b flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-gray-800">{selectedClass.name}</h2>
                    <p className="text-sm text-gray-500">
                      {getStudentsByClass(selectedClass.id).length} students
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowAddStudent(true)}
                      className="flex items-center gap-1 px-3 py-2 bg-scindia-primary text-white rounded-lg text-sm hover:bg-scindia-dark transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add Student
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      Import CSV
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv"
                      onChange={handleCSVUpload}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* CSV Template Info */}
                <div className="px-4 py-3 bg-blue-50 border-b">
                  <div className="flex items-start gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-blue-800">CSV Format:</p>
                      <p className="text-blue-600">name, rollNo, age, gender, house</p>
                    </div>
                  </div>
                </div>

                {/* Student Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="text-left p-4 text-sm font-medium text-gray-600">Roll</th>
                        <th className="text-left p-4 text-sm font-medium text-gray-600">Name</th>
                        <th className="text-left p-4 text-sm font-medium text-gray-600">Age</th>
                        <th className="text-left p-4 text-sm font-medium text-gray-600">Gender</th>
                        <th className="text-left p-4 text-sm font-medium text-gray-600">House</th>
                        <th className="text-left p-4 text-sm font-medium text-gray-600">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getStudentsByClass(selectedClass.id).map((student) => (
                        <tr key={student.id} className="border-t hover:bg-slate-50">
                          <td className="p-4 font-medium text-gray-800">{student.rollNo}</td>
                          <td className="p-4 text-gray-700">{student.name}</td>
                          <td className="p-4 text-gray-600">{student.age}</td>
                          <td className="p-4 text-gray-600">{student.gender}</td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              student.house === 'Jayaji' ? 'bg-red-100 text-red-700' :
                              student.house === 'Madhav' ? 'bg-blue-100 text-blue-700' :
                              student.house === 'Shivaji' ? 'bg-green-100 text-green-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {student.house}
                            </span>
                          </td>
                          <td className="p-4">
                            {student.scores?.height ? (
                              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                Tested
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                                Pending
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {getStudentsByClass(selectedClass.id).length === 0 && (
                    <div className="p-8 text-center">
                      <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No students in this class yet.</p>
                      <p className="text-sm text-gray-400">Add students manually or import from CSV.</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">Select a Class</h3>
                <p className="text-gray-400">Choose a class from the list to view and manage students.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Add Class Modal */}
      {showAddClass && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Create New Class</h2>
              <button onClick={() => setShowAddClass(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddClass} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Class Name</label>
                <input
                  type="text"
                  value={classForm.name}
                  onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-scindia-primary focus:border-transparent"
                  placeholder="e.g., Class 9-A"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
                  <input
                    type="text"
                    value={classForm.grade}
                    onChange={(e) => setClassForm({ ...classForm, grade: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-scindia-primary focus:border-transparent"
                    placeholder="9"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                  <input
                    type="text"
                    value={classForm.section}
                    onChange={(e) => setClassForm({ ...classForm, section: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-scindia-primary focus:border-transparent"
                    placeholder="A"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
                <select
                  value={classForm.academicYear}
                  onChange={(e) => setClassForm({ ...classForm, academicYear: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-scindia-primary focus:border-transparent"
                >
                  <option value="2025-26">2025-26</option>
                  <option value="2026-27">2026-27</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddClass(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-scindia-primary text-white rounded-lg hover:bg-scindia-dark"
                >
                  Create Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      {showAddStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Add Student</h2>
              <button onClick={() => setShowAddStudent(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddStudent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={studentForm.name}
                  onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-scindia-primary focus:border-transparent"
                  placeholder="Student name"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Roll No</label>
                  <input
                    type="text"
                    value={studentForm.rollNo}
                    onChange={(e) => setStudentForm({ ...studentForm, rollNo: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-scindia-primary focus:border-transparent"
                    placeholder="01"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                  <input
                    type="number"
                    value={studentForm.age}
                    onChange={(e) => setStudentForm({ ...studentForm, age: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-scindia-primary focus:border-transparent"
                    placeholder="14"
                    min="5"
                    max="20"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select
                    value={studentForm.gender}
                    onChange={(e) => setStudentForm({ ...studentForm, gender: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-scindia-primary focus:border-transparent"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">House</label>
                  <select
                    value={studentForm.house}
                    onChange={(e) => setStudentForm({ ...studentForm, house: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-scindia-primary focus:border-transparent"
                    required
                  >
                    <option value="">Select House</option>
                    {houses.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddStudent(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-scindia-primary text-white rounded-lg hover:bg-scindia-dark"
                >
                  Add Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
