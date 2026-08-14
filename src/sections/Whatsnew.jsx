// ─────────────────────────────────────────────
// WhatsNew.jsx - Timeline of recent updates
// This is the first section shown on page load.
//
// Update text lives in TranslationProvider (per
// language) under the `news` key - see i18n/TranslationProvider.jsx.
// ─────────────────────────────────────────────

import DatePill from '../components/UI/DatePill'
import { useTranslation } from '../i18n/TranslationProvider'

export default function WhatsNew() {
  const { t } = useTranslation()
  const UPDATES = t('news')

  return (
    <div className="card">
      <div className="timeline-list">
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
    </div>
  )
}