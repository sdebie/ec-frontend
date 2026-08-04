import { createContext, useContext, useMemo, type ReactNode } from 'react'

/**
 * The two surfaces this platform has. Wholesale is a customer *tier*
 * (`shopperType`), not a surface — wholesale shoppers browse the same storefront
 * and differ only in which price tier is primary. Do not add a third member for
 * wholesale: there are no `--ws-*` tokens for its stylesheet block to resolve
 * against, so it falls through to the storefront values it was meant to
 * override — silently, because an undefined custom property just drops.
 */
export type SurfaceElevation = 'admin' | 'storefront'
export type Density = 'compact' | 'comfortable'

interface SurfaceContextValue {
  elevation: SurfaceElevation
  density: Density
}

const SurfaceContext = createContext<SurfaceContextValue | null>(null)

export function useSurface(): SurfaceContextValue {
  const ctx = useContext(SurfaceContext)
  if (!ctx) {
    throw new Error('useSurface must be used inside <Surface>')
  }
  return ctx
}

interface SurfaceProviderProps {
  elevation: SurfaceElevation
  density?: Density
  children: ReactNode
}

export function SurfaceProvider({
  elevation,
  density = 'comfortable',
  children,
}: SurfaceProviderProps) {
  const value = useMemo(() => ({ elevation, density }), [elevation, density])
  return (
    <SurfaceContext.Provider value={value}>
      {children}
    </SurfaceContext.Provider>
  )
}
