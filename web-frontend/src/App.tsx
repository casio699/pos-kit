import { useState } from 'react'
import { AlertCircle, CheckCircle, Loader } from 'lucide-react'
import axios from 'axios'

const API_URL = 'http://localhost:3000'
const TENANT_ID = '00000000-0000-0000-0000-000000000001'

interface TestResult {
  name: string
  status: 'pending' | 'loading' | 'success' | 'error'
  message?: string
  data?: any
}

export default function App() {
  const [results, setResults] = useState<TestResult[]>([
    { name: 'Health Check', status: 'pending' },
    { name: 'Auth - Register', status: 'pending' },
    { name: 'Auth - Login', status: 'pending' },
    { name: 'Products - List', status: 'pending' },
    { name: 'Products - Create', status: 'pending' },
    { name: 'Inventory - Get', status: 'pending' },
    { name: 'Sales - Create', status: 'pending' },
  ])

  const runTests = async () => {
    setResults(prev => prev.map(r => ({ ...r, status: 'loading' })))

    try {
      // Test 1: Health Check
      await testHealthCheck()
      
      // Test 2-3: Auth
      const token = await testAuth()
      
      // Test 4-5: Products
      let productId: string | null = null
      if (token) {
        productId = await testProducts(token)
      }
      
      // Test 6: Inventory (create location, adjust inventory, then get)
      let locationId: string | null = null
      if (token && productId) {
        locationId = await testInventory(token, productId)
      }
      
      // Test 7: Sales
      if (token && productId && locationId) {
        await testSales(token, productId, locationId)
      }
    } catch (error) {
      console.error('Test error:', error)
    }
  }

  const testHealthCheck = async () => {
    try {
      const response = await axios.get(`${API_URL}/health`)
      updateResult('Health Check', 'success', 'API is running', response.data)
    } catch (error: any) {
      updateResult('Health Check', 'error', error.message)
    }
  }

  const testAuth = async (): Promise<string | null> => {
    try {
      // Register
      const registerRes = await axios.post(`${API_URL}/auth/register`, {
        email: `test-${Date.now()}@example.com`,
        password: 'Test123!@#',
        first_name: 'Test',
        last_name: 'User',
        tenant_id: TENANT_ID,
      })
      updateResult('Auth - Register', 'success', 'User registered', registerRes.data)

      // Login
      const loginRes = await axios.post(`${API_URL}/auth/login`, {
        email: registerRes.data.email,
        password: 'Test123!@#',
      })
      updateResult('Auth - Login', 'success', 'User logged in', loginRes.data)
      
      return loginRes.data.access_token
    } catch (error: any) {
      updateResult('Auth - Register', 'error', error.response?.data?.message || error.message)
      updateResult('Auth - Login', 'error', error.response?.data?.message || error.message)
      return null
    }
  }

  const testProducts = async (token: string): Promise<string | null> => {
    try {
      // Create product
      const createRes = await axios.post(
        `${API_URL}/products`,
        {
          tenant_id: TENANT_ID,
          sku: `SKU-${Date.now()}`,
          name: 'Test Product',
          price: 99.99,
          cost: 50.00,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      updateResult('Products - Create', 'success', 'Product created', createRes.data)

      // List products
      const listRes = await axios.get(
        `${API_URL}/products?tenant_id=${TENANT_ID}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      updateResult('Products - List', 'success', `Found ${listRes.data.length} products`, listRes.data)

      return createRes.data.id || null
    } catch (error: any) {
      updateResult('Products - Create', 'error', error.response?.data?.message || error.message)
      updateResult('Products - List', 'error', error.response?.data?.message || error.message)
      return null
    }
  }

  const testInventory = async (token: string, productId: string): Promise<string | null> => {
    try {
      // Create a location (required for inventory and sales)
      const locRes = await axios.post(
        `${API_URL}/locations`,
        {
          tenant_id: TENANT_ID,
          name: 'Main Store',
          type: 'store',
          address: '123 Main St',
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const locationId = locRes.data.id

      // Adjust inventory for the created product at this location
      await axios.post(
        `${API_URL}/inventory/adjust`,
        {
          tenant_id: TENANT_ID,
          product_id: productId,
          location_id: locationId,
          quantity: 10,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      // Get inventory
      const response = await axios.get(
        `${API_URL}/inventory?tenant_id=${TENANT_ID}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      updateResult('Inventory - Get', 'success', `Found ${response.data.length} items`, response.data)

      return locationId
    } catch (error: any) {
      updateResult('Inventory - Get', 'error', error.response?.data?.message || error.message)
      return null
    }
  }

  const testSales = async (token: string, productId: string, locationId: string) => {
    try {
      const response = await axios.post(
        `${API_URL}/sales`,
        {
          tenant_id: TENANT_ID,
          location_id: locationId,
          lines: [
            { product_id: productId, quantity: 2, unit_price: 50.00, discount: 0 },
          ],
          total_amount: 100.00,
          payment_method: 'card',
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      updateResult('Sales - Create', 'success', 'Sale created', response.data)
    } catch (error: any) {
      updateResult('Sales - Create', 'error', error.response?.data?.message || error.message)
    }
  }

  const updateResult = (name: string, status: TestResult['status'], message?: string, data?: any) => {
    setResults(prev =>
      prev.map(r =>
        r.name === name ? { ...r, status, message, data } : r
      )
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">KiTS POS API Tester</h1>
          <p className="text-gray-600 mb-8">Test the backend API endpoints</p>

          <button
            onClick={runTests}
            className="mb-8 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition"
          >
            Run All Tests
          </button>

          <div className="space-y-4">
            {results.map((result) => (
              <div
                key={result.name}
                className={`p-4 rounded-lg border-l-4 ${
                  result.status === 'success'
                    ? 'bg-green-50 border-green-500'
                    : result.status === 'error'
                    ? 'bg-red-50 border-red-500'
                    : result.status === 'loading'
                    ? 'bg-yellow-50 border-yellow-500'
                    : 'bg-gray-50 border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {result.status === 'success' && (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                    {result.status === 'error' && (
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    )}
                    {result.status === 'loading' && (
                      <Loader className="w-5 h-5 text-yellow-600 animate-spin" />
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900">{result.name}</h3>
                      {result.message && (
                        <p className="text-sm text-gray-600">{result.message}</p>
                      )}
                    </div>
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1 rounded ${
                    result.status === 'success'
                      ? 'bg-green-200 text-green-800'
                      : result.status === 'error'
                      ? 'bg-red-200 text-red-800'
                      : result.status === 'loading'
                      ? 'bg-yellow-200 text-yellow-800'
                      : 'bg-gray-200 text-gray-800'
                  }`}>
                    {result.status}
                  </span>
                </div>
                {result.data && (
                  <pre className="mt-3 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-40">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
