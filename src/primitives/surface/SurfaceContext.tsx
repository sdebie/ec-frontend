import { createContext, useContext, useMemo, type ReactNode } from 'react';

export type Surface = 'admin' | 'storefront' | 'wholesaler';
export type Density = 'compact' | 'comfortable';

interface SurfaceContextValue {
  surface: Surface;
  density: Density;
}

const SurfaceContext = createContext<SurfaceContextValue | null>(null);

export function useSurface(): SurfaceContextValue {
  const ctx = useContext(SurfaceContext);
  if (!ctx) {
    throw new Error('useSurface must be used inside <SurfaceProvider>');
  }
  return ctx;
}

interface SurfaceProviderProps {
  surface: Surface;
  density?: Density;
  children: ReactNode;
}

export function SurfaceProvider({
  surface,
  density = 'comfortable',
  children,
}: SurfaceProviderProps) {
  const value = useMemo(() => ({ surface, density }), [surface, density]);
  return (
    <SurfaceContext.Provider value={value}>
      <div data-surface={surface} data-density={density} className="contents">
        {children}
      </div>
    </SurfaceContext.Provider>
  );
}
