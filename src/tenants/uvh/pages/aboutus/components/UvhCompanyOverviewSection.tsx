import {
    FROSTED_CARD,
    UvhGradientTrustBand,
} from '@/tenants/uvh/components/UvhGradientTrustBand.tsx';
import {uvhAboutContent} from '@/tenants/uvh/content/uvhContent';

const MV_BADGE_CLASS =
    'flex size-9 shrink-0 items-center justify-center rounded-md bg-(--sf-accent) text-sm font-bold text-(--sf-accent-text)';

export function UvhCompanyOverviewSection() {
    const {companyOverview} = uvhAboutContent;

    return (
        <UvhGradientTrustBand
            backdrop="customerReviews"
            eyebrow={companyOverview.eyebrow}
            title={companyOverview.title}
        >
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                <article className={FROSTED_CARD}>
                    <div className="flex gap-3">
                        <span className={MV_BADGE_CLASS} aria-hidden>
                            {companyOverview.mission.label}
                        </span>
                        <div className="min-w-0">
                            <h3 className="text-base font-semibold text-white">
                                {companyOverview.mission.heading}
                            </h3>
                            <p className="mt-1 text-sm leading-relaxed text-white/85">
                                {companyOverview.mission.body}
                            </p>
                        </div>
                    </div>
                </article>
                <article className={FROSTED_CARD}>
                    <div className="flex gap-3">
                        <span className={MV_BADGE_CLASS} aria-hidden>
                            {companyOverview.vision.label}
                        </span>
                        <div className="min-w-0">
                            <h3 className="text-base font-semibold text-white">
                                {companyOverview.vision.heading}
                            </h3>
                            <p className="mt-1 text-sm leading-relaxed text-white/85">
                                {companyOverview.vision.body}
                            </p>
                        </div>
                    </div>
                </article>
            </div>
            <p className="mt-6 max-w-4xl text-sm leading-relaxed text-white/85 sm:text-base">
                {companyOverview.closing}
            </p>
        </UvhGradientTrustBand>
    );
}
