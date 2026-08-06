import { useState } from 'react'
import ProjectCard from '../components/UI/Projectcard'

// ── Projects data ──────────────────────────────
// Each object = one project card.
// - name:        project title
// - tech:        tech stack shown below the name
// - description: one-line summary of what the project does
// - category:    'dev' | 'design' - used for the badge color
// - folder:      which tech-stack dossier the project is filed under
// - url:         GitHub (or Figma) link
// - previewUrl:  live demo link, if there is one
const PROJECTS = [
  {
    name: 'NezZen',
    tech: 'Figma · UI Design',
    description: 'New UI design proposal for the NezZen product, built and iterated on in Figma.',
    category: 'design',
    folder: 'Figma',
    url: 'https://www.figma.com/design/9FhPm5Ric9S2FQj2Syr1J6/NezZen?node-id=0-1&t=6BQBuoPJaaO8kriO-1',
  },
  {
    name: 'Portfolio',
    tech: 'Figma · UI Design',
    description: 'Figma design mockups for this very portfolio, before it became a React app.',
    category: 'design',
    folder: 'Figma',
    url: 'https://www.figma.com/design/a3iytrjfRqUQUAZfDZg4Mq/Portfolio?node-id=0-1&t=UVWcuWniWx7Z3pIY-1',
  },
  {
    name: '12.05',
    tech: 'HTML · Landing Page',
    description: 'A static landing page built with plain HTML/CSS to practice layout fundamentals.',
    category: 'dev',
    folder: 'HTML',
    url: 'https://github.com/Polinovia/12.05',
  },
  {
    name: '15.05',
    tech: 'JavaScript · Interaction',
    description: 'A small JavaScript exercise focused on DOM manipulation and interactivity.',
    category: 'dev',
    folder: 'JavaScript',
    url: 'https://github.com/Polinovia/15.05',
  },
  {
    name: 'airport',
    tech: 'React · API · UI',
    description: 'A React app that browses flights via a public API with a clean, responsive UI.',
    category: 'dev',
    folder: 'React',
    url: 'https://github.com/Polinovia/airport',
    previewUrl: 'https://courir-ex.netlify.app/',
  },
  {
    name: 'articles-vue',
    tech: 'Vue · Content · Articles',
    description: 'A Vue app for browsing and reading articles, with a focus on content layout.',
    category: 'dev',
    folder: 'Vue',
    url: 'https://github.com/Polinovia/articles-vue',
    previewUrl: 'https://pwa-vue-polina.netlify.app/',
  },
  {
    name: 'exercice-front',
    tech: 'JavaScript · Game · UI',
    description: 'A small JavaScript game exercise built to practice logic and UI state.',
    category: 'dev',
    folder: 'JavaScript',
    url: 'https://github.com/Polinovia/exercice-front',
    previewUrl: 'https://jeuphrasesbevz.netlify.app/',
  },
  {
    name: 'front_quiestla',
    tech: 'Vue · Responsive · UI',
    description: 'A responsive Vue front-end built around a "who is it" style UI.',
    category: 'dev',
    folder: 'Vue',
    url: 'https://github.com/Polinovia/front_quiestla',
    previewUrl: 'https://quiestla-polina.netlify.app/',
  },
  {
    name: 'jamstack-nuxt',
    tech: 'Nuxt · Jamstack · Static',
    description: 'A statically generated Jamstack site built with Nuxt.',
    category: 'dev',
    folder: 'Nuxt',
    url: 'https://github.com/Polinovia/jamstack-nuxt',
    previewUrl: 'https://nuxtdyn.netlify.app/',
  },
  {
    name: 'my-nuxt-auth',
    tech: 'Nuxt · Auth · SSR',
    description: 'A Nuxt app exploring server-side rendering with authenticated routes.',
    category: 'dev',
    folder: 'Nuxt',
    url: 'https://github.com/Polinovia/my-nuxt-auth',
  },
  {
    name: 'notif_avec_vue',
    tech: 'Vue · Notifications · UI',
    description: 'A Vue app demonstrating a real-time notification system and UI.',
    category: 'dev',
    folder: 'Vue',
    url: 'https://github.com/Polinovia/notif_avec_vue',
  },
  {
    name: 'php-demo',
    tech: 'PHP · Demo · Backend',
    description: 'A small PHP backend demo covering basic server-side logic.',
    category: 'dev',
    folder: 'PHP',
    url: 'https://github.com/Polinovia/php-demo',
  },
  {
    name: 'React',
    tech: 'React · Web App',
    description: 'A React practice repo used to explore components, hooks and routing.',
    category: 'dev',
    folder: 'React',
    url: 'https://github.com/Polinovia/React',
  },
  {
    name: 'wf12-pwa-bpi',
    tech: 'PWA · Service Workers · Offline',
    description: 'A Progressive Web App with offline support via service workers.',
    category: 'dev',
    folder: 'PWA',
    url: 'https://github.com/Polinovia/wf12-pwa-bpi',
    previewUrl: 'https://wf12-pwa-bpi.netlify.app/',
  },
]

// Folder display order - keeps the list stable instead of relying on
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
              <div className="project-folder-body project-grid">
                {folder.projects.map((project, projectIndex) => (
                  <ProjectCard
                    key={project.name}
                    name={project.name}
                    tech={project.tech}
                    description={project.description}
                    category={project.category}
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
