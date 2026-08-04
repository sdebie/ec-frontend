import type {Control, FieldErrors} from 'react-hook-form'
import {Controller, useWatch} from 'react-hook-form'
import {useShippingMethods} from '../hooks/useShippingMethods'
import {useStorefrontConfig} from '@/shared/config/storefrontConfig.context'
import {formatAmount} from '@/shared/utils/formatAmount'
import type {CheckoutFormValues} from '../checkoutFormSchema'
import {isDeliveryMethod} from '../utils/isDeliveryMethod'
import {InputField} from '@/shared/ui/components/form/InputField'
import {CheckoutSection} from './CheckoutSection'

/**
 * Capabilities only (law 14): `control` to bind fields and `errors` to report
 * them — not `watch` or `setValue`, powers no reviewer could see it needed. The
 * selected method is read with `useWatch`, and clearing the address on a switch
 * to collection belongs to the page, which owns the form.
 */
interface ShippingSectionProps {
    control: Control<CheckoutFormValues>
    errors: FieldErrors<CheckoutFormValues>
}

const ADDRESS_FIELDS = [
    {name: 'streetAddress', label: 'Street address'},
    {name: 'city', label: 'City'},
    {name: 'province', label: 'Province'},
    {name: 'postalCode', label: 'Postal code'},
] as const

export function ShippingSection({control, errors}: ShippingSectionProps) {
    const {currency, locale} = useStorefrontConfig()
    const {data: shippingMethods, isLoading, isError, refetch} = useShippingMethods()

    const selectedMethodId = useWatch({control, name: 'shippingMethodId'})
    const selectedMethod = shippingMethods?.find((m) => m.id === selectedMethodId)
    const showAddressForm = selectedMethod ? isDeliveryMethod(selectedMethod) : false

    if (isLoading) {
        return (
            <CheckoutSection id="shipping" title="Delivery method">
                <div className="animate-pulse space-y-3">
                    <div className="h-12 rounded bg-(--sf-surface-muted)"/>
                    <div className="h-12 rounded bg-(--sf-surface-muted)"/>
                </div>
            </CheckoutSection>
        )
    }

    if (isError) {
        return (
            <CheckoutSection id="shipping" title="Delivery method">
                <div className="text-sm text-(--sf-error)">
                    Unable to load delivery options.{' '}
                    <button
                        type="button"
                        onClick={() => refetch()}
                        className="cursor-pointer font-medium underline hover:opacity-80"
                    >
                        Retry
                    </button>
                </div>
            </CheckoutSection>
        )
    }

    return (
        <CheckoutSection id="shipping" title="Delivery method">

            <Controller
                name="shippingMethodId"
                control={control}
                render={({field}) => (
                    <fieldset>
                        <legend className="sr-only">Select a delivery method</legend>
                        <div className="space-y-2">
                            {shippingMethods?.map((method) => (
                                <label
                                    key={method.id}
                                    className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors ${
                                        field.value === method.id ? 'border-(--sf-accent) bg-(--sf-surface-muted)' : 'border-(--sf-border) hover:border-(--sf-accent)'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="radio"
                                            {...field}
                                            value={method.id}
                                            checked={field.value === method.id}
                                            onChange={() => field.onChange(method.id)}
                                            className="h-4 w-4 accent-(--sf-accent)"
                                        />
                                        <div>
                                            <span className="text-sm font-medium text-(--sf-text)">
                                                {method.name}
                                            </span>
                                            {method.estimatedDays && (
                                                <span className="ml-2 text-xs text-(--sf-muted-text)">
                                                    {method.estimatedDays}
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
                            <p className="mt-1 text-sm text-(--sf-error)">
                                {errors.shippingMethodId.message}
                            </p>
                        )}
                    </fieldset>
                )}
            />

            {showAddressForm && (
                <div className="mt-4 space-y-3">
                    <h3 className="text-sm font-medium text-(--sf-text)">Delivery address</h3>

                    {ADDRESS_FIELDS.map(({name, label}) => (
                        <Controller
                            key={name}
                            name={name}
                            control={control}
                            render={({field}) => (
                                <InputField
                                    {...field}
                                    id={name}
                                    type="text"
                                    label={label}
                                    error={errors[name]?.message}
                                />
                            )}
                        />
                    ))}
                </div>
            )}
        </CheckoutSection>
    )
}
