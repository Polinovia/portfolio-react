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

// Short monogram shown in the language badge - same grouping as FOLDER_LABELS/thumb-*
const LANG_MONOGRAM = {
  React: 'R',
  Vue: 'V',
  Nuxt: 'N',
  JavaScript: 'JS',
  TypeScript: 'TS',
  HTML: 'H',
  PHP: 'P',
  PWA: 'PWA',
  Figma: 'F',
}

// ~2 short sentences worth of preview text before the card cuts to "... details"
const CARD_DESCRIPTION_LENGTH = 140

// Cuts at the last full word before the limit, so the preview never ends mid-word.
function truncateAtWord(text, maxLength) {
  const cut = text.slice(0, maxLength)
  const lastSpace = cut.lastIndexOf(' ')
  return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trimEnd()
}

export default function ProjectCard({ name, tech, description, category, delay = 0, url, previewUrl, figmaUrl, image, folder, truncateDescription = false, onClick }) {
  const isTruncated = truncateDescription && description && description.length > CARD_DESCRIPTION_LENGTH
  const displayDescription = isTruncated ? `${truncateAtWord(description, CARD_DESCRIPTION_LENGTH)}...` : description
  const folderKey = (folder || 'other').toLowerCase()

  return (
    <div
      className="project-card"
      // animation-delay staggers the cards so they appear one by one
      style={{ animationDelay: `${delay}s` }}
      onClick={onClick}
    >
      {/* Preview: real screenshot if we have one, otherwise a tech-colored placeholder */}
      {image ? (
        <div className="project-thumb">
          <img src={image} alt={`${name} preview`} loading="lazy" />
        </div>
      ) : (
        <div className={`project-thumb project-thumb-placeholder thumb-${folderKey}`}>
          <span>{FOLDER_LABELS[folder] || folder}</span>
        </div>
      )}

      {/* Top row: category badge + language icon (which language the project is written in) */}
      <div className="project-card-top">
        <span className={`project-cat-badge ${category}`}>
          {BADGE_LABELS[category] || category}
        </span>
        {folder && (
          <span className={`lang-icon thumb-${folderKey}`} title={folder}>
            {LANG_MONOGRAM[folder] || folder.slice(0, 2)}
          </span>
        )}
      </div>

      {/* Title */}
      <div className="project-name">{name}</div>

      {/* Tech stack */}
      <div className="project-tech">{tech}</div>

      {/* Description */}
      {description && (
        <p className="project-description">
          {displayDescription}
          {isTruncated && <span className="project-description-more"> details</span>}
        </p>
      )}

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
