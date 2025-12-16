import { useEffect, useState } from 'react'
import { useAuth } from '../store/auth'
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
  const { tenantId, token, email } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<Product[]>([])

  // Debug: Log authentication state
  console.log('Auth state:', { tenantId, token: token ? 'present' : 'missing', email })

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
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Create Product</h2>
        <div className="grid grid-cols-4 gap-4">
          <input className="border px-3 py-2 rounded" placeholder="SKU" value={sku} onChange={e => setSku(e.target.value)} />
          <input className="border px-3 py-2 rounded" placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
          <input className="border px-3 py-2 rounded" type="number" placeholder="Price" value={price} onChange={e => setPrice(parseFloat(e.target.value))} />
          <input className="border px-3 py-2 rounded" type="number" placeholder="Cost" value={cost} onChange={e => setCost(parseFloat(e.target.value))} />
        </div>
        <div className="mt-3 flex gap-2">
          <button onClick={create} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">{loading ? 'Saving...' : 'Create'}</button>
          <button onClick={load} disabled={loading} className="px-4 py-2 bg-gray-100 rounded">Refresh</button>
          {error && <span className="text-sm text-red-600">{error}</span>}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Products</h2>
        {items.length === 0 ? (
          <p className="text-gray-500">No products yet</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600">
                <th className="py-2">SKU</th>
                <th>Name</th>
                <th>Price</th>
                <th>Cost</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {items.map(p => (
                <tr key={p.id} className="border-t">
                  <td className="py-2">{p.sku}</td>
                  <td>{p.name}</td>
                  <td>{typeof p.price === 'string' ? p.price : p.price.toFixed(2)}</td>
                  <td>{typeof p.cost === 'string' ? p.cost : p.cost.toFixed(2)}</td>
                  <td>{new Date(p.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
