import { Controller, type Control } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { InputField } from '@/shared/ui/components/form/InputField'
import type { CheckoutFormValues } from '../checkoutFormSchema'

interface ContactSectionProps {
  control: Control<CheckoutFormValues>
  isAuthenticated: boolean
  customerProfile: { email: string; firstName: string; lastName: string } | null
}

/**
 * Signed-in shoppers get their profile values back read-only; the muted
 * treatment signals that without disabling the control (a disabled field
 * would drop out of the tab order and out of the submitted form).
 */
const READ_ONLY_CLASSES = 'bg-(--sf-surface-muted) text-(--sf-muted-text) cursor-not-allowed'

export function ContactSection({ control, isAuthenticated, customerProfile }: ContactSectionProps) {
  return (
    <section aria-labelledby="contact-heading">
      <h2 id="contact-heading" className="text-lg font-semibold text-(--sf-text)">
        Contact information
      </h2>

      {isAuthenticated && customerProfile && (
        <p className="mt-1 text-sm text-(--sf-muted-text)">
          Logged in as {customerProfile.email}
        </p>
      )}

      {!isAuthenticated && (
        <p className="mt-1 text-sm text-(--sf-muted-text)">
          Have an account?{' '}
          <Link to="/account/login" className="text-(--sf-accent) hover:opacity-90 underline">
            Sign in
          </Link>
        </p>
      )}

      <div className="mt-4 space-y-4">
        <Controller
          name="email"
          control={control}
          render={({ field, fieldState }) => (
            <div>
              <InputField
                {...field}
                id="email"
                type="email"
                label="Email address"
                readOnly={isAuthenticated}
                className={isAuthenticated ? READ_ONLY_CLASSES : undefined}
                error={fieldState.error?.message}
              />
            </div>
          )}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Controller
            name="firstName"
            control={control}
            render={({ field, fieldState }) => (
              <div>
                <InputField
                  {...field}
                  id="firstName"
                  type="text"
                  label="First name"
                  readOnly={isAuthenticated}
                  className={isAuthenticated ? READ_ONLY_CLASSES : undefined}
                  error={fieldState.error?.message}
                />
              </div>
            )}
          />

          <Controller
            name="lastName"
            control={control}
            render={({ field, fieldState }) => (
              <div>
                <InputField
                  {...field}
                  id="lastName"
                  type="text"
                  label="Last name"
                  readOnly={isAuthenticated}
                  className={isAuthenticated ? READ_ONLY_CLASSES : undefined}
                  error={fieldState.error?.message}
                />
              </div>
            )}
          />
        </div>
      </div>

      {!isAuthenticated && (
        <p className="mt-3 text-sm text-(--sf-muted-text)">
          <Link to="/register" className="text-(--sf-accent) hover:opacity-90 underline">
            Create an account
          </Link>
        </p>
      )}
    </section>
  )
}
