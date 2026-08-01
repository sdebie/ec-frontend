import {Link} from 'react-router-dom'
import type {FieldErrors, UseFormRegister} from 'react-hook-form'
import {InputField} from '@/shared/ui/components'
import type {WholesaleApplicationFormInput} from '../wholesaleApplicationSchema'

interface ApplicantSectionProps {
    register: UseFormRegister<WholesaleApplicationFormInput>
    errors: FieldErrors<WholesaleApplicationFormInput>
    /** Switches the account-email guidance: linked account vs create-one-first. */
    isSignedIn: boolean
}

export function ApplicantSection({register, errors, isSignedIn}: ApplicantSectionProps) {
    return (
        <section>
            <h2 className="mb-4 border-b border-(--sf-border) pb-2 text-base font-semibold text-(--sf-text)">Applicant
                Details</h2>
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
                        id="phone"
                        type="tel"
                        required
                        label="Phone"
                        error={errors.phone?.message}
                        {...register('phone')}
                    />
                </div>

                <div className="sm:col-span-2">
                    <InputField
                        id="accountEmail"
                        type="email"
                        label="Website account email"
                        helperText={isSignedIn
                            ? 'Linked to your signed-in account — wholesale pricing is enabled on it once approved.'
                            : (
                                <>
                                    Your application is linked to a website account when approved. If you do not
                                    have one yet, you can{' '}
                                    <Link
                                        to="/account/register"
                                        className="text-(--sf-accent) underline hover:opacity-80"
                                    >
                                        create a normal account
                                    </Link>{' '}
                                    now or after applying — your username and password stay the same.
                                </>
                            )}
                        error={errors.accountEmail?.message}
                        {...register('accountEmail')}
                    />
                </div>
            </div>
        </section>
    )
}
