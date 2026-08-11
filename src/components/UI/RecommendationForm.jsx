import { useState } from 'react'
import { useTranslation } from '../../i18n/TranslationProvider'

export default function RecommendationForm({ onSubmitted }) {
  const { t } = useTranslation()
  const [authorName, setAuthorName] = useState('')
  const [relationship, setRelationship] = useState('')
  const [comment, setComment] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [status, setStatus] = useState('idle') // idle | submitting | done | error

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (authorName.trim().length < 2 || comment.trim().length < 1) {
      setStatus('error')
      return
    }

    setStatus('submitting')
    try {
      const res = await fetch('/.netlify/functions/recommendations-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authorName, relationship, comment, honeypot }),
      })
      if (!res.ok) throw new Error('submit failed')

      setStatus('done')
      setAuthorName('')
      setRelationship('')
      setComment('')
      if (onSubmitted) onSubmitted()
    } catch {
      setStatus('error')
    }
  }

  if (status === 'done') {
    return <p className="rating-form-thanks">{t('recommendations.thanks')}</p>
  }

  return (
    <form className="rating-form" onSubmit={handleSubmit}>
      <input
        type="text"
        className="rating-form-name"
        placeholder={t('recommendations.namePlaceholder')}
        value={authorName}
        onChange={(e) => setAuthorName(e.target.value)}
        maxLength={60}
        required
      />

      <input
        type="text"
        className="rating-form-name"
        placeholder={t('recommendations.relationshipPlaceholder')}
        value={relationship}
        onChange={(e) => setRelationship(e.target.value)}
        maxLength={60}
      />

      <textarea
        className="rating-form-textarea"
        placeholder={t('recommendations.commentPlaceholder')}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        maxLength={800}
        rows={4}
        required
      />

      {/* Honeypot: hidden from real visitors, catches naive bots.
          Deliberately NOT named "company"/"website"/etc - those are common
          autofill targets and a legit visitor's autofill could silently
          trip it, dropping their real submission. */}
      <input
        type="text"
        name="note_confirm_x1"
        className="rating-form-honeypot"
        tabIndex={-1}
        autoComplete="off"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        aria-hidden="true"
      />

      {status === 'error' && (
        <p className="rating-form-error">
          {authorName.trim().length < 2 ? t('recommendations.errorName') : t('recommendations.errorComment')}
        </p>
      )}

      <button type="submit" className="rating-form-submit" disabled={status === 'submitting'}>
        {status === 'submitting' ? t('recommendations.submitting') : t('recommendations.submit')}
      </button>
    </form>
  )
}
