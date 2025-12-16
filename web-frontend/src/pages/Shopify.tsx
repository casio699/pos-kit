import { useState, useEffect } from 'react'
import { Store, Package, CheckCircle, AlertCircle, Loader, RefreshCw } from 'lucide-react'
import { shopifyApi } from '../api/client'

export default function Shopify() {
  const [syncStatus, setSyncStatus] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Sample product data for testing
  const [sampleProduct, setSampleProduct] = useState({
    name: 'Test Product',
    description: 'A test product for Shopify sync',
    price: 29.99,
    sku: 'TEST-001',
    stock: 100,
    active: true,
  })

  useEffect(() => {
    checkSyncStatus()
  }, [])

  const checkSyncStatus = async () => {
    setLoading(true)
    try {
      const response = await shopifyApi.getSyncStatus()
      setSyncStatus(response.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to get sync status')
    } finally {
      setLoading(false)
    }
  }

  const fetchShopifyProducts = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await shopifyApi.getProducts()
      setProducts(response.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch Shopify products')
    } finally {
      setLoading(false)
    }
  }

  const syncProductToShopify = async () => {
    setLoading(true)
    setError('')
    try {
      await shopifyApi.syncProducts([sampleProduct])
      setSyncStatus((prev: any) => ({
        ...prev,
        lastSync: new Date().toISOString(),
        lastAction: 'Product synced'
      }))
      alert('Product synced successfully!')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to sync product')
    } finally {
      setLoading(false)
    }
  }

  const syncInventoryToShopify = async () => {
    setLoading(true)
    setError('')
    try {
      const inventoryData = [{
        sku: sampleProduct.sku,
        quantity: sampleProduct.stock,
      }]
      await shopifyApi.syncInventory(inventoryData)
      setSyncStatus((prev: any) => ({
        ...prev,
        lastSync: new Date().toISOString(),
        lastAction: 'Inventory synced'
      }))
      alert('Inventory synced successfully!')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to sync inventory')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
          <div className="flex items-center mb-6">
            <Store className="h-8 w-8 text-green-600 mr-3" />
            <h1 className="text-2xl font-bold text-gray-900">Shopify Integration</h1>
          </div>

          {/* Sync Status */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-blue-800">Sync Status</h3>
                {syncStatus && (
                  <div className="mt-2 text-sm text-blue-700">
                    <p>Status: {syncStatus.status}</p>
                    <p>Store: {syncStatus.shop}</p>
                    <p>Last Sync: {syncStatus.lastSync ? new Date(syncStatus.lastSync).toLocaleString() : 'Never'}</p>
                    {syncStatus.lastAction && <p>Last Action: {syncStatus.lastAction}</p>}
                  </div>
                )}
              </div>
              <button
                onClick={checkSyncStatus}
                disabled={loading}
                className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Product Sync */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Product Sync
              </h2>

              <div className="bg-gray-50 rounded-md p-4">
                <h3 className="font-medium text-gray-700 mb-3">Sample Product</h3>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={sampleProduct.name}
                    onChange={(e) => setSampleProduct({...sampleProduct, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Product name"
                  />
                  <input
                    type="number"
                    value={sampleProduct.price}
                    onChange={(e) => setSampleProduct({...sampleProduct, price: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Price"
                    step="0.01"
                  />
                  <input
                    type="text"
                    value={sampleProduct.sku}
                    onChange={(e) => setSampleProduct({...sampleProduct, sku: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="SKU"
                  />
                  <input
                    type="number"
                    value={sampleProduct.stock}
                    onChange={(e) => setSampleProduct({...sampleProduct, stock: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Stock quantity"
                  />
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={syncProductToShopify}
                  disabled={loading}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <Loader className="animate-spin h-4 w-4 mr-2" />
                      Syncing...
                    </>
                  ) : (
                    'Sync Product to Shopify'
                  )}
                </button>
                <button
                  onClick={syncInventoryToShopify}
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <Loader className="animate-spin h-4 w-4 mr-2" />
                      Syncing...
                    </>
                  ) : (
                    'Sync Inventory'
                  )}
                </button>
              </div>
            </div>

            {/* Shopify Products */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800">Shopify Products</h2>
              
              <button
                onClick={fetchShopifyProducts}
                disabled={loading}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader className="animate-spin h-4 w-4 mr-2" />
                    Fetching...
                  </>
                ) : (
                  'Fetch Products from Shopify'
                )}
              </button>

              {products.length > 0 && (
                <div className="bg-gray-50 rounded-md p-4 max-h-96 overflow-y-auto">
                  <h3 className="font-medium text-gray-700 mb-3">
                    {products.length} Products Found
                  </h3>
                  <div className="space-y-3">
                    {products.map((product) => (
                      <div key={product.shopifyId} className="bg-white border border-gray-200 rounded-md p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">{product.title}</h4>
                            <p className="text-sm text-gray-500">Status: {product.status}</p>
                            <p className="text-sm text-gray-500">ID: {product.shopifyId}</p>
                          </div>
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        </div>
                        {product.variants && product.variants.length > 0 && (
                          <div className="mt-2 text-sm text-gray-600">
                            <p>Variants: {product.variants.length}</p>
                            {product.variants.map((variant: any, idx: number) => (
                              <div key={idx} className="ml-4 text-xs">
                                <p>SKU: {variant.sku || 'N/A'}</p>
                                <p>Price: ${variant.price}</p>
                                <p>Stock: {variant.inventory_quantity}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
