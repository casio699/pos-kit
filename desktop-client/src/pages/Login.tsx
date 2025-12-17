import React, { useState } from 'react'
import { Mail, Lock } from 'lucide-react'
import { useAuth } from '../store/auth'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'

console.log('Login component rendering...')

export default function Login() {
  console.log('Login component mounted')
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { login } = useAuth()
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    
    console.log('Form submitted:', { email, password: '***' })
    
    try {
      await login(email, password)
      console.log('Login successful!')
      // The AppRouter will handle redirect after successful login
    } catch (e: any) {
      console.error('Login error:', e)
      setError(e.response?.data?.message || e.message || 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }
  
  return React.createElement('div', {
    style: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #3b82f6 0%, #9333ea 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }
  }, [
    React.createElement('div', {
      key: 'login-card-wrapper',
      className: 'shadow-2xl w-full bg-white rounded-2xl',
      style: {
        padding: 'clamp(24px, 5vw, 40px)',
        maxWidth: 'clamp(384px, 90vw, 512px)'
      }
    }, [
      React.createElement('h1', {
        key: 'title',
        style: {
          fontSize: '24px',
          fontWeight: 'bold',
          marginBottom: '24px',
          textAlign: 'center',
          color: '#1f2937'
        }
      }, 'KiTS POS Login'),
      
      React.createElement('p', {
        key: 'subtitle',
        style: {
          textAlign: 'center',
          color: '#6b7280',
          marginBottom: '32px'
        }
      }, 'Professional Login Page Test'),
      
      error && React.createElement('div', {
        key: 'error',
        style: {
          padding: '12px',
          borderRadius: '8px',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#dc2626',
          marginBottom: '16px',
          fontSize: '14px'
        }
      }, error),
      
      React.createElement('form', {
        key: 'form',
        onSubmit: handleSubmit,
        style: {
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }
      }, [
        React.createElement('div', {
          key: 'email-wrapper',
          style: {
            position: 'relative',
            width: '100%'
          }
        }, [
          React.createElement(Mail, {
            key: 'email-icon',
            size: 20,
            style: {
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#9ca3af',
              zIndex: 10,
              pointerEvents: 'none'
            }
          }),
          React.createElement(Input, {
            key: 'email',
            type: 'email',
            placeholder: 'Email',
            value: email,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value),
            required: true,
            style: {
              fontSize: '16px',
              paddingLeft: '48px'
            }
          })
        ]),
        
        React.createElement('div', {
          key: 'password-wrapper',
          style: {
            position: 'relative',
            width: '100%'
          }
        }, [
          React.createElement(Lock, {
            key: 'password-icon',
            size: 20,
            style: {
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#9ca3af',
              zIndex: 10,
              pointerEvents: 'none'
            }
          }),
          React.createElement(Input, {
            key: 'password',
            type: 'password',
            placeholder: 'Password',
            value: password,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value),
            required: true,
            style: {
              fontSize: '16px',
              paddingLeft: '48px'
            }
          })
        ]),
        
        React.createElement(Button, {
          key: 'submit',
          type: 'submit',
          disabled: isLoading,
          className: 'w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700',
          style: {
            padding: '12px 16px',
            fontSize: '16px',
            fontWeight: '600'
          }
        }, isLoading ? 'Signing in...' : 'Sign In')
      ])
    ])
  ])
}
