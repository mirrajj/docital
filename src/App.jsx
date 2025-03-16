// src/App.js
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom'
import MobileHeader from './common/header/MobileHeader'
import './App.css'
import Sidebar from './common/sidebar'
import Nav from './common/navigation'
import Dashboard from './pages/home'
import AdminLayout from './layout/AdminLayout'
import Task from './pages/task'
import { DataProvider } from './utils/DataContext'
import Record from './pages/records'
import Audit from './pages/audit'
import Monitoring from './pages/monitoring'
import ReportPage from './pages/report'
import Login from './pages/auth/components/Login'
import { AuthProvider } from './pages/auth/authContext/AuthContext'
import ProtectedRoute from './pages/auth/components/ProtectedRoute'

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <div className='App'>
          <Routes>
            {/* Public route */}
            <Route path="/login" element={<Login />} />
            
            {/* Protected routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <AdminLayout page="Dashboard"><Dashboard /></AdminLayout>
              </ProtectedRoute>
            }/>
            
            <Route path="/task" element={
              <ProtectedRoute>
                <AdminLayout page="Task"><Task /></AdminLayout>
              </ProtectedRoute>
            }/>
            
            <Route path='/monitoring' element={
              <ProtectedRoute>
                <AdminLayout page={"Monitoring"}><Monitoring /></AdminLayout>
              </ProtectedRoute>
            } />
            
            <Route path='/record' element={
              <ProtectedRoute>
                <AdminLayout page={"Records"}><Record /></AdminLayout>
              </ProtectedRoute>
            } />
            
            <Route path='/report' element={
              <ProtectedRoute>
                <AdminLayout page={"Report"}><ReportPage /></AdminLayout>
              </ProtectedRoute>
            } />

            <Route path='/audit' element={
              <ProtectedRoute>
                <AdminLayout page={"Audit"}><Audit /></AdminLayout>
              </ProtectedRoute>
            } />
            
            {/* Catch-all redirect to dashboard */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </DataProvider>
    </AuthProvider>
  )
}

export default App