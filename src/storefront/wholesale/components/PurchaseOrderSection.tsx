import {type Control, Controller} from 'react-hook-form'
import {Checkbox} from '@/shared/ui/components'
import type {WholesaleApplicationFormInput, WholesaleApplicationFormValues,} from '../wholesaleApplicationSchema'

interface PurchaseOrderSectionProps {
    control: Control<WholesaleApplicationFormInput, unknown, WholesaleApplicationFormValues>
}

export function PurchaseOrderSection({control}: PurchaseOrderSectionProps) {
    return (
        <section>
            <h2 className="mb-4 border-b border-(--sf-border) pb-2 text-base font-semibold text-(--sf-text)">
                Purchase Orders
            </h2>
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
