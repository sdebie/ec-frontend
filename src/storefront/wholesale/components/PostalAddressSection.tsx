import {type Control, type FieldErrors, type UseFormRegister, useWatch} from 'react-hook-form'
import {InputField} from '@/shared/ui/components'
import type {WholesaleApplicationFormInput, WholesaleApplicationFormValues,} from '../wholesaleApplicationSchema'

/** Mirrored delivery fields are disabled while they reflect the company address. */
const DISABLED_CLASSES = 'disabled:bg-(--sf-surface-muted) disabled:text-(--sf-muted-text)'

interface PostalAddressSectionProps {
    register: UseFormRegister<WholesaleApplicationFormInput>
    control: Control<WholesaleApplicationFormInput, unknown, WholesaleApplicationFormValues>
    errors: FieldErrors<WholesaleApplicationFormInput>
    sameAsPhysical: boolean
}

export function PostalAddressSection({register, control, errors, sameAsPhysical}: PostalAddressSectionProps) {
    // Live company-address values so the disabled fields always show the address
    // that will actually be used for delivery while the mirror is on.
    const [line1, line2, suburb, city, province, postalCode] = useWatch({
        control,
        name: [
            'physicalAddressLine1', 'physicalAddressLine2', 'physicalSuburb',
            'physicalCity', 'physicalProvince', 'physicalPostalCode',
        ],
    })

    const fields = [
        {id: 'postalAddressLine1', label: 'Address Line 1', mirrored: line1 ?? '', wide: true, required: true},
        {id: 'postalAddressLine2', label: 'Address Line 2', mirrored: line2 ?? '', wide: true, required: false},
        {id: 'postalSuburb', label: 'Suburb', mirrored: suburb ?? '', wide: false, required: false},
        {id: 'postalCity', label: 'City', mirrored: city ?? '', wide: false, required: true},
        {id: 'postalProvince', label: 'Province', mirrored: province ?? '', wide: false, required: true},
        {id: 'postalPostalCode', label: 'Postal Code', mirrored: postalCode ?? '', wide: false, required: true},
    ] as const

    return (
        <section>
            <h2 className="mb-4 border-b border-(--sf-border) pb-2 text-base font-semibold text-(--sf-text)">
                Delivery Address
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {fields.map((field) => (
                    <div key={field.id} className={field.wide ? 'sm:col-span-2' : undefined}>
                        {sameAsPhysical ? (
                            // Keyed per mode: reusing one DOM input across the controlled
                            // (mirror) and uncontrolled (registered) branches leaks the
                            // mirrored value into the editable state.
                            <InputField
                                key={`${field.id}-mirror`}
                                id={field.id}
                                type="text"
                                label={field.label}
                                value={field.mirrored}
                                disabled
                                readOnly
                                className={DISABLED_CLASSES}
                            />
                        ) : (
                            <InputField
                                key={`${field.id}-edit`}
                                id={field.id}
                                type="text"
                                required={field.required}
                                label={field.label}
                                error={errors[field.id]?.message}
                                {...register(field.id)}
                            />
                        )}
                    </div>
                ))}
            </div>
        </section>
    )
}
