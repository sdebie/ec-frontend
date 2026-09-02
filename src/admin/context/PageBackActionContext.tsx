import {createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode} from 'react'

export interface PageBackAction {
    onClick: () => void
    label?: string
}

interface PageBackActionContextValue {
    action: PageBackAction | null
    setAction: (action: PageBackAction | null) => void
}

const PageBackActionContext = createContext<PageBackActionContextValue>({
    action: null,
    setAction: () => {},
})

export function PageBackActionProvider({children}: { children: ReactNode }) {
    const [action, setAction] = useState<PageBackAction | null>(null)
    const value = useMemo(() => ({action, setAction}), [action])
    return (
        <PageBackActionContext.Provider value={value}>
            {children}
        </PageBackActionContext.Provider>
    )
}

/**
 * Called by PageLayout, not by pages directly — a page keeps passing onBack/backLabel
 * to PageLayout exactly as before. `onClick` is typically a fresh `() => navigate(-1)`
 * closure every render, so it's read from a ref rather than the effect's own dependency
 * array — depending on it directly would re-push on every render of the host page.
 */
export function usePageBackAction(onClick?: () => void, label?: string) {
    const {setAction} = useContext(PageBackActionContext)
    const onClickRef = useRef(onClick)
    onClickRef.current = onClick

    useEffect(() => {
        if (!onClick) return
        setAction({onClick: () => onClickRef.current?.(), label})
        return () => setAction(null)
        // eslint-disable-next-line react-hooks/exhaustive-deps -- onClick read via ref; only presence/label should re-register
    }, [setAction, label, Boolean(onClick)])
}

/** Read the current back action — used by AdminHeader. */
export function usePageBackActionValue(): PageBackAction | null {
    return useContext(PageBackActionContext).action
}
