import axios from 'axios'
import { useAuth } from '../store/auth'

export const API_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '')

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const { token, tenantId } = useAuth.getState()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  if (tenantId) {
    config.headers['X-Tenant-ID'] = tenantId
  }
  return config
}, (error) => {
  return Promise.reject(error)
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      useAuth.getState().reset()
    }
    // Handle 403 Forbidden for new tenants without data
    if (error.response?.status === 403) {
      // Return empty array for list endpoints
      if (error.config?.method?.toLowerCase() === 'get' && error.config.url?.includes('/products')) {
        return { data: [] }
      }
      // Return null for single resource endpoints
      if (error.config?.method?.toLowerCase() === 'get' && error.config.url?.match(/\/products\/[^/]+$/)) {
        return { data: null }
      }
    }
    return Promise.reject(error)
  }
)

export async function register(payload: { email: string; password: string; first_name: string; last_name: string; tenant_id: string; role: string }) {
  const { data } = await api.post('/auth/register', payload)
  return data
}

export async function login(payload: { email: string; password: string }) {
  const { data } = await api.post('/auth/login', payload)
  return data
}


export async function listProducts(tenant_id: string) {
  const { data } = await api.get(`/products`, { params: { tenant_id } })
  return data
}

export async function createProduct(tenant_id: string, body: { sku: string; name: string; price: number; cost: number }) {
  const { data } = await api.post('/products', { tenant_id, ...body })
  return data
}

export async function listInventory(tenant_id: string, params?: { location_id?: string; product_id?: string }) {
  const { data } = await api.get('/inventory', { params: { tenant_id, ...(params || {}) } })
  return data
}

export async function adjustInventory(tenant_id: string, body: { product_id: string; location_id: string; quantity: number }) {
  const { data } = await api.post('/inventory/adjust', { tenant_id, ...body })
  return data
}

export async function createLocation(tenant_id: string, body: { name: string; type?: string; address?: string }) {
  const { data } = await api.post('/locations', { tenant_id, ...body })
  return data
}

export async function listLocations(tenant_id: string) {
  const { data } = await api.get('/locations', { params: { tenant_id } })
  return data
}

export async function createSale(tenant_id: string, body: { location_id: string; lines: Array<{ product_id: string; quantity: number; unit_price: number; discount?: number }>; total_amount: number; payment_method: string }) {
  const { data } = await api.post('/sales', { tenant_id, ...body })
  return data
}

export async function listSales(tenant_id: string) {
  const { data } = await api.get('/sales', { params: { tenant_id } })
  return data
}

export const salesApi = {
  createSale: (data: any) => api.post('/sales', data),
  listSales: () => api.get('/sales'),
  getSale: (id: string) => api.get(`/sales/${id}`),
  refundSale: (id: string, data: any) => api.post(`/sales/${id}/refund`, data),
}

export const paymentApi = {
  createPaymentIntent: (data: any) => api.post('/payments/create-payment-intent', data),
  getPaymentStatus: (paymentIntentId: string) => api.get(`/payments/status/${paymentIntentId}`),
}

export const shopifyApi = {
  syncProducts: (products: any[]) => api.post('/shopify/sync/products', { products }),
  syncInventory: (inventory: any[]) => api.post('/shopify/sync/inventory', { inventory }),
  createOrder: (orderData: any) => api.post('/shopify/orders/create', orderData),
  getProducts: () => api.get('/shopify/products'),
  getSyncStatus: () => api.get('/shopify/sync/status'),
}

export const rbacApi = {
  listRoles: () => api.get('/rbac/roles'),
  createRole: (roleData: any) => api.post('/rbac/roles', roleData),
  updateRole: (roleId: string, updates: any) => api.put(`/rbac/roles/${roleId}`, updates),
  deleteRole: (roleId: string) => api.delete(`/rbac/roles/${roleId}`),
  listUsers: () => api.get('/rbac/users'),
  assignRole: (userId: string, data: { roleId: string }) => 
    api.post(`/rbac/users/${userId}/roles`, data),
  removeRole: (userId: string, roleId: string) => 
    api.delete(`/rbac/users/${userId}/roles/${roleId}`),
  getUserRoles: (userId: string) => api.get(`/rbac/users/${userId}/roles`),
  getUserPermissions: (userId: string) => api.get(`/rbac/users/${userId}/permissions`),
  listPermissions: () => api.get('/rbac/permissions'),
  initializeRoles: () => api.post('/rbac/initialize-roles'),
}

export const reportsApi = {
  getDashboardStats: (tenant_id: string) => api.get('/reports/dashboard', { params: { tenant_id } }),
  getInventoryHealth: (tenant_id: string) => api.get('/reports/inventory-health', { params: { tenant_id } }),
  getSalesAnalytics: (tenant_id: string, params?: { period?: string }) => 
    api.get('/reports/sales-analytics', { params: { tenant_id, ...(params || {}) } }),
  getTopProducts: (tenant_id: string, params?: { limit?: number }) =>
    api.get('/reports/top-products', { params: { tenant_id, ...(params || {}) } }),
  getRecentOrders: (tenant_id: string, params?: { limit?: number }) =>
    api.get('/reports/recent-orders', { params: { tenant_id, ...(params || {}) } }),
}

// Create a unified client object
export const apiClient = {
  // Auth
  register,
  login,
  
  // Products
  listProducts,
  createProduct,
  
  // Inventory
  listInventory,
  adjustInventory,
  
  // Locations
  createLocation,
  listLocations,
  
  // Sales
  createSale,
  listSales,
  
  // APIs
  salesApi,
  paymentApi,
  shopifyApi,
  rbacApi,
  reportsApi,
  
  // RBAC direct methods
  listRoles: rbacApi.listRoles,
  createRole: rbacApi.createRole,
  updateRole: rbacApi.updateRole,
  deleteRole: rbacApi.deleteRole,
  listUsers: rbacApi.listUsers,
  assignRole: rbacApi.assignRole,
  removeRole: rbacApi.removeRole,
  getUserRoles: rbacApi.getUserRoles,
  getUserPermissions: rbacApi.getUserPermissions,
  listPermissions: rbacApi.listPermissions,
  initializeRoles: rbacApi.initializeRoles,
}
