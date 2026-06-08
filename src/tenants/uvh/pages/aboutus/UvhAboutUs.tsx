import {Globe2, History, ShieldCheck} from 'lucide-react';
import {FROSTED_CARD} from '@/tenants/uvh/components/UvhGradientTrustBand.tsx';
import {UvhCtaSection} from '@/tenants/uvh/components/UvhCtaSection.tsx';
import {UvhTitleHero} from '@/tenants/uvh/components/UvhTitleHero.tsx';
import {uvhAboutContent} from '@/tenants/uvh/config';
import {UvhCompanyOverviewSection} from './components/UvhCompanyOverviewSection';
import {UvhCoreCategoriesSection} from './components/UvhCoreCategoriesSection';
import {UvhAboutValuePropositionsSection} from './components/UvhAboutValuePropositionsSection';
import {UvhProductsServicesSection} from './components/UvhProductsServicesSection';

const HIGHLIGHT_ICONS = [History, Globe2, ShieldCheck];

const UvhAboutUs = () => {
    return (
        <main className="min-h-screen w-full bg-(--sf-bg)">
            <UvhTitleHero
                contentWidth="full"
                titleClassName="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl lg:whitespace-nowrap"
                eyebrow="About UVH Holdings"
                title="Quality supply. Competitive pricing. Fast fulfilment."
                description="UVH Holdings is a South African supplier focused on importing, procuring, and manufacturing essential business consumables—Personal Protective Equipment (PPE), hygiene and cleaning chemicals, medical disposable products, and sanitizer wipes. From local businesses to wholesale buyers across Africa, we simplify procurement through a modern e-commerce platform and a hands-on service team—so you can source what you need, place orders quickly, and keep operations running without delays."
                descriptionClassName="mt-4 text-sm leading-relaxed text-white/80 max-w-none"
                afterDescription={
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
                        {uvhAboutContent.highlights.map((item, index) => {
                            const Icon = HIGHLIGHT_ICONS[index] ?? History;
                            return (
                                <article key={item.title} className={FROSTED_CARD}>
                                    <div className="flex items-center gap-2.5">
                                        <span
                                            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-(--sf-accent) text-(--sf-accent-text)">
                                            <Icon aria-hidden className="size-4" strokeWidth={1.75}/>
                                        </span>
                                        <h3 className="text-base font-bold text-white">{item.title}</h3>
                                    </div>
                                    <p className="mt-2 text-xs font-semibold text-white/90">{item.subtitle}</p>
                                    <p className="mt-1 text-xs leading-relaxed text-white/70">{item.description}</p>
                                </article>
                            );
                        })}
                    </div>
                }
            />

            <UvhCompanyOverviewSection/>

            <UvhCoreCategoriesSection/>

            <UvhProductsServicesSection/>

            <UvhAboutValuePropositionsSection/>

            <UvhCtaSection
                eyebrow="Get in touch"
                title="Ready to place an order or need a quote?"
                description="Contact our team for pricing, bulk orders, or any product enquiries. We respond quickly and keep things simple."
                cta={{label: 'Contact Us', to: '/contact-us'}}
                id="uvh-about-cta-heading"
            />
        </main>
    );
};

export default UvhAboutUs;
