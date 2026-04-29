import { Link } from 'react-router-dom';
import { SfCard, SfAccentDivider, SfButton } from '@/components/storefront';
import { uvhAboutContent } from '@/pages/storefront/uvh/content/uvhContent.ts';

const UvhAboutUs = () => {
    return (
        <div className="bg-(--sf-bg)">
            <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                <SfCard elevation="sm" className="p-8">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-(--sf-accent)">About UVH Holdings</p>
                    <h1 className="mt-2 text-3xl font-bold tracking-tight text-(--sf-text)">Reliable supply for business and wholesale buyers</h1>
                    <SfAccentDivider className="mt-4 mb-6" />
                    <p className="max-w-4xl text-base leading-7 text-(--sf-muted-text)">
                        {uvhAboutContent.intro}
                    </p>
                    <p className="mt-4 max-w-4xl text-base leading-7 text-(--sf-muted-text)">
                        {uvhAboutContent.mission}
                    </p>
                </SfCard>

                <div className="mt-8 grid gap-6 lg:grid-cols-3">
                    {uvhAboutContent.differentiators.map((item) => (
                        <SfCard key={item} className="p-6">
                            <p className="text-sm font-medium leading-6 text-(--sf-text)">{item}</p>
                        </SfCard>
                    ))}
                </div>

                <SfCard className="mt-8 p-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-(--sf-accent)">Accreditors</p>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                        {uvhAboutContent.accreditors.map((item) => (
                            <span
                                key={item}
                                className="rounded-full border border-(--sf-border) bg-(--sf-surface-muted) px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-(--sf-text)"
                            >
                                {item}
                            </span>
                        ))}
                    </div>
                    <div className="mt-6 flex flex-wrap gap-3">
                        <Link to="/products">
                            <SfButton className="px-5 py-2.5 text-sm">Browse Products</SfButton>
                        </Link>
                        <Link to="/contact-us" className="inline-flex rounded-md border border-(--sf-border) bg-(--sf-bg) px-5 py-2.5 text-sm font-semibold text-(--sf-text)">
                            Talk to Sales
                        </Link>
                    </div>
                </SfCard>
            </div>
        </div>
    )
}

export default UvhAboutUs