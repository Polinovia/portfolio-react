// ─────────────────────────────────────────────
// WhatsNew.jsx — Timeline of recent updates
// This is the first section shown on page load.
//
// No props needed — all data is defined below.
// To add a new entry, just add an object to
// the UPDATES array with a date and text.
// ─────────────────────────────────────────────

import DatePill from '../components/UI/DatePill'

// ── Data ──────────────────────────────────────
// Each object = one row in the timeline.
// Replace these with your real updates!
const UPDATES = [
  { date: '24.02', text: 'Start working with Figma' },
  { date: '01.03', text: 'Published first UI case study' },
  { date: '08.03', text: 'Launched personal portfolio site' },
  { date: '12.03', text: 'Started learning Three.js animations' },
]

export default function WhatsNew() {
  return (
    <div className="card">
      {UPDATES.map((item, index) => (
        <div
          key={index}
          className="timeline-row"
          // Stagger animation: each row appears slightly after the previous one
          style={{ animationDelay: `${index * 0.07}s` }}
        >
          {/* Purple date badge on the left */}
          <DatePill date={item.date} />

          {/* Update description on the right */}
          <span className="timeline-text">{item.text}</span>
        </div>
      ))}
    </div>
  )
}