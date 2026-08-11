const RESEND_API_URL = 'https://api.resend.com/emails'

// Fires a "new rating pending" email via Resend. Silently does nothing if
// not configured (no API key set yet), so it never blocks a real submission
// while the feature is being set up.
async function notifyPendingRating({ projectSlug, stars, pendingCount }) {
  const apiKey = process.env.RESEND_API_KEY
  const to = process.env.ADMIN_EMAIL
  if (!apiKey || !to) return

  const from = process.env.RESEND_FROM_EMAIL || 'Portfolio <onboarding@resend.dev>'
  const plural = pendingCount === 1 ? 'rating is' : 'ratings are'

  const res = await fetch(RESEND_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to,
      subject: `New rating for "${projectSlug}" - ${pendingCount} pending review`,
      text: `A new ${stars}/5 rating was submitted for "${projectSlug}".\n\n${pendingCount} ${plural} waiting for review at /admin.`,
    }),
  })

  // fetch only throws on network failure, not HTTP error statuses - log
  // rejections (bad key, unverified sender, etc.) so a misconfiguration is
  // visible in the function logs instead of failing invisibly forever.
  if (!res.ok) {
    console.error('notifyPendingRating: Resend rejected the email', res.status, await res.text())
  }
}

module.exports = { notifyPendingRating }
