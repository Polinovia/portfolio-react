import { useEffect, useRef, useState } from 'react'
import ProjectCard from '../components/UI/Projectcard'
import ProjectRatings from '../components/UI/ProjectRatings'

// Must match .project-carousel-item / .carousel-arrow sizing in global.css
const CARD_WIDTH = 260
const CARD_GAP = 18
const ARROW_WIDTH = 34
const ARROW_GAP = 8

// ── Projects data ──────────────────────────────
// Each object = one project card.
// - name:        project title
// - tech:        tech stack shown below the name
// - description: one-line summary of what the project does
// - category:    'dev' | 'design' - used for the badge color
// - folder:      tech stack - used for the placeholder thumbnail color when there's no image
// - url:         GitHub (or Figma) link
// - previewUrl:  live demo link, if there is one
// - image:       real screenshot, if there is one (falls back to a tech-colored placeholder)
const PROJECTS = [
  {
    name: 'Who Where What',
    slug: 'who-where-what',
    tech: 'TypeScript · Browser Game · EN/FR',
    description: 'A multilingual (EN/FR) browser game where friends build an absurd story together, designed from scratch in Figma before being coded and deployed.',
    category: 'dev',
    folder: 'TypeScript',
    url: 'https://github.com/Polinovia/who-where-what',
    previewUrl: 'https://who-where-what.netlify.app/',
    figmaUrl: 'https://www.figma.com/design/sqG49YO6i4XueFX4IuenbF/who--where--what-?node-id=19-334&t=YS4YU5ueKN3VzMLW-1',
    image: '/assets/projects/whowherewhat.webp',
  },
  {
    name: 'NezZen',
    slug: 'nezzen',
    tech: 'Figma · UI Design',
    description: 'New UI design proposal for the NezZen product, built and iterated on in Figma.',
    category: 'design',
    folder: 'Figma',
    url: 'https://www.figma.com/design/9FhPm5Ric9S2FQj2Syr1J6/NezZen?node-id=0-1&t=6BQBuoPJaaO8kriO-1',
    image: '/assets/projects/nezzen.png',
  },
  {
    name: 'Portfolio',
    slug: 'portfolio-figma',
    tech: 'Figma · UI Design',
    description: 'Figma design mockups for this very portfolio, before it became a React app.',
    category: 'design',
    folder: 'Figma',
    url: 'https://www.figma.com/design/a3iytrjfRqUQUAZfDZg4Mq/Portfolio?node-id=0-1&t=UVWcuWniWx7Z3pIY-1',
    image: '/assets/projects/portfolio-figma.png',
  },
  {
    name: '15.05',
    slug: '15-05',
    tech: 'JavaScript · Interaction',
    description: 'A small JavaScript exercise focused on DOM manipulation and interactivity.',
    category: 'dev',
    folder: 'JavaScript',
    url: 'https://github.com/Polinovia/15.05',
  },
  {
    name: 'airport',
    slug: 'airport',
    tech: 'React · API · UI',
    description: 'A React app that browses flights via a public API with a clean, responsive UI.',
    category: 'dev',
    folder: 'React',
    url: 'https://github.com/Polinovia/airport',
    image: '/assets/projects/airport.png',
  },
  {
    name: 'articles-vue',
    slug: 'articles-vue',
    tech: 'Vue · Content · Articles',
    description: 'A Vue app for browsing and reading articles, with a focus on content layout.',
    category: 'dev',
    folder: 'Vue',
    url: 'https://github.com/Polinovia/articles-vue',
    previewUrl: 'https://pwa-vue-polina.netlify.app/',
  },
  {
    name: 'exercice-front',
    slug: 'exercice-front',
    tech: 'JavaScript · Game · UI',
    description: 'A small JavaScript game exercise built to practice logic and UI state.',
    category: 'dev',
    folder: 'JavaScript',
    url: 'https://github.com/Polinovia/exercice-front',
    previewUrl: 'https://jeuphrasesbevz.netlify.app/',
    image: '/assets/projects/exercice-front.png',
  },
  {
    name: 'front_quiestla',
    slug: 'front-quiestla',
    tech: 'Vue · Responsive · UI',
    description: 'A responsive Vue front-end built around a "who is it" style UI.',
    category: 'dev',
    folder: 'Vue',
    url: 'https://github.com/Polinovia/front_quiestla',
    previewUrl: 'https://quiestla-polina.netlify.app/',
    image: '/assets/projects/front_quiestla.png',
  },
  {
    name: 'jamstack-nuxt',
    slug: 'jamstack-nuxt',
    tech: 'Nuxt · Jamstack · Static',
    description: 'A statically generated Jamstack site built with Nuxt.',
    category: 'dev',
    folder: 'Nuxt',
    url: 'https://github.com/Polinovia/jamstack-nuxt',
    previewUrl: 'https://nuxtdyn.netlify.app/',
    image: '/assets/projects/jamstack-nuxt.png',
  },
  {
    name: 'my-nuxt-auth',
    slug: 'my-nuxt-auth',
    tech: 'Nuxt · Auth · SSR',
    description: 'A Nuxt app exploring server-side rendering with authenticated routes.',
    category: 'dev',
    folder: 'Nuxt',
    url: 'https://github.com/Polinovia/my-nuxt-auth',
    previewUrl: 'https://courir-ex.netlify.app/',
    image: '/assets/projects/my-nuxt-auth.png',
  },
  {
    name: 'plan-culture-front',
    slug: 'plan-culture-front',
    tech: 'Vue · Planning · UI',
    description: 'A Vue front-end for planning crops and tracking plant harvests.',
    category: 'dev',
    folder: 'Vue',
    url: 'https://github.com/Polinovia/plan-culture-front',
  },
  {
    name: 'Urbex-Project-FRONT',
    slug: 'urbex-project-front',
    tech: 'Vue · Exploration Game · Group Project',
    description: 'A Vue exploration game where players discover and navigate abandoned urban sites - built as a team project at the end of our formation.',
    category: 'dev',
    folder: 'Vue',
    url: 'https://github.com/mplscrummaster/Urbex-Project-FRONT',
    image: '/assets/projects/urbex-project-front.png',
  },
  {
    name: 'notif_avec_vue',
    slug: 'notif-avec-vue',
    tech: 'Vue · Notifications · UI',
    description: 'A Vue app demonstrating a real-time notification system and UI.',
    category: 'dev',
    folder: 'Vue',
    url: 'https://github.com/Polinovia/notif_avec_vue',
  },
  {
    name: 'php-demo',
    slug: 'php-demo',
    tech: 'PHP · Demo · Backend',
    description: 'A small PHP backend demo covering basic server-side logic.',
    category: 'dev',
    folder: 'PHP',
    url: 'https://github.com/Polinovia/php-demo',
  },
  {
    name: 'React',
    slug: 'react-practice',
    tech: 'React · Web App',
    description: 'A React practice repo used to explore components, hooks and routing.',
    category: 'dev',
    folder: 'React',
    url: 'https://github.com/Polinovia/React',
  },
  {
    name: 'wf12-pwa-bpi',
    slug: 'wf12-pwa-bpi',
    tech: 'PWA · Service Workers · Offline',
    description: 'A Progressive Web App with offline support via service workers.',
    category: 'dev',
    folder: 'PWA',
    url: 'https://github.com/Polinovia/wf12-pwa-bpi',
    previewUrl: 'https://wf12-pwa-bpi.netlify.app/',
  },
]

export default function Projects({ initialProjectSlug }) {
  const carouselRef = useRef(null)
  const trackRef = useRef(null)
  const [viewportWidth, setViewportWidth] = useState(null)
  const [selectedProject, setSelectedProject] = useState(() =>
    initialProjectSlug ? PROJECTS.find((p) => p.slug === initialProjectSlug) ?? null : null,
  )

  // Clip the viewport to a width that fits a whole number of cards, so no
  // card is ever half-visible at the edge - it either fully shows or scrolls off.
  useEffect(() => {
    const el = carouselRef.current
    if (!el) return

    const recompute = () => {
      const available = el.clientWidth - 2 * (ARROW_WIDTH + ARROW_GAP)
      const cardsPerView = Math.max(1, Math.floor((available + CARD_GAP) / (CARD_WIDTH + CARD_GAP)))
      setViewportWidth(cardsPerView * (CARD_WIDTH + CARD_GAP) - CARD_GAP)
    }

    recompute()
    const observer = new ResizeObserver(recompute)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const scrollByCards = (direction) => {
    const track = trackRef.current
    if (!track) return
    track.scrollBy({ left: direction * track.clientWidth * 0.85, behavior: 'smooth' })
  }

  return (
    <>
      <div className="project-carousel" ref={carouselRef}>
        <button
          type="button"
          className="carousel-arrow carousel-arrow--prev"
          onClick={() => scrollByCards(-1)}
          aria-label="Scroll projects left"
        >
          ‹
        </button>

        <div
          className="project-carousel-viewport"
          style={viewportWidth ? { width: viewportWidth, flex: `0 0 ${viewportWidth}px` } : undefined}
        >
          <div className="project-carousel-track" ref={trackRef}>
            {PROJECTS.map((project, index) => (
              <div
                className="project-carousel-item"
                key={project.name}
                onClick={() => setSelectedProject(project)}
              >
                <ProjectCard
                  name={project.name}
                  tech={project.tech}
                  description={project.description}
                  category={project.category}
                  folder={project.folder}
                  url={project.url}
                  previewUrl={project.previewUrl}
                  figmaUrl={project.figmaUrl}
                  image={project.image}
                  delay={index * 0.05}
                />
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          className="carousel-arrow carousel-arrow--next"
          onClick={() => scrollByCards(1)}
          aria-label="Scroll projects right"
        >
          ›
        </button>
      </div>

      {/* Mobile-only: tappable list, opens a popup with the full card */}
      <ul className="project-mobile-list">
        {PROJECTS.map((project) => (
          <li
            key={project.name}
            className="project-mobile-item"
            onClick={() => setSelectedProject(project)}
          >
            <div>
              <div className="project-mobile-item-name">{project.name}</div>
              <div className="project-mobile-item-tech">{project.tech}</div>
            </div>
            <span className="project-mobile-item-arrow">›</span>
          </li>
        ))}
      </ul>

      {selectedProject && (
        <div className="project-modal-overlay" onClick={() => setSelectedProject(null)}>
          <div className="project-modal" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="project-modal-close"
              onClick={() => setSelectedProject(null)}
              aria-label="Close"
            >
              ×
            </button>
            <div className="project-modal-body">
              <ProjectCard
                name={selectedProject.name}
                tech={selectedProject.tech}
                description={selectedProject.description}
                category={selectedProject.category}
                folder={selectedProject.folder}
                url={selectedProject.url}
                previewUrl={selectedProject.previewUrl}
                figmaUrl={selectedProject.figmaUrl}
                image={selectedProject.image}
              />
              <ProjectRatings projectSlug={selectedProject.slug} />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
