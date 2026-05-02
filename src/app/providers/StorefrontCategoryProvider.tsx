import {
    createContext,
    type Dispatch,
    type PropsWithChildren,
    type SetStateAction,
    useContext,
    useMemo,
    useState,
} from 'react'

export interface StorefrontCategoryContextValue {
    activeCategory: string
    setActiveCategory: Dispatch<SetStateAction<string>>
}

const StorefrontCategoryContext =
    createContext<StorefrontCategoryContextValue | null>(null)

const DEFAULT_CATEGORY = 'All'

export function StorefrontCategoryProvider({children}: PropsWithChildren) {
    const [activeCategory, setActiveCategory] = useState<string>(DEFAULT_CATEGORY)

    const value = useMemo(
        () => ({activeCategory, setActiveCategory}),
        [activeCategory],
    )

    return (
        <StorefrontCategoryContext.Provider value={value}>
            {children}
        </StorefrontCategoryContext.Provider>
    )
}

export function useStorefrontCategory(): StorefrontCategoryContextValue {
    const ctx = useContext(StorefrontCategoryContext)
    if (!ctx) {
        throw new Error(
            'useStorefrontCategory must be used within StorefrontCategoryProvider.',
        )
    }
    return ctx
}
