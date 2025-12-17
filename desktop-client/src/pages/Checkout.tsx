import React, { useState } from 'react'
import { 
  ShoppingCart, 
  Trash2, 
  CreditCard, 
  DollarSign, 
  Plus, 
  Minus, 
  Search,
  Package,
  User,
  Receipt,
  Smartphone,
  Wallet,
  Printer,
  X
} from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Separator } from '../components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { formatCurrency } from '../lib/utils'

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-glow">
              <ShoppingCart className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Point of Sale</h1>
              <p className="text-muted-foreground">Process customer transactions efficiently</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="gap-1">
              <Receipt className="h-3 w-3" />
              {cart.length} items
            </Badge>
            <Button variant="outline" size="sm">
              <Printer className="h-4 w-4 mr-2" />
              Print Setup
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Checkout Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Barcode Scanner */}
            <Card className="shadow-glow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Product Scanner
                </CardTitle>
                <CardDescription>
                  Scan barcode or search for products to add to cart
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleBarcodeSubmit} className="space-y-4">
                  <div className="flex gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Scan barcode or search product..."
                        value={barcode}
                        onChange={(e) => setBarcode(e.target.value)}
                        className="pl-10 text-lg h-12"
                        autoFocus
                      />
                    </div>
                    <Button type="submit" size="lg" className="px-8">
                      Add to Cart
                    </Button>
                  </div>
                </form>

                {/* Quick Product Grid */}
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">Quick Add</h3>
                  <div className="grid grid-cols-4 gap-3">
                    {['Milk', 'Bread', 'Eggs', 'Coffee'].map((product) => (
                      <Button
                        key={product}
                        variant="outline"
                        className="h-16 flex-col gap-1 hover:shadow-glow transition-all duration-300"
                        onClick={() => {
                          // TODO: Add product to cart
                          setBarcode(product)
                        }}
                      >
                        <Package className="h-4 w-4" />
                        <span className="text-xs">{product}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cart Items */}
            <Card className="shadow-glow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Shopping Cart
                  </span>
                  {cart.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCart([])}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear Cart
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {cart.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Your cart is empty</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Add products by scanning barcodes or searching
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                            <Package className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">SKU: {item.sku}</p>
                            <p className="text-sm font-medium">{formatCurrency(item.price)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              className="h-8 w-8 p-0"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              className="h-8 w-8 p-0"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
                            {item.discount > 0 && (
                              <p className="text-xs text-green-600">-{formatCurrency(item.discount)}</p>
                            )}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-destructive hover:text-destructive h-8 w-8 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Payment Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <Card className="shadow-glow">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax (10%)</span>
                  <span>{formatCurrency(tax)}</span>
                </div>
                {cart.some(item => item.discount > 0) && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{formatCurrency(cart.reduce((sum, item) => sum + item.discount, 0))}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">{formatCurrency(total)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card className="shadow-glow">
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as any)}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="card" className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Card
                    </TabsTrigger>
                    <TabsTrigger value="cash" className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Cash
                    </TabsTrigger>
                    <TabsTrigger value="split" className="flex items-center gap-2">
                      <Wallet className="h-4 w-4" />
                      Split
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="card" className="space-y-4">
                    <div className="space-y-3">
                      <Input placeholder="Card number" className="h-12" />
                      <div className="grid grid-cols-2 gap-3">
                        <Input placeholder="MM/YY" />
                        <Input placeholder="CVV" />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="cash" className="space-y-4">
                    <div className="space-y-3">
                      <Input 
                        type="number" 
                        placeholder="Cash received" 
                        className="h-12"
                      />
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">Change due</p>
                        <p className="text-lg font-bold text-green-600">{formatCurrency(0)}</p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="split" className="space-y-4">
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <Input type="number" placeholder="Card amount" />
                        <Input type="number" placeholder="Cash amount" />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Customer Info */}
            <Card className="shadow-glow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Customer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Input placeholder="Customer name or email" />
                  <Button variant="outline" className="w-full">
                    <User className="h-4 w-4 mr-2" />
                    Add Customer
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Checkout Button */}
            <Button
              size="lg"
              className="w-full h-14 text-lg shadow-glow-lg hover:shadow-glow transition-all duration-300"
              disabled={cart.length === 0 || isProcessing}
              onClick={handleCheckout}
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                  Processing...
                </div>
              ) : (
                <>
                  <CreditCard className="h-5 w-5 mr-2" />
                  Complete Sale - {formatCurrency(total)}
                </>
              )}
            </Button>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-12">
                <Receipt className="h-4 w-4 mr-2" />
                Receipt
              </Button>
              <Button variant="outline" className="h-12">
                <Smartphone className="h-4 w-4 mr-2" />
                Email
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
