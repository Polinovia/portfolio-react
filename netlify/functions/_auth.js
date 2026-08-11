// Dev-only escape hatch for the admin panel. Netlify Identity is a hosted
// service, so there is no way to log into /admin locally without linking
// this project to a real Netlify site. This lets the local dev login (see
// DEV_ADMIN_EMAIL/PASSWORD in src/admin/AdminApp.jsx) stand in for it.
//
// Both isProduction and isLocal must agree before the bypass is allowed, so
// a missing/misconfigured NODE_ENV on a real deploy can't open this on its
// own - the deployed DATABASE_URL is never localhost, so isLocal is always
// false there regardless of NODE_ENV.
const { isLocal, isProduction } = require('./_db')

const DEV_BYPASS_ENABLED = !isProduction && isLocal
const DEV_TOKEN = 'dev-local-admin'
const DEV_ADMIN_EMAIL = 'dev@mail.com'
const DEV_ADMIN_PASSWORD = 'password123'

function getAuthenticatedUser(event, context) {
  const identityUser = context.clientContext && context.clientContext.user
  if (identityUser) return identityUser

  if (DEV_BYPASS_ENABLED) {
    const header = (event.headers && (event.headers.authorization || event.headers.Authorization)) || ''
    if (header === `Bearer ${DEV_TOKEN}`) {
      return { email: DEV_ADMIN_EMAIL }
    }
  }

  return null
}

module.exports = { getAuthenticatedUser, DEV_TOKEN, DEV_ADMIN_EMAIL, DEV_ADMIN_PASSWORD }
