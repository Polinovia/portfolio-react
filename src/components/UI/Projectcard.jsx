const BADGE_LABELS = {
  design: 'Figma',
  dev: 'Front-end',
  wordpress: 'WordPress',
}

export default function ProjectCard({ name, tech, category, dotColor, delay = 0, url, previewUrl }) {
  return (
    <div
      className="project-card"
      // animation-delay staggers the cards so they appear one by one
      style={{ animationDelay: `${delay}s` }}
    >
      <a
        href={url || previewUrl || '#'}
        target="_blank"
        rel="noreferrer"
        className="project-card-main"
      >
        {/* Left side: badge + name + tech stack */}
        <div className="project-left">

          {/* Category badge — color depends on the category prop */}
          <span className={`project-cat-badge ${category}`}>
            {BADGE_LABELS[category] || category}
          </span>

          {/* Project name */}
          <div className="project-name">{name}</div>

          {/* Tech stack (e.g. "React · Figma · Motion") */}
          <div className="project-tech">{tech}</div>

        </div>

        {/* Right side: colored glowing dot */}
        <div
          className="project-dot"
          style={{
            background: dotColor,
            color: dotColor, // color is used by box-shadow: 0 0 8px currentColor in CSS
          }}
        />
      </a>

      <div className="project-actions">
        <a href={url || '#'} target="_blank" rel="noreferrer" className="project-link">
          Repo
        </a>
        {previewUrl && (
          <a href={previewUrl} target="_blank" rel="noreferrer" className="project-link project-link--preview">
            Preview
          </a>
        )}
      </div>
    </div>
  )
}