import React, { useState } from 'react'
import { Package, Plus, Minus, ArrowRight } from 'lucide-react'

export default function Inventory() {
  const [items] = useState([
    { id: '1', sku: 'SKU001', name: 'Product A', qty: 50, location: 'Main Store' },
    { id: '2', sku: 'SKU002', name: 'Product B', qty: 25, location: 'Main Store' },
    { id: '3', sku: 'SKU003', name: 'Product C', qty: 0, location: 'Warehouse' },
  ])

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Package className="w-6 h-6" />
          Inventory Management
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="text-left px-4 py-2">SKU</th>
                <th className="text-left px-4 py-2">Product Name</th>
                <th className="text-center px-4 py-2">Quantity</th>
                <th className="text-left px-4 py-2">Location</th>
                <th className="text-center px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2 font-mono text-xs">{item.sku}</td>
                  <td className="px-4 py-2">{item.name}</td>
                  <td className={`px-4 py-2 text-center font-semibold ${item.qty === 0 ? 'text-red-600' : ''}`}>
                    {item.qty}
                  </td>
                  <td className="px-4 py-2">{item.location}</td>
                  <td className="px-4 py-2 text-center flex justify-center gap-2">
                    <button className="p-1 hover:bg-blue-100 rounded text-blue-600">
                      <Plus className="w-4 h-4" />
                    </button>
                    <button className="p-1 hover:bg-red-100 rounded text-red-600">
                      <Minus className="w-4 h-4" />
                    </button>
                    <button className="p-1 hover:bg-green-100 rounded text-green-600">
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
