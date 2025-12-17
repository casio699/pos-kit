import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import Layout from './components/Layout'
import Login from './pages/Login'
import { useAuth } from './store/auth'
import Checkout from './pages/Checkout'
import Inventory from './pages/Inventory'
import Reports from './pages/Reports'
import PurchaseOrders from './pages/PurchaseOrders'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, _hasHydrated, setHasHydrated } = useAuth()
  
  console.log('ProtectedRoute - _hasHydrated:', _hasHydrated, 'token:', token)
  
  // Force hydration after timeout if stuck
  useEffect(() => {
    if (!_hasHydrated) {
      const timer = setTimeout(() => {
        console.log('Forcing hydration to prevent infinite loading')
        setHasHydrated(true)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [_hasHydrated, setHasHydrated])
  
  if (!_hasHydrated) {
    console.log('ProtectedRoute - Still hydrating, showing loading')
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing POS System...</p>
        </div>
      </div>
    )
  }
  
  if (!token) {
    console.log('ProtectedRoute - No token, redirecting to login')
    return <Navigate to="/login" replace />
  }
  
  console.log('ProtectedRoute - Has token, rendering children')
  return <Layout>{children}</Layout>
}

export default function AppRouter() {
  const { validateToken, _hasHydrated, setHasHydrated } = useAuth()

  console.log('AppRouter - _hasHydrated:', _hasHydrated)

  useEffect(() => {
    if (_hasHydrated) {
      console.log('AppRouter - Hydrated, validating token')
      validateToken()
    } else {
      // Force initialization after a short delay
      const timer = setTimeout(() => {
        console.log('AppRouter - Forcing app initialization')
        setHasHydrated(true)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [_hasHydrated, validateToken, setHasHydrated])

  if (!_hasHydrated) {
    console.log('AppRouter - Still hydrating, showing loading')
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading KiTS POS...</p>
        </div>
      </div>
    )
  }

  console.log('AppRouter - Hydrated, rendering Router')

  return (
    <Router>
      <div className="App">
        <Toaster position="top-right" richColors closeButton />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
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
            path="/reports"
            element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/purchase-orders"
            element={
              <ProtectedRoute>
                <PurchaseOrders />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/checkout" replace />} />
        </Routes>
      </div>
    </Router>
  )
}
