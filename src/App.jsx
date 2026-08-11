import { useState, useEffect, useRef } from 'react'
import { TranslationProvider } from './i18n/TranslationProvider'

import Sidebar from './components/Layout/Sidebar'
import Footer from './components/Layout/Footer'
import LangSwitcher from './components/Layout/LangSwitcher'
import Banner from './components/UI/Banner'

import WhatsNew from './sections/Whatsnew'
import WhoAmI from './sections/WhoAmI'
import Skills from './sections/Skills'
import Experience from './sections/Experience'
import Projects from './sections/Projects'
import Recommendations from './sections/Recommendations'

const VALID_SECTIONS = ['news', 'who', 'recommendations', 'skills', 'exp', 'projects']

// URL shape: #<section> or #projects/<project-slug> (e.g. #projects/who-where-what
// deep-links straight to that project's card). Falls back to 'news' for anything
// unrecognized, so a stray/old hash never breaks navigation.
function parseHash() {
  const raw = window.location.hash.slice(1)
  const [section, ...rest] = raw.split('/')
  return {
    section: VALID_SECTIONS.includes(section) ? section : 'news',
    projectSlug: rest.join('/') || null,
  }
}



function Starfield() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext && canvas.getContext('2d')
    if (!ctx) return
    let animId
    let stars = []

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight

      stars = Array.from({ length: 160 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.2 + 0.2,
        o: Math.random() * 0.6 + 0.1,
        speed: Math.random() * 0.3 + 0.05
      }))
    }
    const draw = () => {
      if (!ctx) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      stars.forEach(s => {
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(200,190,255,${s.o})`
        ctx.fill()
        s.y += s.speed
        if (s.y > canvas.height) { s.y = 0; s.x = Math.random() * canvas.width }
      })
      animId = requestAnimationFrame(draw)
    }
    resize()
    draw()
    window.addEventListener('resize', resize)
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])
  return (
    <canvas ref={canvasRef}
      style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}
    />
  )
}

export default function App() {
  const [activeSection, setActiveSectionState] = useState(() => parseHash().section)
  const [initialProjectSlug, setInitialProjectSlug] = useState(() => parseHash().projectSlug)

  // Navigating via the sidebar is a fresh choice, so it clears any pending
  // deep-linked project and updates the URL (via replaceState, not
  // location.hash directly, so it doesn't trigger the browser's native
  // scroll-to-element-with-matching-id behavior in this single-page shell).
  const setActiveSection = (section) => {
    setActiveSectionState(section)
    setInitialProjectSlug(null)
    window.history.replaceState(null, '', `#${section}`)
  }

  // Keeps the app in sync if the hash changes without a full reload (back/
  // forward navigation, or a link elsewhere on the page pointing at #projects/...).
  useEffect(() => {
    const onHashChange = () => {
      const parsed = parseHash()
      setActiveSectionState(parsed.section)
      setInitialProjectSlug(parsed.projectSlug)
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const renderSection = () => {
    switch (activeSection) {
      case 'news': return <WhatsNew />
      case 'who': return <WhoAmI />
      case 'recommendations': return <Recommendations />
      case 'skills': return <Skills />
      case 'exp': return <Experience />
      case 'projects': return <Projects initialProjectSlug={initialProjectSlug} />
      default: return <WhatsNew />
    }
  }
  return (
    <>
      <div className='glow glow-a' />
      <div className='glow glow-b' />
      <div className='glow glow-c' />
      <Starfield />
      <TranslationProvider defaultLang={'EN'}>
        <div className='shell'>
          <div className='lang-row'>
            <LangSwitcher />
          </div>
          <Sidebar
            activeSection={activeSection}
            onNavigate={setActiveSection}
          />
          <main className='main'>
            <Banner titleKey={`titles.${activeSection}`} />
            <div key={activeSection}>
              {renderSection()}
            </div>
          </main>
        </div>
        <Footer />
      </TranslationProvider>
    </>
  )
}


