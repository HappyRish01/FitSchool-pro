import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useData } from '../context/DataContext'
import { 
  ArrowLeft, 
  Save, 
  User, 
  ChevronLeft, 
  ChevronRight,
  Check,
  Calculator,
  Activity
} from 'lucide-react'

export default function TestEngine() {
  const navigate = useNavigate()
  const { classId } = useParams()
  const { getStudentsByClass, getClassById, updateStudentScores } = useData()
  
  const classInfo = getClassById(classId)
  const students = getStudentsByClass(classId)
  
  const [currentIndex, setCurrentIndex] = useState(0)
  const [scores, setScores] = useState({})
  const [saved, setSaved] = useState(false)

  const currentStudent = students[currentIndex]
  const isJunior = currentStudent?.age && currentStudent.age < 9

  // Junior Tests (Age 5-8)
  const juniorTests = [
    { key: 'height', label: 'Height', unit: 'cm', type: 'number', step: '0.1' },
    { key: 'weight', label: 'Weight', unit: 'kg', type: 'number', step: '0.1' },
    { key: 'flamingoBalance', label: 'Flamingo Balance', unit: 'sec', type: 'number', step: '0.1' },
    { key: 'plateTapping', label: 'Plate Tapping', unit: 'sec', type: 'number', step: '0.01' }
  ]

  // Senior Tests (Age 9+)
  const seniorTests = [
    { key: 'height', label: 'Height', unit: 'cm', type: 'number', step: '0.1' },
    { key: 'weight', label: 'Weight', unit: 'kg', type: 'number', step: '0.1' },
    { key: 'dash50m', label: '50m Dash', unit: 'sec', type: 'number', step: '0.01' },
    { key: 'run600m', label: '600m Run', unit: 'sec', type: 'number', step: '1' },
    { key: 'sitAndReach', label: 'Sit & Reach', unit: 'cm', type: 'number', step: '0.5' },
    { key: 'partialCurlUps', label: 'Partial Curl-ups', unit: 'reps', type: 'number', step: '1' },
    { key: 'pushUps', label: 'Push-ups', unit: 'reps', type: 'number', step: '1' }
  ]

  const activeTests = isJunior ? juniorTests : seniorTests

  useEffect(() => {
    if (currentStudent) {
      setScores(currentStudent.scores || {})
      setSaved(false)
    }
  }, [currentIndex, currentStudent])

  // Auto-calculate BMI
  useEffect(() => {
    if (scores.height && scores.weight) {
      const heightM = parseFloat(scores.height) / 100
      const weightKg = parseFloat(scores.weight)
      if (heightM > 0 && weightKg > 0) {
        const bmi = (weightKg / (heightM * heightM)).toFixed(1)
        setScores(prev => ({ ...prev, bmi: parseFloat(bmi) }))
      }
    }
  }, [scores.height, scores.weight])

  const handleScoreChange = (key, value) => {
    setScores(prev => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  const handleSave = () => {
    if (currentStudent) {
      updateStudentScores(currentStudent.id, scores)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  const goNext = () => {
    if (currentIndex < students.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const getBMIStatus = (bmi) => {
    if (!bmi) return { label: '-', color: 'text-gray-400' }
    if (bmi < 18.5) return { label: 'Underweight', color: 'text-blue-600' }
    if (bmi < 25) return { label: 'Normal', color: 'text-green-600' }
    if (bmi < 30) return { label: 'Overweight', color: 'text-yellow-600' }
    return { label: 'Obese', color: 'text-red-600' }
  }

  if (!classInfo) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Class not found</p>
          <button
            onClick={() => navigate('/teacher')}
            className="mt-4 px-4 py-2 bg-scindia-primary text-white rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  if (students.length === 0) {
    return (
      <div className="min-h-screen bg-slate-100">
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
                <h1 className="text-xl font-bold">Test Engine</h1>
                <p className="text-xs text-scindia-secondary">{classInfo.name}</p>
              </div>
            </div>
          </div>
        </header>
        <main className="max-w-2xl mx-auto px-4 py-12 text-center">
          <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No students in this class.</p>
          <button
            onClick={() => navigate('/teacher/classes')}
            className="mt-4 px-4 py-2 bg-scindia-primary text-white rounded-lg"
          >
            Add Students
          </button>
        </main>
      </div>
    )
  }

  const bmiStatus = getBMIStatus(scores.bmi)

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-scindia-primary text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/teacher')}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold">Khelo India Test</h1>
                <p className="text-xs text-scindia-secondary">
                  {classInfo.name} • {isJunior ? 'Junior (5-8 yrs)' : 'Senior (9+ yrs)'}
                </p>
              </div>
            </div>
            <div className="text-sm">
              {currentIndex + 1} / {students.length}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Student Info Card */}
        <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-scindia-primary rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-800">{currentStudent.name}</h2>
              <div className="flex flex-wrap gap-3 text-sm text-gray-500 mt-1">
                <span>Roll: {currentStudent.rollNo}</span>
                <span>Age: {currentStudent.age}</span>
                <span>{currentStudent.gender}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  currentStudent.house === 'Jayaji' ? 'bg-red-100 text-red-700' :
                  currentStudent.house === 'Madhav' ? 'bg-blue-100 text-blue-700' :
                  currentStudent.house === 'Shivaji' ? 'bg-green-100 text-green-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {currentStudent.house}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* BMI Display */}
        {scores.bmi && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calculator className="w-6 h-6 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Auto-Calculated BMI</p>
                <p className="text-2xl font-bold text-gray-800">{scores.bmi}</p>
              </div>
            </div>
            <div className={`px-4 py-2 rounded-lg font-semibold ${bmiStatus.color} bg-white shadow-sm`}>
              {bmiStatus.label}
            </div>
          </div>
        )}

        {/* Test Inputs */}
        <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">
            {isJunior ? 'Junior Tests (Khelo India)' : 'Senior Tests (Khelo India)'}
          </h3>
          
          <div className="space-y-4">
            {activeTests.map((test) => (
              <div key={test.key} className="flex items-center gap-4">
                <label className="w-1/3 text-gray-700 font-medium">
                  {test.label}
                </label>
                <div className="flex-1 relative">
                  <input
                    type={test.type}
                    value={scores[test.key] || ''}
                    onChange={(e) => handleScoreChange(test.key, e.target.value)}
                    step={test.step}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-scindia-primary focus:border-transparent text-lg"
                    placeholder="Enter value"
                  />
                  <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                    {test.unit}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation & Save */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={goPrev}
            disabled={currentIndex === 0}
            className="flex items-center gap-1 px-4 py-3 bg-white border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Previous
          </button>

          <button
            onClick={handleSave}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              saved 
                ? 'bg-green-500 text-white' 
                : 'bg-scindia-primary text-white hover:bg-scindia-dark'
            }`}
          >
            {saved ? (
              <>
                <Check className="w-5 h-5" />
                Saved!
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save & Continue
              </>
            )}
          </button>

          <button
            onClick={goNext}
            disabled={currentIndex === students.length - 1}
            className="flex items-center gap-1 px-4 py-3 bg-white border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Student Quick Navigation */}
        <div className="mt-6 bg-white rounded-xl shadow-sm p-4">
          <p className="text-sm text-gray-500 mb-3">Quick Jump:</p>
          <div className="flex flex-wrap gap-2">
            {students.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => setCurrentIndex(idx)}
                className={`w-10 h-10 rounded-lg font-medium text-sm transition-all ${
                  idx === currentIndex
                    ? 'bg-scindia-primary text-white'
                    : s.scores?.height
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {s.rollNo}
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
