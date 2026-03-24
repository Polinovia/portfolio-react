const JOBS = [
  { role: 'UI/UX Designer', company: 'Freelance', period: '2024 – Present' },
  { role: 'Front-end Developer', company: 'Studio X', period: '2022 – 2024' },
  { role: 'Graphic Designer', company: 'Creative Co.', period: '2020 – 2022' },
]

export default function Experience() {
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