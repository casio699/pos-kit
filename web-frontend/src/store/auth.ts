import { create } from 'zustand'

interface AuthState {
  token: string | null
  email: string | null
  tenantId: string
  setToken: (token: string | null) => void
  setEmail: (email: string | null) => void
  setTenantId: (tenantId: string) => void
  reset: () => void
}

export const useAuth = create<AuthState>((set) => ({
  token: null,
  email: null,
  tenantId: '00000000-0000-0000-0000-000000000001',
  setToken: (token) => set({ token }),
  setEmail: (email) => set({ email }),
  setTenantId: (tenantId) => set({ tenantId }),
  reset: () => set({ token: null, email: null }),
}))
