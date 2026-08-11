const { sql } = require('./_db')
const { notifyPendingRating } = require('./_notify')

const SLUG_RE = /^[a-z0-9-]+$/
const MAX_COMMENT = 500
const MAX_NAME = 60
const JSON_HEADERS = { 'Content-Type': 'application/json' }

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  let payload
  try {
    payload = JSON.parse(event.body || '{}')
  } catch {
    return { statusCode: 400, headers: JSON_HEADERS, body: JSON.stringify({ error: 'Invalid JSON body' }) }
  }

  const { projectSlug, stars, comment, authorName, honeypot } = payload

  // Honeypot tripped: pretend it worked, but don't write anything.
  if (honeypot) {
    return { statusCode: 200, headers: JSON_HEADERS, body: JSON.stringify({ ok: true }) }
  }

  if (typeof projectSlug !== 'string' || !SLUG_RE.test(projectSlug)) {
    return { statusCode: 400, headers: JSON_HEADERS, body: JSON.stringify({ error: 'Invalid projectSlug' }) }
  }

  const starsNum = Number(stars)
  if (!Number.isInteger(starsNum) || starsNum < 1 || starsNum > 5) {
    return { statusCode: 400, headers: JSON_HEADERS, body: JSON.stringify({ error: 'stars must be an integer between 1 and 5' }) }
  }

  const trimmedComment = typeof comment === 'string' ? comment.trim().slice(0, MAX_COMMENT) : null
  const trimmedName = typeof authorName === 'string' ? authorName.trim().slice(0, MAX_NAME) : null

  try {
    await sql`
      insert into project_ratings (project_slug, stars, comment, author_name, approved)
      values (${projectSlug}, ${starsNum}, ${trimmedComment || null}, ${trimmedName || null}, false)
    `

    const [{ count }] = await sql`select count(*)::int as count from project_ratings where approved = false`
    try {
      await notifyPendingRating({ projectSlug, stars: starsNum, pendingCount: count })
    } catch {
      // a broken email notification should never fail the actual submission
    }

    return { statusCode: 201, headers: JSON_HEADERS, body: JSON.stringify({ message: 'submitted, pending review' }) }
  } catch (err) {
    return { statusCode: 500, headers: JSON_HEADERS, body: JSON.stringify({ error: 'Could not save rating' }) }
  }
}
