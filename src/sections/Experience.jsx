import { useTranslation } from '../i18n/TranslationProvider'

export default function Experience() {
  const { t } = useTranslation()
  const JOBS = t('jobs')

  return (
    <div className="card">
      {JOBS.map((job, index) => (
        <div
          key={index}
          className="job-row"
          // Stagger: each row appears slightly after the previous one
          style={{ animationDelay: `${index * 0.07}s` }}
        >
          {/* Left side: role + company */}
          <div>
            <div className="job-title">{job.role}</div>
            <div className="job-company">{job.company}</div>
          </div>

          {/* Right side: time period badge */}
          <span className="period-tag">{job.period}</span>
        </div>
      ))}
    </div>
  )
}