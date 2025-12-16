import React, { useState } from 'react'
import { ShoppingCart, Trash2, CreditCard, DollarSign } from 'lucide-react'
import { useStore } from '../store/useStore'

interface CartItem {
  id: string
  name: string
  sku: string
  quantity: number
  price: number
  discount: number
}

export default function Checkout() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [barcode, setBarcode] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash' | 'split'>('card')
  const [isProcessing, setIsProcessing] = useState(false)

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Fetch product by barcode and add to cart
    setBarcode('')
  }

  const handleRemoveItem = (id: string) => {
    setCart(cart.filter(item => item.id !== id))
  }

  const handleQuantityChange = (id: string, quantity: number) => {
    setCart(cart.map(item => 
      item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
    ))
  }

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity - item.discount), 0)
  const tax = subtotal * 0.1 // 10% tax
  const total = subtotal + tax

  const handleCheckout = async () => {
    setIsProcessing(true)
    try {
      // TODO: Call backend API to create sale
      console.log('Processing sale:', { cart, paymentMethod, total })
      setCart([])
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="grid grid-cols-3 gap-6">
        {/* Barcode Scanner */}
        <div className="col-span-2">
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <ShoppingCart className="w-6 h-6" />
              Checkout
            </h2>
            
            <form onSubmit={handleBarcodeSubmit} className="mb-6">
              <input
                type="text"
                placeholder="Scan barcode or enter SKU..."
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </form>

            {/* Cart Items */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="text-left px-4 py-2">SKU</th>
                    <th className="text-left px-4 py-2">Product</th>
                    <th className="text-center px-4 py-2">Qty</th>
                    <th className="text-right px-4 py-2">Price</th>
                    <th className="text-right px-4 py-2">Discount</th>
                    <th className="text-right px-4 py-2">Total</th>
                    <th className="text-center px-4 py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map(item => (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2 font-mono text-xs">{item.sku}</td>
                      <td className="px-4 py-2">{item.name}</td>
                      <td className="px-4 py-2 text-center">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                          className="w-12 px-2 py-1 border border-gray-300 rounded text-center"
                        />
                      </td>
                      <td className="px-4 py-2 text-right">${item.price.toFixed(2)}</td>
                      <td className="px-4 py-2 text-right text-red-600">${item.discount.toFixed(2)}</td>
                      <td className="px-4 py-2 text-right font-semibold">
                        ${((item.price * item.quantity) - item.discount).toFixed(2)}
                      </td>
                      <td className="px-4 py-2 text-center">
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {cart.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No items in cart. Scan a barcode to get started.</p>
              </div>
            )}
          </div>
        </div>

        {/* Payment Summary */}
        <div className="col-span-1">
          <div className="bg-white rounded-lg shadow p-6 sticky top-6">
            <h3 className="text-xl font-bold mb-4">Order Summary</h3>
            
            <div className="space-y-3 mb-6 pb-6 border-b">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-semibold">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (10%):</span>
                <span className="font-semibold">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-blue-600">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Method */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-3">Payment Method</label>
              <div className="space-y-2">
                {(['card', 'cash', 'split'] as const).map(method => (
                  <label key={method} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="payment"
                      value={method}
                      checked={paymentMethod === method}
                      onChange={(e) => setPaymentMethod(e.target.value as typeof method)}
                      className="w-4 h-4"
                    />
                    <span className="capitalize">{method}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              disabled={cart.length === 0 || isProcessing}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition"
            >
              <CreditCard className="w-5 h-5" />
              {isProcessing ? 'Processing...' : 'Complete Sale'}
            </button>

            {/* Offline Indicator */}
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
              <p className="font-semibold">📱 Offline Mode</p>
              <p>Changes will sync when online</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
