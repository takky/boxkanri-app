import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import LocationsPage from './pages/LocationsPage'
import LocationDetailPage from './pages/LocationDetailPage'
import NewBoxPage from './pages/NewBoxPage'
import BoxDetailPage from './pages/BoxDetailPage'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/"
        element={<ProtectedRoute><LocationsPage /></ProtectedRoute>}
      />
      <Route
        path="/location/:location"
        element={<ProtectedRoute><LocationDetailPage /></ProtectedRoute>}
      />
      <Route
        path="/boxes/new"
        element={<ProtectedRoute><NewBoxPage /></ProtectedRoute>}
      />
      <Route
        path="/boxes/:id"
        element={<ProtectedRoute><BoxDetailPage /></ProtectedRoute>}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
