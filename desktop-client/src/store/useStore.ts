import { create } from 'zustand'
import { apiClient } from '../api/client'
import { Product, InventoryItem, Sale } from '../api/client'
import offlineSyncService from '../services/offline-sync'

interface CartItem {
  product: Product
  quantity: number
  discount: number
}

interface StoreState {
  // Products
  products: Product[]
  isLoadingProducts: boolean
  
  // Inventory
  inventory: InventoryItem[]
  isLoadingInventory: boolean
  
  // Cart
  cart: CartItem[]
  
  // Sales
  sales: Sale[]
  isLoadingSales: boolean
  
  // UI State
  isOnline: boolean
  syncStatus: 'synced' | 'syncing' | 'offline' | 'error'
  
  // Actions
  fetchProducts: (tenantId: string) => Promise<void>
  fetchInventory: (tenantId: string) => Promise<void>
  fetchSales: (tenantId: string) => Promise<Sale[]>
  addToCart: (product: Product, quantity?: number) => void
  removeFromCart: (productId: string) => void
  updateCartQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  createSale: (tenantId: string, paymentMethod: string) => Promise<Sale>
  adjustInventory: (tenantId: string, productId: string, locationId: string, quantity: number, reason: string) => Promise<void>
  setOnlineStatus: (isOnline: boolean) => void
}

export const useStore = create<StoreState>((set, get) => ({
  // Initial state
  products: [],
  isLoadingProducts: false,
  inventory: [],
  isLoadingInventory: false,
  cart: [],
  sales: [],
  isLoadingSales: false,
  isOnline: navigator.onLine,
  syncStatus: 'synced',

  // Product actions
  fetchProducts: async (tenantId: string) => {
    set({ isLoadingProducts: true })
    try {
      let products: Product[]
      
      if (offlineSyncService.isOffline()) {
        // Fetch from offline storage
        products = await offlineSyncService.getProducts()
      } else {
        // Fetch from API
        products = await apiClient.getProducts(tenantId)
        // Save to offline storage
        await offlineSyncService.saveProducts(products)
      }
      
      set({ products, isLoadingProducts: false })
    } catch (error) {
      console.error('Failed to fetch products:', error)
      // Fallback to offline storage
      try {
        const products = await offlineSyncService.getProducts()
        set({ products, isLoadingProducts: false })
      } catch (offlineError) {
        console.error('Failed to fetch from offline storage:', offlineError)
        set({ isLoadingProducts: false })
      }
    }
  },

  // Inventory actions
  fetchInventory: async (tenantId: string) => {
    set({ isLoadingInventory: true })
    try {
      let inventory: InventoryItem[]
      
      if (offlineSyncService.isOffline()) {
        // Fetch from offline storage
        inventory = await offlineSyncService.getInventory()
      } else {
        // Fetch from API
        inventory = await apiClient.getInventory(tenantId)
        // Save to offline storage
        await offlineSyncService.saveInventory(inventory)
      }
      
      set({ inventory, isLoadingInventory: false })
    } catch (error) {
      console.error('Failed to fetch inventory:', error)
      // Fallback to offline storage
      try {
        const inventory = await offlineSyncService.getInventory()
        set({ inventory, isLoadingInventory: false })
      } catch (offlineError) {
        console.error('Failed to fetch from offline storage:', offlineError)
        set({ isLoadingInventory: false })
      }
    }
  },

  // Sales actions
  fetchSales: async (tenantId: string) => {
    set({ isLoadingSales: true })
    try {
      let sales: Sale[]
      
      if (offlineSyncService.isOffline()) {
        // Fetch from offline storage
        sales = await offlineSyncService.getSales()
      } else {
        // Fetch from API
        sales = await apiClient.getSales(tenantId)
        // Save to offline storage
        await Promise.all(sales.map(sale => offlineSyncService.saveSale(sale)))
      }
      
      set({ sales, isLoadingSales: false })
    } catch (error) {
      console.error('Failed to fetch sales:', error)
      // Fallback to offline storage
      try {
        const sales = await offlineSyncService.getSales()
        set({ sales, isLoadingSales: false })
      } catch (offlineError) {
        console.error('Failed to fetch from offline storage:', offlineError)
        set({ isLoadingSales: false })
      }
    }
  },

  // Cart actions
  addToCart: (product: Product, quantity = 1) => {
    const { cart } = get()
    const existingItem = cart.find(item => item.product.id === product.id)
    
    if (existingItem) {
      set({
        cart: cart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      })
    } else {
      set({ cart: [...cart, { product, quantity, discount: 0 }] })
    }
  },

  removeFromCart: (productId: string) => {
    set({ cart: get().cart.filter(item => item.product.id !== productId) })
  },

  updateCartQuantity: (productId: string, quantity: number) => {
    if (quantity <= 0) {
      get().removeFromCart(productId)
    } else {
      set({
        cart: get().cart.map(item =>
          item.product.id === productId
            ? { ...item, quantity }
            : item
        )
      })
    }
  },

  clearCart: () => {
    set({ cart: [] })
  },

  // Sale creation
  createSale: async (tenantId: string, paymentMethod: string) => {
    const { cart } = get()
    if (cart.length === 0) throw new Error('Cart is empty')

    const saleData = {
      items: cart.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity,
        price: item.product.price,
        discount: item.discount,
      })),
      payment_method: paymentMethod as any,
    }

    try {
      const sale = await apiClient.createSale(tenantId, saleData)
      
      // Update local sales list
      set({ sales: [sale, ...get().sales] })
      
      // Clear cart
      get().clearCart()
      
      // Refresh inventory
      get().fetchInventory(tenantId)
      
      return sale
    } catch (error) {
      console.error('Failed to create sale:', error)
      throw error
    }
  },

  // Inventory adjustment
  adjustInventory: async (tenantId: string, productId: string, locationId: string, quantity: number, reason: string) => {
    try {
      await apiClient.adjustInventory(tenantId, productId, locationId, quantity, reason)
      
      // Refresh inventory
      get().fetchInventory(tenantId)
    } catch (error) {
      console.error('Failed to adjust inventory:', error)
      throw error
    }
  },

  // Online status
  setOnlineStatus: (isOnline: boolean) => {
    set({ 
      isOnline,
      syncStatus: isOnline ? 'synced' : 'offline'
    })
  },
}))

// Listen for online/offline events
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    useStore.getState().setOnlineStatus(true)
  })
  
  window.addEventListener('offline', () => {
    useStore.getState().setOnlineStatus(false)
  })
}
