import { useAuth } from '../store/auth'

export function usePermissions() {
  const { token } = useAuth()

  const hasPermission = async (): Promise<boolean> => {
    if (!token) return false
    
    try {
      // For now, we'll check based on user roles from JWT
      // In a real implementation, you might want to call an API to check permissions
      const payload = JSON.parse(atob(token.split('.')[1]))
      const userRoles = payload.roles || []
      
      // Admin role has all permissions
      if (userRoles.includes('admin')) {
        return true
      }
      
      // For now, return false for non-admin users
      // TODO: Implement proper permission checking based on role permissions
      return false
    } catch {
      return false
    }
  }

  const hasRole = (role: string): boolean => {
    if (!token) return false
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload.roles?.includes(role) || false
    } catch {
      return false
    }
  }

  const isAdmin = (): boolean => {
    return hasRole('admin')
  }

  const isViewer = (): boolean => {
    return hasRole('viewer')
  }

  return {
    hasPermission,
    hasRole,
    isAdmin,
    isViewer,
  }
}
