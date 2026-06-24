// ─────────────────────────────────────────────
// Sidebar.jsx — Left column of the portfolio
// Contains: the elf avatar + navigation buttons
//
// PROPS (values passed from App.jsx):
// - activeSection: the ID of the current section (e.g. 'news')
// - onNavigate: function to call when user clicks a nav button
// ─────────────────────────────────────────────

import { useTranslation } from '../../i18n/TranslationProvider'

// NAV_ITEMS defines all the navigation buttons.
// Each item has:
// - id:    matches the section ID used in App.jsx
// - label: the text displayed on the button
const NAV_ITEMS = [
  { id: 'news', label: 'Whats New' },
  { id: 'who', label: 'Who Am I?' },
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
        {/* Elf SVG avatar — inline so no image file needed */}
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="bgGrad" cx="50%" cy="50%">
              <stop offset="0%" stopColor="#2a2d45" />
              <stop offset="100%" stopColor="#14162a" />
            </radialGradient>
            <radialGradient id="skinGrad" cx="45%" cy="35%">
              <stop offset="0%" stopColor="#d8d8ea" />
              <stop offset="100%" stopColor="#a8a8c8" />
            </radialGradient>
          </defs>

          {/* background circle */}
          <circle cx="100" cy="100" r="100" fill="url(#bgGrad)" />

          {/* rain lines */}
          <g stroke="rgba(255,255,255,.06)" strokeWidth="1">
            <line x1="20" y1="0" x2="10" y2="200" />
            <line x1="50" y1="0" x2="40" y2="200" />
            <line x1="80" y1="0" x2="70" y2="200" />
            <line x1="110" y1="0" x2="100" y2="200" />
            <line x1="140" y1="0" x2="130" y2="200" />
            <line x1="170" y1="0" x2="160" y2="200" />
          </g>

          {/* body / cloak */}
          <ellipse cx="100" cy="168" rx="52" ry="38" fill="#1e2038" />

          {/* neck */}
          <rect x="90" y="112" width="20" height="20" rx="8" fill="url(#skinGrad)" />

          {/* head */}
          <ellipse cx="100" cy="88" rx="34" ry="38" fill="url(#skinGrad)" />

          {/* pointed elf ears */}
          <polygon points="66,80 52,60 68,92" fill="url(#skinGrad)" />
          <polygon points="134,80 148,60 132,92" fill="url(#skinGrad)" />
          <line x1="60" y1="64" x2="67" y2="88" stroke="#c0c0d8" strokeWidth="1" />
          <line x1="140" y1="64" x2="133" y2="88" stroke="#c0c0d8" strokeWidth="1" />

          {/* hair */}
          <ellipse cx="100" cy="56" rx="32" ry="18" fill="#e8e8f4" />
          <polygon points="80,58 72,38 88,62" fill="#e8e8f4" />
          <polygon points="100,50 96,32 104,32 108,50" fill="#f0f0f8" />
          <polygon points="120,58 128,38 112,62" fill="#e8e8f4" />
          <polygon points="100,44 94,28 106,28" fill="#f4f4ff" />

          {/* eyes */}
          <ellipse cx="88" cy="90" rx="7" ry="7" fill="white" />
          <ellipse cx="112" cy="90" rx="7" ry="7" fill="white" />
          <circle cx="89" cy="91" r="4.5" fill="#334" />
          <circle cx="113" cy="91" r="4.5" fill="#334" />
          <circle cx="90.5" cy="89.5" r="1.5" fill="white" />
          <circle cx="114.5" cy="89.5" r="1.5" fill="white" />

          {/* eyebrows */}
          <path d="M82 82 Q88 78 94 82" stroke="#888" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M106 82 Q112 78 118 82" stroke="#888" strokeWidth="2" fill="none" strokeLinecap="round" />

          {/* nose */}
          <ellipse cx="100" cy="100" rx="4" ry="3" fill="rgba(0,0,0,.08)" />

          {/* smile */}
          <path d="M90 110 Q100 118 110 110" stroke="#9090b0" strokeWidth="2" fill="none" strokeLinecap="round" />

          {/* collar */}
          <path d="M76 132 Q100 125 124 132 L120 145 Q100 138 80 145 Z" fill="#2c2e48" />
        </svg>
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