const { sql } = require('./_db')

const JSON_HEADERS = { 'Content-Type': 'application/json' }

exports.handler = async (event, context) => {
  const user = context.clientContext && context.clientContext.user
  if (!user) {
    return { statusCode: 401, headers: JSON_HEADERS, body: JSON.stringify({ error: 'Not authenticated' }) }
  }

  if (event.httpMethod === 'GET') {
    try {
      const pending = await sql`
        select id, author_name, relationship, comment, created_at
        from recommendations
        where approved = false
        order by created_at asc
      `
      return { statusCode: 200, headers: JSON_HEADERS, body: JSON.stringify({ pending }) }
    } catch (err) {
      return { statusCode: 500, headers: JSON_HEADERS, body: JSON.stringify({ error: 'Could not load pending recommendations' }) }
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
        await sql`update recommendations set approved = true where id = ${idNum}`
      } else {
        await sql`delete from recommendations where id = ${idNum}`
      }
      return { statusCode: 200, headers: JSON_HEADERS, body: JSON.stringify({ ok: true }) }
    } catch (err) {
      return { statusCode: 500, headers: JSON_HEADERS, body: JSON.stringify({ error: 'Could not update recommendation' }) }
    }
  }

  return { statusCode: 405, body: 'Method Not Allowed' }
}
