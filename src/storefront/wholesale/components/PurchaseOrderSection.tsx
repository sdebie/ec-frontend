import {Controller, type Control} from 'react-hook-form'
import {Checkbox} from '@/shared/ui/components'
import type {
    WholesaleApplicationFormInput,
    WholesaleApplicationFormValues,
} from '../wholesaleApplicationSchema'

interface PurchaseOrderSectionProps {
    control: Control<WholesaleApplicationFormInput, unknown, WholesaleApplicationFormValues>
}

export function PurchaseOrderSection({control}: PurchaseOrderSectionProps) {
    return (
        <section className="rounded-lg border border-(--sf-border) bg-(--sf-panel) p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-(--sf-text)">Purchase Orders</h2>
            <Controller
                control={control}
                name="purchaseOrderRequired"
                render={({field}) => (
                    <Checkbox
                        label="Do you require purchase orders?"
                        checked={!!field.value}
                        onChange={field.onChange}
                    />
                )}
            />
        </section>
    )
}
