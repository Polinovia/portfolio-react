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

// Dev-only escape hatch, mirrored in netlify/functions/_auth.js (keep the
// email/password/token in sync with that file). process.env.NODE_ENV is
// baked in at build time by react-scripts, so this branch is compiled out
// of `pnpm run build` entirely - it only exists in the dev bundle. The
// functions still re-check independently before honoring the token.
const DEV_BYPASS_ENABLED = process.env.NODE_ENV !== 'production'
const DEV_ADMIN_EMAIL = 'dev@mail.com'
const DEV_ADMIN_PASSWORD = 'password123'
const DEV_TOKEN = 'dev-local-admin'

function makeDevUser(email) {
  return { email, jwt: () => Promise.resolve(DEV_TOKEN), logout: () => Promise.resolve() }
}

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

const EMPTY_PROJECT_FORM = {
  slug: '',
  name: '',
  tech: '',
  description: '',
  category: 'dev',
  folder: '',
  url: '',
  previewUrl: '',
  figmaUrl: '',
  image: '',
}

export default function AdminApp() {
  const [user, setUser] = useState(() => auth.currentUser())
  const [view, setView] = useState('loading') // loading | setPassword | login | app
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)
  const [pending, setPending] = useState(null)
  const [pendingRecommendations, setPendingRecommendations] = useState(null)
  const [projects, setProjects] = useState(null)
  const [projectsError, setProjectsError] = useState(null)
  const [projectFormMode, setProjectFormMode] = useState(null) // null | 'create' | 'edit'
  const [projectForm, setProjectForm] = useState(EMPTY_PROJECT_FORM)
  const [projectFormError, setProjectFormError] = useState(null)
  const [savingProject, setSavingProject] = useState(false)
  const [adminTab, setAdminTab] = useState('projects') // projects | reviews

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
      if (DEV_BYPASS_ENABLED && email === DEV_ADMIN_EMAIL && password === DEV_ADMIN_PASSWORD) {
        setUser(makeDevUser(email))
        setView('app')
        return
      }
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

  const fetchPending = useCallback(async () => {
    if (!user) return
    setError(null)
    try {
      const token = await user.jwt()
      const [ratingsRes, recommendationsRes] = await Promise.all([
        fetch('/.netlify/functions/ratings-admin', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/.netlify/functions/recommendations-admin', { headers: { Authorization: `Bearer ${token}` } }),
      ])
      if (!ratingsRes.ok || !recommendationsRes.ok) throw new Error('failed to load')
      const [ratingsJson, recommendationsJson] = await Promise.all([ratingsRes.json(), recommendationsRes.json()])
      setPending(ratingsJson.pending)
      setPendingRecommendations(recommendationsJson.pending)
    } catch {
      setError('Could not load pending items.')
    }
  }, [user])

  const fetchProjects = useCallback(async () => {
    if (!user) return
    setProjectsError(null)
    try {
      const token = await user.jwt()
      const res = await fetch('/.netlify/functions/projects-admin', { headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error('failed to load')
      const json = await res.json()
      setProjects(json.projects)
    } catch {
      setProjectsError('Could not load projects.')
    }
  }, [user])

  useEffect(() => {
    if (view === 'app') {
      fetchPending()
      fetchProjects()
    }
  }, [view, fetchPending, fetchProjects])

  const startCreateProject = () => {
    setProjectForm(EMPTY_PROJECT_FORM)
    setProjectFormError(null)
    setProjectFormMode('create')
  }

  const startEditProject = (project) => {
    setProjectForm({
      slug: project.slug,
      name: project.name,
      tech: project.tech,
      description: project.description,
      category: project.category,
      folder: project.folder,
      url: project.url,
      previewUrl: project.previewUrl || '',
      figmaUrl: project.figmaUrl || '',
      image: project.image || '',
    })
    setProjectFormError(null)
    setProjectFormMode('edit')
  }

  const cancelProjectForm = () => {
    setProjectFormMode(null)
    setProjectFormError(null)
  }

  const handleProjectFormChange = (e) => {
    const { name, value } = e.target
    setProjectForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleProjectFormSubmit = async (e) => {
    e.preventDefault()
    if (!user) return
    setProjectFormError(null)
    setSavingProject(true)
    try {
      const token = await user.jwt()
      const res = await fetch('/.netlify/functions/projects-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          action: projectFormMode === 'edit' ? 'update' : 'create',
          ...projectForm,
        }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error || 'Could not save project')
      setProjectFormMode(null)
      fetchProjects()
    } catch (err) {
      setProjectFormError(err.message || 'Could not save project')
    } finally {
      setSavingProject(false)
    }
  }

  const handleDeleteProject = async (slug) => {
    if (!user) return
    if (!window.confirm(`Delete project "${slug}"? This cannot be undone.`)) return
    try {
      const token = await user.jwt()
      const res = await fetch('/.netlify/functions/projects-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action: 'delete', slug }),
      })
      if (!res.ok) throw new Error('failed')
      fetchProjects()
    } catch {
      setProjectsError('Could not delete that project.')
    }
  }

  const handleMoveProject = async (slug, direction) => {
    if (!user) return
    try {
      const token = await user.jwt()
      const res = await fetch('/.netlify/functions/projects-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action: 'move', slug, direction }),
      })
      if (!res.ok) throw new Error('failed')
      fetchProjects()
    } catch {
      setProjectsError('Could not reorder that project.')
    }
  }

  const moderate = async (endpoint, id, action) => {
    if (!user) return
    try {
      const token = await user.jwt()
      const res = await fetch(`/.netlify/functions/${endpoint}`, {
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
      setError('Could not update that item, please try again.')
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
      <button className="admin-btn" onClick={handleLogout}>
        Log out
      </button>

      {error && <p className="admin-empty">{error}</p>}

      <div className="admin-tabs">
        <button
          className={`admin-tab-btn${adminTab === 'projects' ? ' active' : ''}`}
          onClick={() => setAdminTab('projects')}
        >
          Projects
        </button>
        <button
          className={`admin-tab-btn${adminTab === 'reviews' ? ' active' : ''}`}
          onClick={() => setAdminTab('reviews')}
        >
          Ratings & recommendations
        </button>
      </div>

      {adminTab === 'projects' && (
        <>
          {projectsError && <p className="admin-empty">{projectsError}</p>}

          <button className="admin-btn admin-btn-approve" onClick={startCreateProject}>
            + New project
          </button>

          {projects && projects.length === 0 && <p className="admin-empty">No projects yet.</p>}

          {projects && projects.length > 0 && (
            <ul className="admin-projects-list">
              {projects.map((project, index) => (
                <li key={project.slug} className="admin-project-row">
                  <div className="admin-project-order-btns">
                    <button
                      className="admin-btn admin-order-btn"
                      onClick={() => handleMoveProject(project.slug, 'up')}
                      disabled={index === 0}
                      aria-label="Move up"
                    >
                      ↑
                    </button>
                    <button
                      className="admin-btn admin-order-btn"
                      onClick={() => handleMoveProject(project.slug, 'down')}
                      disabled={index === projects.length - 1}
                      aria-label="Move down"
                    >
                      ↓
                    </button>
                  </div>
                  <div className="admin-project-info">
                    <div className="admin-project-name">{project.name}</div>
                    <div className="admin-project-meta">
                      {project.slug} · {project.category}
                    </div>
                  </div>
                  <div className="admin-project-actions">
                    <button className="admin-btn" onClick={() => startEditProject(project)}>
                      Edit
                    </button>
                    <button className="admin-btn admin-btn-reject" onClick={() => handleDeleteProject(project.slug)}>
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {adminTab === 'reviews' && (
        <>
          <div className="admin-title">Pending ratings & comments</div>

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
                    <button className="admin-btn admin-btn-approve" onClick={() => moderate('ratings-admin', item.id, 'approve')}>
                      Approve
                    </button>
                    <button className="admin-btn admin-btn-reject" onClick={() => moderate('ratings-admin', item.id, 'reject')}>
                      Reject
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="admin-title">Pending recommendations</div>

          {pendingRecommendations && pendingRecommendations.length === 0 && (
            <p className="admin-empty">Nothing waiting for review.</p>
          )}

          {pendingRecommendations && pendingRecommendations.length > 0 && (
            <ul className="admin-pending-list">
              {pendingRecommendations.map((item) => (
                <li key={item.id} className="admin-pending-item">
                  <div className="admin-pending-slug">
                    {item.author_name}
                    {item.relationship ? ` · ${item.relationship}` : ''}
                  </div>
                  {item.comment && <p className="admin-pending-comment">{item.comment}</p>}
                  <div className="admin-pending-actions">
                    <button className="admin-btn admin-btn-approve" onClick={() => moderate('recommendations-admin', item.id, 'approve')}>
                      Approve
                    </button>
                    <button className="admin-btn admin-btn-reject" onClick={() => moderate('recommendations-admin', item.id, 'reject')}>
                      Reject
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {projectFormMode && (
        <div className="admin-modal-overlay" onClick={cancelProjectForm}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="admin-modal-close" onClick={cancelProjectForm} aria-label="Close">
              ×
            </button>
            <div className="admin-modal-body">
              <div className="admin-modal-title">{projectFormMode === 'edit' ? 'Edit project' : 'New project'}</div>
              <form className="admin-project-form" onSubmit={handleProjectFormSubmit}>
                <div className="admin-project-form-grid">
                  <input
                    name="slug"
                    placeholder="slug (e.g. my-project)"
                    value={projectForm.slug}
                    onChange={handleProjectFormChange}
                    className="rating-form-name"
                    required
                    disabled={projectFormMode === 'edit'}
                  />
                  <input
                    name="name"
                    placeholder="Name"
                    value={projectForm.name}
                    onChange={handleProjectFormChange}
                    className="rating-form-name"
                    required
                  />
                  <input
                    name="tech"
                    placeholder="Tech (e.g. React · API · UI)"
                    value={projectForm.tech}
                    onChange={handleProjectFormChange}
                    className="rating-form-name"
                    required
                  />
                  <select name="category" value={projectForm.category} onChange={handleProjectFormChange} className="admin-select">
                    <option value="dev">dev</option>
                    <option value="design">design</option>
                  </select>
                  <input
                    name="folder"
                    placeholder="Folder (e.g. React)"
                    value={projectForm.folder}
                    onChange={handleProjectFormChange}
                    className="rating-form-name"
                    required
                  />
                  <input
                    name="url"
                    placeholder="URL (repo/live link)"
                    value={projectForm.url}
                    onChange={handleProjectFormChange}
                    className="rating-form-name"
                    required
                  />
                  <input
                    name="previewUrl"
                    placeholder="Preview URL (optional)"
                    value={projectForm.previewUrl}
                    onChange={handleProjectFormChange}
                    className="rating-form-name"
                  />
                  <input
                    name="figmaUrl"
                    placeholder="Figma URL (optional)"
                    value={projectForm.figmaUrl}
                    onChange={handleProjectFormChange}
                    className="rating-form-name"
                  />
                  <input
                    name="image"
                    placeholder="Image path (optional)"
                    value={projectForm.image}
                    onChange={handleProjectFormChange}
                    className="rating-form-name"
                  />
                </div>
                <textarea
                  name="description"
                  placeholder="Description"
                  value={projectForm.description}
                  onChange={handleProjectFormChange}
                  className="rating-form-textarea"
                  rows={3}
                  required
                />
                {projectFormError && <p className="rating-form-error">{projectFormError}</p>}
                <div className="admin-project-form-actions">
                  <button type="submit" className="admin-btn admin-btn-approve" disabled={savingProject}>
                    {savingProject ? 'Saving...' : projectFormMode === 'edit' ? 'Save changes' : 'Create project'}
                  </button>
                  <button type="button" className="admin-btn" onClick={cancelProjectForm}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
