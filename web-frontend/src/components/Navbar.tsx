import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../store/auth'
import { usePermissions } from '../hooks/usePermissions'
import NotificationCenter from './NotificationCenter'

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { email, reset } = useAuth()
  const { isAdmin } = usePermissions()

  const linkClass = (path: string) =>
    `px-3 py-2 rounded-md text-sm font-medium ${
      location.pathname === path
        ? 'bg-blue-600 text-white'
        : 'text-gray-700 hover:bg-gray-100'
    }`

  return (
    <nav className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
      <div className="flex items-center gap-2">
        <span className="text-xl font-bold text-gray-900">KiTS POS</span>
        <span className="text-xs text-gray-500">MVP</span>
      </div>
      <div className="flex flex-wrap items-center gap-1 sm:gap-2">
        <Link to="/dashboard" className={linkClass('/dashboard')}>Dashboard</Link>
        <Link to="/products" className={linkClass('/products')}>Products</Link>
        <Link to="/inventory" className={linkClass('/inventory')}>Inventory</Link>
        <Link to="/sales" className={linkClass('/sales')}>Sales</Link>
        <Link to="/payments" className={linkClass('/payments')}>Payments</Link>
        <Link to="/shopify" className={linkClass('/shopify')}>Shopify</Link>
        {isAdmin() && <Link to="/rbac" className={linkClass('/rbac')}>RBAC</Link>}
        {isAdmin() && <Link to="/audit" className={linkClass('/audit')}>Audit</Link>}
        <Link to="/tester" className={linkClass('/tester')}>API</Link>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        {email ? (
          <>
            <NotificationCenter />
            <span className="text-xs sm:text-sm text-gray-700 hidden sm:inline">{email}</span>
            <span className="text-xs text-gray-700 sm:hidden">User</span>
            <button
              onClick={() => { reset(); navigate('/login') }}
              className="px-2 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm rounded-md bg-gray-100 hover:bg-gray-200"
            >
              Logout
            </button>
          </>
        ) : (
          <Link to="/login" className="px-2 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm rounded-md bg-blue-600 text-white">Login</Link>
        )}
      </div>
    </nav>
  )
}
