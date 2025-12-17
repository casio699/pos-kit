import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { apiClient } from '../api/client'

interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  roles: string[]
  tenant_id: string
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  _hasHydrated: boolean
  tenantId: string | null
  
  // Actions
  setToken: (token: string) => void
  setUser: (user: User) => void
  setEmail: (email: string) => void
  login: (email: string, password: string) => Promise<void>
  register: (data: any) => Promise<void>
  logout: () => void
  validateToken: () => Promise<void>
  initializeTenant: () => void
  setHasHydrated: (state: boolean) => void
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      _hasHydrated: false,
      tenantId: null,

      setToken: (token: string) => {
        set({ token })
        apiClient.setToken(token)
      },

      setUser: (user: User) => set({ user }),

      setEmail: (email: string) => {
        if (get().user) {
          set({ user: { ...get().user!, email } })
        }
      },

      login: async (email: string, password: string) => {
        set({ isLoading: true })
        try {
          const response = await apiClient.login({ email, password })
          const { access_token, user } = response
          
          set({ 
            token: access_token,
            user,
            tenantId: user.tenant_id,
            isLoading: false
          })
          
          apiClient.setToken(access_token)
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      register: async (data: any) => {
        set({ isLoading: true })
        try {
          await apiClient.register(data)
          set({ isLoading: false })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      logout: () => {
        set({ 
          user: null, 
          token: null, 
          tenantId: null
        })
        apiClient.clearToken()
      },

      validateToken: async () => {
        const { token } = get()
        if (!token) return

        try {
          // TODO: Add token validation endpoint
          // For now, just check if token exists
          console.log('Token validation completed')
        } catch (error) {
          get().logout()
        }
      },

      initializeTenant: () => {
        const { tenantId } = get()
        if (!tenantId) {
          // Generate a new tenant ID for new installations
          const newTenantId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0
            const v = c === 'x' ? r : (r & 0x3 | 0x8)
            return v.toString(16)
          })
          set({ tenantId: newTenantId })
        }
      },

      setHasHydrated: (state: boolean) => {
        set({ _hasHydrated: state })
      },
    }),
    {
      name: 'pos-auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        tenantId: state.tenantId,
      }),
      onRehydrateStorage: () => (state) => {
        console.log('Starting rehydration...')
        if (state?.token) {
          apiClient.setToken(state.token)
        }
        state?.initializeTenant()
        if (state) {
          state.setHasHydrated(true)
        }
        console.log('Rehydration completed')
      },
    }
  )
)
