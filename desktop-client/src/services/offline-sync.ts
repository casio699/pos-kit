import { Product, InventoryItem, Sale } from '../api/client'
import { apiClient } from '../api/client'
import { OFFLINE_CONFIG } from '../config'

interface OfflineData {
  products: Product[]
  inventory: InventoryItem[]
  sales: Sale[]
  lastSync: string
}

interface SyncQueue {
  sales: Array<{
    data: any
    timestamp: number
    retryCount: number
  }>
  inventoryAdjustments: Array<{
    data: any
    timestamp: number
    retryCount: number
  }>
}

class OfflineSyncService {
  private dbName = 'pos-kit-offline'
  private version = 1
  private db: IDBDatabase | null = null
  private syncInterval: NodeJS.Timeout | null = null
  private isOnline = navigator.onLine

  constructor() {
    this.initDB()
    this.setupEventListeners()
  }

  private async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Create object stores
        if (!db.objectStoreNames.contains('products')) {
          db.createObjectStore('products', { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains('inventory')) {
          db.createObjectStore('inventory', { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains('sales')) {
          db.createObjectStore('sales', { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains('syncQueue')) {
          db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true })
        }
        if (!db.objectStoreNames.contains('metadata')) {
          db.createObjectStore('metadata', { keyPath: 'key' })
        }
      }
    })
  }

  private setupEventListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true
      this.startSync()
    })

    window.addEventListener('offline', () => {
      this.isOnline = false
      this.stopSync()
    })

    // Start sync if online
    if (this.isOnline) {
      this.startSync()
    }
  }

  private startSync(): void {
    if (this.syncInterval) return

    this.syncInterval = setInterval(() => {
      this.syncData()
    }, OFFLINE_CONFIG.syncInterval)

    // Immediate sync when coming online
    this.syncData()
  }

  private stopSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }
  }

  // Data access methods
  async getProducts(): Promise<Product[]> {
    if (!this.db) await this.initDB()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['products'], 'readonly')
      const store = transaction.objectStore('products')
      const request = store.getAll()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result || [])
    })
  }

  async saveProducts(products: Product[]): Promise<void> {
    if (!this.db) await this.initDB()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['products'], 'readwrite')
      const store = transaction.objectStore('products')

      products.forEach(product => {
        store.put(product)
      })

      transaction.onerror = () => reject(transaction.error)
      transaction.oncomplete = () => resolve()
    })
  }

  async getInventory(): Promise<InventoryItem[]> {
    if (!this.db) await this.initDB()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['inventory'], 'readonly')
      const store = transaction.objectStore('inventory')
      const request = store.getAll()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result || [])
    })
  }

  async saveInventory(inventory: InventoryItem[]): Promise<void> {
    if (!this.db) await this.initDB()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['inventory'], 'readwrite')
      const store = transaction.objectStore('inventory')

      inventory.forEach(item => {
        store.put(item)
      })

      transaction.onerror = () => reject(transaction.error)
      transaction.oncomplete = () => resolve()
    })
  }

  async getSales(): Promise<Sale[]> {
    if (!this.db) await this.initDB()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['sales'], 'readonly')
      const store = transaction.objectStore('sales')
      const request = store.getAll()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result || [])
    })
  }

  async saveSale(sale: Sale): Promise<void> {
    if (!this.db) await this.initDB()
    
    // Save sale locally
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['sales', 'syncQueue'], 'readwrite')
      const salesStore = transaction.objectStore('sales')
      const queueStore = transaction.objectStore('syncQueue')

      salesStore.put(sale)

      // Add to sync queue
      queueStore.add({
        type: 'sale',
        data: sale,
        timestamp: Date.now(),
        retryCount: 0
      })

      transaction.onerror = () => reject(transaction.error)
      transaction.oncomplete = () => resolve()
    })
  }

  async queueInventoryAdjustment(adjustment: any): Promise<void> {
    if (!this.db) await this.initDB()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['syncQueue'], 'readwrite')
      const store = transaction.objectStore('syncQueue')

      store.add({
        type: 'inventory_adjustment',
        data: adjustment,
        timestamp: Date.now(),
        retryCount: 0
      })

      transaction.onerror = () => reject(transaction.error)
      transaction.oncomplete = () => resolve()
    })
  }

  // Sync methods
  private async syncData(): Promise<void> {
    if (!this.isOnline || !this.db) return

    try {
      await this.processSyncQueue()
      await this.refreshData()
    } catch (error) {
      console.error('Sync failed:', error)
    }
  }

  private async processSyncQueue(): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['syncQueue'], 'readwrite')
      const store = transaction.objectStore('syncQueue')
      const request = store.getAll()

      request.onerror = () => reject(request.error)
      request.onsuccess = async () => {
        const queue = request.result || []
        const processed: number[] = []

        for (const item of queue) {
          try {
            if (item.type === 'sale') {
              // TODO: Sync sale with server
              console.log('Syncing sale:', item.data)
            } else if (item.type === 'inventory_adjustment') {
              // TODO: Sync inventory adjustment with server
              console.log('Syncing inventory adjustment:', item.data)
            }

            processed.push(item.id)
          } catch (error) {
            console.error('Failed to sync item:', item, error)
            
            // Update retry count
            item.retryCount++
            if (item.retryCount >= OFFLINE_CONFIG.maxRetries) {
              processed.push(item.id) // Remove after max retries
            } else {
              // Update the item with new retry count
              store.put(item)
            }
          }
        }

        // Remove processed items
        const deleteTransaction = this.db!.transaction(['syncQueue'], 'readwrite')
        const deleteStore = deleteTransaction.objectStore('syncQueue')
        
        processed.forEach(id => {
          deleteStore.delete(id)
        })

        resolve()
      }
    })
  }

  private async refreshData(): Promise<void> {
    if (!this.db) return

    try {
      // TODO: Fetch latest data from server
      // This would be implemented when we have the tenant ID
      console.log('Refreshing data from server')
    } catch (error) {
      console.error('Failed to refresh data:', error)
    }
  }

  async getLastSyncTime(): Promise<string | null> {
    if (!this.db) await this.initDB()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['metadata'], 'readonly')
      const store = transaction.objectStore('metadata')
      const request = store.get('lastSync')

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        const result = request.result
        resolve(result ? result.value : null)
      }
    })
  }

  async updateLastSyncTime(): Promise<void> {
    if (!this.db) await this.initDB()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['metadata'], 'readwrite')
      const store = transaction.objectStore('metadata')
      
      store.put({
        key: 'lastSync',
        value: new Date().toISOString()
      })

      transaction.onerror = () => reject(transaction.error)
      transaction.oncomplete = () => resolve()
    })
  }

  // Utility methods
  isOffline(): boolean {
    return !this.isOnline
  }

  getSyncStatus(): 'online' | 'offline' | 'syncing' | 'error' {
    if (!this.isOnline) return 'offline'
    // TODO: Add more sophisticated sync status tracking
    return 'online'
  }

  async clearAllData(): Promise<void> {
    if (!this.db) await this.initDB()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['products', 'inventory', 'sales', 'syncQueue', 'metadata'], 'readwrite')
      
      ['products', 'inventory', 'sales', 'syncQueue', 'metadata'].forEach(storeName => {
        const store = transaction.objectStore(storeName)
        store.clear()
      })

      transaction.onerror = () => reject(transaction.error)
      transaction.oncomplete = () => resolve()
    })
  }
}

export const offlineSyncService = new OfflineSyncService()
export default offlineSyncService
