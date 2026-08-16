import {Card} from '@/shared/ui/primitives'
import type {ShippingAddress} from '../types'

interface OrderCustomerCardProps {
    customerName: string | null
    customerEmail: string | null
    shippingAddress: ShippingAddress | null
    trackingNumber: string | null
    trackingCarrier: string | null
}

/** A titled block that renders nothing at all when it has nothing to say. */
function DetailBlock({title, children}: { title: string; children: React.ReactNode }) {
    return (
        <div className="mt-3 border-t border-(--c-border) pt-3">
            <p className="text-sm font-medium text-(--c-text)">{title}</p>
            {children}
        </div>
    )
}

export function OrderCustomerCard({
                                      customerName,
                                      customerEmail,
                                      shippingAddress,
                                      trackingNumber,
                                      trackingCarrier,
                                  }: OrderCustomerCardProps) {

    const {street, city, province, postalCode} = shippingAddress ?? {}
    const addressLines = [street, [city, province, postalCode].filter(Boolean).join(', ')].filter((line): line is string => !!line,)
    const tracking = [trackingNumber, trackingCarrier].filter((line): line is string => !!line)

    return (
        <Card as="section" elevation="none" padded={false}>
            <Card.Header className="m-0 px-5 py-4">Customer Information</Card.Header>
            <Card.Body className="flex flex-col gap-1 p-5">

                <p className="font-medium text-(--c-text)">
                    {customerName?.trim() || 'Guest'}
                </p>
                {customerEmail && (
                    <p className="text-sm text-(--c-text-muted)">
                        {customerEmail}
                    </p>
                )}

                <DetailBlock title="Shipping Address">
                    {addressLines.length === 0 ? (
                        <p className="text-sm text-(--c-text-muted)">
                            No address captured
                        </p>
                    ) : (
                        addressLines.map((line) => (
                            <p key={line} className="text-sm text-(--c-text-muted)">
                                {line}
                            </p>
                        ))
                    )}
                </DetailBlock>

                {tracking.length > 0 && (
                    <DetailBlock title="Tracking">
                        {tracking.map((line) => (
                            <p key={line} className="text-sm text-(--c-text-muted)">
                                {line}
                            </p>
                        ))}
                    </DetailBlock>
                )}
            </Card.Body>
        </Card>
    )
}
