import React, { useState } from 'react'
import { Settings, Save, LogOut, Store, MapPin, DollarSign, Percent } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Separator } from '../components/ui/separator'
import { Badge } from '../components/ui/badge'

console.log('Settings page rendering...')

export default function SettingsPage() {
  console.log('Settings page mounted')
  
  const [settings, setSettings] = useState({
    storeName: 'Main Store',
    location: 'New York',
    currency: 'USD',
    taxRate: '10',
  })

  const handleChange = (field: string, value: string) => {
    setSettings({ ...settings, [field]: value })
  }

  return React.createElement('div', {
    style: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #dbeafe 100%)',
      padding: '24px'
    }
  }, [
    React.createElement('div', {
      key: 'container',
      style: {
        maxWidth: '1024px',
        margin: '0 auto'
      }
    }, [
      // Header
      React.createElement('div', {
        key: 'header',
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '24px'
        }
      }, [
        React.createElement('div', {
          key: 'icon-wrapper',
          style: {
            padding: '12px',
            background: 'linear-gradient(135deg, #2563eb 0%, #9333ea 100%)',
            borderRadius: '16px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
          }
        }, [
          React.createElement(Settings, {
            key: 'settings-icon',
            style: {
              width: '24px',
              height: '24px',
              color: 'white'
            }
          })
        ]),
        React.createElement('div', {
          key: 'header-text'
        }, [
          React.createElement('h1', {
            key: 'title',
            style: {
              fontSize: '30px',
              fontWeight: 'bold',
              margin: 0
            }
          }, 'Settings'),
          React.createElement('p', {
            key: 'subtitle',
            style: {
              fontSize: '14px',
              color: '#6b7280',
              margin: '4px 0 0 0'
            }
          }, 'Manage your store configuration and preferences')
        ])
      ]),

      // Store Settings Card
      React.createElement('div', {
        key: 'store-card',
        style: {
          background: 'white',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
        }
      }, [
        React.createElement('h2', {
          key: 'store-title',
          style: {
            fontSize: '20px',
            fontWeight: 'bold',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }
        }, [
          React.createElement(Store, {
            key: 'store-icon',
            style: {
              width: '20px',
              height: '20px'
            }
          }),
          'Store Information'
        ]),
        React.createElement('p', {
          key: 'store-description',
          style: {
            fontSize: '14px',
            color: '#6b7280',
            marginBottom: '24px'
          }
        }, 'Configure your basic store details and location'),
        
        React.createElement('div', {
          key: 'store-grid',
          style: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '24px'
          }
        }, [
          React.createElement('div', {
            key: 'store-name-field'
          }, [
            React.createElement('label', {
              key: 'store-name-label',
              style: {
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '8px'
              }
            }, 'Store Name'),
            React.createElement(Input, {
              key: 'store-name-input',
              value: settings.storeName,
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleChange('storeName', e.target.value),
              placeholder: 'Enter store name',
              style: {
                width: '100%'
              }
            })
          ]),
          React.createElement('div', {
            key: 'location-field'
          }, [
            React.createElement('label', {
              key: 'location-label',
              style: {
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '8px'
              }
            }, 'Location'),
            React.createElement(Input, {
              key: 'location-input',
              value: settings.location,
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleChange('location', e.target.value),
              placeholder: 'Enter location',
              style: {
                width: '100%'
              }
            })
          ])
        ])
      ]),

      // Financial Settings Card
      React.createElement('div', {
        key: 'financial-card',
        style: {
          background: 'white',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
        }
      }, [
        React.createElement('h2', {
          key: 'financial-title',
          style: {
            fontSize: '20px',
            fontWeight: 'bold',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }
        }, [
          React.createElement(DollarSign, {
            key: 'financial-icon',
            style: {
              width: '20px',
              height: '20px'
            }
          }),
          'Financial Settings'
        ]),
        React.createElement('p', {
          key: 'financial-description',
          style: {
            fontSize: '14px',
            color: '#6b7280',
            marginBottom: '24px'
          }
        }, 'Configure currency and tax settings for your store'),
        
        React.createElement('div', {
          key: 'financial-grid',
          style: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '24px'
          }
        }, [
          React.createElement('div', {
            key: 'currency-field'
          }, [
            React.createElement('label', {
              key: 'currency-label',
              style: {
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '8px'
              }
            }, 'Currency'),
            React.createElement(Input, {
              key: 'currency-input',
              value: settings.currency,
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleChange('currency', e.target.value),
              style: {
                width: '100%'
              }
            }),
            React.createElement('div', {
              key: 'currency-badges',
              style: {
                display: 'flex',
                gap: '8px',
                marginTop: '8px'
              }
            }, ['USD', 'EUR', 'GBP', 'CAD'].map((currency) => 
              React.createElement('button', {
                key: currency,
                onClick: () => handleChange('currency', currency),
                style: {
                  padding: '4px 8px',
                  borderRadius: '4px',
                  border: settings.currency === currency ? '1px solid #2563eb' : '1px solid #e5e7eb',
                  background: settings.currency === currency ? '#2563eb' : 'white',
                  color: settings.currency === currency ? 'white' : '#374151',
                  fontSize: '12px',
                  cursor: 'pointer'
                }
              }, currency)
            ))
          ]),
          React.createElement('div', {
            key: 'tax-field'
          }, [
            React.createElement('label', {
              key: 'tax-label',
              style: {
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '8px'
              }
            }, 'Tax Rate (%)'),
            React.createElement(Input, {
              key: 'tax-input',
              type: 'number',
              value: settings.taxRate,
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleChange('taxRate', e.target.value),
              placeholder: 'Enter tax rate',
              style: {
                width: '100%'
              }
            }),
            React.createElement('p', {
              key: 'tax-description',
              style: {
                fontSize: '12px',
                color: '#6b7280',
                marginTop: '4px'
              }
            }, 'Applied to all sales transactions')
          ])
        ])
      ]),

      // Action Buttons
      React.createElement('div', {
        key: 'action-buttons',
        style: {
          display: 'flex',
          gap: '16px'
        }
      }, [
        React.createElement(Button, {
          key: 'save-btn',
          style: {
            flex: 1,
            background: 'linear-gradient(135deg, #2563eb 0%, #9333ea 100%)',
            border: 'none',
            color: 'white',
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600'
          }
        }, [
          React.createElement(Save, {
            key: 'save-icon',
            style: {
              width: '20px',
              height: '20px',
              marginRight: '8px'
            }
          }),
          'Save Settings'
        ]),
        React.createElement(Button, {
          key: 'logout-btn',
          variant: 'outline',
          style: {
            flex: 1,
            borderColor: '#ef4444',
            color: '#ef4444',
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600'
          }
        }, [
          React.createElement(LogOut, {
            key: 'logout-icon',
            style: {
              width: '20px',
              height: '20px',
              marginRight: '8px'
            }
          }),
          'Logout'
        ])
      ])
    ])
  ])
}
