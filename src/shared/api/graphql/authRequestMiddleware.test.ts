import {describe, expect, it} from 'vitest'
import {withBearerToken} from './authRequestMiddleware'

/**
 * graphql-request invokes requestMiddleware with `headers` already built into
 * a real Headers instance, and the middleware's return value replaces the
 * whole request init rather than merging with it. A naive `{...headers}`
 * spread does not enumerate a Headers instance's entries, so it silently
 * drops every header set before the middleware runs — this is exactly how
 * X-Order-Token vanished from usePollOrderStatus's poll while every other
 * caller (which only ever needed Authorization, added by the middleware
 * itself) stayed unaffected.
 */
describe('withBearerToken', () => {
    it('preserves a per-call header set before the middleware runs', () => {
        const middleware = withBearerToken(() => null)
        const request = {
            url: 'http://example.test/graphql',
            headers: new Headers({'X-Order-Token': 'abc123'}),
        }

        const result = middleware(request) as { headers: HeadersInit }

        expect(new Headers(result.headers).get('X-Order-Token')).toBe('abc123')
    })

    it('adds Authorization when a token is present without dropping other headers', () => {
        const middleware = withBearerToken(() => 'jwt-xyz')
        const request = {
            url: 'http://example.test/graphql',
            headers: new Headers({'X-Order-Token': 'abc123'}),
        }

        const result = middleware(request) as { headers: HeadersInit }
        const headers = new Headers(result.headers)

        expect(headers.get('X-Order-Token')).toBe('abc123')
        expect(headers.get('Authorization')).toBe('Bearer jwt-xyz')
    })

    it('omits Authorization when there is no token', () => {
        const middleware = withBearerToken(() => null)
        const request = {url: 'http://example.test/graphql', headers: new Headers()}

        const result = middleware(request) as { headers: HeadersInit }

        expect(new Headers(result.headers).has('Authorization')).toBe(false)
    })
})
