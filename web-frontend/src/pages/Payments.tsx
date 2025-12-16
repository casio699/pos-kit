import { useState } from 'react'
import { CreditCard, CheckCircle, AlertCircle, Loader } from 'lucide-react'
import { useAuth } from '../store/auth'
import { usePermissions } from '../hooks/usePermissions'
import LoadingSpinner from '../components/LoadingSpinner'
import { paymentApi } from '../api/client'

export default function Payments() {
  const {} = useAuth()
  const { isAdmin } = usePermissions()

  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState('usd')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  const [paymentHistory] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')

  const createPayment = async () => {
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await paymentApi.createPaymentIntent({
        amount: parseFloat(amount),
        currency,
        description: description || undefined,
      })
      setResult(response.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create payment')
    } finally {
      setLoading(false)
    }
  }

  const checkPaymentStatus = async (paymentIntentId: string) => {
    setLoading(true)
    try {
      const response = await paymentApi.getPaymentStatus(paymentIntentId)
      setResult(response.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to get payment status')
    } finally {
      setLoading(false)
    }
  }

  // Add filtering logic after the checkPaymentStatus function
  const filteredPayments = paymentHistory.filter(payment => {
    const matchesSearch = !searchTerm || 
      payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.amount.toString().includes(searchTerm)
    
    const matchesStatus = selectedStatus === 'all' || payment.status === selectedStatus
    
    return matchesSearch && matchesStatus
  })

  const getPaymentStats = () => {
    const totalPayments = filteredPayments.length
    const totalAmount = filteredPayments.reduce((sum, p) => sum + p.amount, 0)
    const successfulPayments = filteredPayments.filter(p => p.status === 'succeeded').length
    const pendingPayments = filteredPayments.filter(p => p.status === 'pending').length
    const failedPayments = filteredPayments.filter(p => p.status === 'failed').length
    
    return { totalPayments, totalAmount, successfulPayments, pendingPayments, failedPayments }
  }

  const stats = getPaymentStats()

  return (
    <div className="space-y-6">
      {/* Professional Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Payment Processing</h1>
            <p className="text-indigo-100">Manage payment intents and track transactions</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')}
              className="px-4 py-2 bg-white/20 backdrop-blur rounded-lg hover:bg-white/30 transition-colors text-white font-medium"
            >
              {viewMode === 'table' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </button>
            {isAdmin() && (
              <button className="px-4 py-2 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 font-medium transition-colors">
                <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                New Payment
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-indigo-600" />
            </div>
            <span className="text-xs text-gray-500 font-medium">Total</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.totalPayments}</div>
          <div className="text-sm text-gray-600">Payments</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <span className="text-xs text-green-500 font-medium">Amount</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">${stats.totalAmount.toFixed(2)}</div>
          <div className="text-sm text-gray-600">Total Amount</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-xs text-green-500 font-medium">Success</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.successfulPayments}</div>
          <div className="text-sm text-gray-600">Successful</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Loader className="w-6 h-6 text-yellow-600" />
            </div>
            <span className="text-xs text-yellow-500 font-medium">Pending</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.pendingPayments}</div>
          <div className="text-sm text-gray-600">Pending</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <span className="text-xs text-red-500 font-medium">Failed</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.failedPayments}</div>
          <div className="text-sm text-gray-600">Failed</div>
        </div>
      </div>

      {/* Create Payment Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Payment Intent</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="10.00"
                  step="0.01"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="usd">USD - US Dollar</option>
                <option value="eur">EUR - Euro</option>
                <option value="gbp">GBP - British Pound</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description (optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                rows={3}
                placeholder="Payment description..."
              />
            </div>

            <button
              onClick={createPayment}
              disabled={loading || !amount}
              className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Payment Intent'}
            </button>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                  <span className="text-sm text-red-700">{error}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Payment Result */}
        {result && (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Intent Created</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-gray-600">Intent ID:</span>
                <span className="text-sm font-mono text-gray-900">{result.id}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-gray-600">Amount:</span>
                <span className="text-sm font-semibold text-gray-900">${result.amount / 100} {result.currency.toUpperCase()}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-gray-600">Status:</span>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  result.status === 'succeeded' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {result.status}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">Client Secret:</span>
                <span className="text-xs font-mono text-gray-500 max-w-xs truncate">{result.client_secret}</span>
              </div>
              <button
                onClick={() => checkPaymentStatus(result.id)}
                disabled={loading}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50"
              >
                {loading ? 'Checking...' : 'Check Status'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="relative">
            <svg className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search payments by ID, description, or amount..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="succeeded">Succeeded</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
          
          <button className="px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors">
            Export Payments
          </button>
        </div>
      </div>

      {/* Payment History Display */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        {loading ? (
          <LoadingSpinner message="Loading payment history..." />
        ) : filteredPayments.length === 0 ? (
          <div className="text-center py-12">
            <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
            <p className="text-gray-500">
              {searchTerm || selectedStatus !== 'all'
                ? 'Try adjusting your search or filters to find what you\'re looking for.'
                : 'Get started by creating your first payment.'}
            </p>
          </div>
        ) : viewMode === 'table' ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-4 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment ID</th>
                  <th className="py-4 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="py-4 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Currency</th>
                  <th className="py-4 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="py-4 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Description</th>
                  <th className="py-4 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Created</th>
                  <th className="py-4 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPayments.map(payment => (
                  <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="text-sm font-medium text-gray-900">{payment.id}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-lg font-semibold text-gray-900">${payment.amount}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm text-gray-900">{payment.currency?.toUpperCase()}</div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        payment.status === 'succeeded'
                          ? 'bg-green-100 text-green-800'
                          : payment.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 hidden lg:table-cell text-sm text-gray-500 max-w-xs truncate">
                      {payment.description || '-'}
                    </td>
                    <td className="py-4 px-4 hidden lg:table-cell text-sm text-gray-500">
                      {payment.created_at ? new Date(payment.created_at).toLocaleDateString() : '-'}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex gap-2">
                        <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                          View Details
                        </button>
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                          Check Status
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Cards View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPayments.map(payment => (
              <div key={payment.id} className="bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                      {payment.id.charAt(0).toUpperCase()}
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      payment.status === 'succeeded'
                        ? 'bg-green-100 text-green-800'
                        : payment.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {payment.status}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">Payment #{payment.id}</h3>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-bold text-gray-900">${payment.amount}</span>
                    <span className="text-sm text-gray-500">{payment.currency?.toUpperCase()}</span>
                  </div>
                  {payment.description && (
                    <p className="text-sm text-gray-500 mb-3 truncate">{payment.description}</p>
                  )}
                  <div className="flex gap-2">
                    <button className="flex-1 px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">
                      Details
                    </button>
                    <button className="flex-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                      Status
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

            
