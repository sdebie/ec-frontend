import {Card} from '@/shared/ui/primitives'

interface OrderCustomerPanelProps {
    customerName: string | null
    customerEmail: string | null
}

function initialsFor(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean)
    if (parts.length === 0) return '?'
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function OrderCustomerPanel({customerName, customerEmail}: OrderCustomerPanelProps) {
    const name = customerName?.trim() || 'Guest'

    return (
        <Card as="section" variant="bordered">
            <Card.Header className="m-0 px-5 py-4">
                Customer
            </Card.Header>
            <Card.Body className="flex flex-col gap-4 p-5">
                <div className="flex items-center gap-3">
                    <span
                        aria-hidden="true"
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-(--c-accent) text-sm font-semibold text-(--c-accent-text)"
                    >
                        {initialsFor(name)}
                    </span>
                    <p className="font-medium text-(--c-text)">
                        {name}
                    </p>
                </div>

                {customerEmail && (
                    <dl className="border-t border-(--c-border) pt-3 text-sm">
                        <div className="flex justify-between">
                            <dt className="text-(--c-text-muted)">
                                Email
                            </dt>
                            <dd>
                                <a href={`mailto:${customerEmail}`}
                                   className="font-medium text-(--c-accent) hover:underline">
                                    {customerEmail}
                                </a>
                            </dd>
                        </div>
                    </dl>
                )}
            </Card.Body>
        </Card>
    )
}
