const JOBS = [
  { role: 'Développeur front-end', company: 'CEPEGRA · Formation', period: 'May 2025 – Dec 2025' },
  { role: 'Développeur front-end', company: 'PlayZone', period: 'Nov 2025 – Dec 2025' },
  { role: 'Designer Web', company: 'Sante Group Companies · Internship', period: 'Sep 2023 – Dec 2023' },
  { role: 'Junior Programmer', company: 'Fozzy Group · Internship', period: 'Sep 2019 – May 2020' },
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