import React from 'react'
import ReactDOM from 'react-dom/client'
import AppRouter from './AppRouter'
import './index.css'

console.log('Rendering KiTS POS application...')

const rootElement = document.getElementById('root')
console.log('Root element found:', rootElement)

if (rootElement) {
  console.log('Creating React root...')
  const root = ReactDOM.createRoot(rootElement)
  console.log('React root created, rendering AppRouter...')
  root.render(<AppRouter />)
  console.log('AppRouter rendered successfully!')
} else {
  console.error('Root element not found!')
}
