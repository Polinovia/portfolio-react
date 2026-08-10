import { useState } from 'react'
import { useTranslation } from '../../i18n/TranslationProvider'
import RatingStars from './RatingStars'

export default function RatingForm({ projectSlug, onSubmitted }) {
  const { t } = useTranslation()
  const [stars, setStars] = useState(0)
  const [comment, setComment] = useState('')
  const [authorName, setAuthorName] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [status, setStatus] = useState('idle') // idle | submitting | done | error

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (stars < 1) {
      setStatus('error')
      return
    }

    setStatus('submitting')
    try {
      const res = await fetch('/.netlify/functions/ratings-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectSlug, stars, comment, authorName, honeypot }),
      })
      if (!res.ok) throw new Error('submit failed')

      setStatus('done')
      setStars(0)
      setComment('')
      setAuthorName('')
      if (onSubmitted) onSubmitted()
    } catch {
      setStatus('error')
    }
  }

  if (status === 'done') {
    return <p className="rating-form-thanks">{t('ratings.thanks')}</p>
  }

  return (
    <form className="rating-form" onSubmit={handleSubmit}>
      <div className="rating-form-row">
        <span className="rating-form-label">{t('ratings.yourRating')}</span>
        <RatingStars value={stars} onChange={setStars} size="lg" />
      </div>

      <textarea
        className="rating-form-textarea"
        placeholder={t('ratings.commentPlaceholder')}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        maxLength={500}
        rows={3}
      />

      <input
        type="text"
        className="rating-form-name"
        placeholder={t('ratings.nameOptional')}
        value={authorName}
        onChange={(e) => setAuthorName(e.target.value)}
        maxLength={60}
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
          {stars < 1 ? t('ratings.errorStars') : t('ratings.errorGeneric')}
        </p>
      )}

      <button type="submit" className="rating-form-submit" disabled={status === 'submitting'}>
        {status === 'submitting' ? t('ratings.submitting') : t('ratings.submit')}
      </button>
    </form>
  )
}
