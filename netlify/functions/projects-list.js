const { sql } = require('./_db')

const JSON_HEADERS = { 'Content-Type': 'application/json' }

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  try {
    const rows = await sql`
      select slug, name, tech, description, category, folder, url, preview_url, figma_url, image
      from projects
      order by sort_order asc
    `

    return {
      statusCode: 200,
      headers: JSON_HEADERS,
      body: JSON.stringify({
        projects: rows.map((row) => ({
          slug: row.slug,
          name: row.name,
          tech: row.tech,
          description: row.description,
          category: row.category,
          folder: row.folder,
          url: row.url,
          previewUrl: row.preview_url,
          figmaUrl: row.figma_url,
          image: row.image,
        })),
      }),
    }
  } catch (err) {
    return { statusCode: 500, headers: JSON_HEADERS, body: JSON.stringify({ error: 'Could not load projects' }) }
  }
}
