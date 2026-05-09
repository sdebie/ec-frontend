const DELIVERY_SECTIONS = [
    {
        title: '1. Delivery',
        body: 'Delivery options, fees, and timelines are confirmed at checkout or by our team where a quote applies. Please ensure your shipping details are accurate.',
    },
    {
        title: '2. Returns',
        body: 'Eligible items may be returned in line with applicable consumer law and our return windows. Some products may be excluded for hygiene, safety, or custom-order reasons.',
    },
    {
        title: '3. Refunds',
        body: 'Where a refund is approved, we aim to process it to the original payment method. Timing may depend on your bank or card issuer.',
    },
    {
        title: '4. Contact',
        body: 'For delivery issues or return requests, reach out via the contact page with your order number and a short description of the issue.',
    },
] as const;

export default function DeliveryAndReturnsPolicyPage() {
    return (
        <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8">
            <section className="rounded-2xl border border-(--sf-border) bg-(--sf-panel) p-6 sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-(--sf-accent)">Important info</p>
                <h1 className="mt-3 text-3xl font-bold tracking-tight text-(--sf-text) sm:text-4xl">
                    Delivery and Returns Policy
                </h1>
                <p className="mt-4 text-sm leading-7 text-(--sf-muted-text)">
                    How orders are shipped and how returns or refunds work on this demo storefront.
                </p>
            </section>

            <section className="rounded-2xl border border-(--sf-border) bg-(--sf-panel) p-6 sm:p-8">
                <div className="space-y-6">
                    {DELIVERY_SECTIONS.map((section) => (
                        <div key={section.title}>
                            <h2 className="text-lg font-semibold text-(--sf-text)">{section.title}</h2>
                            <p className="mt-2 text-sm leading-7 text-(--sf-muted-text)">{section.body}</p>
                        </div>
                    ))}
                </div>
                <p className="mt-8 text-sm font-medium text-(--sf-text)">Last updated: 3 May 2026</p>
            </section>
        </main>
    );
}
