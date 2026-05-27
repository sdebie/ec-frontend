import {UvhTitleHero} from '@/tenants/uvh/components/UvhTitleHero.tsx';

const TERMS_SECTIONS = [
    {
        title: '1. About us',
        body: 'UVH Holdings supplies products listed on this website. If you need help, contact us via our contact page.',
    },
    {
        title: '2. Orders and contract',
        body: 'Placing an order constitutes an offer to purchase. We accept the order once payment is received (or once approved for account payment terms, where applicable). We may refuse or cancel an order due to stock availability, pricing errors, suspected fraud, or other valid reasons.',
    },
    {
        title: '3. Pricing and VAT',
        body: 'Prices are shown in South African Rand (ZAR) and typically display VAT-inclusive pricing where indicated. We reserve the right to correct obvious errors. If a price changes after you place an order, we will contact you before processing.',
    },
    {
        title: '4. Payments',
        body: 'Payment methods available at checkout may vary over time. Orders may only be dispatched once cleared payment is received, unless agreed otherwise.',
    },
    {
        title: '5. Stock availability and substitutions',
        body: 'Stock quantities shown are best-effort and may not always reflect real-time availability. If an item is unavailable, we will contact you to arrange a substitution, backorder, or refund.',
    },
    {
        title: '6. Delivery and returns',
        body: 'Our delivery timelines, fees, and return rules are described in our Delivery and Returns Policy. Please read it carefully before ordering.',
    },
    {
        title: '7. Warranty and product information',
        body: 'Product images and descriptions are for illustration and information purposes and may vary by supplier batch. Where manufacturer warranties apply, those terms will govern the warranty process.',
    },
    {
        title: '8. Limitation of liability',
        body: 'To the maximum extent permitted by law, we are not liable for indirect or consequential losses. Our total liability for any claim is limited to the amount paid for the relevant order.',
    },
    {
        title: '9. Accounts and wholesale',
        body: 'You are responsible for maintaining the confidentiality of your account credentials. Wholesale pricing (if available) may be subject to approval and may apply only to eligible products and customers.',
    },
    {
        title: '10. Privacy',
        body: 'We process personal information in line with our Privacy Policy.',
    },
    {
        title: '11. Governing law',
        body: 'These terms are governed by the laws of South Africa. Any disputes will be handled in the appropriate South African courts.',
    },
] as const;

export default function UvhTermsAndConditionsPage() {
    return (
        <main className="w-full bg-(--sf-bg)">
            <UvhTitleHero
                description="Our terms of use and purchasing terms for the UVH Holdings website and orders."
                eyebrow="Important info"
                title="Terms and Conditions"
            />

            <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
                <div className="rounded-2xl border border-(--sf-border) bg-(--sf-panel) p-6 shadow-sm sm:p-8">
                    <p className="text-sm leading-7 text-(--sf-muted-text)">
                        These Terms and Conditions govern your use of the UVH Holdings website and your purchase of
                        products through our online store.
                    </p>

                    <div className="mt-8 space-y-6">
                        {TERMS_SECTIONS.map((section) => (
                            <article key={section.title}>
                                <h2 className="text-lg font-semibold text-(--sf-text)">{section.title}</h2>
                                <p className="mt-2 text-sm leading-7 text-(--sf-muted-text)">{section.body}</p>
                            </article>
                        ))}
                    </div>

                    <p className="mt-10 text-sm font-medium text-(--sf-text)">Last updated: 3 May 2026</p>
                </div>
            </section>
        </main>
    );
}
