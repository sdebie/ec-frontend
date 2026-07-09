/**
 * Converts a name string to a URL-safe slug.
 * Produces only lowercase letters, digits, and hyphens.
 * Never starts or ends with a hyphen.
 */
export const toSlug = (name: string) =>
  name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
