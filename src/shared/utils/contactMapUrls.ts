/**
 * Shared utility for validating HTTPS URLs and approved map-embed origins.
 * Consumed by both the public ContactUsPage (before rendering) and
 * the ContactEditorPage (before saving) — single source of truth for
 * the embed security policy.
 */

const APPROVED_EMBED_ORIGINS: Array<{ origin: string; pathnamePrefix: string }> = [
  { origin: 'https://www.google.com', pathnamePrefix: '/maps/embed' },
  { origin: 'https://www.openstreetmap.org', pathnamePrefix: '/export/embed.html' },
]

/**
 * Returns true if `url` is a valid, well-formed HTTPS URL.
 * Rejects HTTP, javascript:, data:, and malformed strings.
 * Also rejects user-info lookalike URLs (e.g. `https://user@host/path`).
 */
export function isValidHttpsUrl(url: string): boolean {
  if (!url) return false

  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return false
  }

  // Must be https protocol
  if (parsed.protocol !== 'https:') return false

  // Reject user-info attacks (e.g. https://www.google.com@evil.com/maps/embed)
  if (parsed.username || parsed.password) return false

  return true
}

/**
 * Returns true if `url` is a valid HTTPS URL whose origin and pathname
 * match one of the approved map-embed providers:
 * - `https://www.google.com` with pathname starting `/maps/embed`
 * - `https://www.openstreetmap.org` with pathname starting `/export/embed.html`
 *
 * Rejects everything else including user-info lookalike URLs.
 */
export function isApprovedMapEmbedUrl(url: string): boolean {
  if (!isValidHttpsUrl(url)) return false

  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return false
  }

  return APPROVED_EMBED_ORIGINS.some(
    ({ origin, pathnamePrefix }) =>
      parsed.origin === origin && parsed.pathname.startsWith(pathnamePrefix),
  )
}
