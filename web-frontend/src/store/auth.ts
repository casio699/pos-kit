import { create } from 'zustand'

interface AuthState {
  token: string | null
  email: string | null
  tenantId: string
  isLoading: boolean
  isInitialized: boolean
  setToken: (token: string | null) => void
  setEmail: (email: string | null) => void
  setTenantId: (tenantId: string) => void
  reset: () => void
  validateToken: () => Promise<boolean>
  initialize: () => Promise<void>
}

const getStoredToken = (): string | null => {
  try {
    return localStorage.getItem('auth-token')
  } catch {
    return null
  }
}

const getStoredEmail = (): string | null => {
  try {
    return localStorage.getItem('auth-email')
  } catch {
    return null
  }
}

const useAuth = create<AuthState>((set, get) => {
  return {
    token: getStoredToken(),
    email: getStoredEmail(),
    tenantId: '00000000-0000-0000-0000-000000000001',
    isLoading: false,
    isInitialized: false,
    setToken: (token: string | null) => {
      try {
        if (token) {
          localStorage.setItem('auth-token', token)
        } else {
          localStorage.removeItem('auth-token')
        }
      } catch {}
      set({ token })
    },
    setEmail: (email: string | null) => {
      try {
        if (email) {
          localStorage.setItem('auth-email', email)
        } else {
          localStorage.removeItem('auth-email')
        }
      } catch {}
      set({ email })
    },
    setTenantId: (tenantId: string) => set({ tenantId }),
    reset: () => {
      try {
        localStorage.removeItem('auth-token')
        localStorage.removeItem('auth-email')
      } catch {}
      set({ token: null, email: null, isInitialized: true, isLoading: false })
    },
    validateToken: async (): Promise<boolean> => {
      const { token } = get()
      if (!token) return false

      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        return response.ok
      } catch (error) {
        console.error('Token validation failed:', error)
        return false
      }
    },
    initialize: async (): Promise<void> => {
      const token = getStoredToken()
      const email = getStoredEmail()

      if (!token) {
        set({ isInitialized: true, isLoading: false })
        return
      }

      set({ token, email, isLoading: true })
      
      try {
        const isValid = await get().validateToken()
        if (!isValid) {
          get().reset()
        }
      } catch (error) {
        console.error('Initialization error:', error)
        get().reset()
      } finally {
        set({ isInitialized: true, isLoading: false })
      }
    }
  }
})

// Initialize the store
useAuth.getState().initialize()

export { useAuth }
