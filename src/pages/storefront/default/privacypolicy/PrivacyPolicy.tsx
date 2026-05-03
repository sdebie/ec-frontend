const PRIVACY_SECTIONS = [
    {
        title: '1. Information we collect',
        body: 'We may collect contact details, order information, and basic usage data needed to run the storefront and fulfil purchases.',
    },
    {
        title: '2. How we use your information',
        body: 'We use this information to process orders, respond to enquiries, improve our services, and meet legal requirements.',
    },
    {
        title: '3. Sharing and retention',
        body: 'We share data only with service providers who help us operate the store (for example payment and delivery partners) where necessary. We do not sell personal information.',
    },
    {
        title: '4. Your choices',
        body: 'You can contact us through the contact page to ask about access, correction, or deletion of your information, subject to applicable law.',
    },
] as const;

export default function PrivacyPolicyPage() {
    return (
        <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8">
            <section className="rounded-2xl border border-(--sf-border) bg-(--sf-panel) p-6 sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-(--sf-accent)">Important info</p>
                <h1 className="mt-3 text-3xl font-bold tracking-tight text-(--sf-text) sm:text-4xl">Privacy Policy</h1>
                <p className="mt-4 text-sm leading-7 text-(--sf-muted-text)">
                    How we handle personal information when you use this demo storefront.
                </p>
            </section>

            <section className="rounded-2xl border border-(--sf-border) bg-(--sf-panel) p-6 sm:p-8">
                <div className="space-y-6">
                    {PRIVACY_SECTIONS.map((section) => (
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
