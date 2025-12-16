import React, { useEffect, useState } from 'react'
import { useAuth } from '../store/auth'
import { listProducts, listLocations, createSale, listSales } from '../api/client'

interface Product { id: string; sku: string; name: string; price?: number | string }
interface Location { id: string; name: string }
interface Sale {
  id: string
  tenant_id: string
  location_id: string
  total_amount: string | number
  payment_method: string
  created_at: string
}

export default function Sales() {
  const { tenantId } = useAuth()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [products, setProducts] = useState<Product[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [sales, setSales] = useState<Sale[]>([])

  const [productId, setProductId] = useState('')
  const [locationId, setLocationId] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [unitPrice, setUnitPrice] = useState(50)
  const [paymentMethod, setPaymentMethod] = useState('card')

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
      await loadAll()
    } catch (e: any) {
      setError(e.response?.data?.message || e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Create Sale</h2>
        <div className="grid grid-cols-5 gap-3">
          <select className="border px-3 py-2 rounded" value={productId} onChange={e => setProductId(e.target.value)}>
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.sku} — {p.name}</option>
            ))}
          </select>
          <select className="border px-3 py-2 rounded" value={locationId} onChange={e => setLocationId(e.target.value)}>
            {locations.map(l => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
          <input type="number" className="border px-3 py-2 rounded" value={quantity} onChange={e => setQuantity(parseInt(e.target.value || '0', 10))} />
          <input type="number" className="border px-3 py-2 rounded" value={unitPrice} onChange={e => setUnitPrice(parseFloat(e.target.value || '0'))} />
          <select className="border px-3 py-2 rounded" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
            <option value="card">Card</option>
            <option value="cash">Cash</option>
          </select>
        </div>
        <div className="mt-3 flex gap-2 items-center">
          <button onClick={onCheckout} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">{loading ? 'Processing...' : 'Checkout'}</button>
          {error && <span className="text-sm text-red-600">{error}</span>}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Recent Sales</h2>
        {sales.length === 0 ? (
          <p className="text-gray-500">No sales yet</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600">
                <th className="py-2">ID</th>
                <th>Location</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {sales.map(s => (
                <tr key={s.id} className="border-t">
                  <td className="py-2">{s.id}</td>
                  <td>{s.location_id}</td>
                  <td>{typeof s.total_amount === 'string' ? s.total_amount : s.total_amount.toFixed(2)}</td>
                  <td>{s.payment_method}</td>
                  <td>{new Date(s.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
