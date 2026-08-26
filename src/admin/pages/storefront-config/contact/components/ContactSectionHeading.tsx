interface ContactSectionHeadingProps {
    title: string
    description?: string
}

/**
 * Plain heading + description, no card chrome — the nav item already carries
 * the section's icon, so repeating an icon badge here would reintroduce the
 * boxed-panel look the redesign moves away from. Matches the storefront's own
 * ContactUsPage heading treatment (h2 + muted p) rather than the admin's
 * bordered-panel convention.
 */
export function ContactSectionHeading({title, description}: ContactSectionHeadingProps) {
    return (
        <div className="mb-6">
            <h2 className="text-base font-semibold text-(--c-text)">{title}</h2>
            {description && <p className="mt-1 text-sm text-(--c-text-muted)">{description}</p>}
        </div>
    )
}
