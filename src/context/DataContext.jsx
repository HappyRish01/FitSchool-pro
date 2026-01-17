import { createContext, useContext, useState, useEffect } from 'react'

const DataContext = createContext(null)

// Generate seed data
const generateSeedData = () => {
  const houses = ['Jayaji', 'Madhav', 'Shivaji', 'Ranoji']
  const firstNames = ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan']
  const lastNames = ['Sharma', 'Verma', 'Patel', 'Singh', 'Gupta', 'Kumar', 'Joshi', 'Agarwal', 'Mehta', 'Reddy']

  const students = []
  for (let i = 1; i <= 10; i++) {
    const age = Math.floor(Math.random() * 3) + 14 // 14-16 years for Class 10
    const height = Math.floor(Math.random() * 30) + 150 // 150-180 cm
    const weight = Math.floor(Math.random() * 25) + 45 // 45-70 kg
    const bmi = (weight / ((height / 100) ** 2)).toFixed(1)

    students.push({
      id: `STU${String(i).padStart(3, '0')}`,
      rollNo: String(i).padStart(2, '0'),
      name: `${firstNames[i - 1]} ${lastNames[i - 1]}`,
      age: age,
      gender: i % 3 === 0 ? 'Female' : 'Male',
      house: houses[i % 4],
      classId: 'class-10a',
      scores: {
        height: height,
        weight: weight,
        bmi: parseFloat(bmi),
        // Senior tests (Age 9+)
        dash50m: (Math.random() * 3 + 7).toFixed(2), // 7-10 seconds
        run600m: (Math.random() * 60 + 150).toFixed(0), // 150-210 seconds
        sitAndReach: Math.floor(Math.random() * 15 + 10), // 10-25 cm
        partialCurlUps: Math.floor(Math.random() * 30 + 15), // 15-45 reps
        pushUps: Math.floor(Math.random() * 25 + 10), // 10-35 reps
      },
      testDate: new Date().toISOString().split('T')[0]
    })
  }

  return {
    classes: [
      {
        id: 'class-10a',
        name: 'Class 10-A',
        section: 'A',
        grade: '10',
        academicYear: '2025-26',
        createdAt: new Date().toISOString()
      }
    ],
    students: students,
    teachers: []
  }
}

export function DataProvider({ children }) {
  const [classes, setClasses] = useState([])
  const [students, setStudents] = useState([])
  const [teachers, setTeachers] = useState([])

  useEffect(() => {
    // Load data from localStorage or initialize with seed data
    const storedClasses = localStorage.getItem('fitschool_classes')
    const storedStudents = localStorage.getItem('fitschool_students')
    const storedTeachers = localStorage.getItem('fitschool_teachers')

    if (!storedClasses || !storedStudents) {
      // Initialize with seed data
      const seedData = generateSeedData()
      setClasses(seedData.classes)
      setStudents(seedData.students)
      setTeachers(seedData.teachers)
      localStorage.setItem('fitschool_classes', JSON.stringify(seedData.classes))
      localStorage.setItem('fitschool_students', JSON.stringify(seedData.students))
      localStorage.setItem('fitschool_teachers', JSON.stringify(seedData.teachers))
    } else {
      setClasses(JSON.parse(storedClasses))
      setStudents(JSON.parse(storedStudents))
      setTeachers(JSON.parse(storedTeachers || '[]'))
    }
  }, [])

  const saveClasses = (newClasses) => {
    setClasses(newClasses)
    localStorage.setItem('fitschool_classes', JSON.stringify(newClasses))
  }

  const saveStudents = (newStudents) => {
    setStudents(newStudents)
    localStorage.setItem('fitschool_students', JSON.stringify(newStudents))
  }

  const saveTeachers = (newTeachers) => {
    setTeachers(newTeachers)
    localStorage.setItem('fitschool_teachers', JSON.stringify(newTeachers))
  }

  const addClass = (classData) => {
    const newClass = {
      ...classData,
      id: `class-${Date.now()}`,
      createdAt: new Date().toISOString()
    }
    const updatedClasses = [...classes, newClass]
    saveClasses(updatedClasses)
    return newClass
  }

  const addStudent = (studentData) => {
    const newStudent = {
      ...studentData,
      id: `STU${Date.now()}`,
      scores: studentData.scores || {}
    }
    const updatedStudents = [...students, newStudent]
    saveStudents(updatedStudents)
    return newStudent
  }

  const addStudentsBulk = (studentsData, classId) => {
    const newStudents = studentsData.map((s, index) => ({
      ...s,
      id: `STU${Date.now()}${index}`,
      classId: classId,
      scores: s.scores || {}
    }))
    const updatedStudents = [...students, ...newStudents]
    saveStudents(updatedStudents)
    return newStudents
  }

  const updateStudentScores = (studentId, scores) => {
    const updatedStudents = students.map(s => 
      s.id === studentId 
        ? { ...s, scores: { ...s.scores, ...scores }, testDate: new Date().toISOString().split('T')[0] }
        : s
    )
    saveStudents(updatedStudents)
  }

  const updateStudentsBatch = (updates) => {
    const updatedStudents = students.map(s => {
      const update = updates.find(u => u.id === s.id)
      if (update) {
        return { ...s, scores: { ...s.scores, ...update.scores }, testDate: new Date().toISOString().split('T')[0] }
      }
      return s
    })
    saveStudents(updatedStudents)
  }

  const getStudentsByClass = (classId) => {
    return students.filter(s => s.classId === classId)
  }

  const getClassById = (classId) => {
    return classes.find(c => c.id === classId)
  }

  const addTeacher = (teacherData) => {
    const newTeacher = {
      ...teacherData,
      id: `TCH${Date.now()}`,
      createdAt: new Date().toISOString()
    }
    const updatedTeachers = [...teachers, newTeacher]
    saveTeachers(updatedTeachers)
    return newTeacher
  }

  const deleteTeacher = (teacherId) => {
    const updatedTeachers = teachers.filter(t => t.id !== teacherId)
    saveTeachers(updatedTeachers)
  }

  const getGlobalStats = () => {
    const totalStudents = students.length
    const testedStudents = students.filter(s => s.scores && s.scores.height).length
    const avgBMI = students.length > 0 
      ? (students.reduce((sum, s) => sum + (s.scores?.bmi || 0), 0) / students.length).toFixed(1)
      : 0
    const totalClasses = classes.length

    return {
      totalStudents,
      testedStudents,
      avgBMI,
      totalClasses,
      totalTeachers: teachers.length + 1 // +1 for default teacher
    }
  }

  const calculateClassAverages = (classId) => {
    const classStudents = getStudentsByClass(classId)
    if (classStudents.length === 0) return {}

    const metrics = ['height', 'weight', 'bmi', 'dash50m', 'run600m', 'sitAndReach', 'partialCurlUps', 'pushUps', 'flamingoBalance', 'plateTapping']
    const averages = {}

    metrics.forEach(metric => {
      const values = classStudents
        .filter(s => s.scores && s.scores[metric] !== undefined)
        .map(s => parseFloat(s.scores[metric]))
      
      if (values.length > 0) {
        averages[metric] = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2)
      }
    })

    return averages
  }

  return (
    <DataContext.Provider value={{
      classes,
      students,
      teachers,
      addClass,
      addStudent,
      addStudentsBulk,
      updateStudentScores,
      updateStudentsBatch,
      getStudentsByClass,
      getClassById,
      addTeacher,
      deleteTeacher,
      getGlobalStats,
      calculateClassAverages
    }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}
