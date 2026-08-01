/**
 * Parses a variant's `attributesJson` column into a flat attribute map.
 *
 * Nothing to do with images — this lived in `imageUtils.ts` until 2026-07-28
 * purely by accident of where it was first written.
 */
export function parseAttributes(json: string): Record<string, string> {
  try {
    return JSON.parse(json)
  } catch {
    return {}
  }
}
