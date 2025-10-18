import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'

// Import pages/components
import LandingPage from './components/LandingPage'
import Onboarding from './components/EnhancedOnboarding'
import Dashboard from './components/AdaptiveDashboard'
import TaskEntry from './components/TaskEntry'
import Settings from './components/Settings'
import TeamDashboard from './components/EnhancedTeamDashboard'
import AdminDashboard from './components/AdminDashboard'

function App() {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing user session in localStorage
    const storedUser = localStorage.getItem('gitUser')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const handleUserUpdate = (userData) => {
    setUser(userData)
    localStorage.setItem('gitUser', JSON.stringify(userData))
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('gitUser')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Get It Done!...</p>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={user ? <Navigate to="/dashboard" /> : <LandingPage />} 
        />
        <Route 
          path="/onboarding" 
          element={<Onboarding onComplete={handleUserUpdate} />} 
        />
        <Route 
          path="/dashboard" 
          element={user ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/" />} 
        />
        <Route 
          path="/tasks" 
          element={user ? <TaskEntry user={user} /> : <Navigate to="/" />} 
        />
        <Route 
          path="/settings" 
          element={user ? <Settings user={user} onUpdate={handleUserUpdate} /> : <Navigate to="/" />} 
        />
        <Route 
          path="/team" 
          element={user && user.userType === 'team' ? <TeamDashboard user={user} /> : <Navigate to="/dashboard" />} 
        />
        <Route 
          path="/admin" 
          element={user && user.isAdmin ? <AdminDashboard onLogout={handleLogout} /> : <Navigate to="/dashboard" />} 
        />
      </Routes>
    </Router>
  )
}

export default App

