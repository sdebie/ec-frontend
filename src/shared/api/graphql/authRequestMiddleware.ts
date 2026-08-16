import type {RequestMiddleware} from 'graphql-request'

/**
 * graphql-request calls requestMiddleware with `headers` already built into a
 * real Headers instance, and takes the middleware's return value as the
 * complete request init rather than merging it with the original. Headers
 * stores its entries in internal slots, not as enumerable own properties, so
 * `{...headers}` silently produces `{}` instead of raising — any header set
 * before the middleware runs (e.g. a per-call header passed as
 * requestHeaders) is lost. Route it through the Headers constructor instead,
 * which knows how to read another Headers instance.
 */
export function withBearerToken(getToken: () => string | null): RequestMiddleware {
    return (request) => {
        const headers = new Headers(request.headers as HeadersInit)
        const token = getToken()
        if (token) {
            headers.set('Authorization', `Bearer ${token}`)
        }
        return {...request, headers}
    }
}
