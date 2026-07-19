import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const STORAGE_KEY = 'ec_local_wishlist'

const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

interface LocalWishlistState {
  variantIds: Set<string>
  count: number
  add: (variantId: string) => void
  remove: (variantId: string) => void
  has: (variantId: string) => boolean
  clear: () => void
}

export const useLocalWishlistStore = create<LocalWishlistState>()(
  persist(
    (set, get) => ({
      variantIds: new Set<string>(),
      count: 0,
      add: (variantId) =>
        set((state) => {
          const next = new Set(state.variantIds)
          next.add(variantId)
          return { variantIds: next, count: next.size }
        }),
      remove: (variantId) =>
        set((state) => {
          const next = new Set(state.variantIds)
          next.delete(variantId)
          return { variantIds: next, count: next.size }
        }),
      has: (variantId) => get().variantIds.has(variantId),
      clear: () => set({ variantIds: new Set(), count: 0 }),
    }),
    {
      name: STORAGE_KEY,
      storage: {
        getItem: (name) => {
          try {
            const raw = localStorage.getItem(name)
            if (!raw) return null
            const parsed = JSON.parse(raw)
            const ids: string[] = Array.isArray(parsed?.state?.variantIds)
              ? parsed.state.variantIds.filter(
                  (id: unknown) => typeof id === 'string' && UUID_V4_REGEX.test(id)
                )
              : []
            return {
              state: { variantIds: new Set(ids), count: ids.length },
            }
          } catch {
            return null
          }
        },
        setItem: (name, value) => {
          try {
            const ids = Array.from((value as { state: LocalWishlistState }).state.variantIds)
            localStorage.setItem(name, JSON.stringify({ state: { variantIds: ids } }))
          } catch {
            // localStorage unavailable (private browsing, quota) — degrade to in-memory only
          }
        },
        removeItem: (name) => {
          try {
            localStorage.removeItem(name)
          } catch {
            // no-op — graceful degradation
          }
        },
      },
    }
  )
)
