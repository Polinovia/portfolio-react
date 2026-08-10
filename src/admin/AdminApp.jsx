import { useCallback, useEffect, useState } from 'react'
import netlifyIdentity from 'netlify-identity-widget'

export default function AdminApp() {
  const [user, setUser] = useState(null)
  const [pending, setPending] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    netlifyIdentity.init()
    setUser(netlifyIdentity.currentUser())

    const onLogin = (u) => {
      setUser(u)
      netlifyIdentity.close()
    }
    const onLogout = () => setUser(null)

    netlifyIdentity.on('login', onLogin)
    netlifyIdentity.on('logout', onLogout)
    return () => {
      netlifyIdentity.off('login', onLogin)
      netlifyIdentity.off('logout', onLogout)
    }
  }, [])

  const fetchPending = useCallback(() => {
    if (!user) return
    setError(null)
    fetch('/.netlify/functions/ratings-admin', {
      headers: { Authorization: `Bearer ${user.token.access_token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('failed to load')
        return res.json()
      })
      .then((json) => setPending(json.pending))
      .catch(() => setError('Could not load pending ratings.'))
  }, [user])

  useEffect(() => {
    fetchPending()
  }, [fetchPending])

  const moderate = async (id, action) => {
    if (!user) return
    try {
      const res = await fetch('/.netlify/functions/ratings-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token.access_token}`,
        },
        body: JSON.stringify({ id, action }),
      })
      if (!res.ok) throw new Error('failed')
      fetchPending()
    } catch {
      setError('Could not update that rating, please try again.')
    }
  }

  if (!user) {
    return (
      <div className="admin-page">
        <div className="admin-title">Portfolio admin</div>
        <button className="admin-login-btn" onClick={() => netlifyIdentity.open('login')}>
          Log in
        </button>
      </div>
    )
  }

  return (
    <div className="admin-page">
      <div className="admin-title">Pending ratings & comments</div>
      <button className="admin-btn" onClick={() => netlifyIdentity.logout()}>
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
