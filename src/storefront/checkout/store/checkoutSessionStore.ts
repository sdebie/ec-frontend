import {create} from 'zustand'
import {createJSONStorage, persist} from 'zustand/middleware'
import type {CheckoutSession} from '../types'

export interface CheckoutSessionState {
    session: CheckoutSession | null
    setSession: (session: CheckoutSession) => void
    clearSession: () => void
}

export const useCheckoutSessionStore = create<CheckoutSessionState>()(
    persist(
        (set) => ({
            session: null,
            setSession: (session) => set({session}),
            clearSession: () => set({session: null}),
        }),
        {
            name: 'ec_checkout_session',
            storage: createJSONStorage(() => sessionStorage),
        }
    )
)
