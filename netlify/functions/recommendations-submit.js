const { sql } = require('./_db')
const { notifyPendingRecommendation } = require('./_notify')

const MAX_NAME = 60
const MAX_RELATIONSHIP = 60
const MAX_COMMENT = 800
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

  const { authorName, relationship, comment, honeypot } = payload

  // Honeypot tripped: pretend it worked, but don't write anything.
  if (honeypot) {
    return { statusCode: 200, headers: JSON_HEADERS, body: JSON.stringify({ ok: true }) }
  }

  const trimmedName = typeof authorName === 'string' ? authorName.trim().slice(0, MAX_NAME) : ''
  if (trimmedName.length < 2) {
    return { statusCode: 400, headers: JSON_HEADERS, body: JSON.stringify({ error: 'Name is required' }) }
  }

  const trimmedComment = typeof comment === 'string' ? comment.trim().slice(0, MAX_COMMENT) : ''
  if (trimmedComment.length < 1) {
    return { statusCode: 400, headers: JSON_HEADERS, body: JSON.stringify({ error: 'Comment is required' }) }
  }

  const trimmedRelationship = typeof relationship === 'string' ? relationship.trim().slice(0, MAX_RELATIONSHIP) : null

  try {
    await sql`
      insert into recommendations (author_name, relationship, comment, approved)
      values (${trimmedName}, ${trimmedRelationship || null}, ${trimmedComment}, false)
    `

    const [{ count }] = await sql`select count(*)::int as count from recommendations where approved = false`
    try {
      await notifyPendingRecommendation({ authorName: trimmedName, pendingCount: count })
    } catch {
      // a broken email notification should never fail the actual submission
    }

    return { statusCode: 201, headers: JSON_HEADERS, body: JSON.stringify({ message: 'submitted, pending review' }) }
  } catch (err) {
    return { statusCode: 500, headers: JSON_HEADERS, body: JSON.stringify({ error: 'Could not save recommendation' }) }
  }
}
