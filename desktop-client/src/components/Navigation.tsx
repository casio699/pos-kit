import React from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, Package, BarChart3, Settings, Wifi, WifiOff } from 'lucide-react'

interface NavigationProps {
  isOnline: boolean
}

export default function Navigation({ isOnline }: NavigationProps) {
  return (
    <nav className="w-64 bg-gray-900 text-white p-6 flex flex-col">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">KiTS POS</h1>
        <p className="text-xs text-gray-400 mt-1">Universal POS System</p>
      </div>

      <div className="space-y-2 flex-1">
        <Link
          to="/"
          className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-800 transition"
        >
          <ShoppingCart className="w-5 h-5" />
          <span>Checkout</span>
        </Link>
        <Link
          to="/inventory"
          className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-800 transition"
        >
          <Package className="w-5 h-5" />
          <span>Inventory</span>
        </Link>
        <Link
          to="/reports"
          className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-800 transition"
        >
          <BarChart3 className="w-5 h-5" />
          <span>Reports</span>
        </Link>
        <Link
          to="/settings"
          className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-800 transition"
        >
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </Link>
      </div>

      <div className="border-t border-gray-700 pt-4">
        <div className="flex items-center gap-2 px-4 py-2">
          {isOnline ? (
            <>
              <Wifi className="w-4 h-4 text-green-400" />
              <span className="text-sm text-green-400">Online</span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-yellow-400">Offline</span>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
