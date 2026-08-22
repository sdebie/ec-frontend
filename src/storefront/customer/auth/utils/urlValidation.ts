// `.invalid` is a reserved TLD (RFC 2606) that can never resolve to a real
// site — it exists only as an anchor so a candidate path can be resolved
// with the same algorithm a browser uses to navigate (which normalizes
// leading backslashes to slashes and strips tab/newline before parsing),
// then checked for whether it escaped to a different origin. A prefix
// check on the raw string can't see that normalization and is bypassable
// by it (e.g. `/\evil.com` -> `//evil.com`).
const RESOLUTION_BASE = 'https://relative-path-check.invalid'

export function isRelativePath(url: string): boolean {
  try {
    const resolved = new URL(url, RESOLUTION_BASE)
    return resolved.origin === RESOLUTION_BASE && url.startsWith('/')
  } catch {
    return false
  }
}
