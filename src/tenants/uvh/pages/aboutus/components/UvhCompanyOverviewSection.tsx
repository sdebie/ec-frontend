import {Card} from '@/primitives/card/Card';
import {Container} from '@/primitives/container/Container';
import {UvhSectionHeading} from '@/tenants/uvh/components/UvhSectionHeading';
import {uvhAboutContent} from '@/tenants/uvh/config';

const BADGE =
    'flex size-9 shrink-0 items-center justify-center rounded-md bg-(--sf-accent) text-sm font-bold text-(--sf-accent-text)';

export function UvhCompanyOverviewSection() {
    const {companyOverview} = uvhAboutContent;

    return (
        <section
            aria-labelledby="uvh-company-overview-heading"
            className="w-full border-t border-(--sf-border) py-7 sm:py-9"
        >
            <Container className="px-4 sm:px-6 lg:px-8" padded={false} size="lg">
                <header className="max-w-2xl">
                    <UvhSectionHeading id="uvh-company-overview-heading" eyebrow={companyOverview.eyebrow} >
                        {companyOverview.title}
                    </UvhSectionHeading>
                </header>

                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                    <Card as="article" className="flex flex-col gap-3 p-4 sm:p-5" elevation="sm" padded={false}>
                        <div className="flex items-center gap-3">
                            <span className={BADGE} aria-hidden>{companyOverview.mission.label}</span>
                            <h3 className="text-base font-semibold text-(--sf-text)">{companyOverview.mission.heading}</h3>
                        </div>
                        <p className="text-sm leading-relaxed text-(--sf-muted-text)">{companyOverview.mission.body}</p>
                    </Card>
                    <Card as="article" className="flex flex-col gap-3 p-4 sm:p-5" elevation="sm" padded={false}>
                        <div className="flex items-center gap-3">
                            <span className={BADGE} aria-hidden>{companyOverview.vision.label}</span>
                            <h3 className="text-base font-semibold text-(--sf-text)">{companyOverview.vision.heading}</h3>
                        </div>
                        <p className="text-sm leading-relaxed text-(--sf-muted-text)">{companyOverview.vision.body}</p>
                    </Card>
                </div>

                <p className="mt-6 w-full text-sm leading-relaxed text-(--sf-muted-text)">
                    {companyOverview.closing}
                </p>
            </Container>
        </section>
    );
}
