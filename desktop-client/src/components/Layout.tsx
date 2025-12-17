import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ShoppingCart, Package, BarChart3, FileText, Settings, LogOut, Menu, X } from 'lucide-react'
import { useAuth } from '../store/auth'
import Checkout from '../pages/Checkout'
import Inventory from '../pages/Inventory'
import Reports from '../pages/Reports'
import PurchaseOrders from '../pages/PurchaseOrders'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(true)
  const { user, logout } = useAuth()

  const navigation = [
    { name: 'Checkout', href: '/checkout', icon: ShoppingCart },
    { name: 'Inventory', href: '/inventory', icon: Package },
    { name: 'Reports', href: '/reports', icon: BarChart3 },
    { name: 'Purchase Orders', href: '/purchase-orders', icon: FileText },
    { name: 'Settings', href: '/settings', icon: Settings },
  ]

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-white shadow-lg transition-all duration-300 ease-in-out`}>
        <div className="flex items-center justify-between p-4 border-b">
          {sidebarOpen && (
            <h1 className="text-xl font-bold text-gray-800">KiTS POS</h1>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <nav className="mt-4">
          {navigation.map((item) => {
            const Icon = item.icon
            return (
              <a
                key={item.name}
                href={item.href}
                className={`flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors ${
                  sidebarOpen ? '' : 'justify-center'
                }`}
              >
                <Icon className="w-5 h-5" />
                {sidebarOpen && <span className="ml-3">{item.name}</span>}
              </a>
            )
          })}
        </nav>

        {/* User section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          {sidebarOpen && user ? (
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {user.first_name} {user.last_name}
                </p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors justify-center w-full"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-gray-800">
                Point of Sale System
              </h2>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Online</span>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date().toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6">
          <Routes>
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/purchase-orders" element={<PurchaseOrders />} />
            <Route path="/settings" element={<div>Settings page coming soon...</div>} />
            <Route path="/" element={<Navigate to="/checkout" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
