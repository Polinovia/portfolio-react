const BADGE_LABELS = {
  design: 'Figma',
  dev: 'Front-end',
  wordpress: 'WordPress',
}

export default function ProjectCard({ name, tech, description, category, delay = 0, url, previewUrl }) {
  return (
    <div
      className="project-card"
      // animation-delay staggers the cards so they appear one by one
      style={{ animationDelay: `${delay}s` }}
    >
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
      <div className="project-actions">
        <a href={url || '#'} target="_blank" rel="noreferrer" className="project-link">
          Repo
        </a>
        {previewUrl && (
          <a href={previewUrl} target="_blank" rel="noreferrer" className="project-link project-link--preview">
            Demo
          </a>
        )}
      </div>
    </div>
  )
}
