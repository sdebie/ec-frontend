import type {FieldErrors, UseFormRegister} from 'react-hook-form'
import {InputField} from '@/shared/ui/components'
import type {WholesaleApplicationFormInput} from '../wholesaleApplicationSchema'

interface CompanySectionProps {
    register: UseFormRegister<WholesaleApplicationFormInput>
    errors: FieldErrors<WholesaleApplicationFormInput>
}

export function CompanySection({register, errors}: CompanySectionProps) {
    return (
        <section>
            <h2 className="mb-4 border-b border-(--sf-border) pb-2 text-base font-semibold text-(--sf-text)">
                Company Details
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                    <InputField
                        id="companyName"
                        type="text"
                        required
                        label="Company Name"
                        error={errors.companyName?.message}
                        {...register('companyName')}
                    />
                </div>

                <div className="sm:col-span-2">
                    <InputField
                        id="tradingName"
                        type="text"
                        label="Trading name (if different)"
                        {...register('tradingName')}
                    />
                </div>

                <div>
                    <InputField
                        id="companyPhone"
                        type="text"
                        label="Company phone"
                        {...register('companyPhone')}
                    />
                </div>

                <div>
                    <InputField
                        id="companyEmail"
                        type="email"
                        label="Company email"
                        error={errors.companyEmail?.message}
                        {...register('companyEmail')}
                    />
                </div>

                <div>
                    <InputField
                        id="vatNumber"
                        type="text"
                        label="VAT Number"
                        error={errors.vatNumber?.message}
                        {...register('vatNumber')}
                    />
                </div>

                <div>
                    <InputField
                        id="regNumber"
                        type="text"
                        label="Registration Number"
                        error={errors.regNumber?.message}
                        {...register('regNumber')}
                    />
                </div>
            </div>
        </section>
    )
}
