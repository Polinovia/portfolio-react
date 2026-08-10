const STAR_VALUES = [1, 2, 3, 4, 5]

// Two modes:
// - display (default): read-only, shows `value` filled stars (supports decimals like 4.3)
// - interactive: pass onChange to let the user pick a 1-5 rating
export default function RatingStars({ value = 0, onChange, size = 'md' }) {
  const interactive = typeof onChange === 'function'

  return (
    <div className={`rating-stars rating-stars--${size}${interactive ? ' rating-stars--interactive' : ''}`}>
      {STAR_VALUES.map((star) => {
        const filled = star <= Math.round(value)
        return (
          <span
            key={star}
            className={`rating-star${filled ? ' filled' : ''}`}
            role={interactive ? 'button' : undefined}
            tabIndex={interactive ? 0 : undefined}
            aria-label={interactive ? `${star} star${star > 1 ? 's' : ''}` : undefined}
            onClick={interactive ? () => onChange(star) : undefined}
            onKeyDown={interactive ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onChange(star)
              }
            } : undefined}
          >
            ★
          </span>
        )
      })}
    </div>
  )
}
