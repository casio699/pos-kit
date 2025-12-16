import React, { useEffect, useState } from 'react'
import { useAuth } from '../store/auth'
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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Create Location</h2>
        <div className="grid grid-cols-3 gap-3">
          <input className="border px-3 py-2 rounded" placeholder="Name" value={locName} onChange={e => setLocName(e.target.value)} />
          <input className="border px-3 py-2 rounded" placeholder="Type" value={locType} onChange={e => setLocType(e.target.value)} />
          <input className="border px-3 py-2 rounded" placeholder="Address" value={locAddress} onChange={e => setLocAddress(e.target.value)} />
        </div>
        <div className="mt-3 flex gap-2">
          <button onClick={onCreateLocation} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">{loading ? 'Working...' : 'Create'}</button>
          {error && <span className="text-sm text-red-600">{error}</span>}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Adjust Inventory</h2>
        <div className="grid grid-cols-3 gap-3">
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
          <input className="border px-3 py-2 rounded" type="number" value={quantity} onChange={e => setQuantity(parseInt(e.target.value || '0', 10))} />
        </div>
        <div className="mt-3">
          <button onClick={onAdjust} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">{loading ? 'Working...' : 'Adjust'}</button>
          {error && <span className="ml-3 text-sm text-red-600">{error}</span>}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Inventory</h2>
        {items.length === 0 ? (
          <p className="text-gray-500">No inventory yet</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600">
                <th className="py-2">Product</th>
                <th>Location</th>
                <th>Qty</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {items.map(i => (
                <tr key={i.id} className="border-t">
                  <td className="py-2">{i.product_id}</td>
                  <td>{i.location_id}</td>
                  <td>{i.qty_available}</td>
                  <td>{i.last_updated ? new Date(i.last_updated).toLocaleString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
