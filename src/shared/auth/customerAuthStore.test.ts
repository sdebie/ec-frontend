import { describe, it, expect, beforeEach } from 'vitest'
import fc from 'fast-check'
import { useCustomerAuthStore, type CustomerType } from './customerAuthStore'

const STORAGE_KEY = 'ec_customer_token'

const customerTypeArb: fc.Arbitrary<CustomerType> = fc.constantFrom(
  'RETAIL',
  'WHOLESALE',
  'GUEST',
)

/** Arbitrary for a valid CustomerSession payload WITH name fields */
const sessionWithNamesArb = fc.record({
  token: fc.string({ minLength: 1 }),
  email: fc.emailAddress(),
  customerType: customerTypeArb,
  firstName: fc.string({ minLength: 1 }),
  lastName: fc.string({ minLength: 1 }),
})

/** Arbitrary for a valid CustomerSession payload WITHOUT name fields */
const sessionWithoutNamesArb = fc.record({
  token: fc.string({ minLength: 1 }),
  email: fc.emailAddress(),
  customerType: customerTypeArb,
})

describe('customerAuthStore — property-based tests', () => {
  beforeEach(() => {
    useCustomerAuthStore.getState().clearSession()
    localStorage.clear()
  })

  /**
   * **Validates: Requirements 9.1**
   *
   * Property 14: setSession accepts optional name fields
   *
   * For any valid CustomerSession payload (with or without firstName and lastName),
   * calling setSession should store token, email, and customerType, and store
   * firstName/lastName when provided or leave them as null when omitted.
   */
  describe('Property 14: setSession accepts optional name fields', () => {
    it('stores token, email, customerType, firstName, and lastName when all provided', () => {
      fc.assert(
        fc.property(sessionWithNamesArb, (session) => {
          useCustomerAuthStore.getState().setSession(session)
          const state = useCustomerAuthStore.getState()

          expect(state.token).toBe(session.token)
          expect(state.email).toBe(session.email)
          expect(state.customerType).toBe(session.customerType)
          expect(state.firstName).toBe(session.firstName)
          expect(state.lastName).toBe(session.lastName)
          expect(state.isSignedIn).toBe(true)
        }),
        { numRuns: 100 },
      )
    })

    it('stores token, email, customerType and leaves firstName/lastName as null when omitted', () => {
      fc.assert(
        fc.property(sessionWithoutNamesArb, (session) => {
          useCustomerAuthStore.getState().setSession(session)
          const state = useCustomerAuthStore.getState()

          expect(state.token).toBe(session.token)
          expect(state.email).toBe(session.email)
          expect(state.customerType).toBe(session.customerType)
          expect(state.firstName).toBeNull()
          expect(state.lastName).toBeNull()
          expect(state.isSignedIn).toBe(true)
        }),
        { numRuns: 100 },
      )
    })
  })

  /**
   * **Validates: Requirements 9.3**
   *
   * Property 15: clearSession nulls name fields
   *
   * For any customerAuthStore state where firstName and lastName are non-null,
   * calling clearSession() should result in both being null (along with all other
   * session fields being cleared).
   */
  describe('Property 15: clearSession nulls name fields', () => {
    it('clears firstName, lastName, and all other session fields', () => {
      fc.assert(
        fc.property(sessionWithNamesArb, (session) => {
          // First set a session with names
          useCustomerAuthStore.getState().setSession(session)

          // Verify names are set
          expect(useCustomerAuthStore.getState().firstName).not.toBeNull()
          expect(useCustomerAuthStore.getState().lastName).not.toBeNull()

          // Clear the session
          useCustomerAuthStore.getState().clearSession()
          const state = useCustomerAuthStore.getState()

          expect(state.firstName).toBeNull()
          expect(state.lastName).toBeNull()
          expect(state.token).toBeNull()
          expect(state.email).toBeNull()
          expect(state.isSignedIn).toBe(false)
          expect(state.customerType).toBe('RETAIL')
        }),
        { numRuns: 100 },
      )
    })
  })

  /**
   * **Validates: Requirements 9.4**
   *
   * Property 16: Name fields not persisted to localStorage
   *
   * For any setSession call that includes firstName and lastName, inspecting
   * localStorage should reveal no firstName or lastName values — only the token
   * is persisted.
   */
  describe('Property 16: Name fields not persisted to localStorage', () => {
    it('persists only token to localStorage — no firstName or lastName', () => {
      fc.assert(
        fc.property(sessionWithNamesArb, (session) => {
          useCustomerAuthStore.getState().setSession(session)

          const stored = localStorage.getItem(STORAGE_KEY)
          expect(stored).not.toBeNull()

          const parsed = JSON.parse(stored!)
          // The persist middleware stores state under a "state" key
          const persistedState = parsed.state

          expect(persistedState.token).toBe(session.token)
          expect(persistedState).not.toHaveProperty('firstName')
          expect(persistedState).not.toHaveProperty('lastName')
          expect(persistedState).not.toHaveProperty('email')
          expect(persistedState).not.toHaveProperty('customerType')
          expect(persistedState).not.toHaveProperty('isSignedIn')
        }),
        { numRuns: 100 },
      )
    })
  })
})
