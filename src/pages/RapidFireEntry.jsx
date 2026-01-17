import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useData } from '../context/DataContext'
import { 
  ArrowLeft, 
  Play,
  Pause,
  RotateCcw,
  Check,
  ChevronRight,
  Timer,
  Delete
} from 'lucide-react'

export default function RapidFireEntry() {
  const navigate = useNavigate()
  const { classId } = useParams()
  const { getStudentsByClass, getClassById, updateStudentScores } = useData()
  
  const classInfo = getClassById(classId)
  const students = getStudentsByClass(classId)
  
  const [currentIndex, setCurrentIndex] = useState(0)
  const [testType, setTestType] = useState('partialCurlUps')
  const [score, setScore] = useState('')
  const [timeLeft, setTimeLeft] = useState(60)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [savedScores, setSavedScores] = useState({})
  const [showAnimation, setShowAnimation] = useState(false)
  
  const inputRef = useRef(null)
  const intervalRef = useRef(null)

  const currentStudent = students[currentIndex]

  const testOptions = [
    { value: 'partialCurlUps', label: 'Partial Curl-ups', unit: 'reps' },
    { value: 'pushUps', label: 'Push-ups', unit: 'reps' },
    { value: 'sitAndReach', label: 'Sit & Reach', unit: 'cm' },
    { value: 'flamingoBalance', label: 'Flamingo Balance', unit: 'sec' },
    { value: 'plateTapping', label: 'Plate Tapping', unit: 'sec' }
  ]

  const selectedTest = testOptions.find(t => t.value === testType)

  // Timer logic
  useEffect(() => {
    if (isTimerRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsTimerRunning(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    
    return () => clearInterval(intervalRef.current)
  }, [isTimerRunning, timeLeft])

  // Focus input on mount and index change
  useEffect(() => {
    inputRef.current?.focus()
  }, [currentIndex])

  const startTimer = () => {
    setTimeLeft(60)
    setIsTimerRunning(true)
  }

  const pauseTimer = () => {
    setIsTimerRunning(false)
  }

  const resetTimer = () => {
    setIsTimerRunning(false)
    setTimeLeft(60)
  }

  const handleKeypadInput = useCallback((value) => {
    if (value === 'clear') {
      setScore('')
    } else if (value === 'backspace') {
      setScore(prev => prev.slice(0, -1))
    } else if (value === 'enter') {
      handleSaveAndNext()
    } else {
      setScore(prev => {
        if (prev.length >= 5) return prev
        if (value === '.' && prev.includes('.')) return prev
        return prev + value
      })
    }
  }, [score, currentIndex])

  const handleSaveAndNext = () => {
    if (!score || !currentStudent) return

    // Save score
    updateStudentScores(currentStudent.id, {
      [testType]: parseFloat(score)
    })

    // Track locally for visual feedback
    setSavedScores(prev => ({
      ...prev,
      [currentStudent.id]: parseFloat(score)
    }))

    // Animation
    setShowAnimation(true)
    setTimeout(() => setShowAnimation(false), 300)

    // Clear and move to next
    setScore('')
    
    if (currentIndex < students.length - 1) {
      setCurrentIndex(prev => prev + 1)
    }
  }

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key >= '0' && e.key <= '9') {
        handleKeypadInput(e.key)
      } else if (e.key === '.') {
        handleKeypadInput('.')
      } else if (e.key === 'Enter') {
        handleKeypadInput('enter')
      } else if (e.key === 'Backspace') {
        handleKeypadInput('backspace')
      } else if (e.key === 'Escape') {
        handleKeypadInput('clear')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeypadInput])

  if (!classInfo) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Class not found</p>
          <button onClick={() => navigate('/teacher')} className="mt-4 px-4 py-2 bg-scindia-primary text-white rounded-lg">
            Go Back
          </button>
        </div>
      </div>
    )
  }

  if (students.length === 0) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <p>No students in this class.</p>
          <button onClick={() => navigate('/teacher')} className="mt-4 px-4 py-2 bg-scindia-primary rounded-lg">
            Go Back
          </button>
        </div>
      </div>
    )
  }

  const timerColor = timeLeft > 30 ? 'text-green-400' : timeLeft > 10 ? 'text-yellow-400' : 'text-red-400'
  const progress = ((students.length - currentIndex - 1) / students.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur text-white">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/teacher')}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-lg font-bold">Rapid Fire Entry</h1>
                <p className="text-xs text-purple-300">{classInfo.name}</p>
              </div>
            </div>
            <select
              value={testType}
              onChange={(e) => setTestType(e.target.value)}
              className="bg-white/10 text-white px-3 py-2 rounded-lg text-sm border border-white/20"
            >
              {testOptions.map(opt => (
                <option key={opt.value} value={opt.value} className="text-gray-800">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {/* Timer */}
        <div className="bg-black/30 backdrop-blur rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-white/70">
              <Timer className="w-5 h-5" />
              <span className="text-sm">Countdown Timer</span>
            </div>
            <div className="flex gap-2">
              {!isTimerRunning ? (
                <button
                  onClick={startTimer}
                  className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                >
                  <Play className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={pauseTimer}
                  className="p-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors"
                >
                  <Pause className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={resetTimer}
                className="p-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className={`text-7xl font-mono font-bold text-center ${timerColor}`}>
            {String(Math.floor(timeLeft / 60)).padStart(2, '0')}:{String(timeLeft % 60).padStart(2, '0')}
          </div>
        </div>

        {/* Current Student Card */}
        <div className={`bg-white rounded-2xl p-6 mb-6 transition-all ${showAnimation ? 'slide-in-right' : ''}`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500">Student {currentIndex + 1} of {students.length}</p>
              <h2 className="text-2xl font-bold text-gray-800">{currentStudent?.name}</h2>
              <p className="text-gray-500">Roll: {currentStudent?.rollNo}</p>
            </div>
            {savedScores[currentStudent?.id] !== undefined && (
              <div className="flex items-center gap-1 text-green-600">
                <Check className="w-5 h-5" />
                <span className="text-sm font-medium">Saved</span>
              </div>
            )}
          </div>

          {/* Score Display */}
          <div className="bg-slate-100 rounded-xl p-6 text-center mb-4">
            <p className="text-sm text-gray-500 mb-2">{selectedTest?.label}</p>
            <div className="text-5xl font-bold text-scindia-primary h-16 flex items-center justify-center">
              {score || '—'}
            </div>
            <p className="text-sm text-gray-400 mt-2">{selectedTest?.unit}</p>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all"
              style={{ width: `${100 - progress}%` }}
            />
          </div>
        </div>

        {/* Numeric Keypad */}
        <div className="bg-white rounded-2xl p-4">
          <div className="grid grid-cols-3 gap-3">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'backspace'].map((key) => (
              <button
                key={key}
                onClick={() => handleKeypadInput(key)}
                className={`h-16 rounded-xl font-bold text-2xl transition-all active:scale-95 ${
                  key === 'backspace'
                    ? 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    : 'bg-slate-100 text-gray-800 hover:bg-slate-200'
                }`}
              >
                {key === 'backspace' ? <Delete className="w-6 h-6 mx-auto" /> : key}
              </button>
            ))}
          </div>

          {/* Action Row */}
          <div className="grid grid-cols-2 gap-3 mt-3">
            <button
              onClick={() => handleKeypadInput('clear')}
              className="h-14 bg-red-100 text-red-600 rounded-xl font-semibold hover:bg-red-200 transition-colors"
            >
              Clear
            </button>
            <button
              onClick={handleSaveAndNext}
              disabled={!score}
              className="h-14 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              Save & Next
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="mt-6 flex flex-wrap gap-2 justify-center">
          {students.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => {
                setCurrentIndex(idx)
                setScore('')
              }}
              className={`w-10 h-10 rounded-lg font-medium text-sm transition-all ${
                idx === currentIndex
                  ? 'bg-purple-500 text-white'
                  : savedScores[s.id] !== undefined
                  ? 'bg-green-500 text-white'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {s.rollNo}
            </button>
          ))}
        </div>
      </main>

      {/* Hidden input for keyboard focus */}
      <input
        ref={inputRef}
        type="text"
        className="absolute opacity-0 pointer-events-none"
        tabIndex={-1}
      />
    </div>
  )
}
