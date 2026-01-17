import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useData } from '../context/DataContext'
import Papa from 'papaparse'
import JSZip from 'jszip'
import {
  ArrowLeft,
  Download,
  FileSpreadsheet,
  FolderOpen,
  Users,
  Archive,
  CheckCircle,
  Loader2
} from 'lucide-react'

export default function ExportData() {
  const navigate = useNavigate()
  const { classes, getStudentsByClass } = useData()
  const [downloading, setDownloading] = useState(null)
  const [downloadingAll, setDownloadingAll] = useState(false)

  const generateCSVData = (students, className) => {
    const data = students.map(student => ({
      'Roll No': student.rollNo,
      'Name': student.name,
      'Age': student.age,
      'Gender': student.gender,
      'House': student.house,
      'Height (cm)': student.scores?.height || '',
      'Weight (kg)': student.scores?.weight || '',
      'BMI': student.scores?.bmi || '',
      '50m Dash (sec)': student.scores?.dash50m || '',
      '600m Run (sec)': student.scores?.run600m || '',
      'Sit & Reach (cm)': student.scores?.sitAndReach || '',
      'Partial Curl-ups': student.scores?.partialCurlUps || '',
      'Push-ups': student.scores?.pushUps || '',
      'Flamingo Balance (sec)': student.scores?.flamingoBalance || '',
      'Plate Tapping (sec)': student.scores?.plateTapping || '',
      'Test Date': student.testDate || ''
    }))

    return Papa.unparse(data)
  }

  const downloadClassCSV = (classInfo) => {
    setDownloading(classInfo.id)
    
    const students = getStudentsByClass(classInfo.id)
    const csvContent = generateCSVData(students, classInfo.name)
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${classInfo.name.replace(/\s+/g, '_')}_Students.csv`
    link.click()
    URL.revokeObjectURL(url)

    setTimeout(() => setDownloading(null), 1000)
  }

  const downloadAllAsZip = async () => {
    setDownloadingAll(true)

    try {
      const zip = new JSZip()

      classes.forEach(classInfo => {
        const students = getStudentsByClass(classInfo.id)
        const csvContent = generateCSVData(students, classInfo.name)
        const fileName = `${classInfo.name.replace(/\s+/g, '_')}_Students.csv`
        zip.file(fileName, csvContent)
      })

      const zipBlob = await zip.generateAsync({ type: 'blob' })
      const url = URL.createObjectURL(zipBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `All_Classes_Data_${new Date().toISOString().split('T')[0]}.zip`
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error creating ZIP:', error)
      alert('Error creating ZIP file. Please try again.')
    } finally {
      setTimeout(() => setDownloadingAll(false), 1000)
    }
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
              <h1 className="text-xl font-bold">Export Data</h1>
              <p className="text-xs text-scindia-secondary">Download student data as CSV</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Download All Section */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-2xl p-6 mb-6 text-white">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                <Archive className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Download All Classes</h2>
                <p className="text-green-100">Export all class data in a single ZIP file</p>
              </div>
            </div>
            <button
              onClick={downloadAllAsZip}
              disabled={downloadingAll || classes.length === 0}
              className="flex items-center gap-2 px-6 py-3 bg-white text-green-700 rounded-xl font-semibold hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {downloadingAll ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating ZIP...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Download ZIP
                </>
              )}
            </button>
          </div>
          <p className="text-sm text-green-200 mt-3">
            {classes.length} classes • Contains CSV files for each class
          </p>
        </div>

        {/* Classes List */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-scindia-primary" />
              Individual Class Exports
            </h3>
            <p className="text-sm text-gray-500">Download CSV file for a specific class</p>
          </div>

          {classes.length === 0 ? (
            <div className="p-8 text-center">
              <FileSpreadsheet className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No classes available.</p>
              <button
                onClick={() => navigate('/teacher/classes')}
                className="mt-4 px-4 py-2 bg-scindia-primary text-white rounded-lg hover:bg-scindia-dark transition-colors"
              >
                Create a Class
              </button>
            </div>
          ) : (
            <div className="divide-y">
              {classes.map((classInfo) => {
                const students = getStudentsByClass(classInfo.id)
                const testedCount = students.filter(s => s.scores?.height).length
                const isDownloading = downloading === classInfo.id

                return (
                  <div
                    key={classInfo.id}
                    className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-scindia-primary/10 rounded-xl flex items-center justify-center">
                        <Users className="w-6 h-6 text-scindia-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">{classInfo.name}</h4>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <span>{students.length} students</span>
                          <span>•</span>
                          <span>{testedCount} tested</span>
                          <span>•</span>
                          <span>{classInfo.academicYear}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => downloadClassCSV(classInfo)}
                      disabled={isDownloading || students.length === 0}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                        isDownloading
                          ? 'bg-green-100 text-green-700'
                          : 'bg-scindia-primary text-white hover:bg-scindia-dark'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {isDownloading ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Downloaded!
                        </>
                      ) : (
                        <>
                          <FileSpreadsheet className="w-4 h-4" />
                          Download CSV
                        </>
                      )}
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* CSV Info */}
        <div className="mt-6 bg-blue-50 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <FileSpreadsheet className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-800">CSV File Contents:</p>
              <p className="text-blue-600 mt-1">
                Roll No, Name, Age, Gender, House, Height, Weight, BMI, 50m Dash, 
                600m Run, Sit & Reach, Partial Curl-ups, Push-ups, Flamingo Balance, 
                Plate Tapping, Test Date
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
