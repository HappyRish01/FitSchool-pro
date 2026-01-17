import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useData } from '../context/DataContext'
import { 
  ArrowLeft, 
  Play, 
  Square, 
  Save,
  Timer,
  Users,
  Check,
  RotateCcw
} from 'lucide-react'

export default function MultiLaneStopwatch() {
  const navigate = useNavigate()
  const { classId } = useParams()
  const { getStudentsByClass, getClassById, updateStudentsBatch } = useData()
  
  const classInfo = getClassById(classId)
  const allStudents = getStudentsByClass(classId)
  
  const [selectedStudents, setSelectedStudents] = useState([])
  const [selectionComplete, setSelectionComplete] = useState(false)
  const [lanes, setLanes] = useState([])
  const [isRunning, setIsRunning] = useState(false)
  const [masterTime, setMasterTime] = useState(0)
  const [saved, setSaved] = useState(false)
  const [testType, setTestType] = useState('dash50m')
  
  const intervalRef = useRef(null)
  const startTimeRef = useRef(null)

  // Initialize lanes with selected students (max 8) when selection is complete
  useEffect(() => {
    if (selectionComplete) {
      const initialLanes = selectedStudents.slice(0, 8).map((student, idx) => ({
        lane: idx + 1,
        student: student,
        time: null,
        stopped: false
      }))
      setLanes(initialLanes)
    }
  }, [selectedStudents, selectionComplete])

  const proceedToRace = () => {
    if (selectedStudents.length === 0) {
      alert('Please select at least one student!')
      return
    }
    setSelectionComplete(true)
  }

  const goBackToSelection = () => {
    resetAll()
    setSelectionComplete(false)
  }

  const formatTime = useCallback((ms) => {
    if (ms === null) return '--:--:--'
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    const centiseconds = Math.floor((ms % 1000) / 10)
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}:${String(centiseconds).padStart(2, '0')}`
  }, [])

  const startMaster = () => {
    if (lanes.length === 0) {
      alert('Please select students first!')
      return
    }
    
    setIsRunning(true)
    setSaved(false)
    startTimeRef.current = Date.now()
    
    intervalRef.current = setInterval(() => {
      setMasterTime(Date.now() - startTimeRef.current)
    }, 10)
  }

  const stopLane = (laneIndex) => {
    if (!isRunning) return
    
    setLanes(prev => prev.map((lane, idx) => {
      if (idx === laneIndex && !lane.stopped) {
        return { ...lane, time: masterTime, stopped: true }
      }
      return lane
    }))
  }

  const resetAll = () => {
    clearInterval(intervalRef.current)
    setIsRunning(false)
    setMasterTime(0)
    setSaved(false)
    setLanes(prev => prev.map(lane => ({ ...lane, time: null, stopped: false })))
  }

  const saveBatch = () => {
    const updates = lanes
      .filter(lane => lane.time !== null)
      .map(lane => ({
        id: lane.student.id,
        scores: {
          [testType]: (lane.time / 1000).toFixed(2) // Convert to seconds
        }
      }))
    
    if (updates.length > 0) {
      updateStudentsBatch(updates)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
  }

  const toggleStudent = (student) => {
    setSelectedStudents(prev => {
      const exists = prev.find(s => s.id === student.id)
      if (exists) {
        return prev.filter(s => s.id !== student.id)
      }
      if (prev.length >= 8) {
        alert('Maximum 8 lanes allowed!')
        return prev
      }
      return [...prev, student]
    })
  }

  const allStopped = lanes.length > 0 && lanes.every(lane => lane.stopped)

  // Auto-stop master timer when all lanes are stopped
  useEffect(() => {
    if (allStopped && isRunning) {
      clearInterval(intervalRef.current)
      setIsRunning(false)
    }
  }, [allStopped, isRunning])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

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

  return (
    <div className="min-h-screen bg-slate-900">
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
                <h1 className="text-xl font-bold">Multi-Lane Stopwatch</h1>
                <p className="text-xs text-scindia-secondary">{classInfo.name}</p>
              </div>
            </div>
            <select
              value={testType}
              onChange={(e) => setTestType(e.target.value)}
              className="bg-white/10 text-white px-3 py-2 rounded-lg text-sm"
            >
              <option value="dash50m" className="text-gray-800">50m Dash</option>
              <option value="run600m" className="text-gray-800">600m Run</option>
            </select>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {!selectionComplete ? (
          // Student Selection
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Users className="w-6 h-6" />
              Select Students (Max 8 Lanes)
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {allStudents.map((student) => (
                <button
                  key={student.id}
                  onClick={() => toggleStudent(student)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    selectedStudents.find(s => s.id === student.id)
                      ? 'border-scindia-primary bg-scindia-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="font-semibold text-gray-800">{student.name}</p>
                  <p className="text-sm text-gray-500">Roll: {student.rollNo}</p>
                </button>
              ))}
            </div>
            {selectedStudents.length > 0 && (
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-gray-600">Selected ({selectedStudents.length}/8):</span>
                  {selectedStudents.map((s, idx) => (
                    <span key={s.id} className="px-2 py-1 bg-scindia-primary/10 text-scindia-primary rounded text-sm font-medium">
                      Lane {idx + 1}: {s.name}
                    </span>
                  ))}
                </div>
                <button
                  onClick={proceedToRace}
                  className="px-6 py-3 bg-scindia-primary text-white rounded-lg font-semibold hover:bg-scindia-dark transition-colors"
                >
                  Proceed to Race with {selectedStudents.length} Student{selectedStudents.length > 1 ? 's' : ''} →
                </button>
              </div>
            )}
          </div>
        ) : (
          // Stopwatch View
          <>
            {/* Master Timer */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 mb-6 text-center">
              <div className="text-6xl md:text-8xl font-mono font-bold text-white mb-6">
                {formatTime(masterTime)}
              </div>
              
              <div className="flex items-center justify-center gap-4">
                {!isRunning && !allStopped && (
                  <button
                    onClick={startMaster}
                    className="flex items-center gap-2 px-8 py-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-xl transition-colors"
                  >
                    <Play className="w-6 h-6" />
                    MASTER START
                  </button>
                )}
                
                <button
                  onClick={resetAll}
                  className="flex items-center gap-2 px-6 py-4 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-semibold transition-colors"
                >
                  <RotateCcw className="w-5 h-5" />
                  Reset All
                </button>

                {allStopped && (
                  <button
                    onClick={saveBatch}
                    className={`flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-xl transition-colors ${
                      saved 
                        ? 'bg-green-500 text-white' 
                        : 'bg-scindia-secondary hover:bg-yellow-500 text-gray-900'
                    }`}
                  >
                    {saved ? (
                      <>
                        <Check className="w-6 h-6" />
                        Saved!
                      </>
                    ) : (
                      <>
                        <Save className="w-6 h-6" />
                        Save Batch
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Lane Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {lanes.map((lane, idx) => (
                <div
                  key={lane.student.id}
                  className={`rounded-xl p-4 transition-all ${
                    lane.stopped 
                      ? 'bg-green-500' 
                      : isRunning 
                      ? 'bg-orange-500 animate-pulse' 
                      : 'bg-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl font-bold text-white">Lane {lane.lane}</span>
                    <Timer className="w-5 h-5 text-white/70" />
                  </div>
                  
                  <p className="text-white font-semibold mb-1">{lane.student.name}</p>
                  <p className="text-white/70 text-sm mb-4">Roll: {lane.student.rollNo}</p>
                  
                  <div className="text-3xl font-mono font-bold text-white mb-4">
                    {lane.stopped ? formatTime(lane.time) : formatTime(isRunning ? masterTime : 0)}
                  </div>
                  
                  <button
                    onClick={() => stopLane(idx)}
                    disabled={!isRunning || lane.stopped}
                    className={`w-full py-3 rounded-lg font-bold text-lg transition-all ${
                      lane.stopped
                        ? 'bg-white/30 text-white cursor-not-allowed'
                        : isRunning
                        ? 'bg-red-600 hover:bg-red-700 text-white active:scale-95'
                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {lane.stopped ? (
                      <span className="flex items-center justify-center gap-2">
                        <Check className="w-5 h-5" />
                        STOPPED
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <Square className="w-5 h-5" />
                        STOP
                      </span>
                    )}
                  </button>
                </div>
              ))}
            </div>

            {/* Change Selection */}
            <button
              onClick={goBackToSelection}
              className="mt-6 w-full py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Change Student Selection
            </button>
          </>
        )}
      </main>
    </div>
  )
}
