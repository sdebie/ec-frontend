import type {FieldErrors, UseFormRegister} from 'react-hook-form'
import {InputField} from '@/shared/ui/components'
import type {WholesaleApplicationFormInput} from '../wholesaleApplicationSchema'

interface PhysicalAddressSectionProps {
    register: UseFormRegister<WholesaleApplicationFormInput>
    errors: FieldErrors<WholesaleApplicationFormInput>
}

export function PhysicalAddressSection({register, errors}: PhysicalAddressSectionProps) {
    return (
        <section className="rounded-lg border border-(--sf-border) bg-(--sf-panel) p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-(--sf-text)">Company Address</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                    <InputField
                        id="physicalAddressLine1"
                        type="text"
                        required
                        label="Address Line 1"
                        error={errors.physicalAddressLine1?.message}
                        {...register('physicalAddressLine1')}
                    />
                </div>

                <div className="sm:col-span-2">
                    <InputField
                        id="physicalAddressLine2"
                        type="text"
                        label="Address Line 2"
                        {...register('physicalAddressLine2')}
                    />
                </div>

                <div>
                    <InputField
                        id="physicalSuburb"
                        type="text"
                        label="Suburb"
                        error={errors.physicalSuburb?.message}
                        {...register('physicalSuburb')}
                    />
                </div>

                <div>
                    <InputField
                        id="physicalCity"
                        type="text"
                        required
                        label="City"
                        error={errors.physicalCity?.message}
                        {...register('physicalCity')}
                    />
                </div>

                <div>
                    <InputField
                        id="physicalProvince"
                        type="text"
                        required
                        label="Province"
                        error={errors.physicalProvince?.message}
                        {...register('physicalProvince')}
                    />
                </div>

                <div>
                    <InputField
                        id="physicalPostalCode"
                        type="text"
                        required
                        label="Postal Code"
                        error={errors.physicalPostalCode?.message}
                        {...register('physicalPostalCode')}
                    />
                </div>
            </div>
        </section>
    )
}
