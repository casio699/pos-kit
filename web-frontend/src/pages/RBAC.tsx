import { useState, useEffect } from 'react'
import { useAuth } from '../store/auth'
import { apiClient } from '../api/client'
import { motion } from 'framer-motion'
import { Search, Users, Shield, Settings, Edit, Trash2, Plus, Download, X, AlertCircle, ChevronDown } from 'lucide-react'

interface Role {
  id: string
  name: string
  description: string
  permissions: string[]
  is_active: boolean
  created_at: string
  updated_at: string
  user_count?: number
}

interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  roles: Role[]
  is_active: boolean
  last_login?: string
}

interface CreateRoleDto {
  name: string
  description: string
  permissions: string[]
}

interface PermissionGroup {
  category: string
  permissions: string[]
  icon: React.ReactNode
  color: string
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
  
  // UI states
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateRoleModal, setShowCreateRoleModal] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [showBulkActions, setShowBulkActions] = useState(false)

  const permissionGroups: PermissionGroup[] = [
    {
      category: 'Products',
      permissions: ['product:read', 'product:create', 'product:update', 'product:delete'],
      icon: <Settings className="w-4 h-4" />,
      color: 'blue'
    },
    {
      category: 'Inventory',
      permissions: ['inventory:read', 'inventory:adjust', 'inventory:transfer'],
      icon: <Shield className="w-4 h-4" />,
      color: 'green'
    },
    {
      category: 'Sales',
      permissions: ['sale:read', 'sale:create', 'sale:update', 'sale:delete', 'sale:refund'],
      icon: <Users className="w-4 h-4" />,
      color: 'purple'
    },
    {
      category: 'Users',
      permissions: ['user:read', 'user:create', 'user:update', 'user:delete'],
      icon: <Users className="w-4 h-4" />,
      color: 'orange'
    },
    {
      category: 'System',
      permissions: ['role:manage', 'report:read', 'report:export', 'settings:read', 'settings:update', 'admin:full'],
      icon: <Shield className="w-4 h-4" />,
      color: 'red'
    }
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
      setShowCreateRoleModal(false)
      loadData()
    } catch (err: any) {
      setError(err.message || 'Failed to create role')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateRole = async () => {
    if (!editingRole || !newRole.name || !newRole.description) {
      setError('Name and description are required')
      return
    }

    setLoading(true)
    try {
      await apiClient.updateRole(editingRole.id, newRole)
      setEditingRole(null)
      setNewRole({ name: '', description: '', permissions: [] })
      loadData()
    } catch (err: any) {
      setError(err.message || 'Failed to update role')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteRole = async (roleId: string) => {
    if (!confirm('Are you sure you want to delete this role?')) return

    setLoading(true)
    try {
      await apiClient.deleteRole(roleId)
      loadData()
    } catch (err: any) {
      setError(err.message || 'Failed to delete role')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveRole = async (userId: string, roleId: string) => {
    if (!confirm('Are you sure you want to remove this role from the user?')) return

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

  const handleEditRole = (role: Role) => {
    setEditingRole(role)
    setNewRole({
      name: role.name,
      description: role.description,
      permissions: role.permissions
    })
    setShowCreateRoleModal(true)
  }

  const handleUserSelect = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const handleBulkAssign = async (roleId: string) => {
    if (selectedUsers.length === 0) {
      setError('Please select users first')
      return
    }

    setLoading(true)
    try {
      await Promise.all(
        selectedUsers.map(userId => apiClient.assignRole(userId, { roleId }))
      )
      setSelectedUsers([])
      setShowBulkActions(false)
      loadData()
    } catch (err: any) {
      setError(err.message || 'Failed to assign roles')
    } finally {
      setLoading(false)
    }
  }

  const filteredRoles = roles.filter(role => 
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.last_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-sm border-b border-gray-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">RBAC Management</h1>
              <p className="mt-1 text-sm text-gray-500">Manage roles, users, and permissions</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Error Alert */}
      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4"
        >
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
            <span className="text-red-800">{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'roles', label: 'Roles', icon: <Shield className="w-4 h-4" /> },
              { id: 'users', label: 'Users', icon: <Users className="w-4 h-4" /> },
              { id: 'permissions', label: 'Permissions', icon: <Settings className="w-4 h-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                <span className="ml-2">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading...</span>
          </div>
        </div>
      )}

      {/* Roles Tab */}
      {!loading && activeTab === 'roles' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Actions Bar */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Roles ({filteredRoles.length})</h2>
              <button
                onClick={() => setShowCreateRoleModal(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Role
              </button>
            </div>

            {/* Roles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRoles.map((role, index) => (
                <motion.div
                  key={role.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        role.is_active ? 'bg-blue-100' : 'bg-gray-100'
                      }`}>
                        <Shield className={`w-5 h-5 ${role.is_active ? 'text-blue-600' : 'text-gray-400'}`} />
                      </div>
                      <div className="ml-3">
                        <h3 className="font-semibold text-gray-900">{role.name}</h3>
                        <p className="text-sm text-gray-500">{role.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleEditRole(role)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteRole(role.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Status</span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        role.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1 ${
                          role.is_active ? 'bg-green-400' : 'bg-red-400'
                        }`} />
                        {role.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    
                    <div>
                      <span className="text-sm text-gray-500">Permissions</span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {role.permissions.slice(0, 3).map(permission => (
                          <span key={permission} className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
                            {permission}
                          </span>
                        ))}
                        {role.permissions.length > 3 && (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-500">
                            +{role.permissions.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {role.user_count !== undefined && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Users</span>
                        <span className="text-sm font-medium text-gray-900">{role.user_count}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {filteredRoles.length === 0 && (
              <div className="text-center py-12">
                <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No roles found</h3>
                <p className="text-gray-500">Get started by creating your first role.</p>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* Users Tab */}
      {!loading && activeTab === 'users' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Actions Bar */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Users ({filteredUsers.length})</h2>
              <div className="flex items-center space-x-3">
                {selectedUsers.length > 0 && (
                  <button
                    onClick={() => setShowBulkActions(!showBulkActions)}
                    className="flex items-center px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <span className="mr-2">Bulk Actions ({selectedUsers.length})</span>
                    <ChevronDown className={`w-4 h-4 transform transition-transform ${showBulkActions ? 'rotate-180' : ''}`} />
                  </button>
                )}
                <button
                  onClick={() => setShowCreateRoleModal(true)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Assign Role
                </button>
              </div>
            </div>

            {/* Bulk Actions Panel */}
            {showBulkActions && selectedUsers.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-purple-900">Bulk Assign Role</h3>
                    <p className="text-sm text-purple-700 mt-1">Assign a role to {selectedUsers.length} selected users</p>
                  </div>
                  <select
                    onChange={(e) => e.target.value && handleBulkAssign(e.target.value)}
                    className="px-3 py-2 border border-purple-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select role...</option>
                    {roles.map(role => (
                      <option key={role.id} value={role.id}>{role.name}</option>
                    ))}
                  </select>
                </div>
              </motion.div>
            )}

            {/* Users Table */}
            <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers(filteredUsers.map(u => u.id))
                          } else {
                            setSelectedUsers([])
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Roles
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Login
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user, index) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.02 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => handleUserSelect(user.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-600">
                                {user.first_name[0]}{user.last_name[0]}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.email}</div>
                            <div className="text-sm text-gray-500">{user.first_name} {user.last_name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {user.roles.map(role => (
                            <span key={role.id} className="inline-flex px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800">
                              {role.name}
                            </span>
                          ))}
                          {user.roles.length === 0 && (
                            <span className="text-sm text-gray-400">No roles</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          user.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 mr-3">
                          Edit
                        </button>
                        {user.roles.length > 0 && (
                          <button
                            onClick={() => handleRemoveRole(user.id, user.roles[0].id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Remove Role
                          </button>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                <p className="text-gray-500">Try adjusting your search criteria.</p>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* Permissions Tab */}
      {!loading && activeTab === 'permissions' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Permissions Overview</h2>
              <p className="mt-1 text-sm text-gray-500">Manage and review all system permissions</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {permissionGroups.map((group, index) => (
                <motion.div
                  key={group.category}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                >
                  <div className={`bg-${group.color}-50 px-6 py-4 border-b border-${group.color}-100`}>
                    <div className="flex items-center">
                      <div className={`text-${group.color}-600`}>
                        {group.icon}
                      </div>
                      <h3 className="ml-3 text-lg font-medium text-gray-900">{group.category}</h3>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="space-y-2">
                      {group.permissions.map(permission => (
                        <div key={permission} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-md">
                          <code className="text-sm font-mono text-gray-700">{permission}</code>
                          <span className="text-xs text-gray-500">{permission}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {/* Create/Edit Role Modal */}
      {showCreateRoleModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 overflow-y-auto"
        >
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={() => setShowCreateRoleModal(false)}>
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full"
            >
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {editingRole ? 'Edit Role' : 'Create New Role'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowCreateRoleModal(false)
                      setEditingRole(null)
                      setNewRole({ name: '', description: '', permissions: [] })
                    }}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role Name
                    </label>
                    <input
                      type="text"
                      value={newRole.name}
                      onChange={(e) => setNewRole(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter role name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={newRole.description}
                      onChange={(e) => setNewRole(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Describe the role's purpose"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Permissions
                    </label>
                    <div className="space-y-3">
                      {permissionGroups.map(group => (
                        <div key={group.category} className="border border-gray-200 rounded-lg p-3">
                          <div className="flex items-center mb-2">
                            <div className={`text-${group.color}-600 mr-2`}>
                              {group.icon}
                            </div>
                            <h4 className="font-medium text-gray-900">{group.category}</h4>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {group.permissions.map(permission => (
                              <label key={permission} className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={newRole.permissions.includes(permission)}
                                  onChange={() => handlePermissionToggle(permission)}
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                                />
                                <span className="text-sm text-gray-700">{permission}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={editingRole ? handleUpdateRole : handleCreateRole}
                  disabled={loading}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  {loading ? 'Saving...' : (editingRole ? 'Update Role' : 'Create Role')}
                </button>
                <button
                  onClick={() => {
                    setShowCreateRoleModal(false)
                    setEditingRole(null)
                    setNewRole({ name: '', description: '', permissions: [] })
                  }}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
