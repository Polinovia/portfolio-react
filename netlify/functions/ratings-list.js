const { sql } = require('./_db')

const SLUG_RE = /^[a-z0-9-]+$/
const JSON_HEADERS = { 'Content-Type': 'application/json' }

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  const projectSlug = event.queryStringParameters && event.queryStringParameters.project

  if (typeof projectSlug !== 'string' || !SLUG_RE.test(projectSlug)) {
    return { statusCode: 400, headers: JSON_HEADERS, body: JSON.stringify({ error: 'Invalid or missing project query param' }) }
  }

  try {
    const comments = await sql`
      select stars, comment, author_name, created_at
      from project_ratings
      where project_slug = ${projectSlug} and approved = true
      order by created_at desc
    `

    const [stats] = await sql`
      select avg(stars)::numeric(3,2) as avg, count(*)::int as count
      from project_ratings
      where project_slug = ${projectSlug} and approved = true
    `

    return {
      statusCode: 200,
      headers: JSON_HEADERS,
      body: JSON.stringify({
        average: stats.avg !== null ? Number(stats.avg) : null,
        count: stats.count,
        comments: comments.map((row) => ({
          stars: row.stars,
          comment: row.comment,
          authorName: row.author_name,
          createdAt: row.created_at,
        })),
      }),
    }
  } catch (err) {
    return { statusCode: 500, headers: JSON_HEADERS, body: JSON.stringify({ error: 'Could not load ratings' }) }
  }
}
