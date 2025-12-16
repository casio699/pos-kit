import React from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Tester from './pages/Tester'
import { useAuth } from './store/auth'

const Login = React.lazy(() => import('./pages/Login'))
const Products = React.lazy(() => import('./pages/Products'))
const Inventory = React.lazy(() => import('./pages/Inventory'))
const Sales = React.lazy(() => import('./pages/Sales'))

function ProtectedRoute({ children }: { children: React.ReactElement }) {
  const { token } = useAuth()
  const location = useLocation()
  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  return children
}

export default function AppRouter() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        <Navbar />
        <React.Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/products"
              element={
                <ProtectedRoute>
                  <Products />
                </ProtectedRoute>
              }
            />
            <Route
              path="/inventory"
              element={
                <ProtectedRoute>
                  <Inventory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/sales"
              element={
                <ProtectedRoute>
                  <Sales />
                </ProtectedRoute>
              }
            />
            <Route path="/tester" element={<Tester />} />
            <Route path="/" element={<Navigate to="/products" replace />} />
            <Route path="*" element={<Navigate to="/products" replace />} />
          </Routes>
        </React.Suspense>
      </div>
    </div>
  )
}
