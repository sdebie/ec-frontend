import {createContext, useContext, useId, useState, type ReactNode} from 'react'
import {cn} from '@/shared/utils/cn'

type TabsVariant = 'underline' | 'pill'

interface TabsContextValue {
    idPrefix: string
    value: string | undefined
    setValue: (value: string) => void
    variant: TabsVariant
}

const TabsContext = createContext<TabsContextValue | null>(null)

function useTabsContext(component: string): TabsContextValue {
    const ctx = useContext(TabsContext)
    if (!ctx) {
        throw new Error(`Tabs.${component} must be rendered inside <Tabs>`)
    }
    return ctx
}

export interface TabsProps {
    /** Initial value for uncontrolled Tabs. */
    defaultValue?: string
    /** Controlled value of the tab to activate. */
    value?: string
    /** Callback when Tab value is changed. */
    onChange?: (value: string) => void
    /** Tabs style. Defaults to 'underline'. */
    variant?: TabsVariant
    className?: string
    children: ReactNode
}

function TabsRoot({defaultValue, value: controlledValue, onChange, variant = 'underline', className, children}: TabsProps) {
    const idPrefix = useId()
    const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue)
    const isControlled = controlledValue !== undefined
    const activeValue = isControlled ? controlledValue : uncontrolledValue

    function setValue(next: string) {
        if (!isControlled) setUncontrolledValue(next)
        onChange?.(next)
    }

    return (
        <TabsContext.Provider value={{idPrefix, value: activeValue, setValue, variant}}>
            <div className={className}>{children}</div>
        </TabsContext.Provider>
    )
}

export interface TabListProps {
    children: ReactNode
    className?: string
}

/** No overflow-x-auto by design — tabs wrap instead of scrolling. */
function TabList({children, className}: TabListProps) {
    const {variant} = useTabsContext('TabList')
    return (
        <div
            role="tablist"
            className={cn(
                'flex flex-wrap items-center gap-1',
                variant === 'underline' && 'border-b border-(--c-border)',
                className,
            )}
        >
            {children}
        </div>
    )
}

export interface TabNavProps {
    /** An unique value matched with TabContent. */
    value: string
    disabled?: boolean
    icon?: ReactNode
    children: ReactNode
    className?: string
}

function TabNav({value, disabled, icon, children, className}: TabNavProps) {
    const {idPrefix, value: activeValue, setValue, variant} = useTabsContext('TabNav')
    const isActive = activeValue === value

    return (
        <button
            type="button"
            role="tab"
            id={`${idPrefix}-tab-${value}`}
            aria-selected={isActive}
            aria-controls={`${idPrefix}-panel-${value}`}
            disabled={disabled}
            onClick={() => !disabled && setValue(value)}
            className={cn(
                'inline-flex items-center gap-2 whitespace-nowrap px-4 py-2.5 text-sm font-medium transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--c-ring)',
                variant === 'underline' && [
                    '-mb-px border-b-2',
                    isActive
                        ? 'border-(--c-accent) text-(--c-accent)'
                        : 'border-transparent text-(--c-text-muted) hover:text-(--c-text)',
                ],
                variant === 'pill' && [
                    'rounded-full',
                    isActive
                        ? 'bg-(--c-accent) text-(--c-accent-text)'
                        : 'text-(--c-text-muted) hover:bg-(--c-surface-hover) hover:text-(--c-text)',
                ],
                disabled && 'cursor-not-allowed opacity-50',
                className,
            )}
        >
            {icon && (
                <span className="shrink-0 [&_svg]:h-4 [&_svg]:w-4" aria-hidden="true">
                    {icon}
                </span>
            )}
            {children}
        </button>
    )
}

export interface TabContentProps {
    /** An unique value matched with TabNav. */
    value: string
    children: ReactNode
    className?: string
}

/**
 * Hidden via the native `hidden` attribute, not a CSS class — the panel stays
 * mounted (so field state inside it survives a tab switch) while `hidden`
 * removes it from layout, the accessibility tree, and the tab order all at
 * once, with no extra aria-hidden/inert bookkeeping needed.
 */
function TabContent({value, children, className}: TabContentProps) {
    const {idPrefix, value: activeValue} = useTabsContext('TabContent')
    const isActive = activeValue === value
    return (
        <div
            role="tabpanel"
            id={`${idPrefix}-panel-${value}`}
            aria-labelledby={`${idPrefix}-tab-${value}`}
            hidden={!isActive}
            className={className}
        >
            {children}
        </div>
    )
}

export const Tabs = Object.assign(TabsRoot, {
    TabList,
    TabNav,
    TabContent,
})
