import {
    FROSTED_CARD,
    UvhGradientTrustBand,
} from '@/tenants/uvh/components/UvhGradientTrustBand.tsx';
import {uvhAboutContent} from '@/tenants/uvh/content/uvhContent';

const ITEM_BADGE_CLASS =
    'flex size-9 shrink-0 items-center justify-center rounded-md bg-(--sf-accent) text-sm font-bold text-(--sf-accent-text)';

export function UvhProductsServicesSection() {
    const {productsAndServices} = uvhAboutContent;

    return (
        <UvhGradientTrustBand
            eyebrow={productsAndServices.eyebrow}
            title={productsAndServices.title}
        >
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                {productsAndServices.items.map((item) => (
                    <article key={item.id} className={FROSTED_CARD}>
                        <div className="flex gap-3">
                            <span className={ITEM_BADGE_CLASS} aria-hidden>
                                {item.label}
                            </span>
                            <div className="min-w-0">
                                <h3 className="text-base font-semibold text-white">
                                    {item.heading}
                                </h3>
                                <p className="mt-1 text-sm leading-relaxed text-white/85">
                                    {item.body}
                                </p>
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </UvhGradientTrustBand>
    );
}
