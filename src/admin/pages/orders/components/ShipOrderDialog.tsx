import {useState} from 'react'

import {ConfirmationDialog, Label} from '@/shared/ui/components'
import {Input} from '@/shared/ui/primitives'

export interface ShipOrderDialogProps {
    open: boolean
    onClose: () => void
    onConfirm: (tracking: { trackingNumber?: string; trackingCarrier?: string }) => void
    isLoading: boolean
}

/**
 * Captures the courier reference at the moment the order is handed over, which is the
 * only moment anyone knows it.
 *
 * Both fields are optional on purpose: a courier may issue no reference, and an order
 * still has to be able to leave. What the shopper receives changes accordingly — with a
 * reference the in-transit email hands it to them, without one it says so plainly rather
 * than showing an empty tracking box.
 */
export function ShipOrderDialog({open, onClose, onConfirm, isLoading}: ShipOrderDialogProps) {
    const [trackingNumber, setTrackingNumber] = useState('')
    const [trackingCarrier, setTrackingCarrier] = useState('')

    const handleConfirm = () => {
        onConfirm({
            trackingNumber: trackingNumber.trim() || undefined,
            trackingCarrier: trackingCarrier.trim() || undefined,
        })
        setTrackingNumber('')
        setTrackingCarrier('')
    }

    return (
        <ConfirmationDialog
            open={open}
            onClose={onClose}
            onConfirm={handleConfirm}
            title="Mark Order Shipped"
            description="This tells the customer their order is on its way. Add the courier's tracking reference if you have one — it goes straight into their email."
            variant="default"
            confirmLabel="Mark Shipped"
            isLoading={isLoading}
        >
            <div className="flex flex-col gap-3">
                <div>
                    <Label htmlFor="tracking-number">Tracking number</Label>
                    <Input
                        id="tracking-number"
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        placeholder="Optional"
                        disabled={isLoading}
                    />
                </div>
                <div>
                    <Label htmlFor="tracking-carrier">Courier</Label>
                    <Input
                        id="tracking-carrier"
                        value={trackingCarrier}
                        onChange={(e) => setTrackingCarrier(e.target.value)}
                        placeholder="Optional"
                        disabled={isLoading}
                    />
                </div>
            </div>
        </ConfirmationDialog>
    )
}
