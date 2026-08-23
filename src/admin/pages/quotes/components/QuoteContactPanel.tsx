import {Card} from '@/shared/ui/primitives'
import {InfoRow} from '@/admin/pages/customers/components/InfoRow'

interface QuoteContactPanelProps {
    name: string
    email: string
}

/**
 * Read-only identity of who submitted the quote request — no edit affordance,
 * since contact details for a submitted request aren't editable from here.
 */
export function QuoteContactPanel({name, email}: QuoteContactPanelProps) {
    return (
        <Card as="section" variant="bordered" className="flex h-full flex-col">
            <Card.Header className="m-0 px-5 py-4">Contact Information</Card.Header>
            <Card.Body className="divide-y divide-(--c-border) px-5 py-1">
                <InfoRow label="Name" value={name}/>
                <InfoRow label="Email" value={email}/>
            </Card.Body>
        </Card>
    )
}
