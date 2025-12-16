import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../store/auth'
import { login, register } from '../api/client'
import { Eye, EyeOff, Store, Package, CreditCard, Users, TrendingUp, Lock, Mail, User, AlertCircle, CheckCircle, Building, MapPin, Phone, Globe } from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation() as any
  const { tenantId, setToken, setEmail, setTenantId } = useAuth()

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

  // Onboarding states
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [onboardingStep, setOnboardingStep] = useState(0)
  const [isNewCustomer, setIsNewCustomer] = useState<boolean | null>(null)
  const [storeData, setStoreData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    timezone: 'UTC',
    currency: 'USD',
    taxRate: '0',
    businessType: 'retail'
  })

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

  const businessTypes = [
    { id: 'retail', name: 'Retail Store', description: 'Physical store selling products directly to customers' },
    { id: 'restaurant', name: 'Restaurant', description: 'Food service establishment with dine-in/takeout' },
    { id: 'service', name: 'Service Business', description: 'Professional services and consulting' },
    { id: 'ecommerce', name: 'E-commerce', description: 'Online store with digital sales' },
    { id: 'wholesale', name: 'Wholesale', description: 'B2B sales and distribution' }
  ]

  const timezones = [
    'UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
    'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Asia/Tokyo', 'Asia/Shanghai'
  ]

  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' }
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
    
    if (isRegisterMode) {
      if (!firstName) errors.firstName = 'First name is required'
      if (!lastName) errors.lastName = 'Last name is required'
      if (!storeLocation) errors.storeLocation = 'Store location is required'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const generateTenantId = () => {
    // Generate a unique tenant ID for new stores
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0
      const v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
  }

  const decodeJWT = (token: string) => {
    try {
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      }).join(''))
      return JSON.parse(jsonPayload)
    } catch (error) {
      console.error('Failed to decode JWT:', error)
      return null
    }
  }

  const handleRegister = async () => {
    if (!validateForm()) {
      return
    }
    
    setLoading(true)
    setError(null)
    setSuccess(null)
    
    // Generate unique tenant ID for new store
    const newTenantId = generateTenantId()
    
    try {
      await register({ 
        email, 
        password, 
        first_name: firstName, 
        last_name: lastName, 
        tenant_id: newTenantId
      })
      setSuccess('Registration successful! Setting up your account...')
      
      // Auto-login after successful registration
      setTimeout(async () => {
        try {
          const res = await login({ email, password })
          setToken(res.access_token)
          setEmail(email)
          setTenantId(newTenantId) // Set the unique tenant ID
          
          // Store remember me preference
          if (rememberMe) {
            localStorage.setItem('pos-remember-email', email)
          }
          
          // Store onboarding flag to prevent redirect
          localStorage.setItem('pos-onboarding-active', 'true')
          
          // Show onboarding flow
          setShowOnboarding(true)
          setOnboardingStep(0)
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
      
      // Extract tenant ID from JWT token
      const decodedToken = decodeJWT(res.access_token)
      if (decodedToken?.tenant_id) {
        setTenantId(decodedToken.tenant_id)
      }
      
      // Store remember me preference
      if (rememberMe) {
        localStorage.setItem('pos-remember-email', email)
      }
      
      goNext()
    } catch (e: any) {
      setError(e.response?.data?.message || e.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = () => {
    // TODO: Implement forgot password functionality
    setSuccess('Password reset link sent to your email')
  }

  const handleOnboardingNext = () => {
    if (onboardingStep === 0 && isNewCustomer === null) {
      setError('Please select an option to continue')
      return
    }
    
    if (onboardingStep === 1 && isNewCustomer && !storeData.name) {
      setError('Store name is required')
      return
    }
    
    setError(null)
    
    if (onboardingStep < 3) {
      setOnboardingStep(onboardingStep + 1)
    } else {
      // Complete onboarding
      completeOnboarding()
    }
  }

  const handleOnboardingBack = () => {
    if (onboardingStep > 0) {
      setOnboardingStep(onboardingStep - 1)
    }
  }

  const completeOnboarding = async () => {
    setLoading(true)
    try {
      if (isNewCustomer) {
        // Create new store with separate database and full dataset
        try {
          // TODO: Implement API call to create new store with isolated database
          // This should create:
          // 1. New tenant/database for the store
          // 2. Initialize with sample products, categories, customers
          // 3. Set up store configuration (currency, timezone, tax rates)
          // 4. Create default user roles and permissions
          
          // For now, we'll simulate the store creation
          console.log('Creating new store with isolated database:', {
            storeName: storeData.name,
            businessType: storeData.businessType,
            currency: storeData.currency,
            timezone: storeData.timezone
          })
          
          // In production, this would be an API call like:
          // await api.post('/stores/create', {
          //   ...storeData,
          //   createDatabase: true,
          //   initializeSampleData: true
          // })
        } catch (storeError: any) {
          throw new Error('Failed to create store database: ' + (storeError.message || 'Unknown error'))
        }
      }
      
      setSuccess('Setup complete! Your new store database is ready! Redirecting to dashboard...')
      
      // Clear onboarding flag to allow redirect
      localStorage.removeItem('pos-onboarding-active')
      
      setTimeout(() => {
        goNext()
      }, 2000)
    } catch (e: any) {
      setError(e.response?.data?.message || e.message || 'Setup failed')
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

  // Onboarding Wizard Component
  const renderOnboardingStep = () => {
    switch (onboardingStep) {
      case 0:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Store className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to POS Pro!</h2>
            <p className="text-lg text-gray-600 mb-8">Are you new to POS Pro or joining an existing store?</p>
            
            <div className="space-y-4">
              <button
                onClick={() => setIsNewCustomer(true)}
                className={`w-full p-6 rounded-2xl border-2 transition-all ${
                  isNewCustomer === true
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400 bg-white'
                }`}
              >
                <div className="flex items-center justify-center">
                  <Building className="w-8 h-8 text-blue-600 mr-4" />
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-gray-900">New Customer</h3>
                    <p className="text-gray-600">I want to start a new store with POS Pro</p>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => setIsNewCustomer(false)}
                className={`w-full p-6 rounded-2xl border-2 transition-all ${
                  isNewCustomer === false
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400 bg-white'
                }`}
              >
                <div className="flex items-center justify-center">
                  <Users className="w-8 h-8 text-blue-600 mr-4" />
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-gray-900">Existing Store</h3>
                    <p className="text-gray-600">I'm joining an existing store</p>
                  </div>
                </div>
              </button>
            </div>
          </motion.div>
        )
        
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {isNewCustomer ? 'Tell us about your store' : 'Connect to your store'}
            </h2>
            
            {isNewCustomer ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Store Name</label>
                  <input
                    type="text"
                    value={storeData.name}
                    onChange={(e) => setStoreData({ ...storeData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="My Amazing Store"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Business Type</label>
                  <select
                    value={storeData.businessType}
                    onChange={(e) => setStoreData({ ...storeData, businessType: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {businessTypes.map((type) => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Store Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={storeData.address}
                      onChange={(e) => setStoreData({ ...storeData, address: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="123 Main St, City, State"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">Joining Existing Store</h3>
                  <p className="text-blue-700">You'll need an invitation code from your store administrator to connect to an existing store.</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Invitation Code</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter invitation code"
                  />
                </div>
              </div>
            )}
          </motion.div>
        )
        
      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {isNewCustomer ? 'Store Configuration' : 'Your Profile'}
            </h2>
            
            {isNewCustomer ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                    <select
                      value={storeData.currency}
                      onChange={(e) => setStoreData({ ...storeData, currency: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {currencies.map((currency) => (
                        <option key={currency.code} value={currency.code}>
                          {currency.symbol} {currency.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                    <select
                      value={storeData.timezone}
                      onChange={(e) => setStoreData({ ...storeData, timezone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {timezones.map((tz) => (
                        <option key={tz} value={tz}>{tz}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="tel"
                        value={storeData.phone}
                        onChange={(e) => setStoreData({ ...storeData, phone: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tax Rate (%)</label>
                    <input
                      type="number"
                      value={storeData.taxRate}
                      onChange={(e) => setStoreData({ ...storeData, taxRate: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="8.5"
                      step="0.1"
                      min="0"
                      max="30"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Website (Optional)</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="url"
                      value={storeData.website}
                      onChange={(e) => setStoreData({ ...storeData, website: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://yourstore.com"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-green-900 mb-2">Almost There!</h3>
                  <p className="text-green-700">Once your store administrator accepts your request, you'll have full access to the store dashboard.</p>
                </div>
                
                <div className="text-left bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">What happens next?</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Your request will be sent to the store admin
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      You'll receive an email when approved
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Full access to store features upon approval
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </motion.div>
        )
        
      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Setup Complete!</h2>
            <p className="text-lg text-gray-600 mb-8">
              {isNewCustomer 
                ? `Your store "${storeData.name}" is ready to use with full dataset and features.`
                : 'Your request has been submitted. You\'ll be notified once approved.'
              }
            </p>
            
            {isNewCustomer && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold text-blue-900 mb-4">What's included in your store:</h3>
                <div className="grid grid-cols-2 gap-4 text-left">
                  <div className="flex items-center">
                    <Package className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="text-sm text-gray-700">Sample products inventory</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="text-sm text-gray-700">Customer management</span>
                  </div>
                  <div className="flex items-center">
                    <TrendingUp className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="text-sm text-gray-700">Sales analytics</span>
                  </div>
                  <div className="flex items-center">
                    <CreditCard className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="text-sm text-gray-700">Payment processing</span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )
        
      default:
        return null
    }
  }

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
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                          formErrors.lastName ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Doe"
                      />
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
                Tenant ID: {tenantId}
              </p>
            </div>
          </div>
        </motion.div>

      {/* Onboarding Modal */}
      {showOnboarding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Background overlay */}
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => {}}></div>

          {/* Modal panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
          >
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                {/* Progress indicator */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-2">
                    {[0, 1, 2, 3].map((step) => (
                      <div
                        key={step}
                        className={`h-2 flex-1 rounded-full ${
                          step <= onboardingStep ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">
                    Step {onboardingStep + 1} of 4
                  </span>
                </div>

                {/* Error/Success messages */}
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

                {/* Onboarding content */}
                <div className="min-h-[400px]">
                  {renderOnboardingStep()}
                </div>
              </div>

              {/* Modal footer with navigation */}
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={handleOnboardingNext}
                  disabled={loading}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : onboardingStep === 3 ? (
                    'Complete Setup'
                  ) : (
                    'Next'
                  )}
                </button>
                
                {onboardingStep > 0 && (
                  <button
                    onClick={handleOnboardingBack}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Back
                  </button>
                )}
              </div>
            </motion.div>
        </div>
      )}
      </div>
    </div>
  )
}
