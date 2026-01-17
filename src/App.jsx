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

function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated } = useAuth()
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to={user?.role === 'admin' ? '/admin' : '/teacher'} replace />
  }
  
  return children
}

function App() {
  const { isAuthenticated, user } = useAuth()

  return (
    <div className="min-h-screen bg-slate-100">
      <Routes>
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to={user?.role === 'admin' ? '/admin' : '/teacher'} replace /> : <Login />} 
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
