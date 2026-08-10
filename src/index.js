
import { StrictMode, Suspense, lazy } from 'react'


import { createRoot } from 'react-dom/client'

import './styles/variables.css'  // CSS color/font variables
import './styles/global.css'     // reset, body, animations


import App from './App'

const isAdmin = window.location.pathname.startsWith('/admin')
// Only the /admin route needs netlify-identity-widget, so load it lazily -
// regular visitors shouldn't pay for that bundle weight.
const AdminApp = lazy(() => import('./admin/AdminApp'))

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isAdmin ? (
      <Suspense fallback={null}>
        <AdminApp />
      </Suspense>
    ) : (
      <App />
    )}
  </StrictMode>
)