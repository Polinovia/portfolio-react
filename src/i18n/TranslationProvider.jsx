import React, { createContext, useContext, useMemo, useState, useEffect, useCallback } from 'react'
import TRANSLATIONS from './translations.json'

const LANG_COOKIE = 'lang'

function readLangCookie() {
  const match = document.cookie.match(new RegExp(`(?:^|; )${LANG_COOKIE}=([^;]*)`))
  const value = match && decodeURIComponent(match[1])
  return value && TRANSLATIONS[value] ? value : null
}

function writeLangCookie(lang) {
  // 1 year expiry so the choice survives across visits, not just this session
  document.cookie = `${LANG_COOKIE}=${encodeURIComponent(lang)}; max-age=${60 * 60 * 24 * 365}; path=/; SameSite=Lax`
}

const TranslationContext = createContext({
  lang: 'EN',
  setLang: () => { },
  t: (p) => p
})

export function TranslationProvider({ children, defaultLang = 'EN' }) {
  const [lang, setLangState] = useState(() => {
    try { return readLangCookie() || defaultLang } catch (e) { return defaultLang }
  })

  const setLang = useCallback((nextLang) => {
    setLangState(nextLang)
    try { writeLangCookie(nextLang) } catch (e) { }
  }, [])

  useEffect(() => {
    try { document.documentElement.lang = String(lang).toLowerCase() } catch (e) { }
  }, [lang])

  const t = useMemo(() => (path) => {
    const parts = String(path).split('.')
    let obj = TRANSLATIONS[lang] || TRANSLATIONS.EN
    for (const p of parts) {
      if (obj && Object.prototype.hasOwnProperty.call(obj, p)) obj = obj[p]
      else return path
    }
    return obj
  }, [lang])

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t])

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  )
}

export function useTranslation() {
  const ctx = useContext(TranslationContext)
  if (!ctx) return { lang: 'EN', setLang: () => { }, t: (p) => p }
  return ctx
}

export default TranslationProvider
