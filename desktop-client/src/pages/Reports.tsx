import React, { useState } from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  Calendar,
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  Activity,
  Users,
  ShoppingCart,
  CreditCard,
  FileText,
  Printer,
  Mail,
  Clock,
  Store
} from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Progress } from '../components/ui/progress'
import { Separator } from '../components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { formatCurrency } from '../lib/utils'

interface ReportData {
  totalSales: number
  totalTransactions: number
  avgTransaction: number
  lowStockItems: number
  salesGrowth: number
  transactionGrowth: number
  customerGrowth: number
  topProducts: Array<{ name: string; sales: number; quantity: number }>
  hourlySales: Array<{ hour: string; sales: number; transactions: number }>
  paymentMethods: Array<{ method: string; count: number; percentage: number }>
  categorySales: Array<{ category: string; sales: number; percentage: number }>
}

export default function Reports() {
  const [dateRange, setDateRange] = useState('7days')
  const [selectedReport, setSelectedReport] = useState('overview')

  const reportData: ReportData = {
    totalSales: 124563.89,
    totalTransactions: 1248,
    avgTransaction: 99.81,
    lowStockItems: 5,
    salesGrowth: 12.5,
    transactionGrowth: 8.2,
    customerGrowth: 15.3,
    topProducts: [
      { name: 'Wireless Mouse', sales: 4567.89, quantity: 152 },
      { name: 'USB-C Cable', sales: 3234.56, quantity: 249 },
      { name: 'Laptop Stand', sales: 2890.12, quantity: 58 },
      { name: 'Mechanical Keyboard', sales: 2678.90, quantity: 30 },
      { name: 'Monitor Stand', sales: 1890.45, quantity: 54 }
    ],
    hourlySales: [
      { hour: '8AM', sales: 2340, transactions: 23 },
      { hour: '9AM', sales: 3456, transactions: 34 },
      { hour: '10AM', sales: 4567, transactions: 45 },
      { hour: '11AM', sales: 5678, transactions: 56 },
      { hour: '12PM', sales: 6789, transactions: 67 },
      { hour: '1PM', sales: 5432, transactions: 54 },
      { hour: '2PM', sales: 4321, transactions: 43 },
      { hour: '3PM', sales: 3210, transactions: 32 },
      { hour: '4PM', sales: 4567, transactions: 45 },
      { hour: '5PM', sales: 5678, transactions: 56 },
      { hour: '6PM', sales: 3456, transactions: 34 },
      { hour: '7PM', sales: 2340, transactions: 23 }
    ],
    paymentMethods: [
      { method: 'Credit Card', count: 890, percentage: 71.3 },
      { method: 'Cash', count: 245, percentage: 19.6 },
      { method: 'Mobile', count: 89, percentage: 7.1 },
      { method: 'Split', count: 24, percentage: 2.0 }
    ],
    categorySales: [
      { category: 'Electronics', sales: 45678.90, percentage: 36.7 },
      { category: 'Accessories', sales: 32345.67, percentage: 26.0 },
      { category: 'Office Supplies', sales: 23456.78, percentage: 18.8 },
      { category: 'Software', sales: 15678.90, percentage: 12.6 },
      { category: 'Other', sales: 7403.64, percentage: 5.9 }
    ]
  }

  const maxHourlySales = Math.max(...reportData.hourlySales.map(h => h.sales))

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-glow">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Reports & Analytics</h1>
              <p className="text-muted-foreground">Comprehensive insights into your business performance</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border border-input bg-background rounded-md shadow-sm"
            >
              <option value="today">Today</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="1year">Last Year</option>
            </select>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="shadow-glow hover:shadow-glow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Sales
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(reportData.totalSales)}</div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <ArrowUpRight className="h-3 w-3 text-green-500" />
                <span className="text-green-500">+{reportData.salesGrowth}%</span>
                <span>vs last period</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-glow hover:shadow-glow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Transactions
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportData.totalTransactions.toLocaleString()}</div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <ArrowUpRight className="h-3 w-3 text-green-500" />
                <span className="text-green-500">+{reportData.transactionGrowth}%</span>
                <span>vs last period</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-glow hover:shadow-glow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Avg Transaction
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(reportData.avgTransaction)}</div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <ArrowUpRight className="h-3 w-3 text-green-500" />
                <span className="text-green-500">+3.2%</span>
                <span>vs last period</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-glow hover:shadow-glow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Low Stock Items
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{reportData.lowStockItems}</div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <ArrowDownRight className="h-3 w-3 text-red-500" />
                <span className="text-red-500">+2</span>
                <span>since yesterday</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Reports Content */}
        <Tabs value={selectedReport} onValueChange={setSelectedReport} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sales">Sales Analysis</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Hourly Sales Chart */}
              <Card className="shadow-glow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Sales by Hour
                  </CardTitle>
                  <CardDescription>
                    Peak sales times throughout the day
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reportData.hourlySales.map((hour, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <div className="w-12 text-sm text-muted-foreground">{hour.hour}</div>
                        <div className="flex-1">
                          <div className="relative h-6 bg-muted rounded-md overflow-hidden">
                            <div 
                              className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-md transition-all duration-500"
                              style={{ width: `${(hour.sales / maxHourlySales) * 100}%` }}
                            />
                            <span className="absolute inset-0 flex items-center px-2 text-xs font-medium text-white mix-blend-difference">
                              {formatCurrency(hour.sales)}
                            </span>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground w-12 text-right">
                          {hour.transactions}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Payment Methods */}
              <Card className="shadow-glow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Methods
                  </CardTitle>
                  <CardDescription>
                    Distribution of payment types
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reportData.paymentMethods.map((method, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                            <CreditCard className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <p className="font-medium">{method.method}</p>
                            <p className="text-sm text-muted-foreground">{method.count} transactions</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{method.percentage}%</p>
                          <Progress value={method.percentage} className="w-20 h-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Category Sales */}
            <Card className="shadow-glow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Sales by Category
                </CardTitle>
                <CardDescription>
                  Revenue distribution across product categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {reportData.categorySales.map((category, index) => (
                    <div key={index} className="text-center">
                      <div className="w-20 h-20 mx-auto mb-2 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                        <Package className="h-8 w-8 text-white" />
                      </div>
                      <p className="font-medium">{category.category}</p>
                      <p className="text-sm text-muted-foreground">{formatCurrency(category.sales)}</p>
                      <p className="text-xs text-muted-foreground">{category.percentage}%</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sales" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 shadow-glow">
                <CardHeader>
                  <CardTitle>Sales Trend Analysis</CardTitle>
                  <CardDescription>
                    Detailed sales performance over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Advanced chart visualization</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Integrate with charting library for detailed analytics
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-glow">
                <CardHeader>
                  <CardTitle>Sales Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Today's Sales</span>
                    <span className="font-medium">{formatCurrency(2345.67)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Yesterday</span>
                    <span className="font-medium">{formatCurrency(1987.45)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">This Week</span>
                    <span className="font-medium">{formatCurrency(12456.78)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Week</span>
                    <span className="font-medium">{formatCurrency(11234.56)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">This Month</span>
                    <span className="font-medium">{formatCurrency(45678.90)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <Card className="shadow-glow">
              <CardHeader>
                <CardTitle>Top Performing Products</CardTitle>
                <CardDescription>
                  Best-selling products by revenue and quantity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportData.topProducts.map((product, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                          <Package className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">{product.quantity} units sold</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(product.sales)}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(product.sales / product.quantity)} per unit
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="customers" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-glow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Customer Analytics
                  </CardTitle>
                  <CardDescription>
                    Customer behavior and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">New Customers</span>
                    <span className="font-medium">+{reportData.customerGrowth}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Returning Customers</span>
                    <span className="font-medium">68%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Avg. Customer Value</span>
                    <span className="font-medium">{formatCurrency(234.56)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Customer Retention</span>
                    <span className="font-medium">82%</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-glow">
                <CardHeader>
                  <CardTitle>Customer Segments</CardTitle>
                  <CardDescription>
                    Distribution by customer type
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Store className="h-4 w-4" />
                        Retail
                      </span>
                      <div className="flex items-center gap-2">
                        <Progress value={65} className="w-16 h-2" />
                        <span className="text-sm">65%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Wholesale
                      </span>
                      <div className="flex items-center gap-2">
                        <Progress value={25} className="w-16 h-2" />
                        <span className="text-sm">25%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Online
                      </span>
                      <div className="flex items-center gap-2">
                        <Progress value={10} className="w-16 h-2" />
                        <span className="text-sm">10%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Button className="h-16 flex-col gap-2 hover:shadow-glow transition-all duration-300">
            <FileText className="h-5 w-5" />
            <span>Generate Report</span>
          </Button>
          <Button variant="outline" className="h-16 flex-col gap-2 hover:shadow-glow transition-all duration-300">
            <Download className="h-5 w-5" />
            <span>Export Data</span>
          </Button>
          <Button variant="outline" className="h-16 flex-col gap-2 hover:shadow-glow transition-all duration-300">
            <Mail className="h-5 w-5" />
            <span>Email Report</span>
          </Button>
          <Button variant="outline" className="h-16 flex-col gap-2 hover:shadow-glow transition-all duration-300">
            <Calendar className="h-5 w-5" />
            <span>Schedule Report</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
