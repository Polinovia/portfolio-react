import React, { createContext, useContext, useMemo, useState, useEffect } from 'react'

const TRANSLATIONS = {
  EN: {
    titles: {
      news: 'News',
      who: 'Who am I?',
      skills: 'My skills',
      exp: 'Professional experience',
      projects: 'My Projects'
    },
    nav: {
      news: 'Whats New',
      who: 'Who Am I?',
      skills: 'My Skills',
      exp: 'Experience',
      projects: 'My Projects'
    },
    footer: {
      tagline: 'Front-end Developer · Open to work'
    },
    filters: {
      all: 'All',
      design: 'Design',
      dev: 'Dev',
      wordpress: 'WordPress'
    }
  },
  FR: {
    titles: {
      news: 'Actualités',
      who: 'Qui suis-je ?',
      skills: 'Mes compétences',
      exp: 'Expérience professionnelle',
      projects: 'Mes projets'
    },
    nav: {
      news: 'Actualités',
      who: 'Qui suis-je ?',
      skills: 'Mes compétences',
      exp: 'Expérience',
      projects: 'Mes projets'
    },
    footer: {
      tagline: 'Développeuse front‑end · Ouverte aux opportunités'
    },
    filters: {
      all: 'Tous',
      design: 'Design',
      dev: 'Dév',
      wordpress: 'WordPress'
    }
  },
  UA: {
    titles: {
      news: 'Новини',
      who: 'Хто я?',
      skills: 'Мої навички',
      exp: 'Професійний досвід',
      projects: 'Мої проєкти'
    },
    nav: {
      news: 'Новини',
      who: 'Хто я?',
      skills: 'Мої навички',
      exp: 'Досвід',
      projects: 'Проєкти'
    },
    footer: {
      tagline: 'Фронтенд-розробник · Відкритий до пропозицій'
    },
    filters: {
      all: 'Всі',
      design: 'Дизайн',
      dev: 'Розробка',
      wordpress: 'WordPress'
    }
  }
}

const TranslationContext = createContext({
  lang: 'EN',
  setLang: () => { },
  t: (p) => p
})

export function TranslationProvider({ children, defaultLang = 'EN' }) {
  const [lang, setLang] = useState(defaultLang)

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
