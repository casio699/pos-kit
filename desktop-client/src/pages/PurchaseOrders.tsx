import React, { useState, useEffect } from 'react'
import { ShoppingCart, Plus, Eye, Package, Truck, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react'
import { useStore } from '../store/useStore'
import { useAuth } from '../store/auth'
import { PurchaseOrder, CreatePurchaseOrderRequest } from '../types/purchase-orders'
import { Product } from '../api/client'

export default function PurchaseOrders() {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showReceiveModal, setShowReceiveModal] = useState(false)
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  
  // Form state for creating PO
  const [newPO, setNewPO] = useState<CreatePurchaseOrderRequest>({
    supplier_name: '',
    expected_delivery_date: '',
    notes: '',
    lines: []
  })
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [lineQuantity, setLineQuantity] = useState(1)
  const [linePrice, setLinePrice] = useState(0)
  
  // Form state for receiving PO
  const [receiveLines, setReceiveLines] = useState<Record<string, number>>({})
  
  const { products, fetchProducts } = useStore()
  const { tenantId } = useAuth()

  useEffect(() => {
    if (tenantId) {
      fetchProducts(tenantId)
      fetchPurchaseOrders()
    }
  }, [tenantId])

  const fetchPurchaseOrders = async () => {
    if (!tenantId) return
    
    setIsLoading(true)
    try {
      // TODO: Replace with actual API call
      // const orders = await apiClient.getPurchaseOrders(tenantId)
      const mockOrders: PurchaseOrder[] = []
      setPurchaseOrders(mockOrders)
    } catch (error) {
      console.error('Failed to fetch purchase orders:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const createPurchaseOrder = async () => {
    if (!tenantId || newPO.lines.length === 0) return
    
    try {
      // TODO: Replace with actual API call
      // await apiClient.createPurchaseOrder(tenantId, newPO)
      
      setShowCreateModal(false)
      setNewPO({
        supplier_name: '',
        expected_delivery_date: '',
        notes: '',
        lines: []
      })
      fetchPurchaseOrders()
    } catch (error) {
      console.error('Failed to create purchase order:', error)
    }
  }

  const receivePurchaseOrder = async () => {
    if (!selectedPO || !tenantId) return
    
    try {
      // TODO: Replace with actual API call
      // await apiClient.receivePurchaseOrder(tenantId, selectedPO.id, receiveLines)
      
      setShowReceiveModal(false)
      setSelectedPO(null)
      setReceiveLines({})
      fetchPurchaseOrders()
    } catch (error) {
      console.error('Failed to receive purchase order:', error)
    }
  }

  const addLineToPO = () => {
    if (!selectedProduct) return
    
    const newLine = {
      product_id: selectedProduct.id,
      quantity: lineQuantity,
      unit_price: linePrice
    }
    
    setNewPO({
      ...newPO,
      lines: [...newPO.lines, newLine]
    })
    
    setSelectedProduct(null)
    setLineQuantity(1)
    setLinePrice(0)
  }

  const removeLineFromPO = (index: number) => {
    setNewPO({
      ...newPO,
      lines: newPO.lines.filter((_, i) => i !== index)
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <Clock className="w-4 h-4 text-gray-500" />
      case 'sent':
        return <Truck className="w-4 h-4 text-blue-500" />
      case 'partial':
        return <Package className="w-4 h-4 text-yellow-500" />
      case 'received':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      case 'sent':
        return 'bg-blue-100 text-blue-800'
      case 'partial':
        return 'bg-yellow-100 text-yellow-800'
      case 'received':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredPOs = purchaseOrders.filter(po => {
    const matchesSearch = searchTerm === '' || 
      po.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.supplier_name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || po.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ShoppingCart className="w-6 h-6" />
            Purchase Orders
          </h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create PO
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search PO number or supplier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="partial">Partial</option>
            <option value="received">Received</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Purchase Orders Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="text-left px-4 py-2">PO Number</th>
                <th className="text-left px-4 py-2">Supplier</th>
                <th className="text-left px-4 py-2">Status</th>
                <th className="text-right px-4 py-2">Total</th>
                <th className="text-left px-4 py-2">Expected Delivery</th>
                <th className="text-left px-4 py-2">Created</th>
                <th className="text-center px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPOs.map(po => (
                <tr key={po.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2 font-mono text-xs">{po.order_number}</td>
                  <td className="px-4 py-2">{po.supplier_name}</td>
                  <td className="px-4 py-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(po.status)}`}>
                      {getStatusIcon(po.status)}
                      <span className="ml-1 capitalize">{po.status}</span>
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right font-semibold">${po.total_amount.toFixed(2)}</td>
                  <td className="px-4 py-2">
                    {po.expected_delivery_date ? 
                      new Date(po.expected_delivery_date).toLocaleDateString() : 
                      'Not set'
                    }
                  </td>
                  <td className="px-4 py-2">
                    {new Date(po.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button
                      onClick={() => setSelectedPO(po)}
                      className="p-1 hover:bg-blue-100 rounded text-blue-600"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {(po.status === 'sent' || po.status === 'partial') && (
                      <button
                        onClick={() => {
                          setSelectedPO(po)
                          setShowReceiveModal(true)
                        }}
                        className="p-1 hover:bg-green-100 rounded text-green-600 ml-1"
                        title="Receive Items"
                      >
                        <Package className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPOs.length === 0 && !isLoading && (
          <div className="text-center py-12 text-gray-500">
            <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No purchase orders found</p>
          </div>
        )}

        {isLoading && (
          <div className="text-center py-12 text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p>Loading purchase orders...</p>
          </div>
        )}
      </div>

      {/* Create PO Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Create Purchase Order</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Supplier Name</label>
                <input
                  type="text"
                  value={newPO.supplier_name}
                  onChange={(e) => setNewPO({...newPO, supplier_name: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="Enter supplier name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Expected Delivery Date</label>
                <input
                  type="date"
                  value={newPO.expected_delivery_date}
                  onChange={(e) => setNewPO({...newPO, expected_delivery_date: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Notes</label>
              <textarea
                value={newPO.notes}
                onChange={(e) => setNewPO({...newPO, notes: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded"
                rows={3}
                placeholder="Optional notes..."
              />
            </div>

            {/* Add Line Item */}
            <div className="border-t pt-4 mb-4">
              <h4 className="font-medium mb-3">Add Line Items</h4>
              <div className="grid grid-cols-4 gap-2 mb-2">
                <select
                  value={selectedProduct?.id || ''}
                  onChange={(e) => {
                    const product = products.find(p => p.id === e.target.value)
                    setSelectedProduct(product || null)
                    if (product) {
                      setLinePrice(product.cost)
                    }
                  }}
                  className="p-2 border border-gray-300 rounded"
                >
                  <option value="">Select Product</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} ({product.sku})
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  value={lineQuantity}
                  onChange={(e) => setLineQuantity(parseInt(e.target.value) || 1)}
                  className="p-2 border border-gray-300 rounded"
                  placeholder="Qty"
                  min="1"
                />
                <input
                  type="number"
                  value={linePrice}
                  onChange={(e) => setLinePrice(parseFloat(e.target.value) || 0)}
                  className="p-2 border border-gray-300 rounded"
                  placeholder="Unit Price"
                  min="0"
                  step="0.01"
                />
                <button
                  onClick={addLineToPO}
                  disabled={!selectedProduct}
                  className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
                >
                  Add
                </button>
              </div>

              {/* Line Items List */}
              {newPO.lines.length > 0 && (
                <div className="border rounded">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-2 py-1">Product</th>
                        <th className="text-center px-2 py-1">Qty</th>
                        <th className="text-right px-2 py-1">Unit Price</th>
                        <th className="text-right px-2 py-1">Total</th>
                        <th className="text-center px-2 py-1">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {newPO.lines.map((line, index) => {
                        const product = products.find(p => p.id === line.product_id)
                        return (
                          <tr key={index} className="border-t">
                            <td className="px-2 py-1">{product?.name || 'Unknown'}</td>
                            <td className="px-2 py-1 text-center">{line.quantity}</td>
                            <td className="px-2 py-1 text-right">${line.unit_price.toFixed(2)}</td>
                            <td className="px-2 py-1 text-right font-semibold">
                              ${(line.quantity * line.unit_price).toFixed(2)}
                            </td>
                            <td className="px-2 py-1 text-center">
                              <button
                                onClick={() => removeLineFromPO(index)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan={3} className="px-2 py-1 text-right font-semibold">Total:</td>
                        <td className="px-2 py-1 text-right font-bold">
                          ${newPO.lines.reduce((sum, line) => sum + (line.quantity * line.unit_price), 0).toFixed(2)}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={createPurchaseOrder}
                disabled={newPO.lines.length === 0 || !newPO.supplier_name}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
              >
                Create PO
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
