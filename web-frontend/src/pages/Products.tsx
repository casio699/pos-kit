import { useEffect, useState } from 'react'
import { useAuth } from '../store/auth'
import { usePermissions } from '../hooks/usePermissions'
import { listProducts, createProduct } from '../api/client'

interface Product {
  id: string
  tenant_id: string
  sku: string
  name: string
  price: string | number
  cost: string | number
  created_at: string
}

export default function Products() {
  const { tenantId } = useAuth()
  const { isAdmin } = usePermissions()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<Product[]>([])

  const [sku, setSku] = useState(`SKU-${Date.now()}`)
  const [name, setName] = useState('Test Product')
  const [price, setPrice] = useState(99.99)
  const [cost, setCost] = useState(50.0)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await listProducts(tenantId)
      setItems(data)
    } catch (e: any) {
      setError(e.response?.data?.message || e.message)
    } finally {
      setLoading(false)
    }
  }

  const create = async () => {
    setLoading(true)
    setError(null)
    try {
      await createProduct(tenantId, { sku, name, price, cost })
      await load()
      setSku(`SKU-${Date.now()}`)
      setName('Test Product')
    } catch (e: any) {
      setError(e.response?.data?.message || e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="space-y-6">
      {isAdmin() && (
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold mb-4">Create Product</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
            <input className="border px-3 py-2 rounded text-sm" placeholder="SKU" value={sku} onChange={e => setSku(e.target.value)} />
            <input className="border px-3 py-2 rounded text-sm" placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
            <input className="border px-3 py-2 rounded text-sm" type="number" placeholder="Price" value={price} onChange={e => setPrice(parseFloat(e.target.value))} />
            <input className="border px-3 py-2 rounded text-sm" type="number" placeholder="Cost" value={cost} onChange={e => setCost(parseFloat(e.target.value))} />
          </div>
          <div className="mt-3 flex flex-col sm:flex-row gap-2">
            <button onClick={create} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded text-sm">{loading ? 'Saving...' : 'Create'}</button>
            <button onClick={load} disabled={loading} className="px-4 py-2 bg-gray-100 rounded text-sm">Refresh</button>
            {error && <span className="text-sm text-red-600">{error}</span>}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold mb-4">Products</h2>
        {items.length === 0 ? (
          <p className="text-gray-500">No products yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600">
                  <th className="py-2 px-1">SKU</th>
                  <th className="px-1">Name</th>
                  <th className="px-1">Price</th>
                  <th className="px-1">Cost</th>
                  <th className="px-1 hidden sm:table-cell">Created</th>
                </tr>
              </thead>
              <tbody>
                {items.map(p => (
                  <tr key={p.id} className="border-t">
                    <td className="py-2 px-1">{p.sku}</td>
                    <td className="px-1">{p.name}</td>
                    <td className="px-1">{typeof p.price === 'string' ? p.price : p.price.toFixed(2)}</td>
                    <td className="px-1">{typeof p.cost === 'string' ? p.cost : p.cost.toFixed(2)}</td>
                    <td className="px-1 hidden sm:table-cell">{new Date(p.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
