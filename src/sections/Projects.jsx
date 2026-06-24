
import { useState } from 'react'
import { useTranslation } from '../i18n/TranslationProvider'
import ProjectCard from '../components/UI/Projectcard'

// ── Filter tabs ────────────────────────────────
// Each object = one filter button.
// - id:    used to match project.category
// - label: text shown on the button
// - icon:  small SVG icon (optional but nice)
const FILTERS = (t = () => ({})) => [
  {
    id: 'all',
    label: t('filters.all') || 'All',
    icon: null,
  },
  {
    id: 'design',
    label: t('filters.design') || 'Design',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <path d="M9 9h6M9 12h6M9 15h4" />
      </svg>
    ),
  },
  {
    id: 'dev',
    label: t('filters.dev') || 'Dev',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
  },
  {
    id: 'wordpress',
    label: t('filters.wordpress') || 'WordPress',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" />
      </svg>
    ),
  },
]

// ── Projects data ──────────────────────────────
// Each object = one project card.
// - name:     project title
// - tech:     tech stack shown below the name
// - category: must match a filter id ('design' | 'dev' | 'wordpress')
// - dotColor: color of the glowing dot on the right
const PROJECTS = [
  // Design projects
  {
    name: 'Portfolio v2',
    tech: 'Figma · Auto Layout · Prototype',
    category: 'design',
    dotColor: '#9c5cdf',
  },
  {
    name: 'Mobile App UI',
    tech: 'Figma · Components · Lottie',
    category: 'design',
    dotColor: '#9c5cdf',
  },
  // Dev projects
  {
    name: 'Dashboard UI',
    tech: 'React · Tailwind · Chart.js',
    category: 'dev',
    dotColor: '#5c7cdf',
  },
  {
    name: 'Custom CMS',
    tech: 'PHP · MySQL · REST API',
    category: 'dev',
    dotColor: '#5c7cdf',
  },
  {
    name: '3D Landing Page',
    tech: 'Three.js · GSAP · WebGL',
    category: 'dev',
    dotColor: '#5cbf9c',
  },
  // WordPress projects
  {
    name: 'Business Website',
    tech: 'WordPress · ACF · Custom Theme',
    category: 'wordpress',
    dotColor: '#bf9c5c',
  },
  {
    name: 'E-commerce Store',
    tech: 'WooCommerce · PHP · Elementor',
    category: 'wordpress',
    dotColor: '#bf9c5c',
  },
]

export default function Projects({ t }) {
  // activeFilter stores the currently selected filter tab.
  // 'all' is the default — shows every project.
  const [activeFilter, setActiveFilter] = useState('all')
  const { t: ctxT } = useTranslation()
  const translate = t || ctxT

  // filteredProjects returns only the projects that match
  // the active filter. If 'all' is selected, show everything.
  const filteredProjects = PROJECTS.filter(project =>
    activeFilter === 'all' || project.category === activeFilter
  )

  return (
    <div>

      {/* ── Filter tabs ── */}
      <div className="filter-tabs">
        {FILTERS(translate).map(filter => (
          <button
            key={filter.id}
            className={`filter-btn${activeFilter === filter.id ? ' active' : ''}`}
            onClick={() => setActiveFilter(filter.id)}
          >
            {/* Show icon only if the filter has one */}
            {filter.icon && filter.icon}
            {filter.label}
          </button>
        ))}
      </div>

      {/* ── Project cards ── */}
      {/* key={activeFilter} makes cards re-animate when filter changes */}
      <div key={activeFilter}>
        {filteredProjects.map((project, index) => (
          <ProjectCard
            key={project.name}
            name={project.name}
            tech={project.tech}
            category={project.category}
            dotColor={project.dotColor}
            // Stagger animation delay based on position in filtered list
            delay={index * 0.07}
          />
        ))}
      </div>

    </div>
  )
}