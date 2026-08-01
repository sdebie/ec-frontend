import type {WholesaleApplicationFormInput} from '../wholesaleApplicationSchema'

interface ReviewSummaryProps {
    values: Partial<WholesaleApplicationFormInput>
    /** Jumps the wizard back to the step owning the group being edited. */
    onEdit: (step: number) => void
}

function compact(parts: Array<string | undefined>): string {
    return parts.filter((p) => p?.trim()).join(' · ')
}

export function ReviewSummary({values, onEdit}: ReviewSummaryProps) {
    const fullName = [values.firstName, values.lastName].filter((v) => v?.trim()).join(' ')
    const groups = [
        {
            step: 0,
            label: 'Applicant',
            value: compact([fullName, values.applicantEmail, values.phone]),
        },
        {
            step: 1,
            label: 'Company',
            value: compact([values.companyName, values.tradingName]),
        },
        {
            step: 2,
            label: 'Company address',
            value: compact([values.physicalAddressLine1, values.physicalCity, values.physicalPostalCode]),
        },
        {
            step: 3,
            label: 'Finance contact',
            value: compact([values.financeContactName, values.financeContactEmail, values.financeContactPhone]),
        },
        {
            step: 3,
            label: 'Purchase orders',
            value: values.purchaseOrderRequired ? 'Required' : 'Not required',
        },
    ]

    return (
        <section>
            <h2 className="mb-4 border-b border-(--sf-border) pb-2 text-base font-semibold text-(--sf-text)">Review your details</h2>
            <dl className="divide-y divide-(--sf-border) rounded-md border border-(--sf-border)">
                {groups.map((group) => (
                    <div key={group.label} className="flex items-center justify-between gap-4 px-4 py-3">
                        <div className="min-w-0">
                            <dt className="text-xs font-medium uppercase tracking-wide text-(--sf-muted-text)">
                                {group.label}
                            </dt>
                            <dd className="mt-0.5 truncate text-sm text-(--sf-text)">{group.value || '—'}</dd>
                        </div>
                        <button
                            type="button"
                            onClick={() => onEdit(group.step)}
                            className="shrink-0 text-sm font-medium text-(--sf-accent) hover:opacity-80"
                        >
                            Edit
                        </button>
                    </div>
                ))}
            </dl>
        </section>
    )
}
