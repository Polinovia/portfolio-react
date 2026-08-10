
import { StrictMode, Suspense, lazy } from 'react'


import { createRoot } from 'react-dom/client'

import './styles/variables.css'  // CSS color/font variables
import './styles/global.css'     // reset, body, animations


import App from './App'

// Netlify Identity invite/confirmation/recovery links always redirect to the
// site's root with a #..._token= hash, regardless of where the flow started.
// Bounce those over to /admin (preserving the hash) so the widget - which
// only loads there - actually gets a chance to process the token.
const IDENTITY_HASH_RE = /(confirmation_token|invite_token|recovery_token|email_change_token)=/
if (IDENTITY_HASH_RE.test(window.location.hash) && !window.location.pathname.startsWith('/admin')) {
  window.location.replace('/admin' + window.location.hash)
}

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