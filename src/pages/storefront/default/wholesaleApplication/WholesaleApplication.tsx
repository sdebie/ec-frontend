import {Link} from 'react-router-dom';
import {WholesaleApplicationForm} from '@/pages/storefront/default/wholesaleApplication/components/WholesaleApplicationForm.tsx';

const WholesaleApplication = () => {
    return (
        <div className="isolate w-full bg-(--sf-bg) text-(--sf-text)">
            <div className="border-b border-(--sf-border) bg-(--sf-panel)">
                <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-(--sf-muted-text)">
                        Business
                    </p>
                    <h1 className="mt-2 text-3xl font-bold tracking-tight text-balance sm:text-4xl">Wholesale</h1>
                    <p className="mt-4 max-w-2xl text-base leading-relaxed text-(--sf-muted-text) sm:text-lg">
                        Open a business account for better pricing and faster ordering on PPE, cleaning, hygiene, and
                        medical consumables.
                    </p>
                </div>
            </div>

            <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
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
                            normal account for now (for example via checkout when you place an order, or{' '}
                            <Link
                                to="/contact-us"
                                className="font-semibold text-(--sf-accent) underline-offset-2 hover:underline"
                            >
                                contact us
                            </Link>{' '}
                            if you need help). When your wholesale application is approved, your existing account will
                            be upgraded to a wholesale account (your username and password will stay the same).
                        </p>
                    </div>

                    <h3 className="mt-10 text-lg font-semibold text-(--sf-text)">Application form</h3>
                    <WholesaleApplicationForm/>
                </div>
            </div>
        </div>
    );
};

export default WholesaleApplication;
