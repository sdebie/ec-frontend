import type {FieldErrors, UseFormRegister} from 'react-hook-form'
import {InputField} from '@/shared/ui/components'
import type {WholesaleApplicationFormInput} from '../wholesaleApplicationSchema'

interface FinanceContactSectionProps {
    register: UseFormRegister<WholesaleApplicationFormInput>
    errors: FieldErrors<WholesaleApplicationFormInput>
}

export function FinanceContactSection({register, errors}: FinanceContactSectionProps) {
    return (
        <section>
            <h2 className="mb-4 border-b border-(--sf-border) pb-2 text-base font-semibold text-(--sf-text)">Financial / Accounts Contact</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                    <InputField
                        id="financeContactName"
                        type="text"
                        label="Financial / accounts contact name"
                        error={errors.financeContactName?.message}
                        {...register('financeContactName')}
                    />
                </div>

                <div>
                    <InputField
                        id="financeContactEmail"
                        type="email"
                        label="Financial / accounts email"
                        error={errors.financeContactEmail?.message}
                        {...register('financeContactEmail')}
                    />
                </div>

                <div>
                    <InputField
                        id="financeContactPhone"
                        type="tel"
                        label="Financial / accounts phone"
                        error={errors.financeContactPhone?.message}
                        {...register('financeContactPhone')}
                    />
                </div>
            </div>
        </section>
    )
}
