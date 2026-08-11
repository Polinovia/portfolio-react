import { useCallback, useEffect, useRef, useState } from 'react'
import ProjectCard from '../components/UI/Projectcard'
import ProjectRatings from '../components/UI/ProjectRatings'
import { useTranslation } from '../i18n/TranslationProvider'

// Must match .project-carousel-item / .carousel-arrow sizing in global.css
const CARD_WIDTH = 260
const CARD_GAP = 18
const ARROW_WIDTH = 34
const ARROW_GAP = 8

export default function Projects({ initialProjectSlug }) {
  const { t } = useTranslation()
  const carouselRef = useRef(null)
  const trackRef = useRef(null)
  const [viewportWidth, setViewportWidth] = useState(null)
  const [projects, setProjects] = useState(null)
  const [error, setError] = useState(false)
  const [selectedProject, setSelectedProject] = useState(null)

  const fetchProjects = useCallback(() => {
    setError(false)
    fetch('/.netlify/functions/projects-list')
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('projects-list request failed'))))
      .then((json) => setProjects(json.projects))
      .catch(() => setError(true))
  }, [])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  // Resolves the #projects/<slug> deep link once the project list has
  // loaded (it can't resolve synchronously anymore now that data is fetched).
  useEffect(() => {
    if (!projects || !initialProjectSlug || selectedProject) return
    const match = projects.find((p) => p.slug === initialProjectSlug)
    if (match) setSelectedProject(match)
  }, [projects, initialProjectSlug, selectedProject])

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

  if (error) {
    return (
      <div className="projects-error">
        <p className="projects-error-text">{t('projects.errorGeneric')}</p>
        <button type="button" className="projects-error-retry" onClick={fetchProjects}>
          {t('projects.retry')}
        </button>
      </div>
    )
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
            {projects && projects.map((project, index) => (
              <div
                className="project-carousel-item"
                key={project.slug}
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
        {projects && projects.map((project) => (
          <li
            key={project.slug}
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
