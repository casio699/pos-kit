import React from 'react'
import { Button } from './ui/button'
import { 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Package,
  ArrowUpRight,
  ArrowDownRight,
  Activity
} from 'lucide-react'
import { formatCurrency } from '../lib/utils'

console.log('Dashboard component rendering...')

export default function Dashboard() {
  console.log('Dashboard component mounted')
  
  const stats = [
    {
      title: "Total Revenue",
      value: formatCurrency(124563.89),
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
      description: "vs last month"
    },
    {
      title: "Total Orders", 
      value: "1,234",
      change: "+8.2%",
      trend: "up", 
      icon: ShoppingCart,
      description: "vs last month"
    },
    {
      title: "Active Customers",
      value: "892",
      change: "+3.1%",
      trend: "up",
      icon: Users,
      description: "vs last month"
    },
    {
      title: "Products Sold",
      value: "5,678",
      change: "-2.4%",
      trend: "down",
      icon: Package,
      description: "vs last month"
    }
  ]

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
        maxWidth: '1280px',
        margin: '0 auto'
      }
    }, [
      // Header
      React.createElement('div', {
        key: 'header',
        style: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px'
        }
      }, [
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
          }, 'Dashboard'),
          React.createElement('p', {
            key: 'subtitle',
            style: {
              fontSize: '14px',
              color: '#6b7280',
              margin: '4px 0 0 0'
            }
          }, 'Welcome back! Here\'s what\'s happening with your store today.')
        ]),
        React.createElement('div', {
          key: 'header-actions',
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }
        }, [
          React.createElement('div', {
            key: 'live-badge',
            style: {
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              borderRadius: '4px',
              background: '#f3f4f6',
              fontSize: '12px'
            }
          }, [
            React.createElement(Activity, {
              key: 'activity-icon',
              style: {
                width: '12px',
                height: '12px'
              }
            }),
            'Live'
          ]),
          React.createElement(Button, {
            key: 'export-btn',
            style: {
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }
          }, [
            React.createElement(ArrowUpRight, {
              key: 'arrow-icon',
              style: {
                width: '16px',
                height: '16px'
              }
            }),
            'Export Report'
          ])
        ])
      ]),

      // Stats Grid
      React.createElement('div', {
        key: 'stats-grid',
        style: {
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '24px'
        }
      }, stats.map((stat, index) => {
        const Icon = stat.icon
        return React.createElement('div', {
          key: index,
          style: {
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }
        }, [
          React.createElement('div', {
            key: `stat-header-${index}`,
            style: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '8px'
            }
          }, [
            React.createElement('h3', {
              key: `stat-title-${index}`,
              style: {
                fontSize: '14px',
                fontWeight: '500',
                color: '#6b7280',
                margin: 0
              }
            }, stat.title),
            React.createElement(Icon, {
              key: `stat-icon-${index}`,
              style: {
                width: '16px',
                height: '16px',
                color: '#6b7280'
              }
            })
          ]),
          React.createElement('div', {
            key: `stat-value-${index}`,
            style: {
              fontSize: '24px',
              fontWeight: 'bold',
              marginBottom: '8px'
            }
          }, stat.value),
          React.createElement('div', {
            key: `stat-change-${index}`,
            style: {
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '12px',
              color: '#6b7280'
            }
          }, [
            stat.trend === "up" ? React.createElement(ArrowUpRight, {
              key: `trend-icon-${index}`,
              style: {
                width: '12px',
                height: '12px',
                color: '#10b981'
              }
            }) : React.createElement(ArrowDownRight, {
              key: `trend-icon-${index}`,
              style: {
                width: '12px',
                height: '12px',
                color: '#ef4444'
              }
            }),
            React.createElement('span', {
              key: `change-text-${index}`,
              style: {
                color: stat.trend === "up" ? '#10b981' : '#ef4444'
              }
            }, stat.change),
            React.createElement('span', {
              key: `description-${index}`
            }, stat.description)
          ])
        ])
      }))
    ])
  ])
}
