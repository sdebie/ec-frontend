import {Card} from '@/shared/ui/primitives'

interface QuoteMessagePanelProps {
    message: string
}

export function QuoteMessagePanel({message}: QuoteMessagePanelProps) {
    return (
        <Card as="section" variant="bordered">
            <Card.Header className="m-0 px-5 py-4">Message</Card.Header>
            <Card.Body className="p-5">
                <p className="whitespace-pre-wrap text-sm text-(--c-text)">{message}</p>
            </Card.Body>
        </Card>
    )
}
