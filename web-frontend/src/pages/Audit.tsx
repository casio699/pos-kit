import { useEffect, useState } from 'react'
import { useAuth } from '../store/auth'
import { usePermissions } from '../hooks/usePermissions'

interface AuditLog {
  id: string
  user_id: string
  tenant_id: string
  action: string
  resource_type?: string
  resource_id?: string
  old_values?: any
  new_values?: any
  ip_address?: string
  user_agent?: string
  success: boolean
  error_message?: string
  created_at: string
}

interface PaginatedLogs {
  logs: AuditLog[]
  total: number
}

export default function Audit() {
  const { token } = useAuth()
  const { isAdmin } = usePermissions()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [filters, setFilters] = useState({
    userId: '',
    action: '',
  })

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      })
      
      if (filters.userId) params.append('userId', filters.userId)
      if (filters.action) params.append('action', filters.action)

      const response = await fetch(`/api/audit/logs?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: PaginatedLogs = await response.json()
      setLogs(data.logs)
      setTotal(data.total)
    } catch (e: any) {
      setError(e.message || 'Failed to load audit logs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isAdmin()) return
    load()
  }, [page, filters, isAdmin])

  if (!isAdmin()) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Access Denied</h2>
        <p className="text-gray-500">You don't have permission to view audit logs.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold mb-4">Audit Logs</h2>
        
        <div className="mb-4 flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Filter by User ID"
            value={filters.userId}
            onChange={e => setFilters({ ...filters, userId: e.target.value })}
            className="border px-3 py-2 rounded text-sm flex-1"
          />
          <input
            type="text"
            placeholder="Filter by Action"
            value={filters.action}
            onChange={e => setFilters({ ...filters, action: e.target.value })}
            className="border px-3 py-2 rounded text-sm flex-1"
          />
          <button
            onClick={load}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded text-sm whitespace-nowrap"
          >
            {loading ? 'Loading...' : 'Search'}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {logs.length === 0 ? (
          <p className="text-gray-500">No audit logs found</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-600">
                    <th className="py-2 px-1">Time</th>
                    <th className="px-1">User</th>
                    <th className="px-1">Action</th>
                    <th className="px-1">Resource</th>
                    <th className="px-1 hidden sm:table-cell">IP Address</th>
                    <th className="px-1 hidden lg:table-cell">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map(log => (
                    <tr key={log.id} className="border-t">
                      <td className="py-2 px-1 whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="px-1 font-mono text-xs">
                        {log.user_id.slice(0, 8)}...
                      </td>
                      <td className="px-1">
                        <span className={`px-2 py-1 rounded text-xs ${
                          log.action.includes('LOGIN') || log.action.includes('REGISTER') 
                            ? 'bg-blue-100 text-blue-800'
                            : log.action.includes('ROLE')
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-1 text-xs">
                        {log.resource_type && (
                          <span>
                            {log.resource_type}
                            {log.resource_id && (
                              <span className="font-mono ml-1">
                                ({log.resource_id.slice(0, 8)}...)
                              </span>
                            )}
                          </span>
                        )}
                      </td>
                      <td className="px-1 hidden sm:table-cell text-xs">
                        {log.ip_address}
                      </td>
                      <td className="px-1 hidden lg:table-cell">
                        <span className={`px-2 py-1 rounded text-xs ${
                          log.success 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {log.success ? 'Success' : 'Failed'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {logs.length} of {total} logs
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 border rounded text-sm disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm">
                  Page {page}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={logs.length < limit}
                  className="px-3 py-1 border rounded text-sm disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
