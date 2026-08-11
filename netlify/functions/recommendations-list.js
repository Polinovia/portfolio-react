const { sql } = require('./_db')

const JSON_HEADERS = { 'Content-Type': 'application/json' }

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  try {
    const rows = await sql`
      select author_name, relationship, comment, created_at
      from recommendations
      where approved = true
      order by created_at desc
    `

    return {
      statusCode: 200,
      headers: JSON_HEADERS,
      body: JSON.stringify({
        recommendations: rows.map((row) => ({
          authorName: row.author_name,
          relationship: row.relationship,
          comment: row.comment,
          createdAt: row.created_at,
        })),
      }),
    }
  } catch (err) {
    return { statusCode: 500, headers: JSON_HEADERS, body: JSON.stringify({ error: 'Could not load recommendations' }) }
  }
}
