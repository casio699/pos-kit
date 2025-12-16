import { useEffect, useState } from 'react'
import { usePermissions } from '../hooks/usePermissions'
import LoadingSpinner from '../components/LoadingSpinner'
import { api } from '../api/client'
import { toast } from 'sonner'

interface Product {
  id: string
  name: string
  price: string
  description?: string
  sku?: string
  stock?: number
  created_at: string
  is_active: boolean
}

export default function Products() {
  const { isAdmin } = usePermissions()
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'created_at'>('name')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')
  const [priceRange, setPriceRange] = useState({ min: '', max: '' })
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    description: '',
    sku: '',
    stock: '',
  })

  const loadProducts = async () => {
    setLoading(true)
    try {
      const response = await api.get('/products')
      const products = Array.isArray(response?.data) ? response.data : []
      setProducts(products)
      
      if (products.length === 0) {
        toast.info('No products found. Add your first product to get started!')
      }
    } catch (error: any) {
      console.error('Failed to load products:', error)
      if (error.response?.status === 403) {
        // New tenant with no products yet
        setProducts([])
        toast.info('Welcome to your new store! Start by adding your first product.')
      } else {
        const errorMsg = error.response?.data?.message || 'Failed to load products. Please try again later.'
        toast.error(errorMsg)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/products', {
        name: newProduct.name,
        price: parseFloat(newProduct.price),
        description: newProduct.description,
        sku: newProduct.sku,
        stock: newProduct.stock ? parseInt(newProduct.stock) : 0,
      })

      setNewProduct({ name: '', price: '', description: '', sku: '', stock: '' })
      setShowCreateForm(false)
      toast.success('Product created successfully!')
      await loadProducts()
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to create product'
      console.error('Failed to create product:', error)
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const filteredAndSortedProducts = (products || [])
    .filter(product => {
      if (!product) return false
      
      const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (product.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (product.sku || '').toLowerCase().includes(searchTerm.toLowerCase())
      
      const price = parseFloat(product.price || '0')
      const minPrice = parseFloat(priceRange.min || '0')
      const maxPrice = parseFloat(priceRange.max || '999999')
      
      const matchesPrice = price >= minPrice && price <= maxPrice
      const matchesStatus = statusFilter === 'all' || 
                          (statusFilter === 'active' && product.is_active !== false) ||
                          (statusFilter === 'inactive' && product.is_active === false)
      
      return matchesSearch && matchesPrice && matchesStatus
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'price') return parseFloat(a.price) - parseFloat(b.price)
      if (sortBy === 'created_at') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      return 0
    })

  const toggleProductSelection = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const toggleAllProducts = () => {
    if (selectedProducts.length === filteredAndSortedProducts.length) {
      setSelectedProducts([])
    } else {
      setSelectedProducts(filteredAndSortedProducts.map(p => p.id))
    }
  }

  return (
    <div className="space-y-6">
      {/* Professional Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Products Management</h1>
            <p className="text-blue-100">Manage your product catalog with advanced tools</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setViewMode(viewMode === 'table' ? 'grid' : 'table')}
              className="px-4 py-2 bg-white/20 backdrop-blur rounded-lg hover:bg-white/30 transition-colors text-white font-medium"
            >
              {viewMode === 'table' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </button>
            {isAdmin() && (
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 font-medium transition-colors"
              >
                <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Product
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Advanced Search and Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
          <div className="lg:col-span-2">
            <div className="relative">
              <svg className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search products by name, SKU, or description..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
          
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="name">Sort by Name</option>
            <option value="price">Sort by Price</option>
            <option value="created_at">Sort by Date</option>
          </select>
        </div>

        {/* Price Range Filter */}
        <div className="flex flex-wrap items-center gap-4 pb-4 border-b">
          <span className="text-sm font-medium text-gray-700">Price Range:</span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min"
              value={priceRange.min}
              onChange={e => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
              className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            <span className="text-gray-500">-</span>
            <input
              type="number"
              placeholder="Max"
              value={priceRange.max}
              onChange={e => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
              className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
          {(priceRange.min || priceRange.max) && (
            <button
              onClick={() => setPriceRange({ min: '', max: '' })}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear Price Filter
            </button>
          )}
        </div>

        {/* Bulk Actions */}
        {selectedProducts.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <span className="text-sm font-medium text-blue-900">
                {selectedProducts.length} product{selectedProducts.length !== 1 ? 's' : ''} selected
              </span>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 bg-white border border-blue-300 rounded-lg text-sm text-blue-700 hover:bg-blue-50">
                  Export Selected
                </button>
                <button className="px-3 py-1.5 bg-white border border-blue-300 rounded-lg text-sm text-blue-700 hover:bg-blue-50">
                  Bulk Edit
                </button>
                <button className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">
                  Delete Selected
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

        {/* Create Product Form */}
        {showCreateForm && isAdmin() && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold mb-4">Create New Product</h3>
            <form onSubmit={handleCreateProduct} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Product Name"
                value={newProduct.name}
                onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                className="px-3 py-2 border rounded"
                required
              />
              <input
                type="number"
                step="0.01"
                placeholder="Price"
                value={newProduct.price}
                onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                className="px-3 py-2 border rounded"
                required
              />
              <input
                type="text"
                placeholder="SKU"
                value={newProduct.sku}
                onChange={e => setNewProduct({ ...newProduct, sku: e.target.value })}
                className="px-3 py-2 border rounded"
              />
              <input
                type="number"
                placeholder="Stock Quantity"
                value={newProduct.stock}
                onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })}
                className="px-3 py-2 border rounded"
                required
              />
              <textarea
                placeholder="Description"
                value={newProduct.description}
                onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                className="px-3 py-2 border rounded sm:col-span-2"
                rows={3}
              />
              <button
                type="submit"
                className="sm:col-span-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Create Product
              </button>
            </form>
          </div>
        )}

        {/* Products Display */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        {loading ? (
          <LoadingSpinner message="Loading products..." />
        ) : filteredAndSortedProducts.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500">
              {searchTerm || priceRange.min || priceRange.max || statusFilter !== 'all'
                ? 'Try adjusting your search or filters to find what you\'re looking for.'
                : 'Get started by adding your first product.'}
            </p>
          </div>
        ) : viewMode === 'table' ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-4 px-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedProducts.length === filteredAndSortedProducts.length && filteredAndSortedProducts.length > 0}
                      onChange={toggleAllProducts}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="py-4 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="py-4 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                  <th className="py-4 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="py-4 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Status</th>
                  <th className="py-4 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Created</th>
                  <th className="py-4 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAndSortedProducts.map(product => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => toggleProductSelection(product.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                          {product.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          {product.description && (
                            <div className="text-xs text-gray-500 truncate max-w-xs">
                              {product.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-mono text-xs text-gray-600">
                      {product.sku || '-'}
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm font-semibold text-gray-900">${parseFloat(product.price).toFixed(2)}</div>
                    </td>
                    <td className="py-4 px-4 hidden sm:table-cell">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        product.is_active 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-4 px-4 hidden lg:table-cell text-xs text-gray-500">
                      {new Date(product.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex gap-2">
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                          Edit
                        </button>
                        <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAndSortedProducts.map(product => (
              <div key={product.id} className="bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                      {product.name.charAt(0).toUpperCase()}
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product.id)}
                      onChange={() => toggleProductSelection(product.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1 truncate">{product.name}</h3>
                  <p className="text-sm text-gray-500 mb-2">{product.sku || 'No SKU'}</p>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-bold text-gray-900">${parseFloat(product.price).toFixed(2)}</span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      product.is_active 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  {product.description && (
                    <p className="text-xs text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                  )}
                  <div className="flex gap-2">
                    <button className="flex-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                      Edit
                    </button>
                    <button className="flex-1 px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-500 mb-1">Total Products</div>
              <div className="text-2xl font-bold text-gray-900">{filteredAndSortedProducts.length}</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-sm text-gray-500 mb-1">Active Products</div>
              <div className="text-2xl font-bold text-green-600">
                {filteredAndSortedProducts.filter(p => p.is_active).length}
              </div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-sm text-gray-500 mb-1">Avg Price</div>
              <div className="text-2xl font-bold text-blue-600">
                ${filteredAndSortedProducts.length > 0 
                  ? (filteredAndSortedProducts.reduce((sum, p) => sum + parseFloat(p.price), 0) / filteredAndSortedProducts.length).toFixed(2)
                  : '0.00'
                }
              </div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-sm text-gray-500 mb-1">Total Value</div>
              <div className="text-2xl font-bold text-purple-600">
                ${filteredAndSortedProducts.reduce((sum, p) => sum + parseFloat(p.price), 0).toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
