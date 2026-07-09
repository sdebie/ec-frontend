import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type CustomerType = 'RETAIL' | 'WHOLESALE' | 'GUEST'

export interface CustomerSession {
  token: string
  customerType: CustomerType
  email: string
  firstName?: string
  lastName?: string
}

export interface CustomerAuthState {
  isSignedIn: boolean
  token: string | null
  customerType: CustomerType
  email: string | null
  firstName: string | null
  lastName: string | null
  setSession: (payload: CustomerSession) => void
  clearSession: () => void
}

const initialState = {
  isSignedIn: false,
  token: null,
  customerType: 'RETAIL' as const,
  email: null,
  firstName: null as string | null,
  lastName: null as string | null,
}

export const useCustomerAuthStore = create<CustomerAuthState>()(
  persist(
    (set) => ({
      ...initialState,
      setSession: (payload) =>
        set({
          isSignedIn: true,
          token: payload.token,
          customerType: payload.customerType,
          email: payload.email,
          firstName: payload.firstName ?? null,
          lastName: payload.lastName ?? null,
        }),
      clearSession: () => set(initialState),
    }),
    {
      name: 'ec_customer_token',
      partialize: (state) => ({ token: state.token }),
    }
  )
)
