export function isRelativePath(url: string): boolean {
  try {
    // If URL() parses successfully, it's absolute — reject it
    new URL(url)
    return false
  } catch {
    // URL() throws on relative paths — that's what we want
    return url.startsWith('/') && !url.startsWith('//')
  }
}
