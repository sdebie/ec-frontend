import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

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
    return (
        <BreadcrumbContext.Provider value={{ items, setItems }}>
            {children}
        </BreadcrumbContext.Provider>
    )
}

/** Call at the top of a page component to register its breadcrumb trail. */
export function useBreadcrumb(items: BreadcrumbItem[]) {
    const { setItems } = useContext(BreadcrumbContext)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { setItems(items); return () => setItems([]) }, [])
}

/** Read the current breadcrumb items — used by AdminHeader. */
export function useBreadcrumbItems(): BreadcrumbItem[] {
    return useContext(BreadcrumbContext).items
}
