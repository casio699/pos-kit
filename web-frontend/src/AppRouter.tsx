import React, { useEffect, useState } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Tester from './pages/Tester'
import { useAuth } from './store/auth'
import { Loader2 } from 'lucide-react'

const Login = React.lazy(() => import('./pages/Login'))
const Products = React.lazy(() => import('./pages/Products'))
const Inventory = React.lazy(() => import('./pages/Inventory'))
const Sales = React.lazy(() => import('./pages/Sales'))
const Payments = React.lazy(() => import('./pages/Payments'))
const Shopify = React.lazy(() => import('./pages/Shopify'))
const RBAC = React.lazy(() => import('./pages/RBAC'))
const Audit = React.lazy(() => import('./pages/Audit'))
const Dashboard = React.lazy(() => import('./pages/Dashboard'))

function ProtectedRoute({ children }: { children: React.ReactElement }) {
  const { token } = useAuth()
  const location = useLocation()
  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  return children
}

export default function AppRouter() {
  const { isInitialized, isLoading, token } = useAuth()
  const [isValidating, setIsValidating] = useState(true)

  useEffect(() => {
    const validateAuth = async () => {
      if (token) {
        await useAuth.getState().validateToken()
      }
      setIsValidating(false)
    }
    validateAuth()
  }, [token])

  if (isLoading || !isInitialized || isValidating) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        <Navbar />
        <React.Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route 
              path="/login" 
              element={!token ? <Login /> : <Navigate to="/dashboard" replace />} 
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
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
            <Route
              path="/payments"
              element={
                <ProtectedRoute>
                  <Payments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/shopify"
              element={
                <ProtectedRoute>
                  <Shopify />
                </ProtectedRoute>
              }
            />
            <Route
              path="/rbac"
              element={
                <ProtectedRoute>
                  <RBAC />
                </ProtectedRoute>
              }
            />
            <Route
              path="/audit"
              element={
                <ProtectedRoute>
                  <Audit />
                </ProtectedRoute>
              }
            />
            <Route path="/tester" element={<Tester />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/products" replace />} />
          </Routes>
        </React.Suspense>
      </div>
    </div>
  )
}
