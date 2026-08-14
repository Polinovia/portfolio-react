const SLUG_RE = /^[a-z0-9-]+$/
const CATEGORIES = ['dev', 'design']
const MAX_IMAGE_LENGTH = 3_000_000 // uploaded photos are resized/compressed client-side before this
const MAX_DESCRIPTION_LENGTH = 1000

function clean(value, maxLen) {
  return typeof value === 'string' ? value.trim().slice(0, maxLen) : ''
}

function validateProject(payload) {
  const slug = clean(payload.slug, 60)
  const name = clean(payload.name, 100)
  const tech = clean(payload.tech, 150)
  const category = payload.category
  const folder = clean(payload.folder, 60)
  const url = clean(payload.url, 500)
  const previewUrl = clean(payload.previewUrl, 500) || null
  const figmaUrl = clean(payload.figmaUrl, 500) || null
  const rawImage = typeof payload.image === 'string' ? payload.image.trim() : ''
  const rawDescription = typeof payload.description === 'string' ? payload.description.trim() : ''

  if (!SLUG_RE.test(slug)) return { error: 'slug must contain only lowercase letters, numbers and hyphens' }
  if (!name) return { error: 'name is required' }
  if (!tech) return { error: 'tech is required' }
  if (!rawDescription) return { error: 'description is required' }
  if (rawDescription.length > MAX_DESCRIPTION_LENGTH) {
    return { error: `Description is too long (max ${MAX_DESCRIPTION_LENGTH} characters)` }
  }
  if (!CATEGORIES.includes(category)) return { error: 'category must be dev or design' }
  if (!folder) return { error: 'folder is required' }
  if (!url) return { error: 'url is required' }
  if (rawImage.length > MAX_IMAGE_LENGTH) {
    return { error: `Photo is too large, please choose a smaller image (max ${MAX_IMAGE_LENGTH.toLocaleString('en-US')} characters)` }
  }

  return { value: { slug, name, tech, description: rawDescription, category, folder, url, previewUrl, figmaUrl, image: rawImage || null } }
}

module.exports = { clean, validateProject, SLUG_RE, CATEGORIES, MAX_IMAGE_LENGTH, MAX_DESCRIPTION_LENGTH }
