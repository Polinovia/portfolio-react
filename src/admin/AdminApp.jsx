import { useEffect, useMemo, useState, useCallback, useRef } from 'react'
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

const MAX_DESCRIPTION_LENGTH = 1000

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
  const [projectSuccessMessage, setProjectSuccessMessage] = useState(null)
  const [projectFormMode, setProjectFormMode] = useState(null) // null | 'create' | 'edit'
  const [projectForm, setProjectForm] = useState(EMPTY_PROJECT_FORM)
  const [projectFormError, setProjectFormError] = useState(null)
  const [savingProject, setSavingProject] = useState(false)
  const [adminTab, setAdminTab] = useState('projects') // projects | reviews
  const photoInputRef = useRef(null)

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

  useEffect(() => {
    if (!projectSuccessMessage) return
    const timer = setTimeout(() => setProjectSuccessMessage(null), 4000)
    return () => clearTimeout(timer)
  }, [projectSuccessMessage])

  const startCreateProject = () => {
    setProjectForm(EMPTY_PROJECT_FORM)
    setProjectFormError(null)
    setProjectSuccessMessage(null)
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
    setProjectSuccessMessage(null)
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

  const handlePhotoChange = (e) => {
    const file = e.target.files && e.target.files[0]
    e.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setProjectFormError('Please choose an image file.')
      return
    }
    if (file.size > 12 * 1024 * 1024) {
      setProjectFormError('That photo is too large (max 12MB).')
      return
    }
    setProjectFormError(null)
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const maxWidth = 960
        const scale = Math.min(1, maxWidth / img.width)
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.82)
        setProjectForm((prev) => ({ ...prev, image: dataUrl }))
      }
      img.src = reader.result
    }
    reader.readAsDataURL(file)
  }

  const handleRemovePhoto = () => {
    setProjectForm((prev) => ({ ...prev, image: '' }))
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
      const wasEdit = projectFormMode === 'edit'
      setProjectFormMode(null)
      setProjectSuccessMessage(
        wasEdit ? `"${projectForm.name}" was updated successfully.` : `"${projectForm.name}" was created successfully.`
      )
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
          {projectSuccessMessage && <p className="admin-success-banner">{projectSuccessMessage}</p>}

          <button className="admin-btn admin-btn-approve" onClick={startCreateProject}>
            + New project
          </button>

          {projects && projects.length === 0 && <p className="admin-empty">No projects yet.</p>}

          {projects && projects.length > 0 && (
            <ul className="admin-projects-list">
              {projects.map((project, index) => (
                <li key={project.slug} className="admin-project-row">
                  <div className="admin-project-main">
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
                  <label className="admin-field">
                    <span className="admin-field-label">Slug</span>
                    <input
                      name="slug"
                      placeholder="my-project"
                      value={projectForm.slug}
                      onChange={handleProjectFormChange}
                      className="rating-form-name"
                      required
                      disabled={projectFormMode === 'edit'}
                    />
                  </label>
                  <label className="admin-field">
                    <span className="admin-field-label">Name</span>
                    <input
                      name="name"
                      placeholder="My Project"
                      value={projectForm.name}
                      onChange={handleProjectFormChange}
                      className="rating-form-name"
                      required
                    />
                  </label>
                  <label className="admin-field">
                    <span className="admin-field-label">Tech</span>
                    <input
                      name="tech"
                      placeholder="React · API · UI"
                      value={projectForm.tech}
                      onChange={handleProjectFormChange}
                      className="rating-form-name"
                      required
                    />
                  </label>
                  <label className="admin-field">
                    <span className="admin-field-label">Category</span>
                    <select name="category" value={projectForm.category} onChange={handleProjectFormChange} className="admin-select">
                      <option value="dev">dev</option>
                      <option value="design">design</option>
                    </select>
                  </label>
                  <label className="admin-field">
                    <span className="admin-field-label">Folder</span>
                    <input
                      name="folder"
                      placeholder="React"
                      value={projectForm.folder}
                      onChange={handleProjectFormChange}
                      className="rating-form-name"
                      required
                    />
                  </label>
                  <label className="admin-field">
                    <span className="admin-field-label">URL (repo or live link)</span>
                    <input
                      name="url"
                      placeholder="https://..."
                      value={projectForm.url}
                      onChange={handleProjectFormChange}
                      className="rating-form-name"
                      required
                    />
                  </label>
                  <label className="admin-field">
                    <span className="admin-field-label">Preview URL (optional)</span>
                    <input
                      name="previewUrl"
                      placeholder="https://..."
                      value={projectForm.previewUrl}
                      onChange={handleProjectFormChange}
                      className="rating-form-name"
                    />
                  </label>
                  <label className="admin-field">
                    <span className="admin-field-label">Figma URL (optional)</span>
                    <input
                      name="figmaUrl"
                      placeholder="https://..."
                      value={projectForm.figmaUrl}
                      onChange={handleProjectFormChange}
                      className="rating-form-name"
                    />
                  </label>
                </div>
                <label className="admin-field">
                  <span className="admin-field-label">Photo (optional)</span>
                  <div className="admin-photo-picker">
                    {projectForm.image ? (
                      <img src={projectForm.image} alt="" className="admin-photo-preview" />
                    ) : (
                      <div className="admin-photo-preview admin-photo-preview--empty">No photo</div>
                    )}
                    <div className="admin-photo-actions">
                      <button type="button" className="admin-btn" onClick={() => photoInputRef.current.click()}>
                        Choose from my computer…
                      </button>
                      {projectForm.image && (
                        <button type="button" className="admin-btn admin-btn-reject" onClick={handleRemovePhoto}>
                          Remove
                        </button>
                      )}
                    </div>
                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="admin-photo-file-input"
                    />
                  </div>
                </label>
                <label className="admin-field">
                  <span className="admin-field-label">
                    Description
                    <span
                      className={
                        'admin-char-count' +
                        (projectForm.description.length > MAX_DESCRIPTION_LENGTH ? ' admin-char-count--over' : '')
                      }
                    >
                      {projectForm.description.length} / {MAX_DESCRIPTION_LENGTH}
                    </span>
                  </span>
                  <textarea
                    name="description"
                    placeholder="Short description shown on the project card"
                    value={projectForm.description}
                    onChange={handleProjectFormChange}
                    className="rating-form-textarea"
                    rows={3}
                    maxLength={MAX_DESCRIPTION_LENGTH}
                    required
                  />
                </label>
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
