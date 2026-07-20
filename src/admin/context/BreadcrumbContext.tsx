import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export interface BreadcrumbItem {
    label: string
    href?: string
}

interface BreadcrumbContextValue {
    items: BreadcrumbItem[]
    setItems: (items: BreadcrumbItem[]) => void
}

const BreadcrumbContext = createContext<BreadcrumbContextValue>({
    items: [],
    setItems: () => {},
})

export function BreadcrumbProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<BreadcrumbItem[]>([])
    const value = useMemo(() => ({ items, setItems }), [items])
    return (
        <BreadcrumbContext.Provider value={value}>
            {children}
        </BreadcrumbContext.Provider>
    )
}

/** Call at the top of a page component to register its breadcrumb trail. */
export function useBreadcrumb(items: BreadcrumbItem[]) {
    const { setItems } = useContext(BreadcrumbContext)
    const serialized = JSON.stringify(items)
    useEffect(() => { setItems(JSON.parse(serialized)); return () => setItems([]) }, [setItems, serialized])
}

/** Read the current breadcrumb items — used by AdminHeader. */
export function useBreadcrumbItems(): BreadcrumbItem[] {
    return useContext(BreadcrumbContext).items
}
