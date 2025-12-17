import React from 'react'
import ReactDOM from 'react-dom/client'

console.log('Starting simple React app...')

const SimpleApp = () => {
  console.log('Rendering SimpleApp')
  return React.createElement('div', {
    style: { 
      padding: '50px', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      fontFamily: 'Arial, sans-serif',
      textAlign: 'center'
    }
  }, [
    React.createElement('h1', { key: 'title' }, 'KiTS POS System'),
    React.createElement('p', { key: 'subtitle' }, 'Professional Point of Sale'),
    React.createElement('button', { 
      key: 'btn',
      onClick: () => alert('React is working!'),
      style: {
        padding: '10px 20px',
        background: 'white',
        color: '#667eea',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '16px'
      }
    }, 'Test React')
  ])
}

const rootElement = document.getElementById('root')
console.log('Root element:', rootElement)

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement)
  console.log('Created root, rendering...')
  root.render(React.createElement(SimpleApp))
} else {
  console.error('Root element not found!')
}
