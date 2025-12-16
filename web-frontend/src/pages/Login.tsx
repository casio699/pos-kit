import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../store/auth'
import { login, register } from '../api/client'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation() as any
  const { tenantId, setToken, setEmail } = useAuth()

  const [email, setEmailInput] = useState(`user-${Date.now()}@example.com`)
  const [password, setPassword] = useState('Test123!@#')
  const [firstName, setFirstName] = useState('Test')
  const [lastName, setLastName] = useState('User')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const goNext = () => {
    const from = location.state?.from?.pathname || '/products'
    navigate(from, { replace: true })
  }

  const handleRegister = async () => {
    setLoading(true)
    setError(null)
    try {
      await register({ email, password, first_name: firstName, last_name: lastName, tenant_id: tenantId })
      const res = await login({ email, password })
      setToken(res.access_token)
      setEmail(email)
      goNext()
    } catch (e: any) {
      setError(e.response?.data?.message || e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await login({ email, password })
      setToken(res.access_token)
      setEmail(email)
      goNext()
    } catch (e: any) {
      setError(e.response?.data?.message || e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Login / Register</h2>

      <div className="space-y-3">
        <div>
          <label className="block text-sm text-gray-600">Email</label>
          <input className="w-full border px-3 py-2 rounded" value={email} onChange={(e) => setEmailInput(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm text-gray-600">Password</label>
          <input type="password" className="w-full border px-3 py-2 rounded" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-600">First name</label>
            <input className="w-full border px-3 py-2 rounded" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-gray-600">Last name</label>
            <input className="w-full border px-3 py-2 rounded" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <div className="flex gap-3">
          <button disabled={loading} onClick={handleRegister} className="px-4 py-2 bg-blue-600 text-white rounded">
            {loading ? 'Please wait...' : 'Register & Login'}
          </button>
          <button disabled={loading} onClick={handleLogin} className="px-4 py-2 bg-gray-100 rounded">
            {loading ? 'Please wait...' : 'Login'}
          </button>
        </div>
        <p className="text-xs text-gray-500">Tenant: {tenantId}</p>
      </div>
    </div>
  )
}
