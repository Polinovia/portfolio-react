import { useState } from 'react'
import ProjectCard from '../components/UI/Projectcard'

// ── Projects data ──────────────────────────────
// Each object = one project card.
// - name:     project title
// - tech:     tech stack shown below the name
// - category: 'dev' | 'design' — used for the badge color
// - folder:   which tech-stack dossier the project is filed under
// - dotColor: color of the glowing dot on the right
const PROJECTS = [
  {
    name: 'NezZen',
    tech: 'Figma · UI Design',
    category: 'design',
    folder: 'Figma',
    dotColor: '#bf9c5c',
    url: 'https://www.figma.com/design/9FhPm5Ric9S2FQj2Syr1J6/NezZen?node-id=0-1&t=6BQBuoPJaaO8kriO-1',
  },
  {
    name: 'Portfolio',
    tech: 'Figma · UI Design',
    category: 'design',
    folder: 'Figma',
    dotColor: '#bf9c5c',
    url: 'https://www.figma.com/design/a3iytrjfRqUQUAZfDZg4Mq/Portfolio?node-id=0-1&t=UVWcuWniWx7Z3pIY-1',
  },
  {
    name: '12.05',
    tech: 'HTML · Landing Page',
    category: 'dev',
    folder: 'HTML',
    dotColor: '#9c5cdf',
    url: 'https://github.com/Polinovia/12.05',
  },
  {
    name: '15.05',
    tech: 'JavaScript · Interaction',
    category: 'dev',
    folder: 'JavaScript',
    dotColor: '#9c5cdf',
    url: 'https://github.com/Polinovia/15.05',
  },
  {
    name: 'airport',
    tech: 'React · API · UI',
    category: 'dev',
    folder: 'React',
    dotColor: '#5c7cdf',
    url: 'https://github.com/Polinovia/airport',
    previewUrl: 'https://courir-ex.netlify.app/',
  },
  {
    name: 'articles-vue',
    tech: 'Vue · Content · Articles',
    category: 'dev',
    folder: 'Vue',
    dotColor: '#5c7cdf',
    url: 'https://github.com/Polinovia/articles-vue',
    previewUrl: 'https://pwa-vue-polina.netlify.app/',
  },
  {
    name: 'exercice-front',
    tech: 'JavaScript · Game · UI',
    category: 'dev',
    folder: 'JavaScript',
    dotColor: '#5c7cdf',
    url: 'https://github.com/Polinovia/exercice-front',
    previewUrl: 'https://jeuphrasesbevz.netlify.app/',
  },
  {
    name: 'front_quiestla',
    tech: 'Vue · Responsive · UI',
    category: 'dev',
    folder: 'Vue',
    dotColor: '#5c7cdf',
    url: 'https://github.com/Polinovia/front_quiestla',
    previewUrl: 'https://quiestla-polina.netlify.app/',
  },
  {
    name: 'jamstack-nuxt',
    tech: 'Nuxt · Jamstack · Static',
    category: 'dev',
    folder: 'Nuxt',
    dotColor: '#5cbf9c',
    url: 'https://github.com/Polinovia/jamstack-nuxt',
    previewUrl: 'https://nuxtdyn.netlify.app/',
  },
  {
    name: 'my-nuxt-auth',
    tech: 'Nuxt · Auth · SSR',
    category: 'dev',
    folder: 'Nuxt',
    dotColor: '#5cbf9c',
    url: 'https://github.com/Polinovia/my-nuxt-auth',
  },
  {
    name: 'notif_avec_vue',
    tech: 'Vue · Notifications · UI',
    category: 'dev',
    folder: 'Vue',
    dotColor: '#5cbf9c',
    url: 'https://github.com/Polinovia/notif_avec_vue',
  },
  {
    name: 'php-demo',
    tech: 'PHP · Demo · Backend',
    category: 'dev',
    folder: 'PHP',
    dotColor: '#5cbf9c',
    url: 'https://github.com/Polinovia/php-demo',
  },
  {
    name: 'React',
    tech: 'React · Web App',
    category: 'dev',
    folder: 'React',
    dotColor: '#5cbf9c',
    url: 'https://github.com/Polinovia/React',
  },
  {
    name: 'wf12-pwa-bpi',
    tech: 'PWA · Service Workers · Offline',
    category: 'dev',
    folder: 'PWA',
    dotColor: '#5cbf9c',
    url: 'https://github.com/Polinovia/wf12-pwa-bpi',
    previewUrl: 'https://wf12-pwa-bpi.netlify.app/',
  },
]

// Folder display order — keeps the list stable instead of relying on
// first-seen order in PROJECTS.
const FOLDER_ORDER = ['React', 'Vue', 'Nuxt', 'JavaScript', 'HTML', 'PHP', 'PWA', 'Figma']

// Group projects by their `folder` field, following FOLDER_ORDER.
const FOLDERS = FOLDER_ORDER
  .map(name => ({ name, projects: PROJECTS.filter(p => p.folder === name) }))
  .filter(folder => folder.projects.length > 0)

export default function Projects() {
  // openFolder holds the name of the currently expanded folder (only one at a time).
  const [openFolder, setOpenFolder] = useState(null)

  return (
    <div>
      {FOLDERS.map((folder, index) => {
        const isOpen = openFolder === folder.name
        return (
          <div
            key={folder.name}
            className="project-folder"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <button
              type="button"
              className={`project-folder-header${isOpen ? ' open' : ''}`}
              onClick={() => setOpenFolder(isOpen ? null : folder.name)}
              aria-expanded={isOpen}
            >
              <svg className="project-folder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
              </svg>

              <span className="project-folder-name">{folder.name}</span>
              <span className="project-folder-count">{folder.projects.length}</span>

              <svg className="project-folder-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 6 15 12 9 18" />
              </svg>
            </button>

            {isOpen && (
              <div className="project-folder-body">
                {folder.projects.map((project, projectIndex) => (
                  <ProjectCard
                    key={project.name}
                    name={project.name}
                    tech={project.tech}
                    category={project.category}
                    dotColor={project.dotColor}
                    url={project.url}
                    previewUrl={project.previewUrl}
                    delay={projectIndex * 0.05}
                  />
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
