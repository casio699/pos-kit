import axios from 'axios'
import { useAuth } from '../store/auth'

export const API_URL = (import.meta as any).env?.VITE_API_URL || '/api'

export const api = axios.create({ baseURL: API_URL })

api.interceptors.request.use((config) => {
  const token = useAuth.getState().token
  if (token) {
    if (!config.headers) config.headers = {} as any
    ;(config.headers as any)['Authorization'] = `Bearer ${token}`
  }
  return config
})

export async function register(payload: { email: string; password: string; first_name: string; last_name: string; tenant_id: string }) {
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
