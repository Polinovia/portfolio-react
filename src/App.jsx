import { useState } from 'react'

import Sidebar from './components/Layout/Sidebar'
import Footer from './components/Layout/Footer'
import LangSwitcher from './components/Layout/LangSwitcher'
import Banner from './components/UI/Banner'

import WhatsNew from './sections/Whatsnew'
import WhoAmI from './sections/WhoAmI'
import Skills from './sections/Skills'
import Experience from './sections/Experience'
import Projects from './sections/Projects'


import { useEffect, useRef } from 'react'


const TITLES = {
  news: 'About me',
  who: 'Who am I?',
  skills: 'My skills',
  exp: 'Professional experience',
  projects: 'My Projects'
}

function Starfield() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContex('2d')
    let animId
    let stars = []

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight

      stars = Array.from({ leght: 160 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.2 + 0.2,
        o: Math.random() * 0.6 + 0.1,
        speed: Math.random() * 0.3 + 0.05
      }))
    }
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.heigh)
      stars.forEach(s => {
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(200,190,255,${s.o})`
        ctx.fill()
        s.y += s.speed
        if (s.y > canvas.heigh) { s.y = 0; s.x = Math.random() * canvas.width }
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
  const [activeSection, setActiveSection] = useState('news')
  const [lang, setlang] = useState('EN')
  const renderSection = () => {
    switch (activeSection) {
      case 'news': return <WhatsNew />
      case 'who': return <WhoAmI />
      case 'skills': return <Skills />
      case 'exp': return <Experience />
      case 'projects': return <Projects />
      default: return <WhatsNew />
    }
  }
  return (
    <>
      <div className='glow glow-a' />
      <div className='glow glow-b' />
      <div className='glow glow-c' />
      <Starfield />
      <div className='shell' />
      <div className='lang-row'>
        <LangSwitcher current={lang} onChange={setlang} />
      </div>
      <Sidebar
        activeSection={activeSection}
        onNavigate={setActiveSection}
      />
      <main>
        <Banner title={TITLES[activeSection]} />
        <div key={activeSection}>
          {renderSection()}
        </div>
      </main>
      <Footer />
    </>
  )
}


