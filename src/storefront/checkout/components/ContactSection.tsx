import { Controller, type Control } from 'react-hook-form'
import { Link } from 'react-router-dom'
import type { CheckoutFormValues } from '../checkoutFormSchema'

interface ContactSectionProps {
  control: Control<CheckoutFormValues>
  isAuthenticated: boolean
  customerProfile: { email: string; firstName: string; lastName: string } | null
}

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
              <label htmlFor="email" className="block text-sm font-medium text-(--sf-text)">
                Email address
              </label>
              <input
                {...field}
                id="email"
                type="email"
                readOnly={isAuthenticated}
                aria-invalid={!!fieldState.error}
                aria-describedby={fieldState.error ? 'email-error' : undefined}
                className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-(--sf-ring) ${
                  isAuthenticated ? 'bg-(--sf-surface-muted) text-(--sf-muted-text) cursor-not-allowed' : 'bg-(--sf-panel)'
                } ${fieldState.error ? 'border-red-500' : 'border-(--sf-border)'}`}
              />
              {fieldState.error && (
                <p id="email-error" className="mt-1 text-sm text-red-600">
                  {fieldState.error.message}
                </p>
              )}
            </div>
          )}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Controller
            name="firstName"
            control={control}
            render={({ field, fieldState }) => (
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-(--sf-text)">
                  First name
                </label>
                <input
                  {...field}
                  id="firstName"
                  type="text"
                  readOnly={isAuthenticated}
                  aria-invalid={!!fieldState.error}
                  aria-describedby={fieldState.error ? 'firstName-error' : undefined}
                  className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-(--sf-ring) ${
                    isAuthenticated ? 'bg-(--sf-surface-muted) text-(--sf-muted-text) cursor-not-allowed' : 'bg-(--sf-panel)'
                  } ${fieldState.error ? 'border-red-500' : 'border-(--sf-border)'}`}
                />
                {fieldState.error && (
                  <p id="firstName-error" className="mt-1 text-sm text-red-600">
                    {fieldState.error.message}
                  </p>
                )}
              </div>
            )}
          />

          <Controller
            name="lastName"
            control={control}
            render={({ field, fieldState }) => (
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-(--sf-text)">
                  Last name
                </label>
                <input
                  {...field}
                  id="lastName"
                  type="text"
                  readOnly={isAuthenticated}
                  aria-invalid={!!fieldState.error}
                  aria-describedby={fieldState.error ? 'lastName-error' : undefined}
                  className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-(--sf-ring) ${
                    isAuthenticated ? 'bg-(--sf-surface-muted) text-(--sf-muted-text) cursor-not-allowed' : 'bg-(--sf-panel)'
                  } ${fieldState.error ? 'border-red-500' : 'border-(--sf-border)'}`}
                />
                {fieldState.error && (
                  <p id="lastName-error" className="mt-1 text-sm text-red-600">
                    {fieldState.error.message}
                  </p>
                )}
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
