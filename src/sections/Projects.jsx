
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
    id: 'design',
    label: t('filters.design') || 'Design',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <path d="M9 9h6M9 12h6M9 15h4" />
      </svg>
    ),
  },
]

// ── Projects data ──────────────────────────────
// Each object = one project card.
// - name:     project title
// - tech:     tech stack shown below the name
// - category: must match a filter id ('dev' | 'design')
// - dotColor: color of the glowing dot on the right
const PROJECTS = [
  {
    name: 'NezZen',
    tech: 'Figma · UI Design',
    category: 'design',
    dotColor: '#bf9c5c',
    url: 'https://www.figma.com/design/9FhPm5Ric9S2FQj2Syr1J6/NezZen?node-id=0-1&t=6BQBuoPJaaO8kriO-1',
  },
  {
    name: 'Portfolio',
    tech: 'Figma · UI Design',
    category: 'design',
    dotColor: '#bf9c5c',
    url: 'https://www.figma.com/design/a3iytrjfRqUQUAZfDZg4Mq/Portfolio?node-id=0-1&t=UVWcuWniWx7Z3pIY-1',
  },
  {
    name: '12.05',
    tech: 'HTML · Landing Page',
    category: 'dev',
    dotColor: '#9c5cdf',
    url: 'https://github.com/Polinovia/12.05',
  },
  {
    name: '15.05',
    tech: 'JavaScript · Interaction',
    category: 'dev',
    dotColor: '#9c5cdf',
    url: 'https://github.com/Polinovia/15.05',
  },
  {
    name: 'airport',
    tech: 'React · API · UI',
    category: 'dev',
    dotColor: '#5c7cdf',
    url: 'https://github.com/Polinovia/airport',
    previewUrl: 'https://courir-ex.netlify.app/',
  },
  {
    name: 'articles-vue',
    tech: 'Vue · Content · Articles',
    category: 'dev',
    dotColor: '#5c7cdf',
    url: 'https://github.com/Polinovia/articles-vue',
    previewUrl: 'https://pwa-vue-polina.netlify.app/',
  },
  {
    name: 'exercice-front',
    tech: 'JavaScript · Game · UI',
    category: 'dev',
    dotColor: '#5c7cdf',
    url: 'https://github.com/Polinovia/exercice-front',
    previewUrl: 'https://jeuphrasesbevz.netlify.app/',
  },
  {
    name: 'front_quiestla',
    tech: 'Vue · Responsive · UI',
    category: 'dev',
    dotColor: '#5c7cdf',
    url: 'https://github.com/Polinovia/front_quiestla',
    previewUrl: 'https://quiestla-polina.netlify.app/',
  },
  {
    name: 'jamstack-nuxt',
    tech: 'Nuxt · Jamstack · Static',
    category: 'dev',
    dotColor: '#5cbf9c',
    url: 'https://github.com/Polinovia/jamstack-nuxt',
    previewUrl: 'https://nuxtdyn.netlify.app/',
  },
  {
    name: 'my-nuxt-auth',
    tech: 'Nuxt · Auth · SSR',
    category: 'dev',
    dotColor: '#5cbf9c',
    url: 'https://github.com/Polinovia/my-nuxt-auth',
  },
  {
    name: 'notif_avec_vue',
    tech: 'Vue · Notifications · UI',
    category: 'dev',
    dotColor: '#5cbf9c',
    url: 'https://github.com/Polinovia/notif_avec_vue',
  },
  {
    name: 'php-demo',
    tech: 'PHP · Demo · Backend',
    category: 'dev',
    dotColor: '#5cbf9c',
    url: 'https://github.com/Polinovia/php-demo',
  },
  {
    name: 'React',
    tech: 'React · Web App',
    category: 'dev',
    dotColor: '#5cbf9c',
    url: 'https://github.com/Polinovia/React',
  },
  {
    name: 'wf12-pwa-bpi',
    tech: 'PWA · Service Workers · Offline',
    category: 'dev',
    dotColor: '#5cbf9c',
    url: 'https://github.com/Polinovia/wf12-pwa-bpi',
    previewUrl: 'https://wf12-pwa-bpi.netlify.app/',
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
            url={project.url}
            previewUrl={project.previewUrl}
            // Stagger animation delay based on position in filtered list
            delay={index * 0.07}
          />
        ))}
      </div>

    </div>
  )
}