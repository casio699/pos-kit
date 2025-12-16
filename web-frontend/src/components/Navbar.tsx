import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../store/auth'

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { email, reset } = useAuth()

  const linkClass = (path: string) =>
    `px-3 py-2 rounded-md text-sm font-medium ${
      location.pathname === path
        ? 'bg-blue-600 text-white'
        : 'text-gray-700 hover:bg-gray-100'
    }`

  return (
    <nav className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2">
        <span className="text-xl font-bold text-gray-900">KiTS POS</span>
        <span className="text-xs text-gray-500">MVP</span>
      </div>
      <div className="flex items-center gap-2">
        <Link to="/products" className={linkClass('/products')}>Products</Link>
        <Link to="/inventory" className={linkClass('/inventory')}>Inventory</Link>
        <Link to="/sales" className={linkClass('/sales')}>Sales</Link>
        <Link to="/payments" className={linkClass('/payments')}>Payments</Link>
        <Link to="/shopify" className={linkClass('/shopify')}>Shopify</Link>
        <Link to="/tester" className={linkClass('/tester')}>API Tester</Link>
      </div>
      <div className="flex items-center gap-3">
        {email ? (
          <>
            <span className="text-sm text-gray-700">{email}</span>
            <button
              onClick={() => { reset(); navigate('/login') }}
              className="px-3 py-2 text-sm rounded-md bg-gray-100 hover:bg-gray-200"
            >
              Logout
            </button>
          </>
        ) : (
          <Link to="/login" className="px-3 py-2 text-sm rounded-md bg-blue-600 text-white">Login</Link>
        )}
      </div>
    </nav>
  )
}
