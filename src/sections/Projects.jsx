import { useCallback, useEffect, useRef, useState } from 'react'
import ProjectCard from '../components/UI/Projectcard'
import ProjectRatings from '../components/UI/ProjectRatings'
import { useTranslation } from '../i18n/TranslationProvider'

// Desktop/tablet grid: 2 columns, 4 cards per "batch" - more load in as you scroll down
const BATCH_SIZE = 4

export default function Projects({ initialProjectSlug }) {
  const { t } = useTranslation()
  const [projects, setProjects] = useState(null)
  const [error, setError] = useState(false)
  const [selectedProject, setSelectedProject] = useState(null)
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE)
  const sentinelRef = useRef(null)

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

  // Resolves the #projects/<slug> deep link once the project list has loaded
  // (it can't resolve synchronously anymore now that data is fetched), and
  // reveals enough of the grid for that project's card to already be in it.
  useEffect(() => {
    if (!projects || !initialProjectSlug || selectedProject) return
    const index = projects.findIndex((p) => p.slug === initialProjectSlug)
    if (index !== -1) {
      setSelectedProject(projects[index])
      setVisibleCount((c) => Math.max(c, index + 1))
    }
  }, [projects, initialProjectSlug, selectedProject])

  // Lazy-load more cards into the grid as the user scrolls near the bottom.
  useEffect(() => {
    if (!projects || visibleCount >= projects.length) return
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((c) => Math.min(projects.length, c + BATCH_SIZE))
        }
      },
      { rootMargin: '200px' }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [projects, visibleCount])

  const visibleProjects = projects ? projects.slice(0, visibleCount) : null

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
      {/* Desktop/tablet: 2-column grid, more cards load in as you scroll down */}
      <div className="project-grid-wrap">
        <div className="project-grid">
          {!projects &&
            Array.from({ length: BATCH_SIZE }).map((_, index) => (
              <div className="project-card project-card-skeleton" key={index} style={{ animationDelay: `${index * 0.05}s` }}>
                <div className="skeleton-block skeleton-thumb" />
                <div className="skeleton-block skeleton-badge" />
                <div className="skeleton-block skeleton-line skeleton-line--name" />
                <div className="skeleton-block skeleton-line skeleton-line--tech" />
                <div className="skeleton-block skeleton-line skeleton-line--desc" />
                <div className="skeleton-block skeleton-line skeleton-line--desc-short" />
                <div className="skeleton-actions">
                  <div className="skeleton-block skeleton-pill" />
                  <div className="skeleton-block skeleton-pill" />
                </div>
              </div>
            ))}
          {visibleProjects && visibleProjects.map((project, index) => (
            <ProjectCard
              key={project.slug}
              name={project.name}
              tech={project.tech}
              description={project.description}
              category={project.category}
              folder={project.folder}
              url={project.url}
              previewUrl={project.previewUrl}
              figmaUrl={project.figmaUrl}
              image={project.image}
              delay={(index % BATCH_SIZE) * 0.05}
              truncateDescription
              onClick={() => setSelectedProject(project)}
            />
          ))}
        </div>

        {/* Invisible marker - loads the next batch once it scrolls into view */}
        {projects && visibleCount < projects.length && <div ref={sentinelRef} className="project-grid-sentinel" />}
      </div>

      {/* Mobile-only: tappable list, opens a popup with the full card */}
      <ul className="project-mobile-list">
        {!projects &&
          Array.from({ length: BATCH_SIZE }).map((_, index) => (
            <li key={index} className="project-mobile-item project-mobile-item-skeleton">
              <div style={{ width: '100%' }}>
                <div className="skeleton-block skeleton-line skeleton-line--name" />
                <div className="skeleton-block skeleton-line skeleton-line--tech" />
              </div>
            </li>
          ))}
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
