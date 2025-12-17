import React, { useState } from 'react'
import { 
  Package, 
  Plus, 
  Minus, 
  ArrowRight, 
  Search, 
  Filter, 
  Download, 
  Upload,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  BarChart3,
  Warehouse,
  Store,
  Truck
} from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Progress } from '../components/ui/progress'
import { Separator } from '../components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { formatCurrency } from '../lib/utils'

interface InventoryItem {
  id: string
  sku: string
  name: string
  quantity: number
  minStock: number
  maxStock: number
  location: string
  category: string
  price: number
  cost: number
  supplier: string
  lastUpdated: string
  status: 'in-stock' | 'low-stock' | 'out-of-stock'
}

export default function Inventory() {
  const [items] = useState<InventoryItem[]>([
    { 
      id: '1', 
      sku: 'SKU001', 
      name: 'Wireless Mouse', 
      quantity: 45, 
      minStock: 10, 
      maxStock: 100, 
      location: 'Main Store', 
      category: 'Electronics',
      price: 29.99,
      cost: 15.50,
      supplier: 'Tech Supplies Inc.',
      lastUpdated: '2 hours ago',
      status: 'in-stock'
    },
    { 
      id: '2', 
      sku: 'SKU002', 
      name: 'USB-C Cable', 
      quantity: 8, 
      minStock: 15, 
      maxStock: 50, 
      location: 'Main Store', 
      category: 'Accessories',
      price: 12.99,
      cost: 4.25,
      supplier: 'Cable Co.',
      lastUpdated: '1 hour ago',
      status: 'low-stock'
    },
    { 
      id: '3', 
      sku: 'SKU003', 
      name: 'Laptop Stand', 
      quantity: 0, 
      minStock: 5, 
      maxStock: 25, 
      location: 'Warehouse', 
      category: 'Office Supplies',
      price: 49.99,
      cost: 28.75,
      supplier: 'Office Depot',
      lastUpdated: '3 hours ago',
      status: 'out-of-stock'
    },
    { 
      id: '4', 
      sku: 'SKU004', 
      name: 'Mechanical Keyboard', 
      quantity: 22, 
      minStock: 8, 
      maxStock: 40, 
      location: 'Main Store', 
      category: 'Electronics',
      price: 89.99,
      cost: 52.30,
      supplier: 'Tech Supplies Inc.',
      lastUpdated: '4 hours ago',
      status: 'in-stock'
    },
    { 
      id: '5', 
      sku: 'SKU005', 
      name: 'Monitor Stand', 
      quantity: 15, 
      minStock: 10, 
      maxStock: 30, 
      location: 'Warehouse', 
      category: 'Office Supplies',
      price: 34.99,
      cost: 19.99,
      supplier: 'Office Depot',
      lastUpdated: '5 hours ago',
      status: 'in-stock'
    },
  ])

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categories = ['all', 'Electronics', 'Accessories', 'Office Supplies']
  
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalValue = items.reduce((sum, item) => sum + (item.quantity * item.price), 0)
  const lowStockItems = items.filter(item => item.status === 'low-stock').length
  const outOfStockItems = items.filter(item => item.status === 'out-of-stock').length

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-stock': return 'bg-green-100 text-green-800'
      case 'low-stock': return 'bg-yellow-100 text-yellow-800'
      case 'out-of-stock': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in-stock': return <TrendingUp className="h-3 w-3" />
      case 'low-stock': return <AlertTriangle className="h-3 w-3" />
      case 'out-of-stock': return <TrendingDown className="h-3 w-3" />
      default: return null
    }
  }

  const getStockPercentage = (item: InventoryItem) => {
    return (item.quantity / item.maxStock) * 100
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-glow">
              <Package className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Inventory Management</h1>
              <p className="text-muted-foreground">Track and manage your product inventory</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="shadow-glow hover:shadow-glow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Items
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalItems.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Across all locations
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-glow hover:shadow-glow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Value
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
              <p className="text-xs text-muted-foreground">
                Current inventory value
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-glow hover:shadow-glow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Low Stock
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{lowStockItems}</div>
              <p className="text-xs text-muted-foreground">
                Items need restocking
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-glow hover:shadow-glow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Out of Stock
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{outOfStockItems}</div>
              <p className="text-xs text-muted-foreground">
                Items unavailable
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="shadow-glow">
          <CardHeader>
            <CardTitle>Inventory Overview</CardTitle>
            <CardDescription>
              Search, filter, and manage your inventory items
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products or SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
                  <TabsList>
                    {categories.map((category) => (
                      <TabsTrigger key={category} value={category}>
                        {category === 'all' ? 'All Categories' : category}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  More Filters
                </Button>
              </div>
            </div>

            {/* Inventory Table */}
            <div className="rounded-md border">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        SKU
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Stock Level
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Value
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map((item) => (
                      <tr key={item.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                              <Package className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-muted-foreground">{item.category}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <code className="px-2 py-1 bg-muted rounded text-sm">{item.sku}</code>
                        </td>
                        <td className="px-4 py-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">{item.quantity}</span>
                              <span className="text-xs text-muted-foreground">/ {item.maxStock}</span>
                            </div>
                            <Progress 
                              value={getStockPercentage(item)} 
                              className="h-2"
                            />
                            <p className="text-xs text-muted-foreground">
                              Min: {item.minStock}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            {item.location === 'Main Store' ? (
                              <Store className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Warehouse className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span className="text-sm">{item.location}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="space-y-1">
                            <p className="font-medium">{formatCurrency(item.quantity * item.price)}</p>
                            <p className="text-xs text-muted-foreground">
                              Cost: {formatCurrency(item.quantity * item.cost)}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <Badge className={getStatusColor(item.status)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(item.status)}
                              <span className="capitalize">
                                {item.status.replace('-', ' ')}
                              </span>
                            </div>
                          </Badge>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Plus className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Minus className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Truck className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {filteredItems.length === 0 && (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No inventory items found</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Try adjusting your search or filters
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Button className="h-16 flex-col gap-2 hover:shadow-glow transition-all duration-300">
            <Plus className="h-5 w-5" />
            <span>Add Stock</span>
          </Button>
          <Button variant="outline" className="h-16 flex-col gap-2 hover:shadow-glow transition-all duration-300">
            <Truck className="h-5 w-5" />
            <span>Transfer</span>
          </Button>
          <Button variant="outline" className="h-16 flex-col gap-2 hover:shadow-glow transition-all duration-300">
            <BarChart3 className="h-5 w-5" />
            <span>Reports</span>
          </Button>
          <Button variant="outline" className="h-16 flex-col gap-2 hover:shadow-glow transition-all duration-300">
            <AlertTriangle className="h-5 w-5" />
            <span>Low Stock Alert</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
