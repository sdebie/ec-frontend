import {WholesaleApplicationForm} from '@/pages/storefront/default/wholesaleApplication/components/WholesaleApplicationForm.tsx';

export default function UvhWholesaleApplicationPage() {
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
                            <span className="h-0.5 w-8 shrink-0 bg-[#d00000]" aria-hidden />
                            <p className="text-xs font-bold uppercase tracking-[0.14em] text-white">Business</p>
                        </div>
                        <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                            Wholesale
                        </h1>
                        <p className="mt-3 text-sm font-normal leading-relaxed text-white sm:text-base">
                            Open a business account for better pricing and faster ordering on PPE, cleaning, hygiene,
                            and medical consumables.
                        </p>
                    </div>
                </div>
            </section>

            <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
                <div className="rounded-2xl border border-(--sf-border) bg-(--sf-panel) p-6 shadow-sm sm:p-8">
                    <h2 className="text-xl font-semibold text-(--sf-text)">Wholesale account application</h2>
                    <div className="mt-4 space-y-4 text-sm leading-relaxed text-(--sf-muted-text) sm:text-base">
                        <p>
                            To apply for a wholesale account, please complete the application form below. Once your
                            application is approved, you will be able to log in and wholesale pricing will be used when
                            you shop and add products to your cart.
                        </p>
                        <p>
                            You need a normal website account first. If you have not created one yet, you can create a
                            normal account for now. When your wholesale application is approved, your existing account
                            will be upgraded to a wholesale account (your username and password will stay the same).
                        </p>
                    </div>

                    <h3 className="mt-10 text-lg font-semibold text-(--sf-text)">Application form:</h3>
                    <WholesaleApplicationForm/>
                </div>
            </section>
        </main>
    );
}
