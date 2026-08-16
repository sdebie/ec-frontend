import {create} from 'zustand'
import {createJSONStorage, persist} from 'zustand/middleware'
import type {CheckoutSession} from '../types'

export interface CheckoutSessionState {
    session: CheckoutSession | null
    /**
     * Identifies one checkout intent, stable across retries of it
     * (.kiro/specs/checkout-idempotency). Never read or generated directly —
     * go through {@link ensureIdempotencyKey}.
     */
    idempotencyKey: string | null
    /** The cart signature (see utils/cartSignature) the current key was minted for. */
    idempotencyKeyCartSignature: string | null
    setSession: (session: CheckoutSession) => void
    /**
     * Ends the checkout INTENT — the actual idempotency-replay hazard
     * (guest-order-authorization): "a shopper immediately placing an identical second
     * order must not have it silently merged into the one just finished by reusing
     * its key." That reasoning is about the idempotency key, not the order id or its
     * token, so this clears only `idempotencyKey`/`idempotencyKeyCartSignature` —
     * deliberately NOT `session`. The order id and token must survive a refresh of
     * the success page, and the cart/form draft are cleared by their own stores at
     * the same call sites, not here.
     * <p>
     * Narrowed rather than replaced so both existing callers — CheckoutSuccessPage's
     * terminal-status effect and useExpireStaleCheckoutSession's cart-divergence
     * watcher — inherit the fix without changing which method they call. See
     * {@link clearOrder} for the full reset.
     */
    clearSession: () => void
    /** The full reset — for any caller that genuinely wants the order forgotten. */
    clearOrder: () => void
    /**
     * Returns the key for the given cart signature, minting a fresh one if
     * none is held or if the cart has diverged from what the held key was
     * minted for. Reusing across calls with an unchanged cart is the entire
     * point — a key minted per call is a silent no-op (see design §7).
     */
    ensureIdempotencyKey: (cartSignature: string) => string
    /**
     * Drops the key without touching the session, so the next
     * {@link ensureIdempotencyKey} call mints a fresh one. Used when the
     * server refuses a key as expired, voided or cart-mismatched — never for
     * a wrong-owner refusal, which must not auto-retry at all.
     */
    clearIdempotencyKey: () => void
}

export const useCheckoutSessionStore = create<CheckoutSessionState>()(
    persist(
        (set, get) => ({
            session: null,
            idempotencyKey: null,
            idempotencyKeyCartSignature: null,
            setSession: (session) => set({session}),
            clearSession: () => set({idempotencyKey: null, idempotencyKeyCartSignature: null}),
            clearOrder: () => set({session: null, idempotencyKey: null, idempotencyKeyCartSignature: null}),
            ensureIdempotencyKey: (cartSignature) => {
                const state = get()
                if (state.idempotencyKey && state.idempotencyKeyCartSignature === cartSignature) {
                    return state.idempotencyKey
                }
                const key = crypto.randomUUID()
                set({idempotencyKey: key, idempotencyKeyCartSignature: cartSignature})
                return key
            },
            clearIdempotencyKey: () => set({idempotencyKey: null, idempotencyKeyCartSignature: null}),
        }),
        {
            name: 'ec_checkout_session',
            storage: createJSONStorage(() => sessionStorage),
        }
    )
)
