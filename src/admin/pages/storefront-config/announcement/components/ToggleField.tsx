export function ToggleField({
    checked,
    onChange,
    label,
    statusText,
    helpText,
}: {
    checked: boolean
    onChange: (checked: boolean) => void
    label: string
    statusText?: string
    helpText?: string
}) {
    return (
        <div className="space-y-1">
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    role="switch"
                    aria-checked={checked}
                    aria-label={label}
                    onClick={() => onChange(!checked)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                        checked ? 'bg-(--c-accent)' : 'bg-(--c-surface-hover)'
                    }`}
                >
                    <span
                        className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-(--c-panel) shadow ring-0 transition-transform duration-200 ${
                            checked ? 'translate-x-5' : 'translate-x-0'
                        }`}
                    />
                </button>
                <span className="text-sm font-medium text-(--c-text)">{statusText ?? label}</span>
            </div>
            {helpText && <p className="text-xs text-(--c-text-muted)">{helpText}</p>}
        </div>
    )
}
