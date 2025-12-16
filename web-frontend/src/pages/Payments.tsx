import { useState } from 'react'
import { CreditCard, CheckCircle, AlertCircle, Loader } from 'lucide-react'
import { paymentApi } from '../api/client'

export default function Payments() {
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState('usd')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg p-6">
          <div className="flex items-center mb-6">
            <CreditCard className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-2xl font-bold text-gray-900">Payment Processing</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Create Payment Form */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800">Create Payment Intent</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="10.00"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="usd">USD</option>
                  <option value="eur">EUR</option>
                  <option value="gbp">GBP</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (optional)
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Payment description"
                />
              </div>

              <button
                onClick={createPayment}
                disabled={loading || !amount}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader className="animate-spin h-4 w-4 mr-2" />
                    Processing...
                  </>
                ) : (
                  'Create Payment Intent'
                )}
              </button>
            </div>

            {/* Results Section */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800">Result</h2>
              
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                    <p className="text-red-800">{error}</p>
                  </div>
                </div>
              )}

              {result && (
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <div className="flex items-center mb-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    <p className="text-green-800 font-semibold">Payment Intent Created</p>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Payment Intent ID:</span>
                      <p className="text-gray-600 font-mono break-all">{result.id}</p>
                    </div>
                    
                    {result.clientSecret && (
                      <div>
                        <span className="font-medium">Client Secret:</span>
                        <p className="text-gray-600 font-mono text-xs break-all">{result.clientSecret}</p>
                      </div>
                    )}

                    {result.status && (
                      <div>
                        <span className="font-medium">Status:</span>
                        <p className="text-gray-600">{result.status}</p>
                      </div>
                    )}

                    {result.amount && (
                      <div>
                        <span className="font-medium">Amount:</span>
                        <p className="text-gray-600">${(result.amount / 100).toFixed(2)}</p>
                      </div>
                    )}

                    {result.id && (
                      <button
                        onClick={() => checkPaymentStatus(result.id)}
                        disabled={loading}
                        className="mt-3 w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm"
                      >
                        Check Payment Status
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
