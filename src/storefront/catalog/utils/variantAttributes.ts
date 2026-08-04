/**
 * Parses a variant's `attributesJson` column into a flat attribute map.
 */
export function parseAttributes(json: string): Record<string, string> {
  try {
    return JSON.parse(json)
  } catch {
    return {}
  }
}
