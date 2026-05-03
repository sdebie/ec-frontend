const DELIVERY_SECTIONS = [
    {
        title: '1. Delivery areas and fees',
        paragraphs: [
            'Delivery fees (if applicable) are shown at checkout or confirmed by our team for special deliveries.',
            'We deliver to the address provided at checkout. Please ensure your details are correct.',
        ],
    },
    {
        title: '2. Processing and dispatch times',
        bullets: [
            'Orders are typically processed during business hours on working days.',
            'Dispatch timelines depend on stock availability and delivery destination.',
            'If there is a delay, we will contact you as soon as possible.',
        ],
    },
    {
        title: '3. Receiving your order',
        paragraphs: [
            'Please inspect parcels on delivery. If packaging is damaged, note it with the driver where possible.',
            'Report missing, damaged, or incorrect items as soon as possible via our contact page.',
        ],
    },
    {
        title: '4. Returns (change of mind)',
        paragraphs: [
            'Returns may be accepted on eligible items if unused, unopened (where applicable), and in resalable condition.',
            'Some items may be non-returnable for hygiene or safety reasons (e.g. certain PPE/medical/disposable products) once opened.',
            'Return approval may require proof of purchase and photographs.',
        ],
    },
    {
        title: '5. Returns (faulty/incorrect goods)',
        paragraphs: [
            'If goods are faulty or we sent the wrong item, we will arrange a replacement, repair, or refund as appropriate.',
            'We may request that the item be returned for inspection.',
        ],
    },
    {
        title: '6. Refunds',
        paragraphs: [
            'Approved refunds are processed back to the original payment method where possible.',
            'Processing times can vary depending on your bank or payment provider.',
        ],
    },
    {
        title: '7. How to request a return',
        paragraphs: [
            "Please contact us via our contact page with your order number, item details, and the reason for return. We'll guide you through the next steps.",
        ],
    },
] as const;

export default function UvhDeliveryAndReturnsPolicyPage() {
    return (
        <main className="w-full bg-(--sf-bg)">
            <section className="relative w-full overflow-hidden py-8 sm:py-10 lg:py-12">
                <div
                    className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,#000000_0%,#0a0202_42%,#2b0505_100%)]"
                    aria-hidden
                />
                <div
                    className="pointer-events-none absolute inset-0 bg-[linear-gradient(155deg,rgba(55,12,12,0.5)_0%,transparent_40%)]"
                    aria-hidden
                />
                <div
                    className="pointer-events-none absolute inset-y-0 right-0 w-[min(100%,52rem)] bg-[radial-gradient(ellipse_75%_115%_at_100%_50%,rgba(58,10,10,0.55)_0%,transparent_72%)]"
                    aria-hidden
                />

                <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="max-w-xl lg:max-w-2xl">
                        <div className="flex items-center gap-3">
                            <span className="h-0.5 w-8 shrink-0 bg-(--sf-accent)" aria-hidden />
                            <p className="text-xs font-bold uppercase tracking-[0.14em] text-white">
                                Important info
                            </p>
                        </div>
                        <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                            Delivery and Returns Policy
                        </h1>
                        <p className="mt-3 text-sm font-normal leading-relaxed text-white sm:text-base">
                            Delivery timelines, costs, and returns—so you know exactly what to expect after checkout.
                        </p>
                    </div>
                </div>
            </section>

            <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
                <div className="rounded-2xl border border-(--sf-border) bg-(--sf-panel) p-6 shadow-sm sm:p-8">
                    <p className="text-sm leading-7 text-(--sf-muted-text)">
                        This Delivery and Returns Policy explains how we deliver orders and how returns/refunds are
                        handled for purchases made from UVH Holdings.
                    </p>

                    <div className="mt-8 space-y-6">
                        {DELIVERY_SECTIONS.map((section) => (
                            <article key={section.title}>
                                <h2 className="text-lg font-semibold text-(--sf-text)">{section.title}</h2>
                                {'bullets' in section && section.bullets ? (
                                    <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-7 text-(--sf-muted-text)">
                                        {section.bullets.map((item) => (
                                            <li key={item}>{item}</li>
                                        ))}
                                    </ul>
                                ) : null}
                                {'paragraphs' in section && section.paragraphs ? (
                                    <div className="mt-2 space-y-2 text-sm leading-7 text-(--sf-muted-text)">
                                        {section.paragraphs.map((para) => (
                                            <p key={para}>{para}</p>
                                        ))}
                                    </div>
                                ) : null}
                            </article>
                        ))}
                    </div>

                    <p className="mt-10 text-sm font-medium text-(--sf-text)">Last updated: 3 May 2026</p>
                </div>
            </section>
        </main>
    );
}
