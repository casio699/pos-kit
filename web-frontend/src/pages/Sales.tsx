import { useEffect, useState } from 'react'
import { useAuth } from '../store/auth'
import { usePermissions } from '../hooks/usePermissions'
import LoadingSpinner from '../components/LoadingSpinner'
import { listProducts, listLocations, createSale, listSales } from '../api/client'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { toast } from 'sonner'
import { Eye, Receipt, CreditCard, DollarSign, Smartphone, Calendar, Filter, X, Download, RefreshCw } from 'lucide-react'

interface Product { id: string; sku: string; name: string; price?: number | string }
interface Location { id: string; name: string }
interface Sale {
  id: string
  tenant_id: string
  location_id: string
  total_amount: string | number
  payment_method: string
  created_at: string
  status?: string
  customer_name?: string
  customer_email?: string
  items?: SaleItem[]
  refunded_amount?: number
  tax_amount?: number
  discount_amount?: number
}

interface SaleItem {
  id: string
  product_id: string
  product_name: string
  sku: string
  quantity: number
  unit_price: number
  total_price: number
}

export default function Sales() {
  const { tenantId } = useAuth()
  const { isAdmin } = usePermissions()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLocation, setSelectedLocation] = useState<string>('all')
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')
  const [showCreateSale, setShowCreateSale] = useState(false)
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)
  const [showSaleDetails, setShowSaleDetails] = useState(false)
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  const [products, setProducts] = useState<Product[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [sales, setSales] = useState<Sale[]>([])

  const [productId, setProductId] = useState('')
  const [locationId, setLocationId] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [unitPrice, setUnitPrice] = useState(50)
  const [paymentMethod, setPaymentMethod] = useState('card')

  // Sample chart data for sales analytics
  const salesTrendData = [
    { date: 'Mon', sales: 1200, revenue: 4800 },
    { date: 'Tue', sales: 1800, revenue: 7200 },
    { date: 'Wed', sales: 1500, revenue: 6000 },
    { date: 'Thu', sales: 2200, revenue: 8800 },
    { date: 'Fri', sales: 2800, revenue: 11200 },
    { date: 'Sat', sales: 3200, revenue: 12800 },
    { date: 'Sun', sales: 2100, revenue: 8400 },
  ]

  const paymentMethodData = [
    { name: 'Credit Card', value: 65, color: '#3B82F6' },
    { name: 'Cash', value: 20, color: '#10B981' },
    { name: 'Mobile', value: 10, color: '#F59E0B' },
    { name: 'Other', value: 5, color: '#EF4444' },
  ]

  const topProductsData = [
    { name: 'Product A', sales: 45, revenue: 2250 },
    { name: 'Product B', sales: 38, revenue: 1900 },
    { name: 'Product C', sales: 32, revenue: 1600 },
    { name: 'Product D', sales: 28, revenue: 1400 },
    { name: 'Product E', sales: 22, revenue: 1100 },
  ]

  const loadAll = async () => {
    setLoading(true)
    setError(null)
    try {
      const [prod, loc, sl] = await Promise.all([
        listProducts(tenantId),
        listLocations(tenantId).catch(() => []),
        listSales(tenantId).catch(() => []),
      ])
      setProducts(prod)
      setLocations(loc)
      setSales(sl)
      if (prod[0] && !productId) setProductId(prod[0].id)
      if (loc[0] && !locationId) setLocationId(loc[0].id)
      if (prod[0] && prod[0].price && typeof prod[0].price === 'string') {
        setUnitPrice(parseFloat(prod[0].price))
      }
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

  const onCheckout = async () => {
    if (!productId || !locationId) return
    setLoading(true)
    setError(null)
    try {
      const total = unitPrice * quantity
      await createSale(tenantId, {
        location_id: locationId,
        lines: [{ product_id: productId, quantity, unit_price: unitPrice, discount: 0 }],
        total_amount: total,
        payment_method: paymentMethod,
      })
      toast.success('Sale completed successfully!')
      await loadAll()
    } catch (e: any) {
      setError(e.response?.data?.message || e.message)
      toast.error('Failed to complete sale')
    } finally {
      setLoading(false)
    }
  }

  // Sale detail functions
  const viewSaleDetails = (sale: Sale) => {
    setSelectedSale(sale)
    setShowSaleDetails(true)
  }

  const exportSalesData = () => {
    const csvData = filteredSales.map(sale => {
      const location = locations.find(l => l.id === sale.location_id)
      return {
        'Sale ID': sale.id,
        'Date': new Date(sale.created_at).toLocaleDateString(),
        'Location': location?.name || 'Unknown',
        'Amount': sale.total_amount,
        'Payment Method': sale.payment_method,
        'Status': sale.status || 'completed',
        'Customer': sale.customer_name || 'Guest',
      }
    })

    const headers = Object.keys(csvData[0] || {})
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => row[header]).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sales_export_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)

    toast.success('Sales data exported successfully')
  }

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'card':
        return <CreditCard className="w-4 h-4" />
      case 'cash':
        return <DollarSign className="w-4 h-4" />
      case 'mobile':
        return <Smartphone className="w-4 h-4" />
      default:
        return <Receipt className="w-4 h-4" />
    }
  }

  // Add filtering logic after the onCheckout function
  const filteredSales = sales.filter(sale => {
    const location = locations.find(l => l.id === sale.location_id)
    
    const matchesSearch = !searchTerm || 
      sale.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.payment_method.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesLocation = selectedLocation === 'all' || sale.location_id === selectedLocation
    const matchesPayment = selectedPaymentMethod === 'all' || sale.payment_method === selectedPaymentMethod
    
    // Date range filtering
    let matchesDate = true
    if (dateRange.start || dateRange.end) {
      const saleDate = new Date(sale.created_at)
      const startDate = dateRange.start ? new Date(dateRange.start) : new Date('1900-01-01')
      const endDate = dateRange.end ? new Date(dateRange.end) : new Date('2100-12-31')
      matchesDate = saleDate >= startDate && saleDate <= endDate
    }
    
    return matchesSearch && matchesLocation && matchesPayment && matchesDate
  })

  const getSalesStats = () => {
    const totalSales = filteredSales.length
    const totalRevenue = filteredSales.reduce((sum, sale) => sum + parseFloat(sale.total_amount.toString()), 0)
    const avgSaleAmount = totalSales > 0 ? totalRevenue / totalSales : 0
    const cardSales = filteredSales.filter(s => s.payment_method === 'card').length
    const cashSales = filteredSales.filter(s => s.payment_method === 'cash').length
    
    return { totalSales, totalRevenue, avgSaleAmount, cardSales, cashSales }
  }

  const stats = getSalesStats()

  return (
    <div className="space-y-6">
      {/* Professional Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Sales Management</h1>
            <p className="text-purple-100">Track and manage all your sales transactions</p>
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
            <button
              onClick={exportSalesData}
              className="px-4 py-2 bg-white/20 backdrop-blur rounded-lg hover:bg-white/30 transition-colors text-white font-medium"
              title="Export sales data"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={loadAll}
              className="px-4 py-2 bg-white/20 backdrop-blur rounded-lg hover:bg-white/30 transition-colors text-white font-medium"
              title="Refresh data"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            {isAdmin() && (
              <button
                onClick={() => setShowCreateSale(!showCreateSale)}
                className="px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-purple-50 font-medium transition-colors"
              >
                <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                New Sale
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <span className="text-xs text-gray-500 font-medium">Total</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.totalSales}</div>
          <div className="text-sm text-gray-600">Sales</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <span className="text-xs text-green-500 font-medium">Revenue</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">${stats.totalRevenue.toFixed(2)}</div>
          <div className="text-sm text-gray-600">Total Revenue</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
            </div>
            <span className="text-xs text-blue-500 font-medium">Average</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">${stats.avgSaleAmount.toFixed(2)}</div>
          <div className="text-sm text-gray-600">Avg Sale</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <span className="text-xs text-yellow-500 font-medium">Card</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.cardSales}</div>
          <div className="text-sm text-gray-600">Card Sales</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <span className="text-xs text-indigo-500 font-medium">Cash</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.cashSales}</div>
          <div className="text-sm text-gray-600">Cash Sales</div>
        </div>
      </div>

      {/* Sales Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Sales Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="sales" stroke="#8B5CF6" strokeWidth={2} />
              <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Payment Methods Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={paymentMethodData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({name, percent}) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {paymentMethodData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Products Chart */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Selling Products</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={topProductsData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="sales" fill="#8B5CF6" />
            <Bar dataKey="revenue" fill="#10B981" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        {/* Main Filters */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
          <div className="relative">
            <svg className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search sales by ID, location, or customer..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={selectedLocation}
            onChange={e => setSelectedLocation(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Locations</option>
            {locations.map(loc => (
              <option key={loc.id} value={loc.id}>{loc.name}</option>
            ))}
          </select>
          
          <select
            value={selectedPaymentMethod}
            onChange={e => setSelectedPaymentMethod(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Payment Methods</option>
            <option value="card">Card</option>
            <option value="cash">Cash</option>
            <option value="mobile">Mobile</option>
          </select>
          
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition-colors"
          >
            <Filter className="w-4 h-4" />
            Advanced Filters
          </button>
        </div>

        {/* Advanced Filters Panel */}
        {showAdvancedFilters && (
          <div className="border-t pt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="relative">
                      <Calendar className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="date"
                        placeholder="Start date"
                        value={dateRange.start}
                        onChange={e => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                      />
                    </div>
                  </div>
                  <span className="text-gray-500">to</span>
                  <div className="flex-1">
                    <div className="relative">
                      <Calendar className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="date"
                        placeholder="End date"
                        value={dateRange.end}
                        onChange={e => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    setDateRange({ start: '', end: '' })
                    setSearchTerm('')
                    setSelectedLocation('all')
                    setSelectedPaymentMethod('all')
                  }}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Active Filters Display */}
        {(dateRange.start || dateRange.end) && (
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            <span className="text-xs text-gray-500">Active filters:</span>
            {dateRange.start && (
              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                From: {new Date(dateRange.start).toLocaleDateString()}
              </span>
            )}
            {dateRange.end && (
              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                To: {new Date(dateRange.end).toLocaleDateString()}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Create Sale Form */}
      {showCreateSale && isAdmin() && (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Sale</h3>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-4">
            <select
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              value={productId}
              onChange={e => setProductId(e.target.value)}
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.sku} — {p.name}</option>
              ))}
            </select>
            <select
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              value={locationId}
              onChange={e => setLocationId(e.target.value)}
            >
              {locations.map(l => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
            <input
              type="number"
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              value={quantity}
              onChange={e => setQuantity(parseInt(e.target.value || '0', 10))}
              placeholder="Quantity"
            />
            <input
              type="number"
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              value={unitPrice}
              onChange={e => setUnitPrice(parseFloat(e.target.value || '0'))}
              placeholder="Unit Price"
            />
            <select
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              value={paymentMethod}
              onChange={e => setPaymentMethod(e.target.value)}
            >
              <option value="card">Card</option>
              <option value="cash">Cash</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold text-gray-900">
              Total: ${(unitPrice * quantity).toFixed(2)}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateSale(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onCheckout}
                disabled={loading}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Complete Sale'}
              </button>
            </div>
          </div>
          {error && <div className="mt-3 text-sm text-red-600">{error}</div>}
        </div>
      )}

      {/* Sales Display */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        {loading ? (
          <LoadingSpinner message="Loading sales..." />
        ) : filteredSales.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No sales found</h3>
            <p className="text-gray-500">
              {searchTerm || selectedLocation !== 'all' || selectedPaymentMethod !== 'all'
                ? 'Try adjusting your search or filters to find what you\'re looking for.'
                : 'Get started by creating your first sale.'}
            </p>
          </div>
        ) : viewMode === 'table' ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-4 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sale ID</th>
                  <th className="py-4 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="py-4 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="py-4 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="py-4 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Method</th>
                  <th className="py-4 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Date</th>
                  <th className="py-4 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredSales.map(sale => {
                  const location = locations.find(l => l.id === sale.location_id)
                  return (
                    <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="text-sm font-medium text-gray-900">{sale.id}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-gray-900">
                          {sale.customer_name || 'Guest'}
                          {sale.customer_email && (
                            <div className="text-xs text-gray-500">{sale.customer_email}</div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-gray-900">{location?.name || 'Unknown'}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-lg font-semibold text-gray-900">
                          ${typeof sale.total_amount === 'string' ? sale.total_amount : sale.total_amount.toFixed(2)}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          {getPaymentIcon(sale.payment_method)}
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            sale.payment_method === 'card'
                              ? 'bg-yellow-100 text-yellow-800'
                              : sale.payment_method === 'cash'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {sale.payment_method === 'card' ? 'Card' : sale.payment_method === 'cash' ? 'Cash' : 'Mobile'}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 hidden lg:table-cell text-xs text-gray-500">
                        {new Date(sale.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => viewSaleDetails(sale)}
                            className="text-purple-600 hover:text-purple-800 text-sm font-medium flex items-center gap-1"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </button>
                          <button className="text-gray-600 hover:text-gray-800 text-sm font-medium flex items-center gap-1">
                            <Receipt className="w-4 h-4" />
                            Receipt
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
            {filteredSales.map(sale => {
              const location = locations.find(l => l.id === sale.location_id)
              return (
                <div key={sale.id} className="bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center text-white font-bold">
                        {sale.id.charAt(0).toUpperCase()}
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        sale.payment_method === 'card'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {sale.payment_method === 'card' ? 'Card' : 'Cash'}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">Sale #{sale.id}</h3>
                    <p className="text-sm text-gray-500 mb-2">{location?.name || 'Unknown Location'}</p>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-bold text-gray-900">
                        ${typeof sale.total_amount === 'string' ? sale.total_amount : sale.total_amount.toFixed(2)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(sale.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => viewSaleDetails(sale)}
                        className="flex-1 px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700"
                      >
                        Details
                      </button>
                      <button className="flex-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                        Receipt
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Sale Details Modal */}
      {showSaleDetails && selectedSale && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Sale Details</h2>
                <button
                  onClick={() => setShowSaleDetails(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Sale Header */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">Sale #{selectedSale.id}</h3>
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                    selectedSale.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : selectedSale.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedSale.status || 'completed'}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  {new Date(selectedSale.created_at).toLocaleString()}
                </div>
              </div>

              {/* Customer Information */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Customer Information</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">Name</div>
                      <div className="font-medium text-gray-900">
                        {selectedSale.customer_name || 'Guest Customer'}
                      </div>
                    </div>
                    {selectedSale.customer_email && (
                      <div>
                        <div className="text-sm text-gray-500">Email</div>
                        <div className="font-medium text-gray-900">{selectedSale.customer_email}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Location Information */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Location</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="font-medium text-gray-900">
                    {locations.find(l => l.id === selectedSale.location_id)?.name || 'Unknown Location'}
                  </div>
                </div>
              </div>

              {/* Sale Items */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Items Purchased</h4>
                <div className="bg-gray-50 rounded-lg overflow-hidden">
                  {selectedSale.items && selectedSale.items.length > 0 ? (
                    <div className="divide-y divide-gray-200">
                      {selectedSale.items.map((item) => (
                        <div key={item.id} className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-gray-900">{item.product_name}</div>
                              <div className="text-sm text-gray-500">SKU: {item.sku}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium text-gray-900">
                                ${item.total_price.toFixed(2)}
                              </div>
                              <div className="text-sm text-gray-500">
                                {item.quantity} × ${item.unit_price.toFixed(2)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      No item details available
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Information */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Payment Information</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">Payment Method</div>
                      <div className="flex items-center gap-2 font-medium text-gray-900">
                        {getPaymentIcon(selectedSale.payment_method)}
                        {selectedSale.payment_method.charAt(0).toUpperCase() + selectedSale.payment_method.slice(1)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Total Amount</div>
                      <div className="font-medium text-gray-900">
                        ${typeof selectedSale.total_amount === 'string' 
                          ? selectedSale.total_amount 
                          : selectedSale.total_amount.toFixed(2)}
                      </div>
                    </div>
                    {selectedSale.tax_amount && (
                      <div>
                        <div className="text-sm text-gray-500">Tax Amount</div>
                        <div className="font-medium text-gray-900">${selectedSale.tax_amount.toFixed(2)}</div>
                      </div>
                    )}
                    {selectedSale.discount_amount && (
                      <div>
                        <div className="text-sm text-gray-500">Discount Amount</div>
                        <div className="font-medium text-gray-900">${selectedSale.discount_amount.toFixed(2)}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-600">Total Amount Paid</div>
                    <div className="text-2xl font-bold text-gray-900">
                      ${typeof selectedSale.total_amount === 'string' 
                        ? selectedSale.total_amount 
                        : selectedSale.total_amount.toFixed(2)}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowSaleDetails(false)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                    >
                      Close
                    </button>
                    <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors flex items-center gap-2">
                      <Receipt className="w-4 h-4" />
                      Print Receipt
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
