import {Card} from '@/shared/ui/primitives'

interface QuoteContactPanelProps {
    name: string
    email: string
    phone: string | null
    company: string | null
}

export function QuoteContactPanel({name, email, phone, company}: QuoteContactPanelProps) {
    return (
        <Card as="section" variant="bordered">
            <Card.Header className="m-0 px-5 py-4">Contact Information</Card.Header>
            <Card.Body className="flex flex-col gap-3 p-5">
                <p className="text-sm text-(--c-text)">
                    <span className="font-medium">Name:</span> {name}
                </p>
                <p className="text-sm text-(--c-text)">
                    <span className="font-medium">Email:</span> {email}
                </p>
                {phone && (
                    <p className="text-sm text-(--c-text)">
                        <span className="font-medium">Phone:</span> {phone}
                    </p>
                )}
                {company && (
                    <p className="text-sm text-(--c-text)">
                        <span className="font-medium">Company:</span> {company}
                    </p>
                )}
            </Card.Body>
        </Card>
    )
}
