import { describe, it, expect, vi, beforeEach } from 'vitest'
import { IncomingMessage, ServerResponse } from 'http'
import { EventEmitter } from 'events'
import { devApiPlugin } from './devApiPlugin'
import { customerProfileFixture } from './fixtures/customerProfile.fixture'

/**
 * Creates a minimal mock IncomingMessage for testing Vite middleware.
 */
function createMockReq(options: { url: string; method?: string }): IncomingMessage {
  const req = new EventEmitter() as IncomingMessage
  req.url = options.url
  req.method = options.method ?? 'GET'
  return req
}

/**
 * Creates a minimal mock ServerResponse that captures written data.
 */
function createMockRes() {
  const headers: Record<string, string> = {}
  let body = ''
  let statusCode = 200

  const res = {
    setHeader(key: string, value: string) {
      headers[key] = value
    },
    end(data?: string) {
      if (data) body = data
    },
    get statusCode() {
      return statusCode
    },
    set statusCode(code: number) {
      statusCode = code
    },
    get headers() {
      return headers
    },
    get body() {
      return body
    },
  }

  return res as unknown as ServerResponse & { headers: Record<string, string>; body: string }
}

type MiddlewareHandler = (req: IncomingMessage, res: ServerResponse, next: () => void) => void

/**
 * Extracts the registered middleware handlers from the devApiPlugin.
 * Returns a map of path -> handler.
 */
function getMiddlewareHandlers() {
  const plugin = devApiPlugin()
  const handlers: Record<string, MiddlewareHandler> = {}

  const mockServer = {
    middlewares: {
      use(path: string, handler: MiddlewareHandler) {
        handlers[path] = handler
      },
    },
  }

  // Call configureServer to register middleware
  const configureServer = (plugin as { configureServer: (server: unknown) => void }).configureServer
  configureServer(mockServer)

  return handlers
}

describe('devApiPlugin', () => {
  let handlers: Record<string, MiddlewareHandler>

  beforeEach(() => {
    handlers = getMiddlewareHandlers()
  })

  describe('GET /storefront/customer-portal', () => {
    it('responds with the customer profile fixture', () => {
      const apiHandler = handlers['/api']
      const req = createMockReq({ url: '/storefront/customer-portal', method: 'GET' })
      const res = createMockRes()
      const next = vi.fn()

      apiHandler(req, res, next)

      expect(next).not.toHaveBeenCalled()
      expect(res.headers['Content-Type']).toBe('application/json')
      expect(JSON.parse(res.body)).toEqual(customerProfileFixture)
    })

    it('returns the correct StorefrontMeResponse shape', () => {
      const apiHandler = handlers['/api']
      const req = createMockReq({ url: '/storefront/customer-portal', method: 'GET' })
      const res = createMockRes()
      const next = vi.fn()

      apiHandler(req, res, next)

      const body = JSON.parse(res.body)
      expect(body).toHaveProperty('email')
      expect(body).toHaveProperty('shopperType')
      expect(body).toHaveProperty('firstName')
      expect(body).toHaveProperty('lastName')
      expect(body).toHaveProperty('phone')
      expect(body).toHaveProperty('physicalAddress')
      expect(body).toHaveProperty('postalAddress')
      expect(body).toHaveProperty('hasPassword')
    })
  })

  describe('GET /storefront/me (removed endpoint)', () => {
    it('does NOT handle the request — calls next() to fall through', () => {
      const apiHandler = handlers['/api']
      const req = createMockReq({ url: '/storefront/me', method: 'GET' })
      const res = createMockRes()
      const next = vi.fn()

      apiHandler(req, res, next)

      expect(next).toHaveBeenCalled()
      expect(res.body).toBe('')
    })
  })
})
