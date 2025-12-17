export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
export const APP_NAME = 'KiTS POS'
export const APP_VERSION = '1.0.0'

// Store configuration
export const STORE_CONFIG = {
  taxRate: 0.1, // 10% tax
  currency: 'USD',
  lowStockThreshold: 5,
}

// Barcode configuration
export const BARCODE_CONFIG = {
  minLength: 8,
  maxLength: 20,
  autoSubmitDelay: 500, // ms
}

// Offline configuration
export const OFFLINE_CONFIG = {
  syncInterval: 30000, // 30 seconds
  maxRetries: 3,
  batchSize: 100,
}
