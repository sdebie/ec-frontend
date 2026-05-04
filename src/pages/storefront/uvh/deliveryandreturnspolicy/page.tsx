import {UvhTitleHero} from '@/pages/storefront/uvh/components/UvhTitleHero.tsx';

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
            <UvhTitleHero
                description="Delivery timelines, costs, and returns—so you know exactly what to expect after checkout."
                eyebrow="Important info"
                title="Delivery and Returns Policy"
            />

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
