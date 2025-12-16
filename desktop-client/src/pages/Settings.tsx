import React, { useState } from 'react'
import { Settings, Save, LogOut } from 'lucide-react'

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    storeName: 'Main Store',
    location: 'New York',
    currency: 'USD',
    taxRate: '10',
  })

  const handleChange = (field: string, value: string) => {
    setSettings({ ...settings, [field]: value })
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Settings className="w-6 h-6" />
        Settings
      </h2>

      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <div>
          <label className="block text-sm font-semibold mb-2">Store Name</label>
          <input
            type="text"
            value={settings.storeName}
            onChange={(e) => handleChange('storeName', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Location</label>
          <input
            type="text"
            value={settings.location}
            onChange={(e) => handleChange('location', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Currency</label>
          <select
            value={settings.currency}
            onChange={(e) => handleChange('currency', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option>USD</option>
            <option>EUR</option>
            <option>GBP</option>
            <option>CAD</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Tax Rate (%)</label>
          <input
            type="number"
            value={settings.taxRate}
            onChange={(e) => handleChange('taxRate', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="border-t pt-6 flex gap-3">
          <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition">
            <Save className="w-5 h-5" />
            Save Settings
          </button>
          <button className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition">
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}
