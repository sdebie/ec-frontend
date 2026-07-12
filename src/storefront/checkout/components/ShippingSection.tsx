import { useEffect } from 'react'
import { Controller } from 'react-hook-form'
import type { Control, FieldErrors, UseFormSetValue, UseFormWatch } from 'react-hook-form'
import { useShippingMethods } from '../hooks/useShippingMethods'
import { useStorefrontConfig } from '@/shared/config/storefrontConfig.context'
import { formatAmount } from '@/shared/utils/formatAmount'
import type { CheckoutFormValues } from '../checkoutFormSchema'
import { isDeliveryMethod } from '../utils/isDeliveryMethod'

interface ShippingSectionProps {
  control: Control<CheckoutFormValues>
  watch: UseFormWatch<CheckoutFormValues>
  errors: FieldErrors<CheckoutFormValues>
  setValue: UseFormSetValue<CheckoutFormValues>
}

export function ShippingSection({ control, watch, errors, setValue }: ShippingSectionProps) {
  const { currency, locale } = useStorefrontConfig()
  const { data: shippingMethods, isLoading, isError, refetch } = useShippingMethods()

  const selectedMethodId = watch('shippingMethodId')

  const selectedMethod = shippingMethods?.find((m) => m.id === selectedMethodId)
  const showAddressForm = selectedMethod ? isDeliveryMethod(selectedMethod) : false

  // Clear address fields when switching to a collection method
  useEffect(() => {
    if (selectedMethod && !isDeliveryMethod(selectedMethod)) {
      setValue('streetAddress', '', { shouldValidate: false })
      setValue('city', '', { shouldValidate: false })
      setValue('province', '', { shouldValidate: false })
      setValue('postalCode', '', { shouldValidate: false })
    }
  }, [selectedMethodId, selectedMethod, setValue])

  if (isLoading) {
    return (
      <section aria-labelledby="shipping-heading">
        <h2 id="shipping-heading" className="text-lg font-semibold mb-4">
          Shipping method
        </h2>
        <div className="animate-pulse space-y-3">
          <div className="h-12 bg-(--sf-surface-muted) rounded" />
          <div className="h-12 bg-(--sf-surface-muted) rounded" />
        </div>
      </section>
    )
  }

  if (isError) {
    return (
      <section aria-labelledby="shipping-heading">
        <h2 id="shipping-heading" className="text-lg font-semibold mb-4">
          Shipping method
        </h2>
        <div className="text-red-600 text-sm">
          Unable to load shipping options.{' '}
          <button
            type="button"
            onClick={() => refetch()}
            className="underline font-medium hover:text-red-800"
          >
            Retry
          </button>
        </div>
      </section>
    )
  }

  return (
    <section aria-labelledby="shipping-heading">
      <h2 id="shipping-heading" className="text-lg font-semibold mb-4">
        Shipping method
      </h2>

      <Controller
        name="shippingMethodId"
        control={control}
        render={({ field }) => (
          <fieldset>
            <legend className="sr-only">Select a shipping method</legend>
            <div className="space-y-2">
              {shippingMethods?.map((method) => (
                <label
                  key={method.id}
                  className={`flex items-center justify-between p-3 border rounded-md cursor-pointer transition-colors ${
                    field.value === method.id
                      ? 'border-(--sf-accent) bg-(--sf-surface-muted)'
                      : 'border-(--sf-border) hover:border-(--sf-accent)'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      {...field}
                      value={method.id}
                      checked={field.value === method.id}
                      onChange={() => field.onChange(method.id)}
                      className="h-4 w-4 accent-(--sf-accent) border-(--sf-border) focus:ring-(--sf-ring)"
                    />
                    <div>
                      <span className="text-sm font-medium text-(--sf-text)">
                        {method.name}
                      </span>
                      {method.estimatedDays && (
                        <span className="ml-2 text-xs text-(--sf-muted-text)">
                          ({method.estimatedDays} days)
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-sm font-medium text-(--sf-text)">
                    {formatAmount(method.baseFee, currency, locale)}
                  </span>
                </label>
              ))}
            </div>
            {errors.shippingMethodId && (
              <p className="mt-1 text-sm text-red-600">{errors.shippingMethodId.message}</p>
            )}
          </fieldset>
        )}
      />

      {showAddressForm && (
        <div className="mt-4 space-y-3">
          <h3 className="text-sm font-medium text-(--sf-text)">Delivery address</h3>

          <div>
            <Controller
              name="streetAddress"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  placeholder="Street address"
                  aria-label="Street address"
                  aria-invalid={!!errors.streetAddress}
                  className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-(--sf-ring) ${
                    errors.streetAddress ? 'border-red-500' : 'border-(--sf-border)'
                  }`}
                />
              )}
            />
            {errors.streetAddress && (
              <p className="mt-1 text-sm text-red-600">{errors.streetAddress.message}</p>
            )}
          </div>

          <div>
            <Controller
              name="city"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  placeholder="City"
                  aria-label="City"
                  aria-invalid={!!errors.city}
                  className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-(--sf-ring) ${
                    errors.city ? 'border-red-500' : 'border-(--sf-border)'
                  }`}
                />
              )}
            />
            {errors.city && (
              <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
            )}
          </div>

          <div>
            <Controller
              name="province"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  placeholder="Province"
                  aria-label="Province"
                  aria-invalid={!!errors.province}
                  className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-(--sf-ring) ${
                    errors.province ? 'border-red-500' : 'border-(--sf-border)'
                  }`}
                />
              )}
            />
            {errors.province && (
              <p className="mt-1 text-sm text-red-600">{errors.province.message}</p>
            )}
          </div>

          <div>
            <Controller
              name="postalCode"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  placeholder="Postal code"
                  aria-label="Postal code"
                  aria-invalid={!!errors.postalCode}
                  className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-(--sf-ring) ${
                    errors.postalCode ? 'border-red-500' : 'border-(--sf-border)'
                  }`}
                />
              )}
            />
            {errors.postalCode && (
              <p className="mt-1 text-sm text-red-600">{errors.postalCode.message}</p>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
