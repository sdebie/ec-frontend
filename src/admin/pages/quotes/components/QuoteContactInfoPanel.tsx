import {UserRound} from 'lucide-react'
import {Card} from '@/shared/ui/primitives'

interface QuoteContactInfoPanelProps {
    name: string
    email: string
}

/** Read-only — this is who to contact, never a place to edit them from. */
export function QuoteContactInfoPanel({name, email}: QuoteContactInfoPanelProps) {
    return (
        <Card as="section" variant="bordered" className="flex h-full flex-col">
            <Card.Header className="m-0 flex items-center gap-2 px-5 py-4">
                <UserRound className="h-5 w-5 text-(--c-text-muted)"/>
                <span>Contact Information</span>
            </Card.Header>
            <Card.Body className="flex flex-1 items-center px-5 py-4">
                <div className="flex w-full flex-col divide-y divide-(--c-border) sm:flex-row sm:divide-y-0 sm:divide-x">
                    <div className="flex-1 py-2 first:pt-0 sm:px-5 sm:py-0 sm:first:pl-0">
                        <p className="text-xs text-(--c-text-muted)">Name</p>
                        <p className="mt-0.5 truncate text-sm font-medium text-(--c-text)">{name}</p>
                    </div>
                    <div className="flex-1 py-2 last:pb-0 sm:px-5 sm:py-0">
                        <p className="text-xs text-(--c-text-muted)">Email</p>
                        <p className="mt-0.5 truncate text-sm font-medium text-(--c-text)">{email}</p>
                    </div>
                </div>
            </Card.Body>
        </Card>
    )
}
