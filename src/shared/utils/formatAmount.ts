const DEFAULT_CURRENCY = 'ZAR'
const DEFAULT_LOCALE = 'en-ZA'

export function formatAmount(
    amount: number | null | undefined,
    currency: string = DEFAULT_CURRENCY,
    locale: string = DEFAULT_LOCALE,
): string {
    if (amount === null || amount === undefined || Number.isNaN(amount)) {
        return '-'
    }

    try {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency.toUpperCase(),
        }).format(amount)
    } catch {
        return `${currency.toUpperCase()} ${amount.toFixed(2)}`
    }
}
