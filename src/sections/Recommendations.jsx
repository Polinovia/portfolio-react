import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from '../i18n/TranslationProvider'
import RecommendationForm from '../components/UI/RecommendationForm'

export default function Recommendations() {
  const { t } = useTranslation()
  const [recommendations, setRecommendations] = useState(null)
  const [loading, setLoading] = useState(true)
  // Recommendations this browser just submitted, shown locally with a
  // "pending" badge until they're approved and returned by the server.
  const [pendingLocal, setPendingLocal] = useState([])

  const fetchRecommendations = useCallback(() => {
    setLoading(true)
    fetch('/.netlify/functions/recommendations-list')
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => setRecommendations(json ? json.recommendations : null))
      .catch(() => setRecommendations(null))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchRecommendations()
  }, [fetchRecommendations])

  const handleSubmitted = (draft) => {
    setPendingLocal((prev) => [...prev, { ...draft, key: `pending-${Date.now()}` }])
    fetchRecommendations()
  }

  const hasApproved = recommendations && recommendations.length > 0

  return (
    <div className="card recommendations" style={{ animation: 'cardIn 0.5s cubic-bezier(.22,1,.36,1) both' }}>
      <RecommendationForm onSubmitted={handleSubmitted} />

      {!loading && !hasApproved && pendingLocal.length === 0 && (
        <p className="project-ratings-empty">{t('recommendations.noneYet')}</p>
      )}

      {(pendingLocal.length > 0 || hasApproved) && (
        <ul className="recommendation-list">
          {pendingLocal.map((rec) => (
            <li key={rec.key} className="recommendation-item recommendation-item--pending">
              <div className="recommendation-item-top">
                <span className="recommendation-item-name">{rec.authorName}</span>
                {rec.relationship && <span className="recommendation-item-relationship">{rec.relationship}</span>}
                <span className="recommendation-status recommendation-status--pending">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="9" />
                    <polyline points="12,7 12,12 15,14" />
                  </svg>
                  {t('recommendations.pendingBadge')}
                </span>
              </div>
              <p className="recommendation-item-comment">{rec.comment}</p>
            </li>
          ))}
          {recommendations && recommendations.map((rec) => (
            <li key={rec.createdAt} className="recommendation-item">
              <div className="recommendation-item-top">
                <span className="recommendation-item-name">{rec.authorName}</span>
                {rec.relationship && <span className="recommendation-item-relationship">{rec.relationship}</span>}
              </div>
              <p className="recommendation-item-comment">{rec.comment}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
