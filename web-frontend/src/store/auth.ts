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

const getStoredToken = () => {
  try {
    return localStorage.getItem('auth-token')
  } catch {
    return null
  }
}

const getStoredEmail = () => {
  try {
    return localStorage.getItem('auth-email')
  } catch {
    return null
  }
}

export const useAuth = create<AuthState>((set, get) => ({
  token: getStoredToken(),
  email: getStoredEmail(),
  tenantId: '00000000-0000-0000-0000-000000000001',
  setToken: (token) => {
    try {
      if (token) {
        localStorage.setItem('auth-token', token)
      } else {
        localStorage.removeItem('auth-token')
      }
    } catch {}
    set({ token })
  },
  setEmail: (email) => {
    try {
      if (email) {
        localStorage.setItem('auth-email', email)
      } else {
        localStorage.removeItem('auth-email')
      }
    } catch {}
    set({ email })
  },
  setTenantId: (tenantId) => set({ tenantId }),
  reset: () => {
    try {
      localStorage.removeItem('auth-token')
      localStorage.removeItem('auth-email')
    } catch {}
    set({ token: null, email: null })
  },
}))
