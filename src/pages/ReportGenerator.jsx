import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useData } from '../context/DataContext'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'
import JSZip from 'jszip'
import {
  ArrowLeft,
  FileText,
  Download,
  Loader2,
  CheckCircle,
  User,
  TrendingUp
} from 'lucide-react'

export default function ReportGenerator() {
  const navigate = useNavigate()
  const { classId } = useParams()
  const { getStudentsByClass, getClassById, calculateClassAverages } = useData()

  const classInfo = getClassById(classId)
  const students = getStudentsByClass(classId)
  const classAverages = calculateClassAverages(classId)

  const [generating, setGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [completed, setCompleted] = useState(false)

  const getHealthFeedback = (student) => {
    const feedback = []
    const scores = student.scores || {}

    // BMI Analysis
    if (scores.bmi) {
      if (scores.bmi > 25) {
        feedback.push({
          type: 'warning',
          title: 'High Body Fat Detected',
          suggestion: 'Recommendation: 30 mins Jogging daily.',
          diet: 'Diet: Reduce sugar & fried food, increase fiber intake. Include more vegetables and whole grains.'
        })
      } else if (scores.bmi < 18.5) {
        feedback.push({
          type: 'info',
          title: 'Underweight',
          suggestion: 'Recommendation: Balanced nutrition with protein-rich foods.',
          diet: 'Diet: Include eggs, milk, nuts, and healthy fats. Consider 5-6 small meals daily.'
        })
      }
    }

    // Stamina Analysis (600m run)
    if (scores.run600m) {
      const avgRun = parseFloat(classAverages.run600m) || 180
      if (parseFloat(scores.run600m) > avgRun * 1.15) {
        feedback.push({
          type: 'warning',
          title: 'Low Endurance',
          suggestion: 'Recommendation: Rope Skipping & cycling for 20 mins daily.',
          diet: 'Diet: Eat Sprouts & Jaggery for sustained energy. Include bananas and oats.'
        })
      }
    }

    // Core Strength Analysis
    if (scores.partialCurlUps) {
      const avgCurls = parseFloat(classAverages.partialCurlUps) || 25
      if (parseFloat(scores.partialCurlUps) < avgCurls * 0.7) {
        feedback.push({
          type: 'info',
          title: 'Core Strength Needs Improvement',
          suggestion: 'Recommendation: Planks and crunches - 3 sets of 15 daily.',
          diet: 'Diet: Protein intake after workout. Include paneer, dal, and chicken.'
        })
      }
    }

    // Upper Body Strength
    if (scores.pushUps) {
      const avgPushups = parseFloat(classAverages.pushUps) || 20
      if (parseFloat(scores.pushUps) < avgPushups * 0.7) {
        feedback.push({
          type: 'info',
          title: 'Upper Body Strength Needs Work',
          suggestion: 'Recommendation: Wall push-ups progressing to regular push-ups.',
          diet: 'Diet: Include protein sources like eggs, milk, and legumes.'
        })
      }
    }

    // If all good
    if (feedback.length === 0) {
      feedback.push({
        type: 'success',
        title: 'Excellent Physical Fitness!',
        suggestion: 'Keep up the great work! Continue with regular physical activities.',
        diet: 'Diet: Maintain balanced nutrition with adequate hydration.'
      })
    }

    return feedback
  }

  const generateSinglePDF = async (student) => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const scores = student.scores || {}
    const feedback = getHealthFeedback(student)

    // Colors
    const primaryColor = [30, 58, 95] // Scindia Primary
    const goldColor = [201, 162, 39] // Scindia Gold
    const darkText = [15, 23, 42]

    // Header Background
    doc.setFillColor(...primaryColor)
    doc.rect(0, 0, pageWidth, 50, 'F')

    // School Logo Placeholder (circular)
    doc.setFillColor(255, 255, 255)
    doc.circle(pageWidth / 2, 20, 12, 'F')
    doc.setFontSize(8)
    doc.setTextColor(...primaryColor)
    doc.text('SS', pageWidth / 2, 22, { align: 'center' })

    // School Name
    doc.setFontSize(18)
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.text('THE SCINDIA SCHOOL', pageWidth / 2, 40, { align: 'center' })

    // Motto
    doc.setFontSize(10)
    doc.setTextColor(...goldColor)
    doc.setFont('helvetica', 'italic')
    doc.text('सा विद्या या विमुक्तये', pageWidth / 2, 47, { align: 'center' })

    // Report Title
    doc.setFontSize(14)
    doc.setTextColor(...darkText)
    doc.setFont('helvetica', 'bold')
    doc.text('KHELO INDIA FITNESS REPORT CARD', pageWidth / 2, 62, { align: 'center' })

    // Student Info Box
    doc.setFillColor(248, 250, 252)
    doc.roundedRect(15, 68, pageWidth - 30, 30, 3, 3, 'F')

    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...darkText)

    const leftCol = 25
    const rightCol = pageWidth / 2 + 10

    doc.text(`Name: ${student.name}`, leftCol, 78)
    doc.text(`Roll No: ${student.rollNo}`, leftCol, 86)
    doc.text(`Class: ${classInfo?.name || '-'}`, leftCol, 94)

    doc.text(`Age: ${student.age} years`, rightCol, 78)
    doc.text(`Gender: ${student.gender}`, rightCol, 86)
    doc.text(`House: ${student.house}`, rightCol, 94)

    // Test Results Table
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.text('FITNESS TEST RESULTS', 15, 110)

    const tableData = []

    // Add test results with comparison
    const tests = [
      { key: 'height', label: 'Height', unit: 'cm' },
      { key: 'weight', label: 'Weight', unit: 'kg' },
      { key: 'bmi', label: 'BMI', unit: '' },
      { key: 'dash50m', label: '50m Dash', unit: 'sec' },
      { key: 'run600m', label: '600m Run', unit: 'sec' },
      { key: 'sitAndReach', label: 'Sit & Reach', unit: 'cm' },
      { key: 'partialCurlUps', label: 'Partial Curl-ups', unit: 'reps' },
      { key: 'pushUps', label: 'Push-ups', unit: 'reps' },
      { key: 'flamingoBalance', label: 'Flamingo Balance', unit: 'sec' },
      { key: 'plateTapping', label: 'Plate Tapping', unit: 'sec' }
    ]

    tests.forEach(test => {
      const studentScore = scores[test.key]
      const classAvg = classAverages[test.key]
      
      if (studentScore !== undefined) {
        let comparison = '-'
        if (classAvg) {
          const diff = ((parseFloat(studentScore) - parseFloat(classAvg)) / parseFloat(classAvg) * 100).toFixed(0)
          // For time-based tests, negative is better
          const timeBasedTests = ['dash50m', 'run600m', 'plateTapping']
          if (timeBasedTests.includes(test.key)) {
            comparison = diff < 0 ? `${Math.abs(diff)}% faster` : diff > 0 ? `${diff}% slower` : 'Average'
          } else {
            comparison = diff > 0 ? `+${diff}%` : diff < 0 ? `${diff}%` : 'Average'
          }
        }
        
        tableData.push([
          test.label,
          `${studentScore} ${test.unit}`,
          classAvg ? `${classAvg} ${test.unit}` : '-',
          comparison
        ])
      }
    })

    doc.autoTable({
      startY: 115,
      head: [['Test', 'Your Score', 'Class Average', 'Comparison']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 9,
        textColor: darkText
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      columnStyles: {
        0: { fontStyle: 'bold' },
        3: { halign: 'center' }
      }
    })

    // Performance Chart (Simple bar representation)
    const chartY = doc.lastAutoTable.finalY + 15
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.text('PERFORMANCE OVERVIEW', 15, chartY)

    // Simple visual bars for key metrics
    const barStartY = chartY + 8
    const barWidth = 100
    const barHeight = 8
    const metrics = ['pushUps', 'partialCurlUps', 'sitAndReach']
    const metricLabels = { pushUps: 'Push-ups', partialCurlUps: 'Curl-ups', sitAndReach: 'Flexibility' }

    metrics.forEach((metric, idx) => {
      const y = barStartY + (idx * 18)
      const studentVal = parseFloat(scores[metric]) || 0
      const avgVal = parseFloat(classAverages[metric]) || 1
      const percentage = Math.min((studentVal / avgVal) * 50, barWidth)

      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.text(metricLabels[metric], 15, y + 6)

      // Background bar
      doc.setFillColor(229, 231, 235)
      doc.roundedRect(55, y, barWidth, barHeight, 2, 2, 'F')

      // Student score bar
      doc.setFillColor(34, 197, 94)
      doc.roundedRect(55, y, percentage, barHeight, 2, 2, 'F')

      // Class average line
      doc.setDrawColor(...goldColor)
      doc.setLineWidth(1)
      doc.line(55 + 50, y - 1, 55 + 50, y + barHeight + 1)

      doc.setFontSize(8)
      doc.text(`${studentVal}`, 160, y + 6)
    })

    // Legend
    const legendY = barStartY + (metrics.length * 18) + 5
    doc.setFontSize(7)
    doc.setTextColor(100, 116, 139)
    doc.text('Green bar = Your score | Gold line = Class average', 55, legendY)

    // Health Feedback Section
    const feedbackY = legendY + 15
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(...darkText)
    doc.text('HEALTH DOCTOR RECOMMENDATIONS', 15, feedbackY)

    let currentY = feedbackY + 8
    feedback.forEach((item, idx) => {
      // Feedback box
      const boxColor = item.type === 'warning' ? [254, 243, 199] : 
                       item.type === 'success' ? [220, 252, 231] : [224, 242, 254]
      const textColor = item.type === 'warning' ? [146, 64, 14] : 
                        item.type === 'success' ? [22, 101, 52] : [30, 64, 175]

      doc.setFillColor(...boxColor)
      doc.roundedRect(15, currentY, pageWidth - 30, 25, 2, 2, 'F')

      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...textColor)
      doc.text(item.title, 20, currentY + 7)

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.text(item.suggestion, 20, currentY + 14)
      doc.text(item.diet, 20, currentY + 21)

      currentY += 30
    })

    // Footer
    const footerY = 280
    doc.setDrawColor(229, 231, 235)
    doc.line(15, footerY, pageWidth - 15, footerY)

    doc.setFontSize(8)
    doc.setTextColor(100, 116, 139)
    doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN')}`, 15, footerY + 6)
    doc.text('FitSchool Pro - Scindia Edition', pageWidth - 15, footerY + 6, { align: 'right' })

    doc.setFontSize(7)
    doc.text('This report is auto-generated based on Khelo India fitness test standards.', pageWidth / 2, footerY + 12, { align: 'center' })

    return doc
  }

  const downloadSingleReport = async (student) => {
    const doc = await generateSinglePDF(student)
    doc.save(`${student.rollNo}_${student.name.replace(/\s+/g, '_')}.pdf`)
  }

  const downloadAllReports = async () => {
    setGenerating(true)
    setProgress(0)
    setCompleted(false)

    try {
      const zip = new JSZip()

      for (let i = 0; i < students.length; i++) {
        const student = students[i]
        const doc = await generateSinglePDF(student)
        const pdfBlob = doc.output('blob')
        const fileName = `${student.rollNo}_${student.name.replace(/\s+/g, '_')}.pdf`
        zip.file(fileName, pdfBlob)
        setProgress(Math.round(((i + 1) / students.length) * 100))
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' })
      const url = URL.createObjectURL(zipBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${classInfo?.name || 'Class'}_Reports.zip`
      link.click()
      URL.revokeObjectURL(url)

      setCompleted(true)
    } catch (error) {
      console.error('Error generating reports:', error)
      alert('Error generating reports. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

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
              <h1 className="text-xl font-bold">Report Generator</h1>
              <p className="text-xs text-scindia-secondary">{classInfo.name} - Scindia School Reports</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Download All Section */}
        <div className="bg-gradient-to-r from-scindia-primary to-scindia-dark rounded-2xl p-6 mb-6 text-white">
          <div className="flex items-center gap-4 mb-4">
            <FileText className="w-12 h-12 text-scindia-secondary" />
            <div>
              <h2 className="text-xl font-bold">Scindia School Report Cards</h2>
              <p className="text-slate-300">Generate professional PDF reports for all students</p>
            </div>
          </div>

          {generating ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Generating reports... {progress}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-3">
                <div 
                  className="bg-scindia-secondary h-3 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : completed ? (
            <div className="flex items-center gap-3 text-green-300">
              <CheckCircle className="w-6 h-6" />
              <span className="font-semibold">All reports generated successfully!</span>
            </div>
          ) : (
            <button
              onClick={downloadAllReports}
              disabled={students.length === 0}
              className="flex items-center gap-2 px-6 py-3 bg-scindia-secondary hover:bg-yellow-500 text-gray-900 rounded-lg font-semibold transition-colors disabled:opacity-50"
            >
              <Download className="w-5 h-5" />
              Download All Reports (ZIP)
            </button>
          )}

          <p className="text-sm text-slate-300 mt-3">
            {students.length} students • Files named: [RollNo]_[Name].pdf
          </p>
        </div>

        {/* Individual Reports */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-gray-800">Individual Reports</h3>
            <p className="text-sm text-gray-500">Click on a student to download their report</p>
          </div>

          <div className="divide-y">
            {students.map((student) => {
              const hasScores = student.scores?.height
              return (
                <div
                  key={student.id}
                  className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-scindia-primary/10 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-scindia-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{student.name}</p>
                      <p className="text-sm text-gray-500">
                        Roll: {student.rollNo} • BMI: {student.scores?.bmi || '-'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {hasScores ? (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        Data Complete
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                        Pending Tests
                      </span>
                    )}
                    <button
                      onClick={() => downloadSingleReport(student)}
                      disabled={!hasScores}
                      className="p-2 text-scindia-primary hover:bg-scindia-primary/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {students.length === 0 && (
            <div className="p-8 text-center">
              <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No students in this class.</p>
            </div>
          )}
        </div>

        {/* Report Preview Info */}
        <div className="mt-6 bg-blue-50 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-800">Report Contents:</p>
              <ul className="text-blue-600 mt-1 space-y-1">
                <li>• School header with Scindia School branding</li>
                <li>• Complete fitness test results with class averages</li>
                <li>• Visual performance comparison charts</li>
                <li>• Smart "Health Doctor" recommendations based on BMI & stamina</li>
                <li>• Personalized diet and exercise suggestions</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
