import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import AnimationProvider from './context/AnimationContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AnimationProvider>
      <App />
    </AnimationProvider>
  </React.StrictMode>,
)
