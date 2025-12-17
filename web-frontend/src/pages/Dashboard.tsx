import { useEffect, useState } from 'react'
import { usePermissions } from '../hooks/usePermissions'
import { useAuth } from '../store/auth'
import { motion } from 'framer-motion'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { reportsApi } from '../api/client'
import { toast } from 'sonner'
import { RefreshCw } from 'lucide-react'

interface DashboardStats {
  totalProducts: number
  totalSales: number
  totalRevenue: number
  pendingOrders: number
  lowStockItems: number
  recentActivity: any[]
  salesGrowth: number
  topProducts: any[]
  recentOrders: any[]
}

export default function Dashboard() {
  const { } = usePermissions()
  const { tenantId } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalSales: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    lowStockItems: 0,
    recentActivity: [],
    salesGrowth: 0,
    topProducts: [],
    recentOrders: [],
  })
  const [salesData, setSalesData] = useState<any[]>([])
  const [categoryData, setCategoryData] = useState<any[]>([])
  const [inventoryData, setInventoryData] = useState<any[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100
      }
    }
  }

  const chartVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        delay: 0.3
      }
    }
  }

  useEffect(() => {
    if (tenantId) {
      loadDashboardData()
    }
  }, [tenantId])

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (tenantId && !loading) {
        loadDashboardData()
      }
    }, 5 * 60 * 1000) // 5 minutes

    return () => clearInterval(interval)
  }, [tenantId, loading])

  const handleRefresh = async () => {
    if (!tenantId || isRefreshing) return
    
    setIsRefreshing(true)
    try {
      await loadDashboardData()
      setLastRefresh(new Date())
      toast.success('Dashboard refreshed successfully')
    } catch (error) {
      toast.error('Failed to refresh dashboard')
    } finally {
      setIsRefreshing(false)
    }
  }

  const loadDashboardData = async () => {
    if (!tenantId) return
    
    setLoading(true)
    try {
      // Load all dashboard data in parallel
      const [
        dashboardStats,
        salesAnalytics,
        inventoryHealth,
        topProducts,
        recentOrders,
      ] = await Promise.allSettled([
        reportsApi.getDashboardStats(tenantId).catch(() => ({ data: null })),
        reportsApi.getSalesAnalytics(tenantId, { period: '6months' }).catch(() => ({ data: null })),
        reportsApi.getInventoryHealth(tenantId).catch(() => ({ data: null })),
        reportsApi.getTopProducts(tenantId, { limit: 10 }).catch(() => ({ data: null })),
        reportsApi.getRecentOrders(tenantId, { limit: 10 }).catch(() => ({ data: null })),
      ])

      // Process dashboard stats
      if (dashboardStats.status === 'fulfilled' && dashboardStats.value.data) {
        const data = dashboardStats.value.data
        setStats({
          totalProducts: data.totalProducts || 0,
          totalSales: data.totalSales || 0,
          totalRevenue: data.totalRevenue || 0,
          pendingOrders: data.pendingOrders || 0,
          lowStockItems: data.lowStockItems || 0,
          recentActivity: data.recentActivity || [],
          salesGrowth: data.salesGrowth || 0,
          topProducts: data.topProducts || [],
          recentOrders: data.recentOrders || [],
        })
      } else {
        // Use fallback data if API fails
        setStats({
          totalProducts: 0,
          totalSales: 0,
          totalRevenue: 0,
          pendingOrders: 0,
          lowStockItems: 0,
          recentActivity: [],
          salesGrowth: 0,
          topProducts: [],
          recentOrders: [],
        })
      }

      // Process sales analytics
      if (salesAnalytics.status === 'fulfilled' && salesAnalytics.value.data) {
        setSalesData(salesAnalytics.value.data.chartData || [])
      } else {
        // Fallback chart data
        setSalesData([
          { month: 'Jan', sales: 0, revenue: 0 },
          { month: 'Feb', sales: 0, revenue: 0 },
          { month: 'Mar', sales: 0, revenue: 0 },
          { month: 'Apr', sales: 0, revenue: 0 },
          { month: 'May', sales: 0, revenue: 0 },
          { month: 'Jun', sales: 0, revenue: 0 },
        ])
      }

      // Process inventory health
      if (inventoryHealth.status === 'fulfilled' && inventoryHealth.value.data) {
        const health = inventoryHealth.value.data
        setCategoryData(health.categoryBreakdown || [])
        setInventoryData(health.inventoryStatus || [])
      } else {
        // Fallback data
        setCategoryData([
          { name: 'No Data', value: 1, color: '#e5e7eb' },
        ])
        setInventoryData([
          { category: 'No Data', inStock: 0, lowStock: 0, outOfStock: 0 },
        ])
      }

      // Update top products and recent orders if available
      if (topProducts.status === 'fulfilled' && topProducts.value.data) {
        setStats(prev => ({ ...prev, topProducts: topProducts.value.data }))
      }

      if (recentOrders.status === 'fulfilled' && recentOrders.value.data) {
        setStats(prev => ({ ...prev, recentOrders: recentOrders.value.data }))
      }

    } catch (error) {
      console.error('Failed to load dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header Section */}
      <motion.div variants={itemVariants} className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Dashboard Overview</h1>
            <p className="text-blue-100">Welcome back! Here's what's happening with your business today.</p>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-xs text-blue-200">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </span>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg p-2 transition-colors"
              title="Refresh dashboard"
            >
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Key Metrics Cards */}
      <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          { icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4", color: "blue", value: stats.totalProducts, label: "Total Products", trend: "+12%" },
          { icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z", color: "green", value: stats.totalSales, label: "Total Sales", trend: `+${stats.salesGrowth}%` },
          { icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1", color: "purple", value: `$${stats.totalRevenue.toFixed(0)}`, label: "Total Revenue", trend: "+8%" },
          { icon: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z", color: "orange", value: stats.pendingOrders, label: "Pending Orders", trend: "Avg" },
          { icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z", color: "red", value: stats.lowStockItems, label: "Low Stock Items", trend: "Alert" },
          { icon: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z", color: "indigo", value: `$${stats.totalSales > 0 ? (stats.totalRevenue / stats.totalSales).toFixed(0) : '0'}`, label: "Avg Order Value", trend: "Avg" }
        ].map((stat, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 bg-${stat.color}-100 rounded-lg flex items-center justify-center`}>
                <svg className={`w-6 h-6 text-${stat.color}-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                </svg>
              </div>
              <span className="text-xs text-gray-500 font-medium">{stat.trend}</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts Section */}
      <motion.div variants={containerVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend Chart */}
        <motion.div variants={chartVariants} whileHover={{ scale: 1.02 }} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales & Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="sales" stroke="#3B82F6" strokeWidth={2} />
              <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Category Distribution Chart */}
        <motion.div variants={chartVariants} whileHover={{ scale: 1.02 }} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({name, percent}) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </motion.div>

      {/* Inventory Status Chart */}
      <motion.div variants={chartVariants} whileHover={{ scale: 1.02 }} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Inventory Status by Category</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={inventoryData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="inStock" fill="#10B981" />
            <Bar dataKey="lowStock" fill="#F59E0B" />
            <Bar dataKey="outOfStock" fill="#EF4444" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      <motion.div variants={containerVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <button className="text-sm text-blue-600 hover:text-blue-800">View All</button>
          </div>
          <div className="space-y-4">
            {stats.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  activity.type === 'sale' ? 'bg-green-100' :
                  activity.type === 'inventory' ? 'bg-yellow-100' :
                  activity.type === 'order' ? 'bg-blue-100' :
                  'bg-gray-100'
                }`}>
                  <svg className={`w-4 h-4 ${
                    activity.type === 'sale' ? 'text-green-600' :
                    activity.type === 'inventory' ? 'text-yellow-600' :
                    activity.type === 'order' ? 'text-blue-600' :
                    'text-gray-600'
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {activity.type === 'sale' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />}
                    {activity.type === 'inventory' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />}
                    {activity.type === 'order' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />}
                    {activity.type === 'product' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />}
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                  {activity.amount && <p className="text-xs text-gray-500">${activity.amount}</p>}
                  {activity.quantity && <p className="text-xs text-gray-500">Qty: {activity.quantity}</p>}
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Top Products</h3>
            <button className="text-sm text-blue-600 hover:text-blue-800">View All</button>
          </div>
          <div className="space-y-4">
            {stats.topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.sales} sales</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">${product.revenue.toFixed(0)}</p>
                  <p className="text-xs text-gray-500">revenue</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
            <button className="text-sm text-blue-600 hover:text-blue-800">View All</button>
          </div>
          <div className="space-y-4">
            {stats.recentOrders.map((order, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    order.status === 'completed' ? 'bg-green-500' :
                    order.status === 'processing' ? 'bg-yellow-500' :
                    'bg-gray-500'
                  }`} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{order.id}</p>
                    <p className="text-xs text-gray-500">{order.customer}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">${order.amount}</p>
                  <p className="text-xs text-gray-500">{order.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Quick Actions & Additional Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <button className="px-4 py-3 bg-white rounded-lg shadow hover:shadow-md transition-shadow text-sm font-medium text-gray-700 hover:text-blue-600 border border-gray-200">
              <svg className="w-5 h-5 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              New Sale
            </button>
            <button className="px-4 py-3 bg-white rounded-lg shadow hover:shadow-md transition-shadow text-sm font-medium text-gray-700 hover:text-green-600 border border-gray-200">
              <svg className="w-5 h-5 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Add Product
            </button>
            <button className="px-4 py-3 bg-white rounded-lg shadow hover:shadow-md transition-shadow text-sm font-medium text-gray-700 hover:text-purple-600 border border-gray-200">
              <svg className="w-5 h-5 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              View Orders
            </button>
            <button className="px-4 py-3 bg-white rounded-lg shadow hover:shadow-md transition-shadow text-sm font-medium text-gray-700 hover:text-indigo-600 border border-gray-200">
              <svg className="w-5 h-5 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              Inventory
            </button>
          </div>
        </div>

        {/* Performance Chart Placeholder */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Sales Performance</h3>
            <select className="text-sm border rounded px-2 py-1">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 3 months</option>
            </select>
          </div>
          <div className="h-48 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <svg className="w-12 h-12 text-blue-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="text-sm text-gray-600">Chart visualization coming soon</p>
              <p className="text-xs text-gray-500 mt-1">Sales trend analysis</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
