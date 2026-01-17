import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login from './pages/Login'
import AdminDashboard from './pages/AdminDashboard'
import TeacherDashboard from './pages/TeacherDashboard'
import ClassManagement from './pages/ClassManagement'
import TestEngine from './pages/TestEngine'
import MultiLaneStopwatch from './pages/MultiLaneStopwatch'
import RapidFireEntry from './pages/RapidFireEntry'
import ReportGenerator from './pages/ReportGenerator'
import TalentScout from './pages/TalentScout'
import SportsDayManager from './pages/SportsDayManager'
import TeacherManagement from './pages/TeacherManagement'
import ExportData from './pages/ExportData'
import Instructions from './pages/Instructions'

function ProtectedRoute({ children, allowedRoles, skipInstructionsCheck = false }) {
  const { user, isAuthenticated, hasSeenInstructions } = useAuth()
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to={user?.role === 'admin' ? '/admin' : '/teacher'} replace />
  }

  // Redirect to instructions if not seen yet (only for teachers, skip for admin)
  if (!skipInstructionsCheck && !hasSeenInstructions && user?.role === 'teacher') {
    return <Navigate to="/instructions" replace />
  }
  
  return children
}

function App() {
  const { isAuthenticated, user, hasSeenInstructions } = useAuth()

  // Determine where to redirect after login
  const getPostLoginRedirect = () => {
    if (user?.role === 'admin') return '/admin'
    if (!hasSeenInstructions) return '/instructions'
    return '/teacher'
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <Routes>
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to={getPostLoginRedirect()} replace /> : <Login />} 
        />

        {/* Instructions Route */}
        <Route 
          path="/instructions" 
          element={
            <ProtectedRoute allowedRoles={['teacher']} skipInstructionsCheck={true}>
              <Instructions />
            </ProtectedRoute>
          } 
        />
        
        {/* Admin Routes */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/teachers" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <TeacherManagement />
            </ProtectedRoute>
          } 
        />
        
        {/* Teacher Routes */}
        <Route 
          path="/teacher" 
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TeacherDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/teacher/classes" 
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <ClassManagement />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/teacher/test/:classId" 
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TestEngine />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/teacher/stopwatch/:classId" 
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <MultiLaneStopwatch />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/teacher/rapid-entry/:classId" 
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <RapidFireEntry />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/teacher/reports/:classId" 
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <ReportGenerator />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/teacher/export" 
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <ExportData />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/teacher/talent-scout" 
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TalentScout />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/teacher/sports-day" 
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <SportsDayManager />
            </ProtectedRoute>
          } 
        />
        
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  )
}

export default App
