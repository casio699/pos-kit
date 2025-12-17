import React from 'react'
import ReactDOM from 'react-dom/client'

console.log('Test app starting...')

const TestApp = () => {
  console.log('Rendering TestApp component')
  return React.createElement('div', {
    style: { 
      padding: '50px', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      fontFamily: 'Arial, sans-serif',
      textAlign: 'center',
      minHeight: '100vh'
    }
  }, [
    React.createElement('h1', { key: 'title' }, 'KiTS POS System - Test Mode'),
    React.createElement('p', { key: 'subtitle' }, 'React is working!'),
    React.createElement('button', { 
      key: 'btn',
      onClick: () => {
        console.log('Button clicked!')
        alert('React is working perfectly!')
      },
      style: {
        padding: '15px 30px',
        background: 'white',
        color: '#667eea',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '18px',
        fontWeight: 'bold',
        marginTop: '20px'
      }
    }, 'Test React Button')
  ])
}

console.log('Creating root element...')
const rootElement = document.getElementById('root')
console.log('Root element found:', rootElement)

if (rootElement) {
  console.log('Creating React root...')
  const root = ReactDOM.createRoot(rootElement)
  console.log('React root created, rendering...')
  root.render(React.createElement(TestApp))
  console.log('Test app rendered successfully!')
} else {
  console.error('Root element not found!')
}
