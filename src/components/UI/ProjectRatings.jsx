import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from '../../i18n/TranslationProvider'
import RatingStars from './RatingStars'
import RatingForm from './RatingForm'

export default function ProjectRatings({ projectSlug }) {
  const { t } = useTranslation()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchRatings = useCallback(() => {
    if (!projectSlug) return
    setLoading(true)
    fetch(`/.netlify/functions/ratings-list?project=${encodeURIComponent(projectSlug)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => setData(json))
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [projectSlug])

  useEffect(() => {
    fetchRatings()
  }, [fetchRatings])

  return (
    <div className="project-ratings">
      <div className="project-ratings-header">{t('ratings.title')}</div>

      {!loading && data && data.count > 0 && (
        <div className="project-ratings-summary">
          <RatingStars value={data.average || 0} />
          <span className="project-ratings-average-text">
            {data.average} {t('ratings.outOf5')} · {data.count}
          </span>
        </div>
      )}

      {!loading && (!data || data.count === 0) && (
        <p className="project-ratings-empty">{t('ratings.noRatingsYet')}</p>
      )}

      {!loading && data && data.comments.length > 0 && (
        <ul className="project-ratings-list">
          {data.comments.map((c) => (
            <li key={c.createdAt} className="project-ratings-item">
              <div className="project-ratings-item-top">
                <RatingStars value={c.stars} size="sm" />
                {c.authorName && <span className="project-ratings-item-name">{c.authorName}</span>}
              </div>
              {c.comment && <p className="project-ratings-item-comment">{c.comment}</p>}
            </li>
          ))}
        </ul>
      )}

      <RatingForm projectSlug={projectSlug} onSubmitted={fetchRatings} />
    </div>
  )
}
