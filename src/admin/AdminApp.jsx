import { useEffect, useMemo, useState, useCallback } from 'react'
import GoTrue from 'gotrue-js'

// Custom minimal admin auth - deliberately NOT using netlify-identity-widget's
// iframe popup, which always shows a "Sign Up" tab (harmless since Identity is
// invite-only, but there's no way to hide it from the parent page - it's an
// iframe). This is a plain email+password form, nothing else.
const auth = new GoTrue({
  APIUrl: `${window.location.origin}/.netlify/identity`,
  setCookie: false,
})

function getHashToken() {
  const params = new URLSearchParams(window.location.hash.replace(/^#/, ''))
  return { invite: params.get('invite_token'), recovery: params.get('recovery_token') }
}

function clearHash() {
  window.history.replaceState(null, '', window.location.pathname)
}

// GoTrue errors usually arrive as a JSONHTTPError with { json: { msg } }
// rather than a plain Error.message.
function authErrorMessage(err, fallback) {
  return (err && err.json && err.json.msg) || (err && err.message) || fallback
}

export default function AdminApp() {
  const [user, setUser] = useState(() => auth.currentUser())
  const [view, setView] = useState('loading') // loading | setPassword | login | app
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)
  const [pending, setPending] = useState(null)

  const { invite, recovery } = useMemo(getHashToken, [])
  const pendingToken = invite || recovery

  useEffect(() => {
    if (pendingToken) {
      setView('setPassword')
    } else if (user) {
      setView('app')
    } else {
      setView('login')
    }
  }, [pendingToken, user])

  const handleSetPassword = async (e) => {
    e.preventDefault()
    setError(null)
    const password = e.target.password.value
    setBusy(true)
    try {
      const loggedInUser = await auth.recover(pendingToken, true)
      await loggedInUser.update({ password })
      clearHash()
      setUser(loggedInUser)
      setView('app')
    } catch (err) {
      setError(authErrorMessage(err, 'Could not set your password. The link may have expired.'))
    } finally {
      setBusy(false)
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError(null)
    const email = e.target.email.value
    const password = e.target.password.value
    setBusy(true)
    try {
      const loggedInUser = await auth.login(email, password, true)
      setUser(loggedInUser)
      setView('app')
    } catch (err) {
      setError(authErrorMessage(err, 'Login failed.'))
    } finally {
      setBusy(false)
    }
  }

  const handleLogout = async () => {
    if (user) await user.logout()
    setUser(null)
    setView('login')
  }

  const fetchPending = useCallback(() => {
    if (!user) return
    setError(null)
    user
      .jwt()
      .then((token) =>
        fetch('/.netlify/functions/ratings-admin', {
          headers: { Authorization: `Bearer ${token}` },
        })
      )
      .then((res) => {
        if (!res.ok) throw new Error('failed to load')
        return res.json()
      })
      .then((json) => setPending(json.pending))
      .catch(() => setError('Could not load pending ratings.'))
  }, [user])

  useEffect(() => {
    if (view === 'app') fetchPending()
  }, [view, fetchPending])

  const moderate = async (id, action) => {
    if (!user) return
    try {
      const token = await user.jwt()
      const res = await fetch('/.netlify/functions/ratings-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, action }),
      })
      if (!res.ok) throw new Error('failed')
      fetchPending()
    } catch {
      setError('Could not update that rating, please try again.')
    }
  }

  if (view === 'loading') {
    return <div className="admin-page" />
  }

  if (view === 'setPassword') {
    return (
      <div className="admin-page">
        <div className="admin-title">Set your admin password</div>
        <form className="rating-form" onSubmit={handleSetPassword} style={{ width: '100%', maxWidth: 320 }}>
          <input
            type="password"
            name="password"
            placeholder="New password"
            required
            minLength={8}
            className="rating-form-name"
            autoFocus
          />
          {error && <p className="rating-form-error">{error}</p>}
          <button type="submit" className="admin-login-btn" disabled={busy}>
            {busy ? 'Saving...' : 'Set password & log in'}
          </button>
        </form>
      </div>
    )
  }

  if (view === 'login') {
    return (
      <div className="admin-page">
        <div className="admin-title">Portfolio admin</div>
        <form className="rating-form" onSubmit={handleLogin} style={{ width: '100%', maxWidth: 320 }}>
          <input type="email" name="email" placeholder="Email" required className="rating-form-name" autoFocus />
          <input type="password" name="password" placeholder="Password" required className="rating-form-name" />
          {error && <p className="rating-form-error">{error}</p>}
          <button type="submit" className="admin-login-btn" disabled={busy}>
            {busy ? 'Logging in...' : 'Log in'}
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="admin-page">
      <div className="admin-title">Pending ratings & comments</div>
      <button className="admin-btn" onClick={handleLogout}>
        Log out
      </button>

      {error && <p className="admin-empty">{error}</p>}

      {pending && pending.length === 0 && (
        <p className="admin-empty">Nothing waiting for review.</p>
      )}

      {pending && pending.length > 0 && (
        <ul className="admin-pending-list">
          {pending.map((item) => (
            <li key={item.id} className="admin-pending-item">
              <div className="admin-pending-slug">
                {item.project_slug} · {item.stars} / 5
                {item.author_name ? ` · ${item.author_name}` : ''}
              </div>
              {item.comment && <p className="admin-pending-comment">{item.comment}</p>}
              <div className="admin-pending-actions">
                <button className="admin-btn admin-btn-approve" onClick={() => moderate(item.id, 'approve')}>
                  Approve
                </button>
                <button className="admin-btn admin-btn-reject" onClick={() => moderate(item.id, 'reject')}>
                  Reject
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
