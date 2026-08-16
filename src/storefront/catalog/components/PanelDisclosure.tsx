import {useId, useState, type ReactNode} from 'react'
import {ChevronDown} from 'lucide-react'

import {SF_FOCUS_RING_PAGE} from '@/storefront/sections/shared'

interface PanelDisclosureProps {
    /** Heading text, and the accessible name of the toggle. */
    title: string
    /**
     * Open on first render. The panel's fields are informational rather than
     * secondary, so a shopper should see them without a click; collapsing is
     * there to get them out of the way, not to hide them by default.
     */
    defaultOpen?: boolean
    children: ReactNode
}

/**
 * A titled, collapsible field in the product detail panel.
 *
 * Shared because the panel's fields sit in one stack and must open and close
 * identically — a chevron that rotates in one field and not the next reads as a
 * bug rather than a distinction.
 *
 * It owns its open state: nothing outside a field needs to know, and lifting it
 * would hand the page a pile of booleans it never reads.
 *
 * `useId` rather than a hand-written id — two fields on one page must not share
 * an `aria-controls` target, and a literal would silently collide the moment a
 * third field is added.
 */
export function PanelDisclosure({title, defaultOpen = true, children}: PanelDisclosureProps) {
    const [open, setOpen] = useState(defaultOpen)
    const bodyId = useId()

    return (
        <div className="border-t border-(--sf-border) pt-4">
            <button
                type="button"
                onClick={() => setOpen((isOpen) => !isOpen)}
                aria-expanded={open}
                aria-controls={bodyId}
                className={`flex w-full items-center justify-between gap-2 rounded-sm text-left text-sm font-semibold text-(--sf-text) ${SF_FOCUS_RING_PAGE}`}
            >
                {title}
                <ChevronDown
                    aria-hidden="true"
                    className={`h-4 w-4 shrink-0 text-(--sf-muted-text) transition-transform ${
                        open ? 'rotate-180' : ''
                    }`}
                />
            </button>
            {open && <div id={bodyId}>{children}</div>}
        </div>
    )
}
