import { API_BASE_URL } from '../config'

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  first_name: string
  last_name: string
  tenant_id: string
  role: string
}

export interface Product {
  id: string
  name: string
  sku: string
  description?: string
  price: number
  cost: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface InventoryItem {
  id: string
  product_id: string
  location_id: string
  qty_available: number
  qty_reserved: number
  reorder_point: number
  created_at: string
  updated_at: string
}

export interface SaleRequest {
  items: {
    product_id: string
    quantity: number
    price: number
    discount: number
  }[]
  payment_method: 'card' | 'cash' | 'split'
  customer_email?: string
}

export interface Sale {
  id: string
  total_amount: number
  payment_method: string
  status: string
  created_at: string
  sale_lines: any[]
}

class ApiClient {
  private baseUrl: string
  private token: string | null = null

  constructor() {
    this.baseUrl = API_BASE_URL || 'http://localhost:3000'
    this.token = localStorage.getItem('pos-token')
  }

  setToken(token: string) {
    this.token = token
    localStorage.setItem('pos-token', token)
  }

  clearToken() {
    this.token = null
    localStorage.removeItem('pos-token')
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }))
      throw new Error(error.message || `HTTP ${response.status}`)
    }

    return response.json()
  }

  // Auth endpoints
  async login(data: LoginRequest) {
    return this.request<{ access_token: string; refresh_token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async register(data: RegisterRequest) {
    return this.request<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Product endpoints
  async getProducts(tenantId: string, skip = 0, take = 50): Promise<Product[]> {
    return this.request<Product[]>(`/products?tenant_id=${tenantId}&skip=${skip}&take=${take}`)
  }

  async getProduct(tenantId: string, id: string): Promise<Product> {
    return this.request<Product>(`/products/${id}?tenant_id=${tenantId}`)
  }

  async createProduct(tenantId: string, data: Partial<Product>): Promise<Product> {
    return this.request<Product>('/products', {
      method: 'POST',
      body: JSON.stringify({ tenant_id: tenantId, ...data }),
    })
  }

  async updateProduct(tenantId: string, id: string, data: Partial<Product>): Promise<Product> {
    return this.request<Product>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ tenant_id: tenantId, ...data }),
    })
  }

  async deleteProduct(tenantId: string, id: string): Promise<void> {
    return this.request<void>(`/products/${id}?tenant_id=${tenantId}`, {
      method: 'DELETE',
    })
  }

  // Inventory endpoints
  async getInventory(tenantId: string): Promise<InventoryItem[]> {
    return this.request<InventoryItem[]>(`/inventory?tenant_id=${tenantId}`)
  }

  async adjustInventory(tenantId: string, productId: string, locationId: string, quantity: number, reason: string): Promise<void> {
    return this.request<void>('/inventory/adjust', {
      method: 'POST',
      body: JSON.stringify({
        tenant_id: tenantId,
        product_id: productId,
        location_id: locationId,
        quantity,
        reason,
      }),
    })
  }

  async transferInventory(tenantId: string, productId: string, fromLocationId: string, toLocationId: string, quantity: number): Promise<void> {
    return this.request<void>('/inventory/transfer', {
      method: 'POST',
      body: JSON.stringify({
        tenant_id: tenantId,
        product_id: productId,
        from_location_id: fromLocationId,
        to_location_id: toLocationId,
        quantity,
      }),
    })
  }

  // Sales endpoints
  async createSale(tenantId: string, data: SaleRequest): Promise<Sale> {
    return this.request<Sale>('/sales', {
      method: 'POST',
      body: JSON.stringify({ tenant_id: tenantId, ...data }),
    })
  }

  async getSales(tenantId: string, skip = 0, take = 50): Promise<Sale[]> {
    return this.request<Sale[]>(`/sales?tenant_id=${tenantId}&skip=${skip}&take=${take}`)
  }

  async getSale(tenantId: string, id: string): Promise<Sale> {
    return this.request<Sale>(`/sales/${id}?tenant_id=${tenantId}`)
  }

  // Reporting endpoints
  async getDashboardMetrics(tenantId: string): Promise<any> {
    return this.request<any>(`/reports/dashboard?tenant_id=${tenantId}`)
  }

  async getInventoryHealth(tenantId: string): Promise<any> {
    return this.request<any>(`/reports/inventory-health?tenant_id=${tenantId}`)
  }

  // Utility method to search products by SKU/barcode
  async findProductBySku(tenantId: string, sku: string): Promise<Product | null> {
    const products = await this.getProducts(tenantId, 0, 1000)
    return products.find(p => p.sku === sku) || null
  }
}

export const apiClient = new ApiClient()
export default apiClient
