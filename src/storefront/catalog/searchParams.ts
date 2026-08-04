/**
 * The catalogue's search term lives in exactly ONE URL parameter.
 *
 * Two parameters for one piece of state is a defect, not a convenience: as soon
 * as one shadows the other, a write to the shadowed key leaves the page reading
 * the stale value and the sync-back reverts the input under the shopper's
 * cursor. Naming the canonical key here is what prevents that.
 *
 * `LEGACY_SEARCH_PARAM` is still READ so links and bookmarks carrying `?search=`
 * keep working, but nothing writes it — and any write of the canonical key
 * clears it, so a stale value can never shadow the live one.
 */
export const SEARCH_PARAM = 'q'

/** Read-only alias, honoured on inbound links. Never written. */
export const LEGACY_SEARCH_PARAM = 'search'

/** The search term currently in effect, canonical key first. */
export function readSearchParam(params: URLSearchParams): string {
    return params.get(SEARCH_PARAM) ?? params.get(LEGACY_SEARCH_PARAM) ?? ''
}

/**
 * Writes the search term onto `params` in place, clearing the legacy alias.
 * An empty term removes both keys rather than leaving `?q=`.
 */
export function writeSearchParam(params: URLSearchParams, term: string): void {
    const trimmed = term.trim()
    if (trimmed) {
        params.set(SEARCH_PARAM, trimmed)
    } else {
        params.delete(SEARCH_PARAM)
    }
    params.delete(LEGACY_SEARCH_PARAM)
}
