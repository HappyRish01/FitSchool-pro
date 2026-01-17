import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useData } from '../context/DataContext'
import Papa from 'papaparse'
import {
  ArrowLeft,
  Medal,
  Flag,
  Users,
  Download,
  Trophy,
  Zap,
  Target,
  TrendingUp,
  Plus
} from 'lucide-react'

export default function SportsDayManager() {
  const navigate = useNavigate()
  const { students, classes } = useData()
  
  const [selectedEvent, setSelectedEvent] = useState('dash50m')
  const [finalistsPerHouse, setFinalistsPerHouse] = useState(2)
  const [showGeneratedList, setShowGeneratedList] = useState(false)

  const houses = ['Jayaji', 'Madhav', 'Shivaji', 'Ranoji']
  const houseColors = {
    Jayaji: { bg: 'bg-red-500', light: 'bg-red-100', text: 'text-red-700' },
    Madhav: { bg: 'bg-blue-500', light: 'bg-blue-100', text: 'text-blue-700' },
    Shivaji: { bg: 'bg-green-500', light: 'bg-green-100', text: 'text-green-700' },
    Ranoji: { bg: 'bg-yellow-500', light: 'bg-yellow-100', text: 'text-yellow-700' }
  }

  const events = [
    { value: 'dash50m', label: '50m Sprint', icon: Zap, order: 'asc', unit: 'sec' },
    { value: 'run600m', label: '600m Run', icon: TrendingUp, order: 'asc', unit: 'sec' },
    { value: 'pushUps', label: 'Push-ups', icon: Target, order: 'desc', unit: 'reps' },
    { value: 'partialCurlUps', label: 'Sit-ups', icon: Target, order: 'desc', unit: 'reps' },
    { value: 'sitAndReach', label: 'Flexibility', icon: Medal, order: 'desc', unit: 'cm' }
  ]

  const selectedEventInfo = events.find(e => e.value === selectedEvent)

  // Generate finalists for each house
  const finalistsByHouse = useMemo(() => {
    const result = {}

    houses.forEach(house => {
      // Filter students by house who have the event score
      const houseStudents = students.filter(s => 
        s.house === house && 
        s.scores && 
        s.scores[selectedEvent] !== undefined
      )

      // Sort by performance
      houseStudents.sort((a, b) => {
        const aVal = parseFloat(a.scores[selectedEvent])
        const bVal = parseFloat(b.scores[selectedEvent])
        
        if (selectedEventInfo?.order === 'asc') {
          return aVal - bVal
        }
        return bVal - aVal
      })

      // Take top N finalists
      result[house] = houseStudents.slice(0, finalistsPerHouse)
    })

    return result
  }, [students, selectedEvent, finalistsPerHouse, selectedEventInfo])

  // All finalists combined for the event
  const allFinalists = useMemo(() => {
    const combined = []
    houses.forEach(house => {
      finalistsByHouse[house]?.forEach(student => {
        combined.push({ ...student, house })
      })
    })

    // Sort all finalists
    combined.sort((a, b) => {
      const aVal = parseFloat(a.scores[selectedEvent])
      const bVal = parseFloat(b.scores[selectedEvent])
      
      if (selectedEventInfo?.order === 'asc') {
        return aVal - bVal
      }
      return bVal - aVal
    })

    return combined
  }, [finalistsByHouse, selectedEvent, selectedEventInfo])

  const exportFinalsList = () => {
    const data = []
    
    // By House format
    houses.forEach(house => {
      finalistsByHouse[house]?.forEach((student, idx) => {
        data.push({
          Event: selectedEventInfo?.label,
          House: house,
          Position: idx + 1,
          Name: student.name,
          RollNo: student.rollNo,
          Class: classes.find(c => c.id === student.classId)?.name || '-',
          Score: student.scores[selectedEvent],
          Unit: selectedEventInfo?.unit
        })
      })
    })

    const csv = Papa.unparse(data)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `SportsDay_${selectedEventInfo?.label.replace(/\s+/g, '_')}_Finals.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const getTotalParticipants = () => {
    return Object.values(finalistsByHouse).reduce((sum, arr) => sum + arr.length, 0)
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/teacher')}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <Flag className="w-8 h-8" />
              <div>
                <h1 className="text-xl font-bold">Sports Day Manager</h1>
                <p className="text-xs text-purple-200">Inter-House Competition Finals Generator</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Configuration */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-purple-600" />
            Generate Finals List
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Event Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Event</label>
              <select
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {events.map(e => (
                  <option key={e.value} value={e.value}>{e.label}</option>
                ))}
              </select>
            </div>

            {/* Finalists per house */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Finalists per House</label>
              <select
                value={finalistsPerHouse}
                onChange={(e) => setFinalistsPerHouse(parseInt(e.target.value))}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value={1}>1 per house</option>
                <option value={2}>2 per house</option>
                <option value={3}>3 per house</option>
                <option value={4}>4 per house</option>
                <option value={5}>5 per house</option>
              </select>
            </div>

            {/* Generate Button */}
            <div className="flex items-end">
              <button
                onClick={() => setShowGeneratedList(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
              >
                <Plus className="w-5 h-5" />
                Generate Finals List
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
            {houses.map(house => {
              const count = finalistsByHouse[house]?.length || 0
              const colors = houseColors[house]
              return (
                <div key={house} className={`${colors.light} rounded-lg p-4 text-center`}>
                  <p className={`text-sm ${colors.text}`}>{house}</p>
                  <p className="text-2xl font-bold text-gray-800">{count}</p>
                  <p className="text-xs text-gray-500">finalists</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Generated List */}
        {showGeneratedList && (
          <>
            {/* Export Button */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2 text-gray-600">
                <Users className="w-5 h-5" />
                <span>{getTotalParticipants()} total participants</span>
              </div>
              <button
                onClick={exportFinalsList}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                Export Finals List
              </button>
            </div>

            {/* House-wise Lists */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {houses.map(house => {
                const colors = houseColors[house]
                const houseFinalists = finalistsByHouse[house] || []

                return (
                  <div key={house} className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className={`${colors.bg} px-4 py-3 text-white`}>
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold">{house} House</h3>
                        <span className="text-sm opacity-80">{houseFinalists.length} finalists</span>
                      </div>
                    </div>
                    <div className="divide-y">
                      {houseFinalists.map((student, idx) => (
                        <div key={student.id} className="p-3 flex items-center gap-3">
                          <span className={`w-6 h-6 ${colors.light} ${colors.text} rounded-full flex items-center justify-center text-sm font-bold`}>
                            {idx + 1}
                          </span>
                          <div className="flex-1">
                            <p className="font-medium text-gray-800 text-sm">{student.name}</p>
                            <p className="text-xs text-gray-500">
                              Roll: {student.rollNo} • {student.scores[selectedEvent]} {selectedEventInfo?.unit}
                            </p>
                          </div>
                        </div>
                      ))}
                      {houseFinalists.length === 0 && (
                        <div className="p-4 text-center text-gray-400 text-sm">
                          No eligible students
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Combined Rankings */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b bg-gradient-to-r from-purple-50 to-indigo-50">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <Medal className="w-5 h-5 text-purple-600" />
                  {selectedEventInfo?.label} - All Finalists Ranked
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="text-left p-3 text-sm font-medium text-gray-600">Lane</th>
                      <th className="text-left p-3 text-sm font-medium text-gray-600">Name</th>
                      <th className="text-left p-3 text-sm font-medium text-gray-600">House</th>
                      <th className="text-left p-3 text-sm font-medium text-gray-600">Class</th>
                      <th className="text-left p-3 text-sm font-medium text-gray-600">Best Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allFinalists.map((student, idx) => {
                      const colors = houseColors[student.house]
                      const studentClass = classes.find(c => c.id === student.classId)

                      return (
                        <tr key={student.id} className="border-t hover:bg-slate-50">
                          <td className="p-3">
                            <span className="w-8 h-8 inline-flex items-center justify-center bg-purple-100 text-purple-700 rounded-full font-bold text-sm">
                              {idx + 1}
                            </span>
                          </td>
                          <td className="p-3">
                            <p className="font-medium text-gray-800">{student.name}</p>
                            <p className="text-xs text-gray-500">Roll: {student.rollNo}</p>
                          </td>
                          <td className="p-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${colors.light} ${colors.text}`}>
                              {student.house}
                            </span>
                          </td>
                          <td className="p-3 text-gray-600">{studentClass?.name || '-'}</td>
                          <td className="p-3">
                            <span className="text-lg font-bold text-purple-600">
                              {student.scores[selectedEvent]}
                            </span>
                            <span className="text-sm text-gray-500 ml-1">{selectedEventInfo?.unit}</span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>

                {allFinalists.length === 0 && (
                  <div className="p-12 text-center">
                    <Flag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No finalists available for this event.</p>
                    <p className="text-sm text-gray-400">Make sure students have been tested for {selectedEventInfo?.label}.</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Instructions */}
        {!showGeneratedList && (
          <div className="bg-purple-50 rounded-xl p-6 text-center">
            <Flag className="w-16 h-16 text-purple-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-purple-800 mb-2">Ready to Generate Finals List</h3>
            <p className="text-purple-600">
              Select an event and the number of finalists per house, then click "Generate Finals List" 
              to create the competition roster.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
