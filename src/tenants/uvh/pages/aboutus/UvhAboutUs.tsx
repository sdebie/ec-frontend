import {UvhTitleHero} from '@/tenants/uvh/components/UvhTitleHero.tsx';
import {UvhAboutHighlightCards} from './components/UvhAboutHighlightCards';
import {UvhCompanyOverviewSection} from './components/UvhCompanyOverviewSection';
import {UvhCoreCategoriesSection} from './components/UvhCoreCategoriesSection';
import {UvhAboutValuePropositionsSection} from './components/UvhAboutValuePropositionsSection';
import {UvhProductsServicesSection} from './components/UvhProductsServicesSection';

const UvhAboutUs = () => {
    return (
        <main className="min-h-screen w-full bg-(--sf-bg)">
            <UvhTitleHero
                contentWidth="full"
                titleClassName="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl lg:whitespace-nowrap"
                description={
                    <>
                        UVH Holdings is a South African supplier focused on importing, procuring, and
                        manufacturing essential business consumables—Personal Protective Equipment
                        (PPE), hygiene and cleaning chemicals, medical disposable products, and
                        sanitizer wipes.
                        <span className="mt-5 block text-white/85 text-sm">
                            From local businesses to wholesale buyers across Africa, we simplify
                            procurement through a modern e-commerce platform and a hands-on service
                            team—so you can source what you need, place orders quickly, and keep
                            operations running without delays.
                        </span>
                    </>
                }
                eyebrow="About UVH Holdings"
                title="Quality supply. Competitive pricing. Fast fulfilment."
            />

            <UvhAboutHighlightCards />

            <UvhCompanyOverviewSection />

            <UvhCoreCategoriesSection />

            <UvhProductsServicesSection />

            <UvhAboutValuePropositionsSection />
        </main>
    );
};

export default UvhAboutUs;
