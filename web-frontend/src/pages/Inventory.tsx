import { useEffect, useState } from 'react'
import { useAuth } from '../store/auth'
import { usePermissions } from '../hooks/usePermissions'
import LoadingSpinner from '../components/LoadingSpinner'
import { listProducts, listInventory, createLocation, listLocations, adjustInventory } from '../api/client'

interface Product { id: string; sku: string; name: string }
interface Location { id: string; name: string; type?: string }
interface InventoryItem {
  id: string
  tenant_id: string
  product_id: string
  location_id: string
  qty_available: number
  created_at: string
  last_updated?: string
}

export default function Inventory() {
  const { tenantId } = useAuth()
  const { isAdmin } = usePermissions()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLocation, setSelectedLocation] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')
  const [showLowStockOnly, setShowLowStockOnly] = useState(false)

  const [products, setProducts] = useState<Product[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [items, setItems] = useState<InventoryItem[]>([])

  // forms
  const [locName, setLocName] = useState('Main Store')
  const [locType, setLocType] = useState('store')
  const [locAddress, setLocAddress] = useState('')

  const [productId, setProductId] = useState('')
  const [locationId, setLocationId] = useState('')
  const [quantity, setQuantity] = useState(10)

  const loadAll = async () => {
    setLoading(true)
    setError(null)
    try {
      const [prod, loc, inv] = await Promise.all([
        listProducts(tenantId),
        listLocations(tenantId).catch(() => []),
        listInventory(tenantId),
      ])
      setProducts(prod)
      setLocations(loc)
      setItems(inv)
      if (prod[0] && !productId) setProductId(prod[0].id)
      if (loc[0] && !locationId) setLocationId(loc[0].id)
    } catch (e: any) {
      setError(e.response?.data?.message || e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onCreateLocation = async () => {
    setLoading(true)
    setError(null)
    try {
      await createLocation(tenantId, { name: locName, type: locType, address: locAddress })
      await loadAll()
    } catch (e: any) {
      setError(e.response?.data?.message || e.message)
    } finally {
      setLoading(false)
    }
  }

  const onAdjust = async () => {
    if (!productId || !locationId) return
    setLoading(true)
    setError(null)
    try {
      await adjustInventory(tenantId, { product_id: productId, location_id: locationId, quantity })
      await loadAll()
    } catch (e: any) {
      setError(e.response?.data?.message || e.message)
    } finally {
      setLoading(false)
    }
  }

  // Add filtering logic after the onAdjust function
  const filteredItems = items.filter(item => {
    const product = products.find(p => p.id === item.product_id)
    const location = locations.find(l => l.id === item.location_id)
    
    const matchesSearch = !searchTerm || 
      product?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product?.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location?.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesLocation = selectedLocation === 'all' || item.location_id === selectedLocation
    const matchesLowStock = !showLowStockOnly || item.qty_available <= 10
    
    return matchesSearch && matchesLocation && matchesLowStock
  })

  const getInventoryStats = () => {
    const totalItems = filteredItems.length
    const lowStockItems = filteredItems.filter(item => item.qty_available <= 10).length
    const outOfStockItems = filteredItems.filter(item => item.qty_available === 0).length
    const totalQuantity = filteredItems.reduce((sum, item) => sum + item.qty_available, 0)
    
    return { totalItems, lowStockItems, outOfStockItems, totalQuantity }
  }

  const stats = getInventoryStats()

  return (
    <div className="space-y-6">
      {/* Professional Header */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Inventory Management</h1>
            <p className="text-green-100">Track and manage your stock across all locations</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')}
              className="px-4 py-2 bg-white/20 backdrop-blur rounded-lg hover:bg-white/30 transition-colors text-white font-medium"
            >
              {viewMode === 'table' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </button>
            {isAdmin() && (
              <button className="px-4 py-2 bg-white text-green-600 rounded-lg hover:bg-green-50 font-medium transition-colors">
                <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Location
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <span className="text-xs text-gray-500 font-medium">Total</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.totalItems}</div>
          <div className="text-sm text-gray-600">Inventory Items</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <span className="text-xs text-yellow-500 font-medium">Alert</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.lowStockItems}</div>
          <div className="text-sm text-gray-600">Low Stock Items</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <span className="text-xs text-red-500 font-medium">Critical</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.outOfStockItems}</div>
          <div className="text-sm text-gray-600">Out of Stock</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
            </div>
            <span className="text-xs text-blue-500 font-medium">Total</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.totalQuantity}</div>
          <div className="text-sm text-gray-600">Total Quantity</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="relative">
            <svg className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search inventory..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={selectedLocation}
            onChange={e => setSelectedLocation(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="all">All Locations</option>
            {locations.map(loc => (
              <option key={loc.id} value={loc.id}>{loc.name}</option>
            ))}
          </select>
          
          <div className="flex items-center gap-3">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showLowStockOnly}
                onChange={e => setShowLowStockOnly(e.target.checked)}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500 mr-2"
              />
              <span className="text-sm text-gray-700">Show low stock only</span>
            </label>
          </div>
        </div>
      </div>
          {/* Inventory Display */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        {loading ? (
          <LoadingSpinner message="Loading inventory..." />
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No inventory found</h3>
            <p className="text-gray-500">
              {searchTerm || selectedLocation !== 'all' || showLowStockOnly
                ? 'Try adjusting your search or filters to find what you\'re looking for.'
                : 'Get started by adding inventory items.'}
            </p>
          </div>
        ) : viewMode === 'table' ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-4 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="py-4 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="py-4 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th className="py-4 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="py-4 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Last Updated</th>
                  <th className="py-4 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredItems.map(item => {
                  const product = products.find(p => p.id === item.product_id)
                  const location = locations.find(l => l.id === item.location_id)
                  const isLowStock = item.qty_available <= 10
                  const isOutOfStock = item.qty_available === 0
                  
                  return (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center text-white font-bold mr-3">
                            {product?.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{product?.name}</div>
                            <div className="text-xs text-gray-500">{product?.sku}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-gray-900">{location?.name}</div>
                        <div className="text-xs text-gray-500">{location?.type}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-lg font-semibold text-gray-900">{item.qty_available}</div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          isOutOfStock 
                            ? 'bg-red-100 text-red-800'
                            : isLowStock 
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'In Stock'}
                        </span>
                      </td>
                      <td className="py-4 px-4 hidden lg:table-cell text-xs text-gray-500">
                        {item.last_updated ? new Date(item.last_updated).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2">
                          <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                            Adjust
                          </button>
                          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                            History
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* Cards View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map(item => {
              const product = products.find(p => p.id === item.product_id)
              const location = locations.find(l => l.id === item.location_id)
              const isLowStock = item.qty_available <= 10
              const isOutOfStock = item.qty_available === 0
              
              return (
                <div key={item.id} className="bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center text-white font-bold">
                        {product?.name.charAt(0).toUpperCase()}
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        isOutOfStock 
                          ? 'bg-red-100 text-red-800'
                          : isLowStock 
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {isOutOfStock ? 'Out' : isLowStock ? 'Low' : 'In Stock'}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1 truncate">{product?.name}</h3>
                    <p className="text-sm text-gray-500 mb-2">{product?.sku}</p>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-bold text-gray-900">{item.qty_available}</span>
                      <span className="text-xs text-gray-500">units</span>
                    </div>
                    <div className="text-xs text-gray-600 mb-3">
                      <div className="flex items-center mb-1">
                        <svg className="w-3 h-3 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {location?.name}
                      </div>
                      <div className="text-gray-400">
                        {item.last_updated ? `Updated ${new Date(item.last_updated).toLocaleDateString()}` : 'Never updated'}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="flex-1 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700">
                        Adjust
                      </button>
                      <button className="flex-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                        History
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Quick Actions Panel */}
      {isAdmin() && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Create Location */}
          <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Location</h3>
            <div className="space-y-4">
              <input
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Location Name"
                value={locName}
                onChange={e => setLocName(e.target.value)}
              />
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={locType}
                onChange={e => setLocType(e.target.value)}
              >
                <option value="store">Store</option>
                <option value="warehouse">Warehouse</option>
                <option value="supplier">Supplier</option>
              </select>
              <input
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Address (optional)"
                value={locAddress}
                onChange={e => setLocAddress(e.target.value)}
              />
              <button
                onClick={onCreateLocation}
                disabled={loading}
                className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Location'}
              </button>
              {error && <span className="text-sm text-red-600">{error}</span>}
            </div>
          </div>

          {/* Adjust Inventory */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Inventory Adjustment</h3>
            <div className="space-y-4">
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={productId}
                onChange={e => setProductId(e.target.value)}
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.sku} — {p.name}</option>
                ))}
              </select>
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={locationId}
                onChange={e => setLocationId(e.target.value)}
              >
                {locations.map(l => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
              <input
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                type="number"
                placeholder="Quantity"
                value={quantity}
                onChange={e => setQuantity(parseInt(e.target.value || '0', 10))}
              />
              <button
                onClick={onAdjust}
                disabled={loading}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50"
              >
                {loading ? 'Adjusting...' : 'Adjust Inventory'}
              </button>
              {error && <span className="text-sm text-red-600">{error}</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
