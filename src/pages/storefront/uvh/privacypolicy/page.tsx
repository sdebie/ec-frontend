import {UvhTitleHero} from '@/pages/storefront/uvh/components/UvhTitleHero.tsx';

const PRIVACY_SECTIONS = [
    {
        title: '1. Information we collect',
        bullets: [
            'Contact details (e.g. name, email, phone number)',
            'Delivery and billing details (e.g. address)',
            'Order and payment-related information (payment processing is handled by our payment providers)',
            'Website usage information (e.g. cookies and analytics, where enabled)',
        ],
    },
    {
        title: '2. How we use your information',
        bullets: [
            'To process and deliver your orders',
            'To provide customer support',
            'To improve our website and services',
            'To comply with legal and regulatory obligations',
        ],
    },
    {
        title: '3. Sharing your information',
        bullets: [
            'Delivery partners/couriers for fulfilment',
            'Payment providers for transaction processing',
            'Service providers who help run the website (hosting, email, etc.), where necessary',
        ],
        body: 'We do not sell your personal information.',
    },
    {
        title: '4. Security',
        body: 'We take reasonable technical and organisational measures to protect your personal information. However, no method of transmission over the internet is 100% secure.',
    },
    {
        title: '5. Your rights',
        body: 'You may request access to, correction of, or deletion of your personal information (subject to legal requirements). To make a request, contact us via our contact page.',
    },
    {
        title: '6. Changes to this policy',
        body: 'We may update this policy from time to time. The “Last updated” date will indicate when changes were made.',
    },
] as const;

export default function UvhPrivacyPolicyPage() {
    return (
        <main className="w-full bg-(--sf-bg)">
            <UvhTitleHero
                description="How we collect, use, store, and protect your personal information when you use our website or place an order."
                eyebrow="Important info"
                title="Privacy Policy"
            />

            <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
                <div className="rounded-2xl border border-(--sf-border) bg-(--sf-panel) p-6 shadow-sm sm:p-8">
                    <p className="text-sm leading-7 text-(--sf-muted-text)">
                        This Privacy Policy explains how UVH Holdings collects, uses, and protects your personal
                        information when you use our website and services.
                    </p>

                    <div className="mt-8 space-y-6">
                        {PRIVACY_SECTIONS.map((section) => (
                            <article key={section.title}>
                                <h2 className="text-lg font-semibold text-(--sf-text)">{section.title}</h2>
                                {'bullets' in section && section.bullets ? (
                                    <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-7 text-(--sf-muted-text)">
                                        {section.bullets.map((item) => (
                                            <li key={item}>{item}</li>
                                        ))}
                                    </ul>
                                ) : null}
                                {'body' in section && section.body ? (
                                    <p
                                        className={
                                            'bullets' in section && section.bullets?.length
                                                ? 'mt-3 text-sm leading-7 text-(--sf-muted-text)'
                                                : 'mt-2 text-sm leading-7 text-(--sf-muted-text)'
                                        }
                                    >
                                        {section.body}
                                    </p>
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
