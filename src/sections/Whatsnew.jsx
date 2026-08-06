// ─────────────────────────────────────────────
// WhatsNew.jsx - Timeline of recent updates
// This is the first section shown on page load.
//
// Update text lives in TranslationProvider (per
// language) under the `news` key - see i18n/TranslationProvider.jsx.
// ─────────────────────────────────────────────

import { useState } from 'react'
import DatePill from '../components/UI/DatePill'
import { useTranslation } from '../i18n/TranslationProvider'

// How many rows are visible at once
const PAGE_SIZE = 5

export default function WhatsNew() {
  const { t } = useTranslation()
  const UPDATES = t('news')

  // startIndex = first visible row. Arrows shift the 5-row window.
  const [startIndex, setStartIndex] = useState(0)

  const canScrollUp = startIndex > 0
  const canScrollDown = startIndex + PAGE_SIZE < UPDATES.length
  const visibleUpdates = UPDATES.slice(startIndex, startIndex + PAGE_SIZE)

  return (
    <div className="card">
      <button
        type="button"
        className="timeline-arrow-btn timeline-arrow-btn--top"
        disabled={!canScrollUp}
        onClick={() => setStartIndex(i => Math.max(0, i - 1))}
        aria-label="Show newer updates"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="18 15 12 9 6 15" />
        </svg>
      </button>

      {visibleUpdates.map((item, index) => (
        <div
          key={startIndex + index}
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

      <button
        type="button"
        className="timeline-arrow-btn timeline-arrow-btn--bottom"
        disabled={!canScrollDown}
        onClick={() => setStartIndex(i => Math.min(UPDATES.length - PAGE_SIZE, i + 1))}
        aria-label="Show older updates"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
    </div>
  )
}