const { sql } = require('./_db')
const { getAuthenticatedUser } = require('./_auth')

const JSON_HEADERS = { 'Content-Type': 'application/json' }

exports.handler = async (event, context) => {
  const user = getAuthenticatedUser(event, context)
  if (!user) {
    return { statusCode: 401, headers: JSON_HEADERS, body: JSON.stringify({ error: 'Not authenticated' }) }
  }

  if (event.httpMethod === 'GET') {
    try {
      const pending = await sql`
        select id, project_slug, stars, comment, author_name, created_at
        from project_ratings
        where approved = false
        order by created_at asc
      `
      return { statusCode: 200, headers: JSON_HEADERS, body: JSON.stringify({ pending }) }
    } catch (err) {
      return { statusCode: 500, headers: JSON_HEADERS, body: JSON.stringify({ error: 'Could not load pending ratings' }) }
    }
  }

  if (event.httpMethod === 'POST') {
    let payload
    try {
      payload = JSON.parse(event.body || '{}')
    } catch {
      return { statusCode: 400, headers: JSON_HEADERS, body: JSON.stringify({ error: 'Invalid JSON body' }) }
    }

    const { id, action } = payload
    const idNum = Number(id)
    if (!Number.isInteger(idNum) || (action !== 'approve' && action !== 'reject')) {
      return { statusCode: 400, headers: JSON_HEADERS, body: JSON.stringify({ error: 'Invalid id or action' }) }
    }

    try {
      if (action === 'approve') {
        await sql`update project_ratings set approved = true where id = ${idNum}`
      } else {
        await sql`delete from project_ratings where id = ${idNum}`
      }
      return { statusCode: 200, headers: JSON_HEADERS, body: JSON.stringify({ ok: true }) }
    } catch (err) {
      return { statusCode: 500, headers: JSON_HEADERS, body: JSON.stringify({ error: 'Could not update rating' }) }
    }
  }

  return { statusCode: 405, body: 'Method Not Allowed' }
}
