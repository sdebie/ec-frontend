import { createContext, useContext, useMemo, type ReactNode } from 'react'

export type SurfaceElevation = 'admin' | 'storefront' | 'wholesaler'
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
