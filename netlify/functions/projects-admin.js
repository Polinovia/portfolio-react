const { sql } = require('./_db')
const { getAuthenticatedUser } = require('./_auth')

const JSON_HEADERS = { 'Content-Type': 'application/json' }
const SLUG_RE = /^[a-z0-9-]+$/
const CATEGORIES = ['dev', 'design']

function clean(value, maxLen) {
  return typeof value === 'string' ? value.trim().slice(0, maxLen) : ''
}

function validateProject(payload) {
  const slug = clean(payload.slug, 60)
  const name = clean(payload.name, 100)
  const tech = clean(payload.tech, 150)
  const description = clean(payload.description, 1000)
  const category = payload.category
  const folder = clean(payload.folder, 60)
  const url = clean(payload.url, 500)
  const previewUrl = clean(payload.previewUrl, 500) || null
  const figmaUrl = clean(payload.figmaUrl, 500) || null
  const image = clean(payload.image, 500) || null

  if (!SLUG_RE.test(slug)) return { error: 'slug must contain only lowercase letters, numbers and hyphens' }
  if (!name) return { error: 'name is required' }
  if (!tech) return { error: 'tech is required' }
  if (!description) return { error: 'description is required' }
  if (!CATEGORIES.includes(category)) return { error: 'category must be dev or design' }
  if (!folder) return { error: 'folder is required' }
  if (!url) return { error: 'url is required' }

  return { value: { slug, name, tech, description, category, folder, url, previewUrl, figmaUrl, image } }
}

exports.handler = async (event, context) => {
  const user = getAuthenticatedUser(event, context)
  if (!user) {
    return { statusCode: 401, headers: JSON_HEADERS, body: JSON.stringify({ error: 'Not authenticated' }) }
  }

  if (event.httpMethod === 'GET') {
    try {
      const rows = await sql`
        select slug, name, tech, description, category, folder, url, preview_url, figma_url, image, sort_order
        from projects
        order by sort_order asc, slug asc
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
            sortOrder: row.sort_order,
          })),
        }),
      }
    } catch (err) {
      return { statusCode: 500, headers: JSON_HEADERS, body: JSON.stringify({ error: 'Could not load projects' }) }
    }
  }

  if (event.httpMethod === 'POST') {
    let payload
    try {
      payload = JSON.parse(event.body || '{}')
    } catch {
      return { statusCode: 400, headers: JSON_HEADERS, body: JSON.stringify({ error: 'Invalid JSON body' }) }
    }

    const { action } = payload

    if (action === 'delete') {
      const slug = clean(payload.slug, 60)
      if (!slug) {
        return { statusCode: 400, headers: JSON_HEADERS, body: JSON.stringify({ error: 'slug is required' }) }
      }
      try {
        await sql`delete from projects where slug = ${slug}`
        return { statusCode: 200, headers: JSON_HEADERS, body: JSON.stringify({ ok: true }) }
      } catch (err) {
        return { statusCode: 500, headers: JSON_HEADERS, body: JSON.stringify({ error: 'Could not delete project' }) }
      }
    }

    if (action === 'move') {
      const slug = clean(payload.slug, 60)
      const direction = payload.direction
      if (!slug || (direction !== 'up' && direction !== 'down')) {
        return { statusCode: 400, headers: JSON_HEADERS, body: JSON.stringify({ error: 'Invalid slug or direction' }) }
      }
      try {
        const rows = await sql`select slug, sort_order from projects order by sort_order asc, slug asc`
        const index = rows.findIndex((r) => r.slug === slug)
        if (index === -1) {
          return { statusCode: 404, headers: JSON_HEADERS, body: JSON.stringify({ error: 'Project not found' }) }
        }
        const swapIndex = direction === 'up' ? index - 1 : index + 1
        if (swapIndex < 0 || swapIndex >= rows.length) {
          return { statusCode: 200, headers: JSON_HEADERS, body: JSON.stringify({ ok: true }) }
        }
        const current = rows[index]
        const neighbor = rows[swapIndex]
        await sql`update projects set sort_order = ${neighbor.sort_order} where slug = ${current.slug}`
        await sql`update projects set sort_order = ${current.sort_order} where slug = ${neighbor.slug}`
        return { statusCode: 200, headers: JSON_HEADERS, body: JSON.stringify({ ok: true }) }
      } catch (err) {
        return { statusCode: 500, headers: JSON_HEADERS, body: JSON.stringify({ error: 'Could not reorder projects' }) }
      }
    }

    if (action === 'create' || action === 'update') {
      const result = validateProject(payload)
      if (result.error) {
        return { statusCode: 400, headers: JSON_HEADERS, body: JSON.stringify({ error: result.error }) }
      }
      const p = result.value

      const parsedSortOrder = Number(payload.sortOrder)
      let sortOrder = Number.isInteger(parsedSortOrder) ? parsedSortOrder : null

      try {
        if (action === 'create') {
          if (sortOrder === null) {
            const [{ next }] = await sql`select coalesce(max(sort_order), 0) + 1 as next from projects`
            sortOrder = next
          }
          await sql`
            insert into projects (slug, name, tech, description, category, folder, url, preview_url, figma_url, image, sort_order)
            values (${p.slug}, ${p.name}, ${p.tech}, ${p.description}, ${p.category}, ${p.folder}, ${p.url}, ${p.previewUrl}, ${p.figmaUrl}, ${p.image}, ${sortOrder})
          `
          return { statusCode: 201, headers: JSON_HEADERS, body: JSON.stringify({ ok: true }) }
        }

        const [existing] = await sql`select sort_order from projects where slug = ${p.slug}`
        if (!existing) {
          return { statusCode: 404, headers: JSON_HEADERS, body: JSON.stringify({ error: 'Project not found' }) }
        }
        if (sortOrder === null) sortOrder = existing.sort_order

        await sql`
          update projects set
            name = ${p.name},
            tech = ${p.tech},
            description = ${p.description},
            category = ${p.category},
            folder = ${p.folder},
            url = ${p.url},
            preview_url = ${p.previewUrl},
            figma_url = ${p.figmaUrl},
            image = ${p.image},
            sort_order = ${sortOrder}
          where slug = ${p.slug}
        `
        return { statusCode: 200, headers: JSON_HEADERS, body: JSON.stringify({ ok: true }) }
      } catch (err) {
        if (err && err.code === '23505') {
          return { statusCode: 409, headers: JSON_HEADERS, body: JSON.stringify({ error: 'A project with that slug already exists' }) }
        }
        return { statusCode: 500, headers: JSON_HEADERS, body: JSON.stringify({ error: 'Could not save project' }) }
      }
    }

    return { statusCode: 400, headers: JSON_HEADERS, body: JSON.stringify({ error: 'Invalid action' }) }
  }

  return { statusCode: 405, body: 'Method Not Allowed' }
}
