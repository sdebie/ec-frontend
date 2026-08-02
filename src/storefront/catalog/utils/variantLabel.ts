/**
 * Parses a variant label from JSON attributes string into a readable label.
 * e.g. '{"Size":"Large","Color":"Red"}' → "Size: Large, Color: Red"
 * Falls back to the raw string if parsing fails or the JSON is not a plain object.
 */
export function parseVariantLabel(label: string): string {
    if (!label) return ''
    try {
        const parsed = JSON.parse(label)
        if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
            return Object.entries(parsed)
                .map(([key, value]) => `${key}: ${value}`)
                .join(', ')
        }
        return label
    } catch {
        return label
    }
}
