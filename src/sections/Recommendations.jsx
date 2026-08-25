import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from '../i18n/TranslationProvider'
import RecommendationForm from '../components/UI/RecommendationForm'

export default function Recommendations() {
  const { t } = useTranslation()
  const [recommendations, setRecommendations] = useState(null)
  const [loading, setLoading] = useState(true)

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

  return (
    <div className="card recommendations" style={{ animation: 'cardIn 0.5s cubic-bezier(.22,1,.36,1) both' }}>
      <RecommendationForm onSubmitted={fetchRecommendations} />

      {!loading && recommendations && recommendations.length === 0 && (
        <p className="project-ratings-empty">{t('recommendations.noneYet')}</p>
      )}

      {!loading && recommendations && recommendations.length > 0 && (
        <ul className="recommendation-list">
          {recommendations.map((rec) => (
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
