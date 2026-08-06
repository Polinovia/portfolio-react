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
  { date: '02.06.26', text: 'Completed internship at NezZen' },
  { date: '13.05.26', text: 'Built a Chrome extension to manage Jimdo with a new design, for non-programmers' },
  { date: '07.04.26', text: 'Started internship (stage) at NezZen' },
  { date: '20.03.26', text: 'Started building this portfolio (React)' },
  { date: '24.02.26', text: 'Started working with Figma on my own initiative, proposed a new design for NezZen' },
  { date: '15.12.25', text: 'Completed Front-end Developer formation at CEPEGRA' },
  { date: '18.11.25', text: 'Started plan-culture-front project' },
  { date: '10.09.25', text: 'Explored React in a dedicated practice repo' },
  { date: '01.09.25', text: 'Built Nuxt projects (Jamstack + Auth/SSR)' },
  { date: '26.08.25', text: 'Built PWA, Vue notifications & articles apps' },
  { date: '14.07.25', text: 'Built Vue quiz app & JS game exercise' },
  { date: '24.06.25', text: 'Built a PHP demo project' },
  { date: '28.05.25', text: 'Built "airport" React app' },
  { date: '12.05.25', text: 'Started Front-end Developer formation at CEPEGRA' },
  { date: '25.04.25', text: 'Completed Web Design formation' },
  { date: '10.04.25', text: 'Started Web Design formation' },
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