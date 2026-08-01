import type {FieldErrors, UseFormRegister} from 'react-hook-form'
import {InputField} from '@/shared/ui/components'
import type {WholesaleApplicationFormInput} from '../wholesaleApplicationSchema'

interface ApplicantSectionProps {
    register: UseFormRegister<WholesaleApplicationFormInput>
    errors: FieldErrors<WholesaleApplicationFormInput>
}

export function ApplicantSection({register, errors}: ApplicantSectionProps) {
    return (
        <section className="rounded-lg border border-(--sf-border) bg-(--sf-panel) p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-(--sf-text)">Applicant Details</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                    <InputField
                        id="firstName"
                        type="text"
                        required
                        label="First Name"
                        error={errors.firstName?.message}
                        {...register('firstName')}
                    />
                </div>

                <div>
                    <InputField
                        id="lastName"
                        type="text"
                        required
                        label="Last Name"
                        error={errors.lastName?.message}
                        {...register('lastName')}
                    />
                </div>

                <div>
                    <InputField
                        id="applicantEmail"
                        type="email"
                        required
                        label="Email"
                        error={errors.applicantEmail?.message}
                        {...register('applicantEmail')}
                    />
                </div>

                <div>
                    <InputField
                        id="accountEmail"
                        type="email"
                        label="Existing website account email (recommended)"
                        error={errors.accountEmail?.message}
                        {...register('accountEmail')}
                    />
                </div>

                <div>
                    <InputField
                        id="phone"
                        type="tel"
                        required
                        label="Phone"
                        error={errors.phone?.message}
                        {...register('phone')}
                    />
                </div>
            </div>
        </section>
    )
}
