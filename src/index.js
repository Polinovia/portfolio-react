
import { StrictMode } from 'react'
 

import { createRoot } from 'react-dom/client'

import './styles/variables.css'  // CSS color/font variables
import './styles/global.css'     // reset, body, animations
 

import App from './App'
 

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)