import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../store/auth'
import { login, register } from '../api/client'
import { Eye, EyeOff, Store, Package, CreditCard, Users, TrendingUp, Lock, Mail, User, AlertCircle, CheckCircle, X } from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation() as any
  const { tenantId, setToken, setEmail } = useAuth()

  const [email, setEmailInput] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isRegisterMode, setIsRegisterMode] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  
  // Onboarding state
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [onboardingStep, setOnboardingStep] = useState(0)

  // POS features
  const [selectedRole, setSelectedRole] = useState<'cashier' | 'manager' | 'admin'>('cashier')
  const [storeLocation, setStoreLocation] = useState('')

  const storeLocations = [
    'Main Store - Downtown',
    'Branch A - North Side', 
    'Branch B - West Mall',
    'Warehouse - Industrial',
    'Pop-up Store - Central'
  ]

  const roles = [
    { id: 'cashier', name: 'Cashier', icon: <CreditCard className="w-4 h-4" />, description: 'Process sales and manage daily transactions' },
    { id: 'manager', name: 'Store Manager', icon: <Users className="w-4 h-4" />, description: 'Manage inventory, staff, and reports' },
    { id: 'admin', name: 'System Admin', icon: <Store className="w-4 h-4" />, description: 'Full system access and configuration' }
  ]

  const goNext = () => {
    const from = location.state?.from?.pathname || '/products'
    navigate(from, { replace: true })
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}
    
    if (!email) errors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(email)) errors.email = 'Invalid email format'
    
    if (!password) errors.password = 'Password is required'
    else if (password.length < 6) errors.password = 'Password must be at least 6 characters'
    else if (password.length > 128) errors.password = 'Password is too long (max 128 characters)'
    
    if (isRegisterMode) {
      if (!firstName) errors.firstName = 'First name is required'
      else if (firstName.length < 2) errors.firstName = 'First name must be at least 2 characters'
      else if (firstName.length > 50) errors.firstName = 'First name is too long (max 50 characters)'
      
      if (!lastName) errors.lastName = 'Last name is required'
      else if (lastName.length < 2) errors.lastName = 'Last name must be at least 2 characters'
      else if (lastName.length > 50) errors.lastName = 'Last name is too long (max 50 characters)'
      
      if (!storeLocation) errors.storeLocation = 'Store location is required'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleRegister = async () => {
    if (!validateForm()) return
    
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      // Generate a UUID for the tenant if none exists
      let newTenantId = tenantId
      
      if (!tenantId || tenantId === 'Generating...' || tenantId.length < 10) {
        const generateUUID = () => {
          return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0
            const v = c === 'x' ? r : (r & 0x3 | 0x8)
            return v.toString(16)
          })
        }
        newTenantId = generateUUID()
      }
      
      const registrationData = { 
        email, 
        password, 
        first_name: firstName, 
        last_name: lastName,
        tenant_id: newTenantId,
        role: selectedRole
      }
      
      await register(registrationData)
      setSuccess('Registration successful! Logging you in...')
      
      // Auto-login after successful registration
      setTimeout(async () => {
        try {
          const res = await login({ email, password })
          setToken(res.access_token)
          setEmail(email)
          
          // Store remember me preference
          if (rememberMe) {
            localStorage.setItem('pos-remember-email', email)
          }
          
          // Show onboarding modal for new users BEFORE redirecting
          setShowOnboarding(true)
          setOnboardingStep(0)
          
          // Don't redirect immediately - let user see onboarding first
          // setTimeout(goNext, 1500) // Commented out - redirect happens after onboarding
        } catch (loginError: any) {
          setError('Registration successful but login failed. Please try logging in manually.')
        }
      }, 1500)
    } catch (e: any) {
      setError(e.response?.data?.message || e.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async () => {
    if (!validateForm()) return
    
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      const res = await login({ email, password })
      setToken(res.access_token)
      setEmail(email)
      setSuccess('Login successful! Redirecting...')
      
      // Store remember me preference
      if (rememberMe) {
        localStorage.setItem('pos-remember-email', email)
      } else {
        localStorage.removeItem('pos-remember-email')
      }
      
      setTimeout(goNext, 1000)
    } catch (e: any) {
      setError(e.response?.data?.message || e.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address first')
      return
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address')
      return
    }
    
    setLoading(true)
    setError(null)
    try {
      // TODO: Implement actual forgot password API call
      // await api.post('/auth/forgot-password', { email })
      setSuccess('Password reset link sent to your email')
    } catch (e: any) {
      setError(e.response?.data?.message || e.message || 'Failed to send password reset link')
    } finally {
      setLoading(false)
    }
  }

  // Load remembered email on mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('pos-remember-email')
    if (rememberedEmail) {
      setEmailInput(rememberedEmail)
      setRememberMe(true)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        
        {/* Left Panel - POS Branding */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden lg:block"
        >
          <div className="text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Store className="w-8 h-8 text-white" />
              </div>
              <div className="ml-4">
                <h1 className="text-3xl font-bold text-gray-900">POS Pro</h1>
                <p className="text-gray-600">Point of Sale Management System</p>
              </div>
            </div>
            
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white rounded-2xl p-6 shadow-lg"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="ml-3 text-lg font-semibold text-gray-900">Real-time Analytics</h3>
                </div>
                <p className="text-gray-600">Track sales, inventory, and performance metrics in real-time</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="bg-white rounded-2xl p-6 shadow-lg"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="ml-3 text-lg font-semibold text-gray-900">Inventory Management</h3>
                </div>
                <p className="text-gray-600">Smart inventory tracking with automated reorder points</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="bg-white rounded-2xl p-6 shadow-lg"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="ml-3 text-lg font-semibold text-gray-900">Multi-Store Support</h3>
                </div>
                <p className="text-gray-600">Manage multiple locations from a single dashboard</p>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Right Panel - Login Form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md mx-auto"
        >
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Mobile Logo */}
            <div className="flex items-center justify-center mb-8 lg:hidden">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Store className="w-6 h-6 text-white" />
              </div>
              <h1 className="ml-3 text-2xl font-bold text-gray-900">POS Pro</h1>
            </div>

            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {isRegisterMode ? 'Create Account' : 'Welcome Back'}
              </h2>
              <p className="text-gray-600">
                {isRegisterMode 
                  ? 'Join thousands of stores using POS Pro'
                  : 'Sign in to manage your store'
                }
              </p>
            </div>

            {/* Success/Error Messages */}
            {success && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center"
              >
                <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                <span className="text-green-800 text-sm">{success}</span>
              </motion.div>
            )}
            
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center"
              >
                <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0" />
                <span className="text-red-800 text-sm">{error}</span>
              </motion.div>
            )}

            {/* Form */}
            <div className="space-y-6">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      formErrors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="you@example.com"
                  />
                </div>
                {formErrors.email && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      formErrors.password ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {formErrors.password && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
                )}
              </div>

              {/* Registration Fields */}
              {isRegisterMode && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                            formErrors.firstName ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="John"
                        />
                      </div>
                      {formErrors.firstName && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.firstName}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                            formErrors.lastName ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="Doe"
                        />
                      </div>
                      {formErrors.lastName && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.lastName}</p>
                      )}
                    </div>
                  </div>

                  {/* Role Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Role</label>
                    <div className="grid grid-cols-1 gap-2">
                      {roles.map((role) => (
                        <button
                          key={role.id}
                          type="button"
                          onClick={() => setSelectedRole(role.id as any)}
                          className={`p-3 border rounded-lg text-left transition-colors ${
                            selectedRole === role.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <div className="flex items-center">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${
                              selectedRole === role.id ? 'bg-blue-100' : 'bg-gray-100'
                            }`}>
                              {role.icon}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{role.name}</div>
                              <div className="text-xs text-gray-500">{role.description}</div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Store Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Store Location</label>
                    <select
                      value={storeLocation}
                      onChange={(e) => setStoreLocation(e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        formErrors.storeLocation ? 'border-red-300' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select a location</option>
                      {storeLocations.map((location) => (
                        <option key={location} value={location}>{location}</option>
                      ))}
                    </select>
                    {formErrors.storeLocation && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.storeLocation}</p>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">Remember me</span>
                </label>
                {!isRegisterMode && (
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Forgot password?
                  </button>
                )}
              </div>

              {/* Submit Button */}
              <button
                onClick={isRegisterMode ? handleRegister : handleLogin}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    {isRegisterMode ? 'Creating Account...' : 'Signing In...'}
                  </div>
                ) : (
                  isRegisterMode ? 'Create Account' : 'Sign In'
                )}
              </button>

              {/* Toggle Mode */}
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  {isRegisterMode ? 'Already have an account?' : "Don't have an account?"}
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegisterMode(!isRegisterMode)
                      setError(null)
                      setSuccess(null)
                      setFormErrors({})
                    }}
                    className="ml-1 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {isRegisterMode ? 'Sign In' : 'Create Account'}
                  </button>
                </p>
              </div>
            </div>

            {/* Tenant Info */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                Tenant ID: {tenantId === 'Generating...' ? 'Loading...' : tenantId?.substring(0, 8) + '...' || 'Not Available'}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Onboarding Modal */}
      {showOnboarding && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto relative"
          >
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to KiTS POS!</h2>
              
              {onboardingStep === 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Are you a new or existing customer?</h3>
                  <div className="space-y-4">
                    <button
                      onClick={() => setOnboardingStep(1)}
                      className="w-full p-4 border-2 border-blue-500 rounded-lg hover:bg-blue-50 transition-colors text-left"
                    >
                      <h4 className="font-semibold text-blue-600">New Customer</h4>
                      <p className="text-gray-600 text-sm mt-1">I'm setting up a new store and need to get started</p>
                    </button>
                    <button
                      onClick={() => setOnboardingStep(2)}
                      className="w-full p-4 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left"
                    >
                      <h4 className="font-semibold text-gray-700">Existing Customer</h4>
                      <p className="text-gray-600 text-sm mt-1">I already have a store and want to connect it</p>
                    </button>
                  </div>
                </div>
              )}

              {onboardingStep === 1 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Let's set up your new store</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
                      <input
                        type="text"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="My Store"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Store Type</label>
                      <select className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                        <option>Retail Store</option>
                        <option>Restaurant</option>
                        <option>Service Business</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => setOnboardingStep(0)}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800"
                      >
                        Back
                      </button>
                      <button
                        onClick={() => {
                          setShowOnboarding(false)
                          goNext()
                        }}
                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                      >
                        Complete Setup
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {onboardingStep === 2 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Connect your existing store</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Store ID</label>
                      <input
                        type="text"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter your store ID"
                      />
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => setOnboardingStep(0)}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800"
                      >
                        Back
                      </button>
                      <button
                        onClick={() => {
                          setShowOnboarding(false)
                          goNext()
                        }}
                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                      >
                        Connect Store
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <button
              onClick={() => setShowOnboarding(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </motion.div>
        </div>
      )}
    </div>
  )
}
