import {Controller, type Control, type FieldErrors, type UseFormRegister} from 'react-hook-form'
import {Checkbox, InputField} from '@/shared/ui/components'
import type {
    WholesaleApplicationFormInput,
    WholesaleApplicationFormValues,
} from '../wholesaleApplicationSchema'

/** Delivery-address fields are disabled while they mirror the company address. */
const DISABLED_CLASSES = 'disabled:bg-(--sf-surface-muted) disabled:text-(--sf-muted-text)'

interface PostalAddressSectionProps {
    register: UseFormRegister<WholesaleApplicationFormInput>
    control: Control<WholesaleApplicationFormInput, unknown, WholesaleApplicationFormValues>
    errors: FieldErrors<WholesaleApplicationFormInput>
    sameAsPhysical: boolean
}

export function PostalAddressSection({register, control, errors, sameAsPhysical}: PostalAddressSectionProps) {
    return (
        <section className="rounded-lg border border-(--sf-border) bg-(--sf-panel) p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-(--sf-text)">Delivery Address (if different from company
                address)</h2>

            <Controller
                control={control}
                name="sameAsPhysical"
                render={({field}) => (
                    <Checkbox
                        className="mb-4"
                        label="Same as company address"
                        checked={!!field.value}
                        onChange={field.onChange}
                    />
                )}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                    <InputField
                        id="postalAddressLine1"
                        type="text"
                        disabled={sameAsPhysical}
                        label="Address Line 1"
                        className={DISABLED_CLASSES}
                        error={errors.postalAddressLine1?.message}
                        {...register('postalAddressLine1')}
                    />
                </div>

                <div className="sm:col-span-2">
                    <InputField
                        id="postalAddressLine2"
                        type="text"
                        disabled={sameAsPhysical}
                        label="Address Line 2"
                        className={DISABLED_CLASSES}
                        {...register('postalAddressLine2')}
                    />
                </div>

                <div>
                    <InputField
                        id="postalSuburb"
                        type="text"
                        disabled={sameAsPhysical}
                        label="Suburb"
                        className={DISABLED_CLASSES}
                        error={errors.postalSuburb?.message}
                        {...register('postalSuburb')}
                    />
                </div>

                <div>
                    <InputField
                        id="postalCity"
                        type="text"
                        disabled={sameAsPhysical}
                        label="City"
                        className={DISABLED_CLASSES}
                        error={errors.postalCity?.message}
                        {...register('postalCity')}
                    />
                </div>

                <div>
                    <InputField
                        id="postalProvince"
                        type="text"
                        disabled={sameAsPhysical}
                        label="Province"
                        className={DISABLED_CLASSES}
                        error={errors.postalProvince?.message}
                        {...register('postalProvince')}
                    />
                </div>

                <div>
                    <InputField
                        id="postalPostalCode"
                        type="text"
                        disabled={sameAsPhysical}
                        label="Postal Code"
                        className={DISABLED_CLASSES}
                        error={errors.postalPostalCode?.message}
                        {...register('postalPostalCode')}
                    />
                </div>
            </div>
        </section>
    )
}
