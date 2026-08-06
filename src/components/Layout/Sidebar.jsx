// ─────────────────────────────────────────────
// Sidebar.jsx — Left column of the portfolio
// Contains: the elf avatar + navigation buttons
//
// PROPS (values passed from App.jsx):
// - activeSection: the ID of the current section (e.g. 'news')
// - onNavigate: function to call when user clicks a nav button
// ─────────────────────────────────────────────

import { useTranslation } from '../../i18n/TranslationProvider'
import avatarPhoto from '../../assets/avatar.webp'

// NAV_ITEMS defines all the navigation buttons.
// Each item has:
// - id:    matches the section ID used in App.jsx
// - label: the text displayed on the button
const NAV_ITEMS = [
  { id: 'news', label: 'Whats New' },
  { id: 'who', label: 'Who Am I?' },
  { id: 'skills', label: 'My Skills' },
  { id: 'exp', label: 'Experience' },
  { id: 'projects', label: 'My Projects' },
]

export default function Sidebar({ activeSection, onNavigate, t }) {
  // activeSection and onNavigate come from App.jsx as props.
  // Props are like "arguments" you pass to a component.
  const { t: ctxT } = useTranslation()
  const translate = t || ctxT

  return (
    <aside className="sidebar">

      {/* ── Avatar ── */}
      <div className="avatar-wrap">
        <img src={avatarPhoto} alt="Polina Bevz" className="avatar-photo" />
      </div>

      {/* ── Mini intro card ── */}
      <div className="sidebar-intro">
        <div className="sidebar-intro-name">Polina Bevz</div>
        <div className="sidebar-intro-tagline">Front-end developer</div>
        <div className="sidebar-intro-status">Open to work</div>
      </div>

      {/* ── Navigation ── */}
      <nav>
        {/* Map over NAV_ITEMS to create one button per section.
            This avoids repeating the same button code manually. */}
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}


            className={`nav-btn${activeSection === item.id ? ' active' : ''}`}


            onClick={() => onNavigate(item.id)}
          >
            {translate(`nav.${item.id}`) || item.label}
          </button>
        ))}
      </nav>

    </aside>
  )
}