import { useState, useEffect } from 'react'
import { useAuth } from '../store/auth'
import { apiClient } from '../api/client'

interface Role {
  id: string
  name: string
  description: string
  permissions: string[]
  is_active: boolean
  created_at: string
  updated_at: string
}

interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  roles: Role[]
  is_active: boolean
}

interface CreateRoleDto {
  name: string
  description: string
  permissions: string[]
}

export default function RBAC() {
  const { token } = useAuth()
  const [activeTab, setActiveTab] = useState<'roles' | 'users' | 'permissions'>('roles')
  const [roles, setRoles] = useState<Role[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Form states
  const [newRole, setNewRole] = useState<CreateRoleDto>({
    name: '',
    description: '',
    permissions: []
  })
  const [selectedUser, setSelectedUser] = useState<string>('')
  const [selectedRole, setSelectedRole] = useState<string>('')

  const availablePermissions = [
    'product:read', 'product:create', 'product:update', 'product:delete',
    'inventory:read', 'inventory:adjust', 'inventory:transfer',
    'sale:read', 'sale:create', 'sale:update', 'sale:delete', 'sale:refund',
    'user:read', 'user:create', 'user:update', 'user:delete',
    'role:manage',
    'report:read', 'report:export',
    'settings:read', 'settings:update',
    'admin:full'
  ]

  useEffect(() => {
    if (token) {
      loadData()
    }
  }, [token])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const [rolesRes, usersRes] = await Promise.all([
        apiClient.listRoles(),
        apiClient.listUsers()
      ])
      setRoles(rolesRes.data || [])
      setUsers(usersRes.data || [])
    } catch (err: any) {
      setError(err.message || 'Failed to load RBAC data')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateRole = async () => {
    if (!newRole.name || !newRole.description) {
      setError('Name and description are required')
      return
    }

    setLoading(true)
    try {
      await apiClient.createRole(newRole)
      setNewRole({ name: '', description: '', permissions: [] })
      loadData()
    } catch (err: any) {
      setError(err.message || 'Failed to create role')
    } finally {
      setLoading(false)
    }
  }

  const handleAssignRole = async () => {
    if (!selectedUser || !selectedRole) {
      setError('Please select both user and role')
      return
    }

    setLoading(true)
    try {
      await apiClient.assignRole(selectedUser, { roleId: selectedRole })
      setSelectedUser('')
      setSelectedRole('')
      loadData()
    } catch (err: any) {
      setError(err.message || 'Failed to assign role')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveRole = async (userId: string, roleId: string) => {
    setLoading(true)
    try {
      await apiClient.removeRole(userId, roleId)
      loadData()
    } catch (err: any) {
      setError(err.message || 'Failed to remove role')
    } finally {
      setLoading(false)
    }
  }

  const handlePermissionToggle = (permission: string) => {
    setNewRole(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }))
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">RBAC Management</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('roles')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'roles'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Roles
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'users'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab('permissions')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'permissions'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Permissions
          </button>
        </nav>
      </div>

      {loading && (
        <div className="text-center py-4">
          <div className="text-gray-500">Loading...</div>
        </div>
      )}

      {!loading && activeTab === 'roles' && (
        <div className="space-y-6">
          {/* Create New Role */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Create New Role</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Role Name"
                value={newRole.name}
                onChange={(e) => setNewRole(prev => ({ ...prev, name: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Description"
                value={newRole.description}
                onChange={(e) => setNewRole(prev => ({ ...prev, description: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Permissions:</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {availablePermissions.map(permission => (
                  <label key={permission} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newRole.permissions.includes(permission)}
                      onChange={() => handlePermissionToggle(permission)}
                      className="mr-2"
                    />
                    <span className="text-sm">{permission}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <button
              onClick={handleCreateRole}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Create Role
            </button>
          </div>

          {/* Existing Roles */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Existing Roles</h2>
            <div className="space-y-4">
              {roles.map(role => (
                <div key={role.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{role.name}</h3>
                      <p className="text-gray-600 text-sm">{role.description}</p>
                      <div className="mt-2">
                        <span className="text-xs text-gray-500">Permissions: </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {role.permissions.map(permission => (
                            <span key={permission} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                              {permission}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded ${
                      role.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {role.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!loading && activeTab === 'users' && (
        <div className="space-y-6">
          {/* Assign Role to User */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Assign Role to User</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select User</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.email} ({user.first_name} {user.last_name})
                  </option>
                ))}
              </select>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Role</option>
                {roles.map(role => (
                  <option key={role.id} value={role.id}>
                    {role.name} - {role.description}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleAssignRole}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Assign Role
            </button>
          </div>

          {/* User Roles */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">User Roles</h2>
            <div className="space-y-4">
              {users.map(user => (
                <div key={user.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{user.email}</h3>
                      <p className="text-gray-600 text-sm">{user.first_name} {user.last_name}</p>
                      <div className="mt-2">
                        <span className="text-xs text-gray-500">Roles: </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {user.roles.map(role => (
                            <span key={role.id} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                              {role.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded ${
                      user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  {user.roles.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <button
                        onClick={() => handleRemoveRole(user.id, user.roles[0].id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove {user.roles[0].name} role
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!loading && activeTab === 'permissions' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Available Permissions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availablePermissions.map(permission => (
              <div key={permission} className="border border-gray-200 rounded-lg p-3">
                <code className="text-sm font-mono text-blue-600">{permission}</code>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
