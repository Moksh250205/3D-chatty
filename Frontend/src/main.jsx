import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import AnimationProvider from './context/AnimationContext'
import './index.css'
import UserContext from './context/UserContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AnimationProvider>
      <UserContext >
        <App />
      </UserContext>
    </AnimationProvider>
  </React.StrictMode>,
)
