import {Card} from '@/shared/ui/primitives'
import type {ShippingAddress} from '../types'

interface OrderShippingAddressPanelProps {
    customerName: string | null
    shippingAddress: ShippingAddress | null
    trackingNumber: string | null
    trackingCarrier: string | null
}

export function OrderShippingAddressPanel({
                                              customerName,
                                              shippingAddress,
                                              trackingNumber,
                                              trackingCarrier,
                                          }: OrderShippingAddressPanelProps) {
    const {street, city, province, postalCode} = shippingAddress ?? {}
    const addressLines = [street, [city, province, postalCode].filter(Boolean).join(', ')].filter((line): line is string => !!line)
    const tracking = [trackingNumber, trackingCarrier].filter((line): line is string => !!line)

    return (
        <Card as="section" variant="bordered">
            <Card.Header className="m-0 px-5 py-4">
                Shipping Address
            </Card.Header>
            <Card.Body className="flex flex-col gap-1 p-5 text-sm">
                {addressLines.length === 0 ? (
                    <p className="text-(--c-text-muted)">
                        No address captured
                    </p>
                ) : (
                    <>
                        <p className="font-medium text-(--c-text)">
                            {customerName?.trim() || 'Guest'}
                        </p>
                        {addressLines.map((line) => (
                            <p key={line} className="text-(--c-text-muted)">
                                {line}
                            </p>
                        ))}
                    </>
                )}

                {tracking.length > 0 && (
                    <div className="mt-3 border-t border-(--c-border) pt-3">
                        <p className="font-medium text-(--c-text)">
                            Tracking
                        </p>
                        {tracking.map((line) => (
                            <p key={line} className="text-(--c-text-muted)">
                                {line}
                            </p>
                        ))}
                    </div>
                )}
            </Card.Body>
        </Card>
    )
}
