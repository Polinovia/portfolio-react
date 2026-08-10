const BADGE_LABELS = {
  design: 'Figma',
  dev: 'Front-end',
  wordpress: 'WordPress',
}

// Tech-colored placeholder shown when a project has no real screenshot yet.
const FOLDER_LABELS = {
  React: 'React',
  Vue: 'Vue',
  Nuxt: 'Nuxt',
  JavaScript: 'JS',
  TypeScript: 'TS',
  HTML: 'HTML',
  PHP: 'PHP',
  PWA: 'PWA',
  Figma: 'Figma',
}

export default function ProjectCard({ name, tech, description, category, delay = 0, url, previewUrl, figmaUrl, image, folder }) {
  return (
    <div
      className="project-card"
      // animation-delay staggers the cards so they appear one by one
      style={{ animationDelay: `${delay}s` }}
    >
      {/* Preview: real screenshot if we have one, otherwise a tech-colored placeholder */}
      {image ? (
        <div className="project-thumb">
          <img src={image} alt={`${name} preview`} loading="lazy" />
        </div>
      ) : (
        <div className={`project-thumb project-thumb-placeholder thumb-${(folder || 'other').toLowerCase()}`}>
          <span>{FOLDER_LABELS[folder] || folder}</span>
        </div>
      )}

      {/* Top row: badge */}
      <div className="project-card-top">
        <span className={`project-cat-badge ${category}`}>
          {BADGE_LABELS[category] || category}
        </span>
      </div>

      {/* Title */}
      <div className="project-name">{name}</div>

      {/* Tech stack */}
      <div className="project-tech">{tech}</div>

      {/* Description */}
      {description && <p className="project-description">{description}</p>}

      {/* Links */}
      <div className="project-actions" onClick={(e) => e.stopPropagation()}>
        <a href={url || '#'} target="_blank" rel="noreferrer" className="project-link">
          Repo
        </a>
        {previewUrl && (
          <a href={previewUrl} target="_blank" rel="noreferrer" className="project-link project-link--preview">
            Demo
          </a>
        )}
        {figmaUrl && (
          <a href={figmaUrl} target="_blank" rel="noreferrer" className="project-link project-link--figma">
            Design
          </a>
        )}
      </div>
    </div>
  )
}
