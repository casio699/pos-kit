import React from 'react'

export default function TestApp() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '16px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        maxWidth: '400px'
      }}>
        <h1 style={{
          color: '#1f2937',
          marginBottom: '16px',
          fontSize: '24px'
        }}>React is Working!</h1>
        <p style={{
          color: '#6b7280',
          marginBottom: '24px'
        }}>
          Your React application is successfully rendering components.
        </p>
        <button style={{
          background: '#3b82f6',
          color: 'white',
          border: 'none',
          padding: '12px 24px',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '16px'
        }} onClick={() => alert('React click handler working!')}>
          Click Me!
        </button>
      </div>
    </div>
  )
}
