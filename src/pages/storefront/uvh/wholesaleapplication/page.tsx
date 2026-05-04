import {WholesaleApplicationForm} from '@/pages/storefront/default/wholesaleApplication/WholesaleApplicationForm.tsx';
import {UvhTitleHero} from '@/pages/storefront/uvh/components/UvhTitleHero.tsx';

export default function UvhWholesaleApplicationPage() {
    return (
        <main className="w-full bg-(--sf-bg)">
            <UvhTitleHero
                description="Open a business account for better pricing and faster ordering on PPE, cleaning, hygiene, and medical consumables."
                eyebrow="Business"
                title="Wholesale"
            />

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
