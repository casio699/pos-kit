import React from 'react'
import ReactDOM from 'react-dom/client'

const TestApp = () => {
  return (
    <div style={{ padding: '20px', background: 'lightblue', color: 'black' }}>
      <h1>React Test App</h1>
      <p>If you see this, React is working!</p>
      <button onClick={() => alert('Button clicked!')}>
        Click Me
      </button>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(<TestApp />)
