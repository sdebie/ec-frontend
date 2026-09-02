/**
 * Dev-only Vite plugin that intercepts /api/* and /graphql requests with fixture data.
 * Enabled when VITE_USE_MOCK_API=true (the default in .env).
 *
 * To use the real backend instead:
 *   1. Copy .env.local.example → .env.local
 *   2. Ensure VITE_USE_MOCK_API=false in .env.local
 *   3. Start ec-backend: mvn quarkus:dev (from ec-parent or ec-backend)
 *   4. Ensure the DB is seeded: psql < ec-infra/scripts/seed-uvh.sql
 *
 * Prerequisites before disabling the mock in production:
 *   - Auth Hardening spec complete (CORS locked, @RolesAllowed audit done)
 */

import type {Plugin} from 'vite'
import type {IncomingMessage} from 'http'
import {storefrontConfigFixture} from './fixtures/storefrontConfig.fixture.js'
import {featuredProductsFixture} from './fixtures/featuredProducts.fixture.js'
import {customerProfileFixture} from './fixtures/customerProfile.fixture.js'
import {myOrdersFixture, orderDetailFixture} from './fixtures/orders.fixture.js'
import {
    storefrontBrandsFixture,
    storefrontCategoriesFixture,
    storefrontFeaturedProductsFixture,
    storefrontProductsFixture,
} from './fixtures/storefrontCatalog.fixture.js'

/**
 * Collects the request body from a Node.js IncomingMessage stream
 * and parses it as JSON. Returns an empty object on failure.
 */
function parseJsonBody(req: IncomingMessage): Promise<Record<string, unknown>> {
    return new Promise((resolve) => {
        const chunks: Buffer[] = []
        req.on('data', (chunk: Buffer) => chunks.push(chunk))
        req.on('end', () => {
            try {
                const raw = Buffer.concat(chunks).toString('utf-8')
                resolve(JSON.parse(raw) as Record<string, unknown>)
            } catch {
                resolve({})
            }
        })
        req.on('error', () => resolve({}))
    })
}

/**
 * Per-order call counter for the `orderStatus` GraphQL mock (guest-order-authorization
 * — replaces `orderBySessionId`, keyed on orderId instead of sessionId).
 * The first call returns PENDING; later calls (count >= 2) return PAID.
 */
const orderStatusCallCounts = new Map<string, number>()

/**
 * Vite dev-only plugin that intercepts API calls and returns fixture data.
 * Active only when VITE_USE_MOCK_API=true.
 * Remove this plugin (or leave the env var unset) when a real backend is available.
 */
export function devApiPlugin(): Plugin {
    return {
        name: 'dev-api-mock',
        apply: 'serve',
        configureServer(server) {
            // REST API mock — intercepts /api/* requests
            server.middlewares.use('/api', (req, res, next) => {
                const url = req.url ?? ''

                if (url === '/storefront/config') {
                    res.setHeader('Content-Type', 'application/json')
                    res.end(JSON.stringify(storefrontConfigFixture))
                    return
                }

                if (url.startsWith('/storefront/products/featured')) {
                    res.setHeader('Content-Type', 'application/json')
                    res.end(JSON.stringify(featuredProductsFixture))
                    return
                }

                // Customer auth: POST /api/customers/login
                if (url === '/customers/login' && req.method === 'POST') {
                    res.setHeader('Content-Type', 'application/json')
                    res.end(JSON.stringify({
                        token: 'mock-customer-jwt',
                        email: 'dev@example.com',
                        firstName: 'Dev',
                        lastName: 'User',
                        shopperType: 'RETAILER',
                        status: 'ACTIVE',
                    }))
                    return
                }

                // Customer auth: POST /api/customers/register
                if (url === '/customers/register' && req.method === 'POST') {
                    parseJsonBody(req).then((body) => {
                        const email = (body.email as string) ?? 'dev@example.com'
                        // Simulate 409 for a known "taken" email in dev
                        if (email === 'taken@example.com') {
                            res.statusCode = 409
                            res.setHeader('Content-Type', 'application/json')
                            res.end(JSON.stringify({message: 'Account already exists'}))
                            return
                        }
                        res.setHeader('Content-Type', 'application/json')
                        res.end(JSON.stringify({
                            token: 'mock-customer-jwt-register',
                            email,
                            firstName: (body.firstName as string) ?? 'Dev',
                            lastName: (body.lastName as string) ?? 'User',
                            shopperType: 'RETAILER',
                            status: 'ACTIVE',
                        }))
                    })
                    return
                }

                if (url === '/customers/profile' && req.method === 'PATCH') {
                    parseJsonBody(req).then((body) => {
                        res.setHeader('Content-Type', 'application/json')
                        res.end(JSON.stringify({
                            token: 'mock-customer-jwt-profile',
                            email: (body.email as string) ?? 'dev@example.com',
                            firstName: (body.firstName as string) ?? 'Dev',
                            lastName: (body.lastName as string) ?? 'User',
                            shopperType: 'RETAILER',
                            status: 'ACTIVE',
                        }))
                    })
                    return
                }

                // Customer auth: POST /api/customers/login/google
                if (url === '/customers/login/google' && req.method === 'POST') {
                    res.setHeader('Content-Type', 'application/json')
                    res.end(JSON.stringify({
                        token: 'mock-customer-jwt-google',
                        email: 'dev-google@example.com',
                        firstName: 'Dev',
                        lastName: 'Google',
                        shopperType: 'RETAILER',
                        status: 'ACTIVE',
                    }))
                    return
                }

                // GET /api/storefront/customer-portal — full profile with addresses
                if (url === '/storefront/customer-portal' && req.method === 'GET') {
                    res.setHeader('Content-Type', 'application/json')
                    res.end(JSON.stringify(customerProfileFixture))
                    return
                }

                if (url === '/storefront/wishlist' && req.method === 'GET') {
                    res.setHeader('Content-Type', 'application/json')
                    res.end(JSON.stringify({variantIds: []}))
                    return
                }

                // POST /api/storefront/wishlist/hydrate — must precede the add-variant
                // route below, whose startsWith check would otherwise swallow it
                if (url === '/storefront/wishlist/hydrate' && req.method === 'POST') {
                    parseJsonBody(req).then((body) => {
                        const requestedIds = Array.isArray(body.variantIds) ? (body.variantIds as string[]) : []
                        const items = requestedIds.map((variantId, i) => {
                            const product = storefrontProductsFixture[i % storefrontProductsFixture.length]
                            const variant = product.variants[0]
                            return {
                                variantId,
                                variantLabel: variant.attributesJson,
                                sku: variant.sku,
                                productId: product.id,
                                productName: product.name,
                                productSlug: product.slug,
                                imagePath: product.images[0]?.imageUrl ?? null,
                                retailPrice: product.retailPrice,
                                wholesalePrice: product.wholesalePrice,
                                retailSalePrice: null,
                                wholesaleSalePrice: null,
                            }
                        })
                        res.setHeader('Content-Type', 'application/json')
                        res.end(JSON.stringify({items}))
                    })
                    return
                }

                if (url.startsWith('/storefront/wishlist/') && req.method === 'POST') {
                    res.statusCode = 204
                    res.end()
                    return
                }

                if (url.startsWith('/storefront/wishlist/') && req.method === 'DELETE') {
                    res.statusCode = 204
                    res.end()
                    return
                }

                if (url === '/customers/password' && req.method === 'PATCH') {
                    res.statusCode = 204
                    res.end()
                    return
                }

                if (/^\/orders\/[^/]+\/contact$/.test(url) && req.method === 'PATCH') {
                    // guest-order-authorization: mocks require X-Order-Token so dev
                    // exercises the real contract, not a lenient stand-in for it.
                    if (!req.headers['x-order-token']) {
                        res.statusCode = 404
                        res.setHeader('Content-Type', 'application/json')
                        res.end(JSON.stringify({error: 'Order not found'}))
                        return
                    }
                    const orderId = url.split('/')[2]
                    parseJsonBody(req).then((body) => {
                        res.setHeader('Content-Type', 'application/json')
                        res.end(JSON.stringify({
                            orderId,
                            contactEmail: body.email as string,
                        }))
                    })
                    return
                }

                if (url === '/storefront/shipping-methods' && req.method === 'GET') {
                    res.setHeader('Content-Type', 'application/json')
                    res.end(JSON.stringify([
                        {
                            id: 'sm-delivery-01',
                            name: 'Standard Delivery',
                            baseFee: 89.00,
                            estimatedDays: '3-5',
                        },
                        {
                            id: 'sm-collection-01',
                            name: 'In-store Collection',
                            baseFee: 0,
                            estimatedDays: null,
                        },
                    ]))
                    return
                }

                if (url === '/storefront/payment-methods' && req.method === 'GET') {
                    res.setHeader('Content-Type', 'application/json')
                    res.end(JSON.stringify(['PAYFAST', 'IN_STORE']))
                    return
                }

                if (url === '/payments/checkout' && req.method === 'POST') {
                    // guest-order-authorization: requires X-Order-Token, same contract
                    // as /orders/{id}/contact above.
                    if (!req.headers['x-order-token']) {
                        res.statusCode = 404
                        res.setHeader('Content-Type', 'application/json')
                        res.end(JSON.stringify({error: 'Order not found'}))
                        return
                    }
                    res.statusCode = 202
                    res.setHeader('Content-Type', 'application/json')
                    res.end(JSON.stringify({
                        gatewayUrl: 'https://sandbox.payfast.co.za/eng/process',
                        fields: [
                            {name: 'merchant_id', value: '10000100'},
                            {name: 'merchant_key', value: '46f0cd694581a'},
                            {name: 'amount', value: '1000.00'},
                            {name: 'item_name', value: 'Order'},
                        ],
                    }))
                    return
                }

                // POST /api/orders — mock checkout handoff
                if (url === '/orders' && req.method === 'POST') {
                    parseJsonBody(req).then((body) => {
                        const items = body.items as Array<{ variantId: string; quantity: number }>

                        // Check for special "unavailable" variant
                        const unavailable = items.filter(i => i.variantId === 'unavailable-variant-id')
                        if (unavailable.length > 0) {
                            res.statusCode = 422
                            res.setHeader('Content-Type', 'application/json')
                            res.end(JSON.stringify({unavailableVariantIds: unavailable.map(i => i.variantId)}))
                            return
                        }

                        // Success response with hardcoded unit price of 100.00
                        const lines = items.map(i => ({
                            variantId: i.variantId,
                            name: `Product for ${i.variantId}`,
                            unitPrice: 100.00,
                            quantity: i.quantity,
                            lineTotal: i.quantity * 100.00,
                        }))
                        const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0)
                        const vatAmount = subtotal * 0.15
                        const shippingEstimate = 99.00

                        res.statusCode = 201
                        res.setHeader('Content-Type', 'application/json')
                        res.end(JSON.stringify({
                            orderId: 'mock-order-uuid',
                            sessionId: 'mock-session-uuid',
                            // guest-order-authorization — required by every
                            // order-scoped request from here on.
                            orderToken: 'mock-order-token',
                            lines,
                            subtotal,
                            vatAmount,
                            shippingEstimate,
                            grandTotal: subtotal + vatAmount + shippingEstimate,
                        }))
                    })
                    return
                }

                next()
            })

            // GraphQL mock — intercepts /graphql requests
            server.middlewares.use('/graphql', (req, res, next) => {
                if (req.method !== 'POST') {
                    next()
                    return
                }

                parseJsonBody(req).then((body) => {
                    const query = (body.query as string) ?? ''
                    const variables = (body.variables as Record<string, unknown>) ?? {}

                    if (query.includes('shoppingProductList')) {
                        const filterRequest = variables.filterRequest as {
                            filters?: Array<{ key: string; value: string }>
                            filterGroups?: Array<{ filters?: Array<{ key: string; value: string }> }>
                        } | undefined
                        const categoryId = filterRequest?.filters?.find((filter) => filter.key === 'category.id')?.value
                        const search = filterRequest?.filterGroups?.flatMap((group) => group.filters ?? [])
                            .find((filter) => filter.key === 'name')?.value
                            ?.replaceAll('%', '')
                            .toLowerCase()
                        const onSale = variables.onSale === true
                        const filtered = storefrontProductsFixture.filter((product) =>
                            (!categoryId || product.category.id === categoryId)
                            && (!search || product.name.toLowerCase().includes(search))
                            && (!onSale || product.retailSalePrice != null || product.wholesaleSalePrice != null),
                        )
                        const pageSize = typeof variables.pageSize === 'number' ? variables.pageSize : filtered.length
                        const pageIndex = typeof variables.pageIndex === 'number' ? variables.pageIndex : 0
                        const content = filtered.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize)
                        res.setHeader('Content-Type', 'application/json')
                        res.end(JSON.stringify({
                            data: {
                                shoppingProductList: {
                                    content,
                                    totalElements: filtered.length,
                                    totalPages: Math.max(1, Math.ceil(filtered.length / pageSize)),
                                    pageSize,
                                    pageIndex,
                                }
                            }
                        }))
                        return
                    }

                    if (query.includes('getProductInformationBySlug')) {
                        const slug = variables.slug as string | undefined
                        const product = storefrontProductsFixture.find((item) => item.slug === slug)
                        const information = product ? {
                            product: {
                                id: product.id,
                                name: product.name,
                                slug: product.slug,
                                shortDescription: product.shortDescription,
                                description: product.description,
                                category: product.category,
                                brand: {id: product.brand.id, name: product.brand.name},
                            },
                            variants: product.variants.map((variant) => ({...variant, images: product.images})),
                        } : null
                        res.setHeader('Content-Type', 'application/json')
                        res.end(JSON.stringify({data: {getProductInformationBySlug: information}}))
                        return
                    }

                    if (query.includes('shoppingFeaturedProductList')) {
                        const limit = typeof variables.limit === 'number' ? variables.limit : storefrontFeaturedProductsFixture.length
                        res.setHeader('Content-Type', 'application/json')
                        res.end(JSON.stringify({data: {shoppingFeaturedProductList: storefrontFeaturedProductsFixture.slice(0, limit)}}))
                        return
                    }

                    if (query.includes('getCategories')) {
                        res.setHeader('Content-Type', 'application/json')
                        res.end(JSON.stringify({
                            data: {
                                getCategories: {
                                    content: storefrontCategoriesFixture,
                                    totalElements: storefrontCategoriesFixture.length,
                                }
                            }
                        }))
                        return
                    }

                    if (query.includes('getBrands')) {
                        res.setHeader('Content-Type', 'application/json')
                        res.end(JSON.stringify({
                            data: {
                                getBrands: {
                                    content: storefrontBrandsFixture,
                                    totalElements: storefrontBrandsFixture.length,
                                }
                            }
                        }))
                        return
                    }

                    if (query.includes('myOrders')) {
                        res.setHeader('Content-Type', 'application/json')
                        res.end(JSON.stringify({data: {myOrders: myOrdersFixture}}))
                        return
                    }

                    if (query.includes('getOrderDetail')) {
                        // guest-order-authorization: requires X-Order-Token, same
                        // contract as /orders/{id}/contact above.
                        if (!req.headers['x-order-token']) {
                            res.setHeader('Content-Type', 'application/json')
                            res.end(JSON.stringify({errors: [{message: 'Order not found'}], data: null}))
                            return
                        }
                        const id = variables.id as string | undefined
                        // Return the fixture with the requested ID (or default fixture)
                        const detail = id ? {...orderDetailFixture, id} : orderDetailFixture
                        res.setHeader('Content-Type', 'application/json')
                        res.end(JSON.stringify({data: {getOrderDetail: detail}}))
                        return
                    }

                    // orderStatus query (guest-order-authorization) — requires
                    // X-Order-Token; see orderStatusCallCounts above for the
                    // PENDING -> PAID behaviour.
                    if (query.includes('orderStatus')) {
                        if (!req.headers['x-order-token']) {
                            res.setHeader('Content-Type', 'application/json')
                            res.end(JSON.stringify({errors: [{message: 'Order not found'}], data: null}))
                            return
                        }
                        const orderId = (variables.orderId as string) ?? 'unknown'
                        const currentCount = (orderStatusCallCounts.get(orderId) ?? 0) + 1
                        orderStatusCallCounts.set(orderId, currentCount)

                        const status = currentCount >= 2 ? 'PAID' : 'PENDING'

                        res.setHeader('Content-Type', 'application/json')
                        res.end(JSON.stringify({
                            data: {
                                orderStatus: {
                                    id: orderId,
                                    status,
                                    totalAmount: 1000,
                                    createdAt: new Date().toISOString(),
                                },
                            },
                        }))
                        return
                    }

                    // Unhandled GraphQL query — pass through
                    next()
                })
            })
        },
    }
}
