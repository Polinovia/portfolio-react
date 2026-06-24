// ─────────────────────────────────────────────
// LangSwitcher.jsx — Language selector (EN/FR/UA)
// Displayed in the top-right corner of the page.
//
// PROPS (values passed from App.jsx):
// - current:  the currently selected language (e.g. 'EN')
// - onChange: function to call when user picks a language
// ─────────────────────────────────────────────

import { useTranslation } from '../../i18n/TranslationProvider'

// The list of available languages.
// To add a new one, just add it to this array.
const LANGS = ['EN', 'FR', 'UA']

export default function LangSwitcher() {
  const { lang: current, setLang } = useTranslation()

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>

      {/* Loop over each language and render a button + separator */}
      {LANGS.map((lang, index) => (
        <span key={lang} style={{ display: 'flex', alignItems: 'center' }}>

          {/* Language button */}
          <button
            // Add 'active' class when this language is the selected one
            className={`lang-btn${current === lang ? ' active' : ''}`}

            // When clicked, tell the provider to update the language
            onClick={() => setLang(lang)}
          >
            {lang}
          </button>

          {/* Show a "/" separator between languages, but NOT after the last one */}
          {index < LANGS.length - 1 && (
            <span className="lang-sep">/</span>
          )}

        </span>
      ))}

    </div>
  )
}