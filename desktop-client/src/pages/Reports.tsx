import React from 'react'
import { BarChart3, TrendingUp, DollarSign, Package } from 'lucide-react'

export default function Reports() {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <BarChart3 className="w-6 h-6" />
        Reports & Analytics
      </h2>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Sales</p>
              <p className="text-3xl font-bold">$12,450</p>
            </div>
            <DollarSign className="w-12 h-12 text-green-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Transactions</p>
              <p className="text-3xl font-bold">248</p>
            </div>
            <TrendingUp className="w-12 h-12 text-blue-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Avg Transaction</p>
              <p className="text-3xl font-bold">$50.20</p>
            </div>
            <BarChart3 className="w-12 h-12 text-purple-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Low Stock Items</p>
              <p className="text-3xl font-bold">5</p>
            </div>
            <Package className="w-12 h-12 text-orange-500 opacity-20" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Sales by Hour</h3>
        <div className="h-64 bg-gray-100 rounded flex items-center justify-center text-gray-500">
          Chart placeholder - integrate with charting library
        </div>
      </div>
    </div>
  )
}
