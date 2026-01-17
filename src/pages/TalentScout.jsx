import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useData } from '../context/DataContext'
import Papa from 'papaparse'
import {
  ArrowLeft,
  Trophy,
  Medal,
  Filter,
  Download,
  Search,
  Zap,
  Target,
  TrendingUp,
  Users
} from 'lucide-react'

export default function TalentScout() {
  const navigate = useNavigate()
  const { students, classes } = useData()
  
  const [filterMetric, setFilterMetric] = useState('dash50m')
  const [filterHouse, setFilterHouse] = useState('all')
  const [filterGender, setFilterGender] = useState('all')
  const [topCount, setTopCount] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')

  const houses = ['Jayaji', 'Madhav', 'Shivaji', 'Ranoji']

  const metrics = [
    { value: 'dash50m', label: '50m Sprint (Fastest)', icon: Zap, order: 'asc', unit: 'sec' },
    { value: 'run600m', label: '600m Run (Fastest)', icon: TrendingUp, order: 'asc', unit: 'sec' },
    { value: 'pushUps', label: 'Push-ups (Most)', icon: Target, order: 'desc', unit: 'reps' },
    { value: 'partialCurlUps', label: 'Curl-ups (Most)', icon: Target, order: 'desc', unit: 'reps' },
    { value: 'sitAndReach', label: 'Flexibility (Best)', icon: Medal, order: 'desc', unit: 'cm' },
    { value: 'flamingoBalance', label: 'Balance (Best)', icon: Trophy, order: 'desc', unit: 'sec' }
  ]

  const selectedMetric = metrics.find(m => m.value === filterMetric)

  const filteredAndSortedStudents = useMemo(() => {
    let result = students.filter(s => {
      // Must have the metric score
      if (!s.scores || s.scores[filterMetric] === undefined) return false
      
      // House filter
      if (filterHouse !== 'all' && s.house !== filterHouse) return false
      
      // Gender filter
      if (filterGender !== 'all' && s.gender !== filterGender) return false
      
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return s.name.toLowerCase().includes(query) || s.rollNo.includes(query)
      }
      
      return true
    })

    // Sort based on metric
    result.sort((a, b) => {
      const aVal = parseFloat(a.scores[filterMetric])
      const bVal = parseFloat(b.scores[filterMetric])
      
      if (selectedMetric?.order === 'asc') {
        return aVal - bVal // Lower is better (time-based)
      }
      return bVal - aVal // Higher is better (count-based)
    })

    return result.slice(0, topCount)
  }, [students, filterMetric, filterHouse, filterGender, topCount, searchQuery, selectedMetric])

  const exportCSV = () => {
    const data = filteredAndSortedStudents.map((s, idx) => ({
      Rank: idx + 1,
      Name: s.name,
      RollNo: s.rollNo,
      Class: classes.find(c => c.id === s.classId)?.name || '-',
      House: s.house,
      Gender: s.gender,
      Score: s.scores[filterMetric],
      Unit: selectedMetric?.unit || ''
    }))

    const csv = Papa.unparse(data)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `TalentScout_${filterMetric}_Top${topCount}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const getRankBadge = (rank) => {
    if (rank === 1) return { bg: 'bg-yellow-400', text: 'text-yellow-900', icon: '🥇' }
    if (rank === 2) return { bg: 'bg-gray-300', text: 'text-gray-800', icon: '🥈' }
    if (rank === 3) return { bg: 'bg-amber-600', text: 'text-white', icon: '🥉' }
    return { bg: 'bg-slate-100', text: 'text-gray-600', icon: rank }
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/teacher')}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8" />
              <div>
                <h1 className="text-xl font-bold">Talent Scout</h1>
                <p className="text-xs text-amber-100">Find top performers for school teams</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-500" />
            <span className="font-semibold text-gray-700">Filters</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {/* Metric Selection */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">Performance Metric</label>
              <select
                value={filterMetric}
                onChange={(e) => setFilterMetric(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                {metrics.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>

            {/* House Filter */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">House</label>
              <select
                value={filterHouse}
                onChange={(e) => setFilterHouse(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="all">All Houses</option>
                {houses.map(h => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>

            {/* Gender Filter */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">Gender</label>
              <select
                value={filterGender}
                onChange={(e) => setFilterGender(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="all">All</option>
                <option value="Male">Boys</option>
                <option value="Female">Girls</option>
              </select>
            </div>

            {/* Top Count */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">Show Top</label>
              <select
                value={topCount}
                onChange={(e) => setTopCount(parseInt(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value={5}>Top 5</option>
                <option value={10}>Top 10</option>
                <option value={20}>Top 20</option>
                <option value={50}>Top 50</option>
              </select>
            </div>

            {/* Search */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">Search</label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Name or Roll"
                  className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Export Button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Export List (CSV)
          </button>
        </div>

        {/* Results */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b bg-gradient-to-r from-amber-50 to-orange-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {selectedMetric && <selectedMetric.icon className="w-5 h-5 text-amber-600" />}
                <h2 className="font-bold text-gray-800">
                  Top {filteredAndSortedStudents.length} - {selectedMetric?.label}
                </h2>
              </div>
              <div className="flex items-center gap-1 text-gray-500 text-sm">
                <Users className="w-4 h-4" />
                {filteredAndSortedStudents.length} students
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">Rank</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">Student</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">Class</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">House</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">Score</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedStudents.map((student, idx) => {
                  const rank = idx + 1
                  const badge = getRankBadge(rank)
                  const studentClass = classes.find(c => c.id === student.classId)

                  return (
                    <tr key={student.id} className="border-t hover:bg-slate-50">
                      <td className="p-4">
                        <span className={`w-8 h-8 inline-flex items-center justify-center rounded-full font-bold text-sm ${badge.bg} ${badge.text}`}>
                          {typeof badge.icon === 'string' ? badge.icon : badge.icon}
                        </span>
                      </td>
                      <td className="p-4">
                        <p className="font-semibold text-gray-800">{student.name}</p>
                        <p className="text-xs text-gray-500">Roll: {student.rollNo} • {student.gender}</p>
                      </td>
                      <td className="p-4 text-gray-600">{studentClass?.name || '-'}</td>
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
                        <span className="text-lg font-bold text-amber-600">
                          {student.scores[filterMetric]}
                        </span>
                        <span className="text-sm text-gray-500 ml-1">
                          {selectedMetric?.unit}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {filteredAndSortedStudents.length === 0 && (
              <div className="p-12 text-center">
                <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No students match the current filters.</p>
                <p className="text-sm text-gray-400">Try adjusting your filters or ensure tests have been conducted.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
